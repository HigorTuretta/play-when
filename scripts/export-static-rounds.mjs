// Regenerates public/rounds/<version>/ from the rounds already seeded in Firestore.
// Read-only against Firestore. Use it when facts.json is not at hand; seed-firestore.mjs
// writes the same files while seeding.
import process from 'node:process'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import {
  ROUND_COUNT, isGuestRound, publicCard, resetStaticRoundsDir, roundIdFor, staticRoundsDir, writeStaticRound,
} from './lib/rounds.mjs'
import { resolveImages } from './lib/wikipedia.mjs'

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'tempo-certo-6ccc2'

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
const db = getFirestore()

const numbers = Array.from({ length: ROUND_COUNT }, (_, index) => index + 1)
const guestNumbers = numbers.filter(isGuestRound)

const [roundSnaps, answerSnaps] = await Promise.all([
  db.getAll(...numbers.map((n) => db.doc(`rounds/${roundIdFor(n)}`))),
  db.getAll(...guestNumbers.map((n) => db.doc(`roundAnswers/${roundIdFor(n)}`))),
])

const missing = [...roundSnaps, ...answerSnaps].filter((snap) => !snap.exists).map((snap) => snap.ref.path)
if (missing.length) throw new Error(`Missing documents: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`)

const answers = new Map(answerSnaps.map((snap) => [snap.id, snap.data()]))
const images = await resolveImages(roundSnaps.flatMap((snap) => snap.data().cards))

await resetStaticRoundsDir()
for (const snap of roundSnaps) {
  const cards = snap.data().cards.map((card) => publicCard(card, images.get(card.id)))
  await writeStaticRound(snap.id, cards, answers.get(snap.id))
}

const withoutImage = [...images.values()].filter((image) => !image).length
console.log(`Exported ${roundSnaps.length} rounds (${answers.size} with guest answers) to ${staticRoundsDir}`)
console.log(`Images: ${images.size - withoutImage}/${images.size} facts resolved on Wikipedia.`)
