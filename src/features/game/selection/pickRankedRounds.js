import { recencyPenalties } from './history'

const CATEGORY_WEIGHT = 0.4

// Ranked rounds are fixed sets of four cards whose answers live only in Firestore, so a
// ranked game is six whole rounds the player has never answered (isUsed). Among those it
// prefers rounds whose events the player has not seen recently, never repeats an event
// inside a game when it can avoid it, and spreads categories. A random term breaks ties,
// so two players with the same history still get different games.
export function pickRankedRounds(index, history, isUsed, { count = 6, random = Math.random } = {}) {
  const penalties = recencyPenalties(history, Object.keys(index.eventCategories).length)
  const chosen = []
  const chosenEvents = new Set()
  const categories = new Map()

  const best = (allowRepeats) => {
    let pick = null
    let pickScore = Infinity
    index.rounds.forEach((events, position) => {
      const number = position + 1
      if (isUsed(number) || chosen.includes(number)) return
      if (!allowRepeats && events.some((event) => chosenEvents.has(event))) return
      let score = random()
      for (const event of events) {
        score += penalties.get(event) || 0
        score += (categories.get(index.eventCategories[event]) || 0) * CATEGORY_WEIGHT
      }
      if (score < pickScore) {
        pick = number
        pickScore = score
      }
    })
    return pick
  }

  for (let slot = 0; slot < count; slot += 1) {
    const number = best(false) ?? best(true)
    if (number === null) return null
    chosen.push(number)
    for (const event of index.rounds[number - 1]) {
      chosenEvents.add(event)
      const category = index.eventCategories[event]
      categories.set(category, (categories.get(category) || 0) + 1)
    }
  }

  return chosen
}
