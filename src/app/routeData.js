import { loadFacts } from '../content/facts/store'

const NEEDS_FACTS = new Set(['history', 'topic', 'fact'])

// Loads what a route renders before it is shown: on navigation, before hydrating a
// prerendered page, and before prerendering it. Only the fact catalogue is loaded on
// demand; everything else ships with the main bundle.
export async function prepareRoute(route) {
  if (NEEDS_FACTS.has(route.name)) await loadFacts()
}
