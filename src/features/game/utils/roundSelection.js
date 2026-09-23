import { RANKED_POOL_SIZE } from '../constants'
import { shuffle } from './shuffle'

export const roundIdFor = (n) => `round-${String(n).padStart(4, '0')}`
export const roundNumberOf = (roundId) => Number(roundId.slice(-4))

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
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let ranked = { uid: null, order: [] }

// Before the used-rounds bitset, each player walked a fixed permutation of the ranked pool
// seeded by their uid, with the position saved as roundCursor. It is kept only to read
// that cursor back (see usedRoundsFromDaily).
function rankedOrderFor(uid) {
  if (ranked.uid !== uid) {
    const pool = Array.from({ length: RANKED_POOL_SIZE }, (_, index) => index + 1)
    ranked = { uid, order: shuffle(pool, mulberry32(hashString(uid))) }
  }
  return ranked.order
}

export function rankedRoundAt(uid, position) {
  const order = rankedOrderFor(uid)
  return position < order.length ? roundIdFor(order[position]) : null
}
