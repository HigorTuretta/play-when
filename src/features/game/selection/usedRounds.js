import { RANKED_POOL_SIZE } from '../constants'
import { rankedRoundAt } from '../utils/roundSelection'

// The ranked rounds a player has already been dealt, one bit per round, stored as base64
// in the daily document (about 380 characters for 2,250 rounds). It is only a hint for
// choosing rounds: the rules refuse any round that already has an attempt on record.
const BYTES = Math.ceil(RANKED_POOL_SIZE / 8)

export function createUsedRounds(encoded) {
  const bits = new Uint8Array(BYTES)
  if (typeof encoded === 'string' && encoded) {
    try {
      const raw = atob(encoded)
      for (let i = 0; i < Math.min(raw.length, BYTES); i += 1) bits[i] = raw.charCodeAt(i)
    } catch {}
  }

  const has = (n) =>
    n >= 1 && n <= RANKED_POOL_SIZE && (bits[(n - 1) >> 3] & (1 << ((n - 1) & 7))) !== 0
  const add = (n) => {
    if (n >= 1 && n <= RANKED_POOL_SIZE) bits[(n - 1) >> 3] |= 1 << ((n - 1) & 7)
  }
  const count = () => bits.reduce((total, byte) => total + popCount(byte), 0)
  const encode = () => btoa(String.fromCharCode(...bits))

  return { has, add, count, encode }
}

const popCount = (byte) => {
  let bits = byte
  let total = 0
  while (bits) {
    total += bits & 1
    bits >>= 1
  }
  return total
}

// Accounts from before the bitset walked a fixed per-player permutation of the pool, with
// their position saved as roundCursor: every round before the cursor has been dealt.
export function usedRoundsFromDaily(uid, daily) {
  if (typeof daily?.usedRounds === 'string') return createUsedRounds(daily.usedRounds)
  const used = createUsedRounds()
  const cursor = Number.isInteger(daily?.roundCursor) ? daily.roundCursor : 0
  for (let position = 0; position < cursor; position += 1) {
    const roundId = rankedRoundAt(uid, position)
    if (roundId) used.add(Number(roundId.slice(-4)))
  }
  return used
}
