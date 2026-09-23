import { TOPICS } from '../topics'

// The fact catalogue is its own chunk: only the history, topic and fact pages need it.
let facts = null
let pending = null

export function loadFacts() {
  if (facts) return Promise.resolve(facts)
  pending ||= import('./catalog').then((module) => {
    facts = module.FACTS
    return facts
  })
  return pending
}

// Synchronous access for rendering. prepareRoute() loads the catalogue before any page
// that needs it is rendered, so this is only null on pages that never read it.
export const loadedFacts = () => facts || []

export const factBySlug = (slug, language) =>
  loadedFacts().find((fact) => fact.slug[language] === slug) || null

export const factById = (id) => loadedFacts().find((fact) => fact.id === id) || null

export const factsForTopic = (topicId) =>
  loadedFacts().filter((fact) => fact.topics.includes(topicId))

// A topic page is only published when it has at least one fact to link to.
export const publishedTopics = () => TOPICS.filter((topic) => factsForTopic(topic.id).length > 0)
