import { STATIC_ROUNDS_URL } from '../constants'

const requests = new Map()

// Static game files are fetched once per page load and cached by the browser as immutable
// (their folder changes whenever their content does), so they cost no Firestore reads.
export function fetchStatic(name) {
  if (!requests.has(name)) {
    const request = fetch(`${STATIC_ROUNDS_URL}/${name}`)
      .then((response) => {
        if (!response.ok) throw new Error('static-file-not-found')
        return response.json()
      })
      .catch((error) => {
        requests.delete(name)
        throw error
      })
    requests.set(name, request)
  }
  return requests.get(name)
}

// Facts with public years, dealt by the normal mode (see scripts/lib/gameData.mjs).
export const loadCatalog = () => fetchStatic('catalog.json').then((data) => data.facts)

// The events of each ranked round, used to choose rounds without repeats.
export const loadRoundIndex = () => fetchStatic('index.json')

// A ranked round's cards. Its answer is not in the file: it is read from Firestore after
// the player's order is on record.
export async function getRankedRound(roundId) {
  const { cards } = await fetchStatic(`${roundId}.json`)
  return { id: roundId, cards }
}
