import {
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../lib/firebase/db'
import { RANKED_LEADERBOARD } from '../../leaderboard/collections'
import { leaderboardEntryId } from '../../leaderboard/entryId'
import { DAILY_LIMIT, TOTAL_ROUNDS } from '../constants'
import { currentStreak, isSameDay, nextStreak, scoreGame, scoreRound } from '../scoring'
import { decodeHistory, encodeHistory } from '../selection/history'
import { usedRoundsFromDaily } from '../selection/usedRounds'
import { roundIdFor, roundNumberOf } from '../utils/roundSelection'

// Everything a ranked game writes, in order (see firestore.rules for what each write proves):
//   start game    game document + daily document, in one transaction
//   each round    roundStarts.<n> = server time, then the attempt with the player's order
//   finish        game completion + score credit + leaderboard, in one batch
//   streak        daily document, once a day
// That is 2 + 6×2 + 3 + 1 writes per game, whatever the player does inside a round.
const START_ATTEMPTS = 3

const newGameId = () => crypto.randomUUID()
const recordIdFor = (uid, roundId) => `${uid}_${roundId}`
const dailyRef = (uid) => doc(db, 'users', uid, 'state', 'daily')
const historyRef = (uid) => doc(db, 'users', uid, 'state', 'history')
const gameRef = (uid, gameId) => doc(db, 'users', uid, 'games', gameId)
const attemptRef = (uid, roundId) => doc(db, 'attempts', recordIdFor(uid, roundId))
const leaderboardRef = async (uid) => doc(db, RANKED_LEADERBOARD, await leaderboardEntryId(uid))
const toDate = (timestamp) => timestamp?.toDate?.() || null

const submissionError = (stage, error) =>
  new Error(`${stage}: ${error?.code || error?.message || 'unknown-error'}`, { cause: error })

function toDailyState(data = {}, now = new Date()) {
  const day = toDate(data.day)
  const lastPlayedAt = toDate(data.lastPlayedAt)
  return {
    plays: day && isSameDay(day, now) ? data.plays || 0 : 0,
    streak: currentStreak(data.streak || 0, lastPlayedAt, now),
    storedStreak: data.streak || 0,
    lastPlayedAt,
  }
}

async function createOrResume(ref, data, matches, stage) {
  try {
    await setDoc(ref, data)
    return data
  } catch (writeError) {
    try {
      const existing = await getDoc(ref)
      if (!existing.exists()) throw writeError
      const stored = existing.data()
      if (!matches(stored)) throw new Error(`${stage}-conflict`)
      return stored
    } catch (readError) {
      if (readError === writeError) throw writeError
      throw submissionError(`${stage}-write-failed`, writeError)
    }
  }
}

async function getAnswer(roundId) {
  const snap = await getDoc(doc(db, 'roundAnswers', roundId))
  if (!snap.exists()) throw new Error('answer-not-found')
  return snap.data()
}

// Read once when a signed-in player opens the game: two documents.
export async function getAccountState(uid) {
  const [daily, history] = await Promise.all([getDoc(dailyRef(uid)), getDoc(historyRef(uid))])
  return {
    daily: toDailyState(daily.exists() ? daily.data() : {}),
    history: history.exists() ? decodeHistory(history.data().events) : [],
  }
}

// One write per game, from either mode. A failure only costs the other devices a little
// of the history, so it is never awaited by the game.
export function saveHistory(uid, events) {
  return setDoc(historyRef(uid), { events: encodeHistory(events), updatedAt: serverTimestamp() })
}

// A saved session points at a game that may no longer be playable: it can have been
// finished on another device, or belong to a database the account no longer has.
// Returns the game, false when it is gone or closed, or null when the check itself could
// not be made, so a network blip never costs the player a game that is still open.
export async function getOpenGame(uid, gameId) {
  try {
    const snap = await getDoc(gameRef(uid, gameId))
    if (!snap.exists() || snap.data().completed !== false) return false
    return snap.data()
  } catch {
    return null
  }
}

// Players who signed up before the ranked leaderboard existed have no entry in it yet.
// It is created from their profile before their first ranked game (the rules check that
// the nickname and country match the profile).
const knownEntries = new Set()
export async function ensureLeaderboardEntry(uid, profile) {
  if (knownEntries.has(uid)) return
  const ref = await leaderboardRef(uid)
  const entry = await getDoc(ref)
  if (!entry.exists()) {
    await setDoc(ref, {
      nickname: profile.nickname,
      countryCode: profile.countryCode,
      totalScore: 0,
      gamesPlayed: 0,
      updatedAt: serverTimestamp(),
    })
  }
  knownEntries.add(uid)
}

// Uses the daily state already in memory instead of reading it again. If another device
// credited today's streak first, the rules reject the write and the caller keeps its state.
export async function creditDailyStreak(uid, daily) {
  const now = new Date()
  const { storedStreak, lastPlayedAt } = daily
  if (lastPlayedAt && isSameDay(lastPlayedAt, now)) return daily

  const streak = nextStreak(storedStreak, lastPlayedAt, now)
  await updateDoc(dailyRef(uid), {
    streak,
    lastPlayedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { ...daily, streak, storedStreak: streak, lastPlayedAt: now }
}

// The rounds are chosen inside the transaction, from the used-rounds hint it reads, so two
// tabs starting a game at once each retry against the other's commit instead of dealing
// the same rounds. If the rules still refuse a round (the hint was stale), the attempts of
// the rounds just tried are checked, the answered ones are marked and the game is dealt
// again.
export async function startRankedGame(uid, pickRounds) {
  const answered = new Set()
  let lastError = null

  for (let attempt = 0; attempt < START_ATTEMPTS; attempt += 1) {
    const id = newGameId()
    let tried = []

    try {
      return await runTransaction(db, async (tx) => {
        const snap = await tx.get(dailyRef(uid))
        const stored = snap.exists() ? snap.data() : {}
        const daily = toDailyState(stored)
        if (daily.plays >= DAILY_LIMIT) throw new Error('daily-limit')

        const used = usedRoundsFromDaily(uid, stored)
        answered.forEach(used.add)
        const numbers = pickRounds(used.has)
        if (!numbers || numbers.length < TOTAL_ROUNDS) throw new Error('pool-exhausted')
        numbers.forEach(used.add)

        const roundIds = numbers.map(roundIdFor)
        tried = roundIds
        const plays = daily.plays + 1

        tx.set(gameRef(uid, id), {
          uid,
          mode: 'ranked',
          roundIds,
          roundStarts: {},
          score: 0,
          completed: false,
          createdAt: serverTimestamp(),
          completedAt: null,
        })
        tx.set(
          dailyRef(uid),
          {
            day: serverTimestamp(),
            plays,
            currentGameId: id,
            usedRounds: used.encode(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )

        return { game: { id, mode: 'ranked', roundIds }, daily: { ...daily, plays } }
      })
    } catch (error) {
      if (error?.code !== 'permission-denied' || !tried.length) throw error
      lastError = error
      const snaps = await Promise.all(tried.map((roundId) => getDoc(attemptRef(uid, roundId))))
      snaps.forEach((snap, index) => snap.exists() && answered.add(roundNumberOf(tried[index])))
    }
  }

  throw submissionError('start-game-failed', lastError)
}

// Stamps the round with the server's clock just before its cards are shown. The rules only
// accept the order within the round's time from this stamp, so pausing or reloading the
// page gains no time. A round that was already stamped (the page was reloaded after the
// stamp) is refused; the stored stamp is returned instead.
export async function startRankedRound(uid, gameId, roundIndex) {
  try {
    await updateDoc(gameRef(uid, gameId), { [`roundStarts.${roundIndex}`]: serverTimestamp() })
    return { startedAt: Date.now() }
  } catch (error) {
    const game = await getOpenGame(uid, gameId)
    const stamp = game?.roundStarts?.[roundIndex]
    if (stamp?.toMillis) return { startedAt: stamp.toMillis() }
    throw error
  }
}

async function revealRound(uid, roundId, orderedIds, streakBefore) {
  const answer = await getAnswer(roundId)
  const result = scoreRound(orderedIds, answer.correctOrder, streakBefore)
  return { ...result, years: answer.years, correctOrder: answer.correctOrder }
}

// The attempt records only the order; the answer becomes readable once it exists. The score
// is recomputed by the rules when the game is finished.
export async function submitRankedRound({
  uid,
  gameId,
  roundId,
  roundIndex,
  orderedIds,
  streakBefore,
}) {
  const attempt = await createOrResume(
    attemptRef(uid, roundId),
    { uid, gameId, roundId, roundIndex, orderedIds, createdAt: serverTimestamp() },
    (stored) =>
      stored.gameId === gameId && stored.roundId === roundId && stored.roundIndex === roundIndex,
    'attempt',
  )
  const timedOut = attempt.timedOut === true
  const result = await revealRound(uid, roundId, timedOut ? [] : attempt.orderedIds, streakBefore)
  return { ...result, timedOut }
}

// When an order arrives after the round's time (the tab was paused or the connection
// dropped), the rules refuse it. The round is then closed as timed out: it scores nothing,
// and its answer can be shown.
export async function submitTimedOutRound({ uid, gameId, roundId, roundIndex, streakBefore }) {
  await createOrResume(
    attemptRef(uid, roundId),
    {
      uid,
      gameId,
      roundId,
      roundIndex,
      orderedIds: [],
      timedOut: true,
      createdAt: serverTimestamp(),
    },
    (stored) =>
      stored.gameId === gameId && stored.roundId === roundId && stored.roundIndex === roundIndex,
    'attempt',
  )
  const result = await revealRound(uid, roundId, [], streakBefore)
  return { ...result, timedOut: true }
}

// The rules check each round's hits against its attempt and answer (rounds 1-3 on the
// game, 4-6 on the score credit) and require the score to follow from them. The credit id
// is the game id, so one game can only ever be credited once.
export async function finishRankedGame({ uid, gameId, hits }) {
  const score = scoreGame(hits)
  const entry = await leaderboardRef(uid)
  const batch = writeBatch(db)
  batch.update(gameRef(uid, gameId), {
    score,
    hits,
    completed: true,
    completedAt: serverTimestamp(),
  })
  batch.set(doc(db, 'scoreCredits', `${uid}_${gameId}`), {
    uid,
    gameId,
    score,
    createdAt: serverTimestamp(),
  })
  batch.update(entry, {
    totalScore: increment(score),
    gamesPlayed: increment(1),
    lastGameId: gameId,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
  return score
}
