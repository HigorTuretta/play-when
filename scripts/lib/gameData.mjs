import fs from 'node:fs/promises'
import path from 'node:path'
import {
  RANKED_POOL_SIZE,
  ROUND_COUNT,
  isGuestRound,
  roundIdFor,
  staticRoundsDir,
} from './rounds.mjs'

export const CATALOG_FILE = 'catalog.json'
export const INDEX_FILE = 'index.json'

const eventNumber = (id) => Number(id.replace('event-', ''))

async function readRounds(dir) {
  const rounds = []
  for (let n = 1; n <= ROUND_COUNT; n += 1) {
    const roundId = roundIdFor(n)
    rounds.push({ n, ...JSON.parse(await fs.readFile(path.join(dir, `${roundId}.json`), 'utf8')) })
  }
  return rounds
}

// Two files derived from the published rounds, so they can never disagree with them:
//
// catalog.json — every fact whose year is already public (it appears in a guest round,
// whose answer ships in the round file). The normal mode deals its cards from here, fact
// by fact, which lets it avoid repeats and balance categories and eras. It publishes no
// year that was not public before.
//
// index.json — the four events of each ranked round (card ids only, no years) and each
// event's category. The ranked mode reads it to choose rounds the player has not seen
// recently, without downloading 2,250 round files.
export async function buildGameData(dir = staticRoundsDir) {
  const rounds = await readRounds(dir)
  const cards = new Map()
  const years = new Map()

  for (const round of rounds) {
    for (const card of round.cards) cards.set(card.id, card)
    if (isGuestRound(round.n) && round.answer) {
      for (const [id, year] of Object.entries(round.answer.years)) years.set(id, year)
    }
  }

  const facts = [...years.keys()]
    .sort((a, b) => eventNumber(a) - eventNumber(b))
    .map((id) => {
      const { titlePt, titleEn, category, image } = cards.get(id)
      return { id, titlePt, titleEn, category, image, year: years.get(id) }
    })

  const categories = [...new Set([...cards.values()].map((card) => card.category))].sort()
  const eventCategories = {}
  for (const card of [...cards.values()].sort((a, b) => eventNumber(a.id) - eventNumber(b.id))) {
    eventCategories[eventNumber(card.id)] = categories.indexOf(card.category)
  }

  const index = {
    rankedPoolSize: RANKED_POOL_SIZE,
    categories,
    eventCategories,
    rounds: rounds
      .filter((round) => !isGuestRound(round.n))
      .map((round) => round.cards.map((card) => eventNumber(card.id))),
  }

  return {
    [CATALOG_FILE]: `${JSON.stringify({ facts })}\n`,
    [INDEX_FILE]: `${JSON.stringify(index)}\n`,
  }
}

export async function writeGameData(dir = staticRoundsDir) {
  const files = await buildGameData(dir)
  for (const [name, body] of Object.entries(files)) await fs.writeFile(path.join(dir, name), body)
  return files
}
