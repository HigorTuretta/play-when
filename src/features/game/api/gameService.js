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
import { guestRoundIds, rankedRoundIds } from '../utils/roundSelection'
import { getGuestAnswer } from './roundService'

const START_ATTEMPTS = 8

const newGameId = () => crypto.randomUUID()
const recordIdFor = (uid, roundId) => `${uid}_${roundId}`
const dailyRef = (uid) => doc(db, 'users', uid, 'state', 'daily')
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

// The daily document is merged, not replaced: replacing it would drop the streak fields,
// which the rules refuse. When the rules reject a block of rounds (accounts from before
// roundCursor may have played some of them at random), the next block is tried.
export async function startGame(uid) {
  for (let attempt = 0; attempt < START_ATTEMPTS; attempt += 1) {
    const id = newGameId()

    try {
      return await runTransaction(db, async (tx) => {
        const snap = await tx.get(dailyRef(uid))
        const data = snap.exists() ? snap.data() : {}
        const daily = toDailyState(data)
        if (daily.plays >= DAILY_LIMIT) throw new Error('daily-limit')

        const cursor = (data.roundCursor || 0) + attempt * TOTAL_ROUNDS
        const roundIds = rankedRoundIds(uid, cursor)
        const plays = daily.plays + 1

        tx.set(doc(db, 'users', uid, 'games', id), {
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
          roundCursor: cursor + TOTAL_ROUNDS,
          updatedAt: serverTimestamp(),
        }, { merge: true })

        return { game: { id, roundIds, guest: false }, daily: { ...daily, plays } }
      })
    } catch (error) {
      if (error?.code !== 'permission-denied' || attempt === START_ATTEMPTS - 1) throw error
    }
  }

  throw new Error('round-selection-failed')
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
    doc(db, 'attempts', recordIdFor(uid, roundId)),
    { uid, gameId, roundId, roundIndex, orderedIds, createdAt: serverTimestamp() },
    (stored) => stored.gameId === gameId && stored.roundId === roundId && stored.roundIndex === roundIndex,
    'attempt',
  )

  const answer = await getAnswer(roundId)
  const result = scoreRound(attempt.orderedIds, answer.correctOrder, streakBefore)
  return { ...result, years: answer.years, correctOrder: answer.correctOrder }
}

// The rules check each round's hits against its attempt and answer (rounds 1-3 on the game,
// 4-6 on the score credit) and require the score to follow from them.
export async function finishGame({ uid, gameId, hits }) {
  const score = scoreGame(hits)
  const batch = writeBatch(db)

  batch.update(doc(db, 'users', uid, 'games', gameId), { score, hits, completed: true, completedAt: serverTimestamp() })
  batch.set(doc(db, 'scoreCredits', `${uid}_${gameId}`), { uid, gameId, score, createdAt: serverTimestamp() })
  batch.update(doc(db, 'leaderboard', uid), {
    totalScore: increment(score),
    gamesPlayed: increment(1),
    lastGameId: gameId,
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
  return score
}
