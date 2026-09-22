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
import { db } from '../../../lib/firebase'
import { DAILY_LIMIT, TOTAL_ROUNDS } from '../constants'
import { currentStreak, isSameDay, nextStreak, scoreGame, scoreRound } from '../scoring'
import { guestRoundIds, rankedRoundAt, rankedRoundIds } from '../utils/roundSelection'
import { getGuestAnswer } from './roundService'

// One block is dealt without reading anything; each further try walks the player's round
// order looking for rounds they have not answered yet, in pages of SCAN_STEP.
const START_ATTEMPTS = 3
const SCAN_STEP = 12
const SCAN_LIMIT = 240

const newGameId = () => crypto.randomUUID()
const recordIdFor = (uid, roundId) => `${uid}_${roundId}`
const dailyRef = (uid) => doc(db, 'users', uid, 'state', 'daily')
const gameRef = (uid, gameId) => doc(db, 'users', uid, 'games', gameId)
const attemptRef = (uid, roundId) => doc(db, 'attempts', recordIdFor(uid, roundId))
const toDate = (timestamp) => timestamp?.toDate?.() || null

const submissionError = (stage, error) => new Error(
  `${stage}: ${error?.code || error?.message || 'unknown-error'}`,
  { cause: error },
)

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

export function startGuestGame() {
  return { id: `guest-${newGameId()}`, roundIds: guestRoundIds(), guest: true }
}

export async function getDailyState(uid) {
  const snap = await getDoc(dailyRef(uid))
  return toDailyState(snap.exists() ? snap.data() : {})
}

// A saved session points at a game that may no longer be playable: it can have been
// finished on another device, or belong to a database the account no longer has. Writing
// an attempt for it is refused by the rules, so the session is checked before it resumes.
// Returns null when the check itself could not be made, so a network blip never costs the
// player a game that is still open.
export async function isGameOpen(uid, gameId) {
  try {
    const snap = await getDoc(gameRef(uid, gameId))
    return snap.exists() ? snap.data().completed === false : false
  } catch {
    return null
  }
}

