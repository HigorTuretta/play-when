import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Keep in sync with src/features/game/constants.js and validRankedRoundId() in firestore.rules.
// Rounds 1..RANKED_POOL_SIZE are ranked: their answers stay in Firestore and can only be read
// after the attempt is recorded. The rest form the guest pool, whose answers ship as static JSON.
export const ROUND_COUNT = 2500
export const RANKED_POOL_SIZE = 2250
export const STATIC_ROUNDS_VERSION = 'v1'

export const roundIdFor = (n) => `round-${String(n).padStart(4, '0')}`
export const isGuestRound = (n) => n > RANKED_POOL_SIZE

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const staticRoundsDir = path.resolve(__dirname, '../../public/rounds', STATIC_ROUNDS_VERSION)

// Only display fields are published. imageQuery (often "<event> <year>"), the year itself and
// the source links stay private.
export const publicCard = ({ id, titlePt, titleEn, category, shortPt, shortEn }, image) => ({
  id, titlePt, titleEn, category, shortPt, shortEn, image: image || null,
})

export async function writeStaticRound(roundId, cards, answer = null) {
  const body = answer
    ? { cards, answer: { correctOrder: answer.correctOrder, years: answer.years } }
    : { cards }
  await fs.writeFile(path.join(staticRoundsDir, `${roundId}.json`), `${JSON.stringify(body)}\n`)
}

export async function resetStaticRoundsDir() {
  await fs.rm(staticRoundsDir, { recursive: true, force: true })
  await fs.mkdir(staticRoundsDir, { recursive: true })
}
