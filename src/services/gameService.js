import {
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/client'

export const TOTAL_ROUNDS = 6
export const ROUND_SIZE = 4
export const DAILY_LIMIT = 3
export const ROUND_POOL_SIZE = 2500
export const POINTS_PER_CARD = 25
export const PERFECT_BONUS = 50
export const STREAK_BONUS_STEP = 20

const gameId = () => crypto.randomUUID()
const roundIdFor = (n) => `round-${String(n).padStart(4, '0')}`
const attemptIdFor = (uid, roundId) => `${uid}_${roundId}`
const creditIdFor = (uid, roundId) => `${uid}_${roundId}`

function randomRoundIds() {
  const picked = new Set()
  while (picked.size < TOTAL_ROUNDS) picked.add(roundIdFor(1 + Math.floor(Math.random() * ROUND_POOL_SIZE)))
  return [...picked]
}

export function startGuestGame() {
  return { id: `guest-${gameId()}`, roundIds: randomRoundIds(), guest: true }
}

export async function getDailyState(uid) {
  const snap = await getDoc(doc(db, 'users', uid, 'state', 'daily'))
  if (!snap.exists()) return { plays: 0, day: null }
  const data = snap.data()
  const day = data.day?.toDate?.() || null
  const now = new Date()
  const sameDay = day && day.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
  return sameDay ? { plays: data.plays || 0, day } : { plays: 0, day }
}

export async function startGame(uid) {
  for (let selectionAttempt = 0; selectionAttempt < 8; selectionAttempt += 1) {
    const roundIds = randomRoundIds()
    const id = gameId()
    const dailyRef = doc(db, 'users', uid, 'state', 'daily')
    const gameRef = doc(db, 'users', uid, 'games', id)

    try {
      await runTransaction(db, async (tx) => {
        const dailySnap = await tx.get(dailyRef)
        let plays = 1

        if (dailySnap.exists()) {
          const data = dailySnap.data()
          const day = data.day?.toDate?.()
          const now = new Date()
          const sameDay = day && day.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
          plays = sameDay ? (data.plays || 0) + 1 : 1
          if (sameDay && plays > DAILY_LIMIT) throw new Error('daily-limit')
        }

        tx.set(gameRef, {
          uid,
          roundIds,
          score: 0,
          completed: false,
          createdAt: serverTimestamp(),
          completedAt: null,
        })
        tx.set(dailyRef, {
          day: serverTimestamp(),
          plays,
          currentGameId: id,
          updatedAt: serverTimestamp(),
        })
      })

      return { id, roundIds }
    } catch (error) {
      if (error?.message === 'daily-limit') throw error
      if (selectionAttempt === 7) throw error
    }
  }

  throw new Error('round-selection-failed')
}

export async function getRound(roundId) {
  const snap = await getDoc(doc(db, 'rounds', roundId))
  if (!snap.exists()) throw new Error('round-not-found')
  return { id: snap.id, ...snap.data() }
}

function calculateFromAnswer(orderedIds, answer, streakBefore) {
  const correct = answer.correctOrder
  const hits = orderedIds.reduce((total, id, index) => total + (correct[index] === id ? 1 : 0), 0)
  const perfect = hits === ROUND_SIZE
  const score = hits * POINTS_PER_CARD + (perfect ? PERFECT_BONUS + streakBefore * STREAK_BONUS_STEP : 0)
  return { hits, perfect, score, streakAfter: perfect ? streakBefore + 1 : 0 }
}

export async function submitGuestRound({ roundId, orderedIds, streakBefore }) {
  const answerSnap = await getDoc(doc(db, 'roundAnswers', roundId))
  if (!answerSnap.exists()) throw new Error('answer-not-found')
  const answer = answerSnap.data()
  const result = calculateFromAnswer(orderedIds, answer, streakBefore)
  return { ...result, years: answer.years, correctOrder: answer.correctOrder }
}

export async function submitRound({ uid, gameId, roundId, roundIndex, orderedIds, streakBefore }) {
  const attemptId = attemptIdFor(uid, roundId)
  const attemptRef = doc(db, 'attempts', attemptId)
  const existingAttempt = await getDoc(attemptRef)
  let submittedOrder = orderedIds

  // A connection can fail after Firestore has accepted the attempt but before
  // the rest of the submission finishes. Retrying must resume that attempt:
  // attempting to overwrite it is (intentionally) rejected by the rules.
  if (existingAttempt.exists()) {
    const attempt = existingAttempt.data()
    if (attempt.gameId !== gameId || attempt.roundId !== roundId || attempt.roundIndex !== roundIndex) {
      throw new Error('attempt-conflict')
    }
    submittedOrder = attempt.orderedIds
  } else {
    await setDoc(attemptRef, {
      uid,
      gameId,
      roundId,
      roundIndex,
      orderedIds,
      createdAt: serverTimestamp(),
    })
  }

  const answerSnap = await getDoc(doc(db, 'roundAnswers', roundId))
  if (!answerSnap.exists()) throw new Error('answer-not-found')
  const answer = answerSnap.data()
  const result = calculateFromAnswer(submittedOrder, answer, streakBefore)

  const creditRef = doc(db, 'roundCredits', creditIdFor(uid, roundId))
  const existingCredit = await getDoc(creditRef)
  if (!existingCredit.exists()) {
    await setDoc(creditRef, {
      uid,
      gameId,
      roundId,
      roundIndex,
      hits: result.hits,
      score: result.score,
      streakBefore,
      streakAfter: result.streakAfter,
      createdAt: serverTimestamp(),
    })
  }

  return { ...result, years: answer.years, correctOrder: answer.correctOrder }
}

export async function finishGame({ uid, gameId, score }) {
  const gameRef = doc(db, 'users', uid, 'games', gameId)
  const scoreCreditRef = doc(db, 'scoreCredits', `${uid}_${gameId}`)
  const leaderboardRef = doc(db, 'leaderboard', uid)
  const batch = writeBatch(db)

  batch.update(gameRef, { score, completed: true, completedAt: serverTimestamp() })
  batch.set(scoreCreditRef, { uid, gameId, score, createdAt: serverTimestamp() })
  batch.update(leaderboardRef, {
    totalScore: increment(score),
    gamesPlayed: increment(1),
    lastGameId: gameId,
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
  return score
}
