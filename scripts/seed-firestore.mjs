import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const factsPath = path.resolve(__dirname, '../private-data/facts.json')
const ROUND_COUNT = 2500
const ROUND_SIZE = 4
const SEED = 0x54494d45

function mulberry32(seed) {
  return function rand() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function shuffled(items, rand) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function makeRound(facts, rand) {
  for (let tries = 0; tries < 200; tries += 1) {
    const cards = shuffled(facts, rand).slice(0, ROUND_SIZE)
    if (new Set(cards.map((item) => item.year)).size === ROUND_SIZE) return cards
  }
  throw new Error('Could not build a round with four distinct years.')
}

const facts = JSON.parse(await fs.readFile(factsPath, 'utf8'))
if (facts.length !== 500) throw new Error(`Expected exactly 500 facts, found ${facts.length}.`)
if (new Set(facts.map((item) => item.id)).size !== facts.length) throw new Error('Duplicate fact ids found.')

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  'tempo-certo-6ccc2'

initializeApp({
  credential: applicationDefault(),
  projectId: PROJECT_ID
})
const db = getFirestore()
const writer = db.bulkWriter()
writer.onWriteError((error) => {
  if (error.failedAttempts < 5) return true
  console.error('Write failed:', error.documentRef.path, error.message)
  return false
})

for (const fact of facts) {
  const { year, sourceUrl, datePrecision, ...publicFact } = fact
  writer.set(db.doc(`facts/${fact.id}`), { ...publicFact, active: true, updatedAt: FieldValue.serverTimestamp() })
  writer.set(db.doc(`factAnswers/${fact.id}`), { year, sourceUrl, datePrecision, updatedAt: FieldValue.serverTimestamp() })
}

const rand = mulberry32(SEED)
for (let index = 1; index <= ROUND_COUNT; index += 1) {
  const selected = makeRound(facts, rand)
  const roundId = `round-${String(index).padStart(4, '0')}`
  const publicCards = shuffled(selected, rand).map(({ year, sourceUrl, datePrecision, ...card }) => card)
  const correct = [...selected].sort((a, b) => a.year - b.year)

  writer.set(db.doc(`rounds/${roundId}`), {
    cards: publicCards,
    version: 1,
    active: true,
    updatedAt: FieldValue.serverTimestamp(),
  })

  writer.set(db.doc(`roundAnswers/${roundId}`), {
    correctOrder: correct.map((item) => item.id),
    years: Object.fromEntries(selected.map((item) => [item.id, item.year])),
    updatedAt: FieldValue.serverTimestamp(),
  })
}

writer.set(db.doc('config/game'), {
  factCount: facts.length,
  roundCount: ROUND_COUNT,
  roundsPerGame: 6,
  cardsPerRound: 4,
  dailyLimit: 3,
  updatedAt: FieldValue.serverTimestamp(),
})

await writer.close()
console.log(`Seed concluído: ${facts.length} fatos + ${ROUND_COUNT} rodadas públicas/privadas.`)
console.log('As respostas ficam apenas em factAnswers/ e roundAnswers/, bloqueadas pelas Security Rules.')
