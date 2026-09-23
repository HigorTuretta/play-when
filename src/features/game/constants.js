export const TOTAL_ROUNDS = 6
export const ROUND_SIZE = 4
// Ranked games a signed-in player may start per day. Normal games are unlimited.
export const DAILY_LIMIT = 3
// Rounds 1..RANKED_POOL_SIZE are ranked: their answers stay in Firestore. Keep in sync with
// scripts/lib/rounds.mjs and validRankedRoundId() in firestore.rules.
export const RANKED_POOL_SIZE = 2250
// Bump together with STATIC_ROUNDS_VERSION in scripts/lib/rounds.mjs: files are cached as immutable.
export const STATIC_ROUNDS_URL = '/rounds/v2'

// Ranked rounds last RANKED_ROUND_SECONDS. The rules accept an answer up to
// RANKED_GRACE_SECONDS later, to absorb network latency. Keep both in sync with
// firestore.rules (validAttemptTime).
export const RANKED_ROUND_SECONDS = 40
export const RANKED_GRACE_SECONDS = 5

export const GAME_MODES = { normal: 'normal', ranked: 'ranked' }

export const POINTS_PER_CARD = 25
export const PERFECT_BONUS = 50
export const STREAK_BONUS_STEP = 20
export const STREAK_WINDOW_MS = 3 * 24 * 60 * 60 * 1000
export const GREAT_SCORE = 620
