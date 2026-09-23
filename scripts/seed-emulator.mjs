// Fills the local Firestore emulator (project demo-play-when) with answers for the ranked
// rounds, so ranked games can be played end to end with `npm run dev:emulators`. The real
// answers are private and never leave production; these are made up (each round's cards
// in file order, one year apart). Refuses to run against anything but the emulator.
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { RANKED_POOL_SIZE, roundIdFor, staticRoundsDir } from './lib/rounds.mjs'

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error(
    'Set FIRESTORE_EMULATOR_HOST (e.g. 127.0.0.1:8080). This script only seeds the emulator.',
  )
  process.exit(1)
}

initializeApp({ projectId: 'demo-play-when' })
const db = getFirestore()
const writer = db.bulkWriter()

for (let n = 1; n <= RANKED_POOL_SIZE; n += 1) {
  const roundId = roundIdFor(n)
  const { cards } = JSON.parse(
    await fs.readFile(path.join(staticRoundsDir, `${roundId}.json`), 'utf8'),
  )
  const correctOrder = cards.map((card) => card.id)
  const years = Object.fromEntries(correctOrder.map((id, index) => [id, 1900 + index]))
  writer.set(db.doc(`roundAnswers/${roundId}`), { correctOrder, years })
}

await writer.close()
console.log(`Seeded made-up answers for ${RANKED_POOL_SIZE} ranked rounds in the emulator.`)
