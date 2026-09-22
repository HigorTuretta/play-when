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
import { DAILY_LIMIT, ROUND_POOL_SIZE, TOTAL_ROUNDS } from '../constants'
import { currentStreak, isSameDay, nextStreak, scoreRound } from '../scoring'

const START_ATTEMPTS = 8

const newGameId = () => crypto.randomUUID()
const roundIdFor = (n) => `round-${String(n).padStart(4, '0')}`
const recordIdFor = (uid, roundId) => `${uid}_${roundId}`
const dailyRef = (uid) => doc(db, 'users', uid, 'state', 'daily')
const toDate = (timestamp) => timestamp?.toDate?.() || null

const submissionError = (stage, error) => new Error(
  `${stage}: ${error?.code || error?.message || 'unknown-error'}`,
  { cause: error },
)

function randomRoundIds() {
  const picked = new Set()
  while (picked.size < TOTAL_ROUNDS) picked.add(roundIdFor(1 + Math.floor(Math.random() * ROUND_POOL_SIZE)))
  return [...picked]
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
  return { id: `guest-${newGameId()}`, roundIds: randomRoundIds(), guest: true }
}

export async function getDailyState(uid) {
  const snap = await getDoc(dailyRef(uid))
  if (!snap.exists()) return { plays: 0, day: null, streak: 0, lastPlayedAt: null }

  const data = snap.data()
  const day = toDate(data.day)
  const lastPlayedAt = toDate(data.lastPlayedAt)
  const now = new Date()
  return {
    plays: day && isSameDay(day, now) ? data.plays || 0 : 0,
    day,
    streak: currentStreak(data.streak || 0, lastPlayedAt, now),
    lastPlayedAt,
  }
}

export async function creditDailyStreak(uid) {
  const ref = dailyRef(uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return 0

  const data = snap.data()
  const lastPlayedAt = toDate(data.lastPlayedAt)
  const now = new Date()
  const stored = data.streak || 0
  if (lastPlayedAt && isSameDay(lastPlayedAt, now)) return stored

  const streak = nextStreak(stored, lastPlayedAt, now)
  await updateDoc(ref, { streak, lastPlayedAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return streak
}

export async function startGame(uid) {
  for (let attempt = 1; attempt <= START_ATTEMPTS; attempt += 1) {
    const roundIds = randomRoundIds()
    const id = newGameId()

    try {
      await runTransaction(db, async (tx) => {
        const dailySnap = await tx.get(dailyRef(uid))
        let plays = 1

        if (dailySnap.exists()) {
          const data = dailySnap.data()
          const day = toDate(data.day)
          const sameDay = day && isSameDay(day, new Date())
          plays = sameDay ? (data.plays || 0) + 1 : 1
          if (sameDay && plays > DAILY_LIMIT) throw new Error('daily-limit')
        }

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
          updatedAt: serverTimestamp(),
        })
      })

      return { id, roundIds, guest: false }
    } catch (error) {
      if (error?.message === 'daily-limit' || attempt === START_ATTEMPTS) throw error
    }
  }

  throw new Error('round-selection-failed')
}

export async function getRound(roundId) {
  const snap = await getDoc(doc(db, 'rounds', roundId))
  if (!snap.exists()) throw new Error('round-not-found')
  return { id: snap.id, ...snap.data() }
}

export async function submitGuestRound({ roundId, orderedIds, streakBefore }) {
  const answer = await getAnswer(roundId)
  const result = scoreRound(orderedIds, answer.correctOrder, streakBefore)
  return { ...result, years: answer.years, correctOrder: answer.correctOrder }
}

export async function submitRound({ uid, gameId, roundId, roundIndex, orderedIds, streakBefore }) {
  const sameRound = (stored) => stored.gameId === gameId && stored.roundId === roundId && stored.roundIndex === roundIndex

  const attempt = await createOrResume(
    doc(db, 'attempts', recordIdFor(uid, roundId)),
    { uid, gameId, roundId, roundIndex, orderedIds, createdAt: serverTimestamp() },
    sameRound,
    'attempt',
  )

  const answer = await getAnswer(roundId)
  const result = scoreRound(attempt.orderedIds, answer.correctOrder, streakBefore)

  await createOrResume(
    doc(db, 'roundCredits', recordIdFor(uid, roundId)),
    {
      uid,
      gameId,
      roundId,
      roundIndex,
      hits: result.hits,
      score: result.score,
      streakBefore,
      streakAfter: result.streakAfter,
      createdAt: serverTimestamp(),
    },
    sameRound,
    'credit',
  )

  return { ...result, years: answer.years, correctOrder: answer.correctOrder }
}

export async function finishGame({ uid, gameId, score }) {
  const batch = writeBatch(db)

  batch.update(doc(db, 'users', uid, 'games', gameId), { score, completed: true, completedAt: serverTimestamp() })
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
