import fs from 'node:fs'
import { describe, expect, test } from 'vitest'
import {
  HISTORY_LIMIT,
  appendHistory,
  decodeHistory,
  encodeHistory,
  eventNumber,
  mergeHistories,
} from '../../src/features/game/selection/history'
import { pickNormalGame } from '../../src/features/game/selection/pickNormalGame'
import { pickRankedRounds } from '../../src/features/game/selection/pickRankedRounds'
import { createUsedRounds } from '../../src/features/game/selection/usedRounds'

const read = (name) => JSON.parse(fs.readFileSync(`public/rounds/v2/${name}`, 'utf8'))
const { facts } = read('catalog.json')
const index = read('index.json')

// A seeded random source keeps these tests deterministic.
function seeded(seed) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

describe('recent-facts history', () => {
  test('appending moves repeated events to the recent end instead of duplicating them', () => {
    expect(appendHistory([1, 2, 3], [2, 4])).toEqual([1, 3, 2, 4])
  })

  test('keeps at most HISTORY_LIMIT events, dropping the oldest', () => {
    const long = Array.from({ length: HISTORY_LIMIT + 50 }, (_, i) => i + 1)
    const history = appendHistory([], long)
    expect(history).toHaveLength(HISTORY_LIMIT)
    expect(history.at(-1)).toBe(HISTORY_LIMIT + 50)
  })

  test('survives the round trip through its compact text form', () => {
    expect(decodeHistory(encodeHistory([238, 5, 17]))).toEqual([238, 5, 17])
    expect(decodeHistory('1 x -3 4')).toEqual([1, 4])
    expect(decodeHistory(null)).toEqual([])
  })

  test('merging keeps what both copies have seen', () => {
    expect(mergeHistories([1, 2], [2, 3])).toEqual([1, 2, 3])
  })
})

describe('normal games', () => {
  test('deal six rounds of four cards with distinct categories and years', () => {
    const game = pickNormalGame(facts, [], { random: seeded(1) })
    expect(game).toHaveLength(6)
    for (const round of game) {
      expect(round).toHaveLength(4)
      expect(new Set(round.map((fact) => fact.category)).size).toBe(4)
      expect(new Set(round.map((fact) => fact.year)).size).toBe(4)
    }
    expect(new Set(game.flat().map((fact) => fact.id)).size).toBe(24)
  })

  test('do not repeat a fact across the next ten games', () => {
    const random = seeded(2)
    let history = []
    const seen = new Set()
    for (let game = 0; game < 10; game += 1) {
      const ids = pickNormalGame(facts, history, { random })
        .flat()
        .map((fact) => fact.id)
      for (const id of ids) expect(seen.has(id)).toBe(false)
      ids.forEach((id) => seen.add(id))
      history = appendHistory(history, ids.map(eventNumber))
    }
  })

  test('spread a game over many categories', () => {
    const game = pickNormalGame(facts, [], { random: seeded(3) }).flat()
    const counts = {}
    for (const fact of game) counts[fact.category] = (counts[fact.category] || 0) + 1
    expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(3)
  })
})

describe('ranked games', () => {
  test('never deal a round the player already has', () => {
    const used = createUsedRounds()
    for (let n = 1; n <= 2000; n += 1) used.add(n)
    const rounds = pickRankedRounds(index, [], used.has, { random: seeded(4) })
    expect(rounds).toHaveLength(6)
    for (const n of rounds) expect(n).toBeGreaterThan(2000)
  })

  test('avoid recently seen events and repeats inside a game', () => {
    const random = seeded(5)
    const used = createUsedRounds()
    let history = []
    const seen = new Set()
    for (let game = 0; game < 8; game += 1) {
      const rounds = pickRankedRounds(index, history, used.has, { random })
      const events = rounds.flatMap((n) => index.rounds[n - 1])
      expect(new Set(events).size).toBe(24)
      for (const event of events) expect(seen.has(event)).toBe(false)
      events.forEach((event) => seen.add(event))
      rounds.forEach(used.add)
      history = appendHistory(history, events)
    }
  })

  test('report exhaustion instead of dealing a used round', () => {
    const used = createUsedRounds()
    for (let n = 1; n <= index.rounds.length - 3; n += 1) used.add(n)
    expect(pickRankedRounds(index, [], used.has)).toBeNull()
  })
})

describe('used-rounds bitset', () => {
  test('round-trips through base64', () => {
    const used = createUsedRounds()
    ;[1, 8, 9, 1999, 2250].forEach(used.add)
    const copy = createUsedRounds(used.encode())
    expect([1, 8, 9, 1999, 2250].every(copy.has)).toBe(true)
    expect(copy.has(2)).toBe(false)
    expect(copy.count()).toBe(5)
    expect(used.encode().length).toBeLessThan(400)
  })

  test('ignores garbage', () => {
    expect(createUsedRounds('%%%').count()).toBe(0)
  })
})
