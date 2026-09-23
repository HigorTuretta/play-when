import { eventNumber } from '../selection/history'
import { scoreRound } from '../scoring'
import { loadCatalog } from './gameData'

const publicCard = ({ id, titlePt, titleEn, category, image }) => ({
  id,
  titlePt,
  titleEn,
  category,
  image,
})

// A normal round is four facts from the public catalogue. The years stay out of the cards
// until the order is confirmed.
export async function getNormalRound(factIds) {
  const catalog = await loadCatalog()
  const facts = factIds.map((id) => catalog.find((fact) => fact.id === id))
  if (facts.some((fact) => !fact)) throw new Error('round-not-found')

  const correctOrder = [...facts].sort((a, b) => a.year - b.year).map((fact) => fact.id)
  const years = Object.fromEntries(facts.map((fact) => [fact.id, fact.year]))
  return { data: { cards: facts.map(publicCard) }, answer: { correctOrder, years } }
}

export function scoreNormalRound(orderedIds, answer, streakBefore) {
  return { ...scoreRound(orderedIds, answer.correctOrder, streakBefore), ...answer }
}

// Checks that a game (e.g. from a challenge link) can be dealt from this catalogue: known
// facts, no repeats, and four different years per round so the order is unambiguous.
export async function validateNormalRounds(rounds) {
  const catalog = await loadCatalog()
  const byNumber = new Map(catalog.map((fact) => [eventNumber(fact.id), fact]))
  const seen = new Set()
  const factRounds = []
  for (const round of rounds) {
    const facts = round.map((number) => byNumber.get(number))
    if (facts.some((fact) => !fact || seen.has(fact.id))) return null
    if (new Set(facts.map((fact) => fact.year)).size !== facts.length) return null
    facts.forEach((fact) => seen.add(fact.id))
    factRounds.push(facts.map((fact) => fact.id))
  }
  return factRounds
}
