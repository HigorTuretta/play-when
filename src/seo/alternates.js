import { LANGUAGES, homePath, isStaticPage, pathFor } from '../config/routes'
import { topicBySlug } from '../content/topics'
import { factBySlug } from '../content/facts/store'

// The same page in each language, or null when a page has no version in that language
// (e.g. an unknown fact slug).
function slugIn(route, language) {
  const { name, params, language: from } = route
  if (name === 'challenge') return params.slug
  if (name === 'topic') return topicBySlug(params.slug, from)?.slug[language] || null
  if (name === 'fact') return factBySlug(params.slug, from)?.slug[language] || null
  return null
}

export function alternatePath(route, language) {
  if (isStaticPage(route.name)) return pathFor(route.name, language)
  const slug = slugIn(route, language)
  return slug ? pathFor(route.name, language, { slug }) : homePath(language)
}

export function alternatePaths(route) {
  return Object.fromEntries(LANGUAGES.map((language) => [language, alternatePath(route, language)]))
}