// Uses the daily state already in memory (read when the game started or the page loaded)
// instead of reading it again. If another device credited today's streak first, the rules
// reject the write and the caller keeps its state.
export async function creditDailyStreak(uid, daily) {
  const now = new Date()
  const { storedStreak, lastPlayedAt } = daily
  if (lastPlayedAt && isSameDay(lastPlayedAt, now)) return daily

  const streak = nextStreak(storedStreak, lastPlayedAt, now)
  await updateDoc(dailyRef(uid), { streak, lastPlayedAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return { ...daily, streak, storedStreak: streak, lastPlayedAt: now }
}

// Rounds an account has already answered are refused on game creation, and accounts from
// before roundCursor were dealt rounds at random, so their cursor is not a reliable
// starting point. Reading the attempt of each candidate finds a clean block in one pass.
async function findUnplayedRounds(uid, from) {
  const roundIds = []
  let position = from
  let cursor = from
  let scanned = 0

  while (roundIds.length < TOTAL_ROUNDS && scanned < SCAN_LIMIT) {
    const page = []
    while (page.length < SCAN_STEP) {
      const roundId = rankedRoundAt(uid, position + page.length)
      if (!roundId) break
      page.push(roundId)
    }
    if (!page.length) throw new Error('pool-exhausted')

    const snaps = await Promise.all(page.map((roundId) => getDoc(attemptRef(uid, roundId))))
    for (let index = 0; index < page.length && roundIds.length < TOTAL_ROUNDS; index += 1) {
      cursor = position + index + 1
      if (!snaps[index].exists()) roundIds.push(page[index])
    }
    position += page.length
    scanned += page.length
  }

  if (roundIds.length < TOTAL_ROUNDS) throw new Error('round-selection-failed')
  return { roundIds, cursor }
}

// The daily document is merged, not replaced: replacing it would drop the streak fields,
// which the rules refuse.
export async function startGame(uid) {
  const snap = await getDoc(dailyRef(uid))
  const stored = snap.exists() ? snap.data() : {}
  if (toDailyState(stored).plays >= DAILY_LIMIT) throw new Error('daily-limit')

  let scanFrom = stored.roundCursor || 0
  let selection = { roundIds: rankedRoundIds(uid, scanFrom), cursor: scanFrom + TOTAL_ROUNDS }
  if (selection.roundIds.some((roundId) => !roundId)) selection = await findUnplayedRounds(uid, scanFrom)
  let lastError = null

  for (let attempt = 0; attempt < START_ATTEMPTS; attempt += 1) {
    const id = newGameId()
    const { roundIds, cursor } = selection

    try {
      return await runTransaction(db, async (tx) => {
        const current = await tx.get(dailyRef(uid))
        const daily = toDailyState(current.exists() ? current.data() : {})
        if (daily.plays >= DAILY_LIMIT) throw new Error('daily-limit')
        const plays = daily.plays + 1

        tx.set(gameRef(uid, id), {
          uid,
          roundIds,
          score: 0,
          completed: false,
          createdAt: serverTimestamp(),
          completedAt: null,
        })
        tx.set(dailyRef(uid), {
          day: serverTimestamp(),
          plays,
          currentGameId: id,
          roundCursor: cursor,
          updatedAt: serverTimestamp(),
        }, { merge: true })

        return { game: { id, roundIds, guest: false }, daily: { ...daily, plays } }
      })
    } catch (error) {
      if (error?.code !== 'permission-denied') throw error
      lastError = error
      selection = await findUnplayedRounds(uid, scanFrom)
      scanFrom = selection.cursor
    }
  }

  throw submissionError('start-game-failed', lastError)
}

export async function submitGuestRound({ roundId, orderedIds, streakBefore }) {
  const answer = await getGuestAnswer(roundId)
  const result = scoreRound(orderedIds, answer.correctOrder, streakBefore)
  return { ...result, years: answer.years, correctOrder: answer.correctOrder }
}

// The attempt records only the order; the answer becomes readable once it exists. The
// score is recomputed by the rules when the game is finished.
export async function submitRound({ uid, gameId, roundId, roundIndex, orderedIds, streakBefore }) {
  const attempt = await createOrResume(
    attemptRef(uid, roundId),
    { uid, gameId, roundId, roundIndex, orderedIds, createdAt: serverTimestamp() },
    (stored) => stored.gameId === gameId && stored.roundId === roundId && stored.roundIndex === roundIndex,
    'attempt',
  )

  const answer = await getAnswer(roundId)
  const result = scoreRound(attempt.orderedIds, answer.correctOrder, streakBefore)
  return { ...result, years: answer.years, correctOrder: answer.correctOrder }
}

// The leaderboard entry is written with the profile at sign-up. If that batch was
// interrupted, the entry is missing and the all-or-nothing finish below can never land,
// which would lose the score for good — so it is rebuilt from the profile and retried.
async function restoreLeaderboardEntry(uid) {
  const entry = await getDoc(doc(db, 'leaderboard', uid))
  if (entry.exists()) return false

  const profile = await getDoc(doc(db, 'profiles', uid))
  if (!profile.exists()) return false

  const { nickname, countryCode } = profile.data()
  await setDoc(doc(db, 'leaderboard', uid), {
    nickname, countryCode, totalScore: 0, gamesPlayed: 0, updatedAt: serverTimestamp(),
  })
  return true
}

function commitFinish({ uid, gameId, score, hits }) {
  const batch = writeBatch(db)
  batch.update(gameRef(uid, gameId), { score, hits, completed: true, completedAt: serverTimestamp() })
  batch.set(doc(db, 'scoreCredits', `${uid}_${gameId}`), { uid, gameId, score, createdAt: serverTimestamp() })
  batch.update(doc(db, 'leaderboard', uid), {
    totalScore: increment(score),
    gamesPlayed: increment(1),
    lastGameId: gameId,
    updatedAt: serverTimestamp(),
  })
  return batch.commit()
}

// The rules check each round's hits against its attempt and answer (rounds 1-3 on the game,
// 4-6 on the score credit) and require the score to follow from them.
export async function finishGame({ uid, gameId, hits }) {
  const score = scoreGame(hits)

  try {
    await commitFinish({ uid, gameId, score, hits })
  } catch (error) {
    if (error?.code !== 'permission-denied') throw error
    if (!await restoreLeaderboardEntry(uid)) throw error
    await commitFinish({ uid, gameId, score, hits })
  }

  return score
}
