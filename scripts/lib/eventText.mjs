import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Card titles are checked into the repository, not derived from the seed data: titleEn
// used to carry the Wikipedia search query (often "<event> <year>"), which both spoiled
// the answer and read as a fragment rather than a sentence. data/event-titles-pt.json
// only holds the Portuguese titles that need to differ from the seed.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, '../../data')

const read = async (name) => JSON.parse(await fs.readFile(path.join(dataDir, name), 'utf8'))

const [titlesEn, titlesPt] = await Promise.all([
  read('event-titles-en.json'),
  read('event-titles-pt.json'),
])

// "2001: A Space Odyssey" is the name of the film, not the year of its release.
const TITLE_YEAR = /\b(?:1[0-9]{3}|20[0-9]{2})\b/
const YEAR_ALLOWED = new Set(['event-376'])

export const titleEnFor = (card) => titlesEn[card.id] || card.titleEn || card.titlePt
export const titlePtFor = (card) => titlesPt[card.id] || card.titlePt

// A published title that names a year hands the player the answer before they order the
// cards, so it never reaches a round file.
export function assertNoYearInTitles(card) {
  if (YEAR_ALLOWED.has(card.id)) return
  for (const title of [titlePtFor(card), titleEnFor(card)]) {
    if (TITLE_YEAR.test(title)) throw new Error(`${card.id}: published title names a year: "${title}"`)
  }
}

export const titleCatalogueSize = Object.keys(titlesEn).length
