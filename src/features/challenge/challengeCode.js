import { ROUND_SIZE, TOTAL_ROUNDS } from '../game/constants'

// A challenge link carries the 24 facts of a normal game, so a friend plays the very same
// cards: /desafio/<code> or /challenge/<code>. Each fact is its event number in 9 bits
// (events go up to 511), 216 bits in all, written as 36 base64url characters. Only normal
// games can be shared this way: their answers are public anyway, while ranked rounds can
// never be replayed.
const BITS = 9
const MAX_EVENT = (1 << BITS) - 1
const CARD_COUNT = TOTAL_ROUNDS * ROUND_SIZE
const BYTES = (CARD_COUNT * BITS) / 8

const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

function fromBase64Url(code) {
  const base64 = code.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  return Uint8Array.from(raw, (char) => char.charCodeAt(0))
}

export function encodeChallenge(rounds) {
  const numbers = rounds.flat()
  if (numbers.length !== CARD_COUNT || numbers.some((n) => n < 1 || n > MAX_EVENT)) return null
  const bytes = new Uint8Array(BYTES)
  numbers.forEach((number, index) => {
    for (let bit = 0; bit < BITS; bit += 1) {
      if (number & (1 << bit)) {
        const position = index * BITS + bit
        bytes[position >> 3] |= 1 << (position & 7)
      }
    }
  })
  return toBase64Url(bytes)
}

export function decodeChallenge(code) {
  let bytes
  try {
    bytes = fromBase64Url(code)
  } catch {
    return null
  }
  if (bytes.length !== BYTES) return null

  const numbers = Array.from({ length: CARD_COUNT }, (_, index) => {
    let number = 0
    for (let bit = 0; bit < BITS; bit += 1) {
      const position = index * BITS + bit
      if (bytes[position >> 3] & (1 << (position & 7))) number |= 1 << bit
    }
    return number
  })
  if (numbers.some((n) => n < 1) || new Set(numbers).size !== CARD_COUNT) return null
  return Array.from({ length: TOTAL_ROUNDS }, (_, round) =>
    numbers.slice(round * ROUND_SIZE, (round + 1) * ROUND_SIZE),
  )
}
