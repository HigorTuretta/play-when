import { eventNumber, recencyPenalties } from './history'

// Periods used to spread a game across history. The catalogue leans modern, so the
// recent buckets are narrower.
const ERA_STARTS = [1500, 1800, 1900, 1950, 1980, 2000]
const eraOf = (year) => ERA_STARTS.filter((start) => year >= start).length

// Soft caps per game, relaxed only when a round cannot be completed without breaking them.
const LIMITS = [
  { category: 3, era: 6 },
  { category: 4, era: 8 },
  { category: Infinity, era: Infinity },
]

// Deals a normal game fact by fact from the public catalogue:
// - facts seen recently (see recencyPenalties) sink to the end of the queue;
// - the rest are shuffled, so the order is never predictable;
// - each round has four different categories and four different years (the order must be
//   unambiguous), and no fact appears twice in a game;
// - a game does not lean on one category or one period.
export function pickNormalGame(
  facts,
  history,
  { rounds = 6, size = 4, random = Math.random } = {},
) {
  const penalties = recencyPenalties(history, facts.length)
  const queue = facts
    .map((fact) => ({
      fact,
      era: eraOf(fact.year),
      score: (penalties.get(eventNumber(fact.id)) || 0) + random(),
    }))
    .sort((a, b) => a.score - b.score)

  const used = new Set()
  const categories = new Map()
  const eras = new Map()
  const game = []

  const fillRound = (limits) => {
    const round = []
    const roundCategories = new Set()
    const roundYears = new Set()
    for (const item of queue) {
      const { fact, era } = item
      if (used.has(fact.id) || roundCategories.has(fact.category) || roundYears.has(fact.year)) {
        continue
      }
      if ((categories.get(fact.category) || 0) >= limits.category) continue
      if ((eras.get(era) || 0) >= limits.era) continue
      round.push(item)
      roundCategories.add(fact.category)
      roundYears.add(fact.year)
      if (round.length === size) return round
    }
    return null
  }

  for (let index = 0; index < rounds; index += 1) {
    const round = LIMITS.reduce((found, limits) => found || fillRound(limits), null)
    if (!round) throw new Error('round-selection-failed')
    for (const { fact, era } of round) {
      used.add(fact.id)
      categories.set(fact.category, (categories.get(fact.category) || 0) + 1)
      eras.set(era, (eras.get(era) || 0) + 1)
    }
    game.push(round.map(({ fact }) => fact))
  }

  return game
}
