import React from 'react'
import { renderToString } from 'react-dom/server'
import App from './app/App'
import AppProviders from './app/AppProviders'
import { prepareRoute } from './app/routeData'
import { routeKey } from './app/routeKey'
import { LANGUAGES, pathFor, resolvePath, staticPageNames } from './config/routes'
import { SITE_URL, absoluteUrl } from './config/site'
import { loadFacts, publishedTopics } from './content/facts/store'
import { buildHead, renderHead } from './seo/head'

export { SITE_URL, absoluteUrl }

// Used by scripts/prerender.mjs, which runs this bundle in Node after the client build.
export async function render(path) {
  const route = resolvePath(path)
  await prepareRoute(route)
  const html = renderToString(
    <AppProviders initialPath={path}>
      <App />
    </AppProviders>,
  )
  const head = buildHead(route)
  return {
    html,
    head: renderHead(head),
    language: route.language,
    routeKey: routeKey(route),
    indexable: Boolean(head.canonical),
    alternates: head.alternates,
  }
}

// Every page to prerender. Fact and topic pages come from src/content, so a new fact file
// is published (and added to the sitemap) without touching this list.
export async function listPages() {
  const facts = await loadFacts()
  const paths = []
  for (const language of LANGUAGES) {
    for (const name of staticPageNames()) paths.push(pathFor(name, language))
    for (const topic of publishedTopics()) {
      paths.push(pathFor('topic', language, { slug: topic.slug[language] }))
    }
    for (const fact of facts) paths.push(pathFor('fact', language, { slug: fact.slug[language] }))
  }
  return paths
}
