import { RANKED_POOL_SIZE, ROUND_POOL_SIZE, TOTAL_ROUNDS } from '../constants'
import { shuffle } from './shuffle'

export const roundIdFor = (n) => `round-${String(n).padStart(4, '0')}`

function hashString(value) {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function mulberry32(seed) {
  let state = seed
  return () => {
    state += 0x6D2B79F5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let ranked = { uid: null, order: [] }

// Each player walks a fixed permutation of the ranked pool, seeded by their uid, with the
// position saved as roundCursor. New games never deal a round the player already answered,
// so starting a game needs no trial and error against the attempt checks in the rules.
function rankedOrderFor(uid) {
  if (ranked.uid !== uid) {
    const pool = Array.from({ length: RANKED_POOL_SIZE }, (_, index) => index + 1)
    ranked = { uid, order: shuffle(pool, mulberry32(hashString(uid))) }
  }
  return ranked.order
}

export function rankedRoundIds(uid, cursor) {
  const order = rankedOrderFor(uid)
  return Array.from({ length: TOTAL_ROUNDS }, (_, index) => roundIdFor(order[(cursor + index) % order.length]))
}

export function guestRoundIds() {
  const guestPool = Array.from({ length: ROUND_POOL_SIZE - RANKED_POOL_SIZE }, (_, index) => RANKED_POOL_SIZE + index + 1)
  return shuffle(guestPool).slice(0, TOTAL_ROUNDS).map(roundIdFor)
}
