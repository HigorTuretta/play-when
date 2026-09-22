export const TOTAL_ROUNDS = 6
export const ROUND_SIZE = 4
export const DAILY_LIMIT = 3
export const ROUND_POOL_SIZE = 2500
// Rounds 1..RANKED_POOL_SIZE are ranked. The rest form the guest pool, whose answers ship
// in the public round files. Keep in sync with scripts/lib/rounds.mjs and
// validRankedRoundId() in firestore.rules.
export const RANKED_POOL_SIZE = 2250
// Bump together with STATIC_ROUNDS_VERSION in scripts/lib/rounds.mjs: files are cached as immutable.
export const STATIC_ROUNDS_URL = '/rounds/v2'
export const POINTS_PER_CARD = 25
export const PERFECT_BONUS = 50
export const STREAK_BONUS_STEP = 20
export const STREAK_WINDOW_MS = 3 * 24 * 60 * 60 * 1000
export const GREAT_SCORE = 620
