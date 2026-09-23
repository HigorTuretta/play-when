import { describe, expect, test } from 'vitest'
import { decodeChallenge, encodeChallenge } from '../../src/features/challenge/challengeCode'
import { shareTextFrom } from '../../src/features/results/share'

const rounds = Array.from({ length: 6 }, (_, r) => [1, 2, 3, 4].map((c) => r * 4 + c + 100))

const results = rounds.map((round, index) => {
  const cards = round.map((n) => ({ id: `event-${n}`, titlePt: `Fato ${n}`, year: 1900 + n }))
  const correct = cards.map((card) => card.id)
  const ordered = index === 0 ? [...cards].reverse() : cards
  const hits = ordered.filter((card, i) => correct[i] === card.id).length
  return { round: index, hits, ordered, correct, timedOut: false }
})

describe('challenge codes', () => {
  test('carry the 24 facts of a game', () => {
    const code = encodeChallenge(rounds)
    expect(code).toMatch(/^[A-Za-z0-9_-]{36}$/)
    expect(decodeChallenge(code)).toEqual(rounds)
  })

  test('reject anything malformed', () => {
    expect(decodeChallenge('abc')).toBeNull()
    expect(decodeChallenge('!'.repeat(36))).toBeNull()
    expect(decodeChallenge('A'.repeat(36))).toBeNull()
  })
})

describe('shared results', () => {
  const text = (mode, language = 'pt-BR') =>
    shareTextFrom({ results, score: 1000, mode, challenge: encodeChallenge(rounds), language })

  test('show the score, the hits and one row of squares per round', () => {
    const shared = text('normal')
    expect(shared).toContain('When?')
    expect(shared).toContain('1000 pts')
    expect(shared).toContain('20/24')
    expect(shared.match(/[🟩🟥]{4}/gu)).toHaveLength(6)
  })

  test('never reveal cards, years or the source repository', () => {
    const shared = text('normal') + text('ranked', 'en')
    expect(shared).not.toMatch(/github/i)
    expect(shared).not.toMatch(/Fato|event-|19\d\d|20\d\d/)
  })

  test('link normal games to a challenge and ranked games to the home page', () => {
    expect(text('normal')).toMatch(/\/desafio\/[A-Za-z0-9_-]{36}$/)
    expect(text('normal', 'en')).toMatch(/\/challenge\/[A-Za-z0-9_-]{36}$/)
    expect(text('ranked')).toMatch(/\/$/)
    expect(text('ranked', 'en')).toMatch(/\/en$/)
  })
})
