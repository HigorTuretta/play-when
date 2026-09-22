import { PERFECT_BONUS, POINTS_PER_CARD, ROUND_SIZE, STREAK_BONUS_STEP, STREAK_WINDOW_MS } from './constants'

export const isSameDay = (a, b) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10)

export function scoreRound(orderedIds, correctOrder, streakBefore) {
  const hits = orderedIds.reduce((total, id, index) => total + (correctOrder[index] === id ? 1 : 0), 0)
  const perfect = hits === ROUND_SIZE
  const score = hits * POINTS_PER_CARD + (perfect ? PERFECT_BONUS + streakBefore * STREAK_BONUS_STEP : 0)
  return { hits, perfect, score, streakAfter: perfect ? streakBefore + 1 : 0 }
}

export function currentStreak(streak, lastPlayedAt, now = new Date()) {
  if (!streak || !lastPlayedAt) return 0
  return now.getTime() - lastPlayedAt.getTime() < STREAK_WINDOW_MS ? streak : 0
}

export function nextStreak(streak, lastPlayedAt, now = new Date()) {
  if (!lastPlayedAt) return 1
  if (isSameDay(lastPlayedAt, now)) return streak || 1
  return now.getTime() - lastPlayedAt.getTime() < STREAK_WINDOW_MS ? (streak || 0) + 1 : 1
}
