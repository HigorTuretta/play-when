// Rewrites the card text of the published round files from data/event-titles-*.json into
// the current STATIC_ROUNDS_VERSION, leaving every round's cards, images and answers
// exactly as they are. Use it when only the wording changes: reseeding is not needed,
// because the answers in Firestore are keyed by round id and card id, neither of which
// this touches. /rounds/** is served as immutable, so the version must be bumped for the
// new text to reach players — which is what makes this a copy from one version to another.
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  ROUND_COUNT, publicCard, resetStaticRoundsDir, roundIdFor, staticRoundsDir, staticRoundsDirFor,
  STATIC_ROUNDS_VERSION, writeStaticRound,
} from './lib/rounds.mjs'

const from = process.argv[2] || 'v1'
if (from === STATIC_ROUNDS_VERSION) {
  throw new Error(`Source and target are both ${from}. Bump STATIC_ROUNDS_VERSION first.`)
}

const sourceDir = staticRoundsDirFor(from)
await resetStaticRoundsDir()

let written = 0
for (let index = 1; index <= ROUND_COUNT; index += 1) {
  const roundId = roundIdFor(index)
  const round = JSON.parse(await fs.readFile(path.join(sourceDir, `${roundId}.json`), 'utf8'))
  const cards = round.cards.map((card) => publicCard(card, card.image))
  await writeStaticRound(roundId, cards, round.answer || null)
  written += 1
}

console.log(`Rewrote ${written} rounds from ${from} into ${path.basename(staticRoundsDir)}.`)
console.log(`Keep public/rounds/${from} for one release so tabs still running the old bundle keep working.`)
