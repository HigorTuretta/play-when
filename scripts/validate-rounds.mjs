// Checks the published round files (public/rounds/<version>/). Run it after seeding or
// after `npm run retext:rounds` to confirm that what ships matches the rules the game
// relies on: four cards, one per category, no repeated event, no year given away in a
// title, and a guest answer that really is the four cards sorted by year.
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { ROUND_COUNT, isGuestRound, roundIdFor, staticRoundsDir, staticRoundsDirFor } from './lib/rounds.mjs'

const ROUND_SIZE = 4
const TITLE_YEAR = /\b(?:1[0-9]{3}|20[0-9]{2})\b/
const YEAR_ALLOWED = new Set(['event-376'])
const CARD_FIELDS = ['id', 'titlePt', 'titleEn', 'category', 'image']

const dir = process.argv[2] ? staticRoundsDirFor(process.argv[2]) : staticRoundsDir
const errors = []
const report = (roundId, message) => errors.push(`${roundId}: ${message}`)

let repeatedCategory = 0
const categoryUse = new Map()

for (let index = 1; index <= ROUND_COUNT; index += 1) {
  const roundId = roundIdFor(index)
  let round
  try {
    round = JSON.parse(await fs.readFile(path.join(dir, `${roundId}.json`), 'utf8'))
  } catch {
    report(roundId, 'missing or unreadable')
    continue
  }

  const { cards } = round
  if (!Array.isArray(cards) || cards.length !== ROUND_SIZE) {
    report(roundId, `expected ${ROUND_SIZE} cards, found ${cards?.length}`)
    continue
  }

  if (new Set(cards.map((card) => card.id)).size !== ROUND_SIZE) report(roundId, 'repeats an event')

  const categories = new Set(cards.map((card) => card.category))
  if (categories.size !== ROUND_SIZE) repeatedCategory += 1
  for (const category of cards.map((card) => card.category)) {
    categoryUse.set(category, (categoryUse.get(category) || 0) + 1)
  }

  for (const card of cards) {
    const unexpected = Object.keys(card).filter((field) => !CARD_FIELDS.includes(field))
    if (unexpected.length) report(roundId, `${card.id} publishes ${unexpected.join(', ')}`)
    if (!card.titlePt || !card.titleEn) report(roundId, `${card.id} is missing a title`)
    if (!YEAR_ALLOWED.has(card.id) && (TITLE_YEAR.test(card.titlePt) || TITLE_YEAR.test(card.titleEn))) {
      report(roundId, `${card.id} gives the year away in its title`)
    }
  }

  const { answer } = round
  if (isGuestRound(index)) {
    if (!answer) {
      report(roundId, 'guest round has no answer')
    } else {
      const ids = cards.map((card) => card.id).sort()
      if (JSON.stringify([...answer.correctOrder].sort()) !== JSON.stringify(ids)) {
        report(roundId, 'answer is not a permutation of the cards')
      }
      const years = answer.correctOrder.map((id) => answer.years[id])
      if (new Set(years).size !== ROUND_SIZE) report(roundId, 'answer repeats a year')
      if (years.some((year, position) => position > 0 && year < years[position - 1])) {
        report(roundId, 'answer is not sorted from oldest to newest')
      }
    }
  } else if (answer) {
    report(roundId, 'ranked round ships its answer publicly')
  }
}

console.log(`Checked ${ROUND_COUNT} rounds in ${path.basename(dir)}.`)
console.log(`Categories per round: ${repeatedCategory} of ${ROUND_COUNT} rounds repeat one.`)
console.log([...categoryUse.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${n}`).join(' · '))

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`)
  console.error(errors.slice(0, 20).join('\n'))
  if (errors.length > 20) console.error(`…and ${errors.length - 20} more.`)
  process.exit(1)
}
if (repeatedCategory) {
  console.error('\nSome rounds repeat a category. Reseed with `npm run seed:firestore` to rebuild them.')
  process.exit(1)
}
console.log('OK.')
