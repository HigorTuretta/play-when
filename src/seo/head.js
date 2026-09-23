import { LANGUAGES, pathFor } from '../config/routes'
import {
  AUTHOR_NAME,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGES,
  SOCIAL_IMAGE_SIZE,
  absoluteUrl,
} from '../config/site'
import { factBySlug, factsForTopic } from '../content/facts/store'
import { topicById, topicBySlug } from '../content/topics'
import { languages, translations } from '../i18n'
import { alternatePaths } from './alternates'
import { PAGE_META } from './pageMeta'

// Everything that goes in <head> for a route, built once and used twice: rendered to a
// string by the prerender script, and applied to the live document on navigation.

const INDEXABLE = new Set([
  'home',
  'howToPlay',
  'about',
  'ranking',
  'history',
  'privacy',
  'terms',
  'topic',
  'fact',
])

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}

const publisher = { '@type': 'Person', name: AUTHOR_NAME }

function structuredData(route, meta, url) {
  const { name, language } = route
  const t = translations[language]
  const home = [t.home, pathFor('home', language)]
  const webPage = (type = 'WebPage') => ({
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: meta.title,
    description: meta.description,
    inLanguage: language,
    isPartOf: { '@id': `${SITE_URL}/#website` },
  })

  if (name === 'home') {
    return [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: absoluteUrl('/'),
        name: SITE_NAME,
        inLanguage: LANGUAGES,
      },
      {
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        url,
        description: meta.description,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        inLanguage: LANGUAGES,
        isAccessibleForFree: true,
        author: publisher,
        offers: { '@type': 'Offer', price: '0', priceCurrency: language === 'en' ? 'USD' : 'BRL' },
      },
    ]
  }

  if (name === 'fact') {
    const fact = factBySlug(route.params.slug, language)
    const text = fact[language]
    const topic = topicById(fact.topics[0])
    return [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: text.title,
        description: text.description,
        inLanguage: language,
        url,
        mainEntityOfPage: url,
        author: publisher,
        publisher,
        image: absoluteUrl(SOCIAL_IMAGES[language]),
        about: { '@type': 'Thing', name: text.title },
        citation: fact.sources.map((source) => source.url),
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      breadcrumb([
        home,
        [t.nav.history, pathFor('history', language)],
        [topic[language].name, pathFor('topic', language, { slug: topic.slug[language] })],
        [text.title, route.path],
      ]),
    ]
  }

  if (name === 'topic') {
    const topic = topicBySlug(route.params.slug, language)
    const facts = factsForTopic(topic.id)
    return [
      {
        ...webPage('CollectionPage'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: facts.map((fact, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(pathFor('fact', language, { slug: fact.slug[language] })),
            name: fact[language].title,
          })),
        },
      },
      breadcrumb([
        home,
        [t.nav.history, pathFor('history', language)],
        [topic[language].name, route.path],
      ]),
    ]
  }

  if (name === 'history') {
    return [webPage('CollectionPage'), breadcrumb([home, [t.nav.history, route.path]])]
  }

  const labels = {
    howToPlay: t.nav.howToPlay,
    about: t.nav.about,
    ranking: t.nav.ranking,
    privacy: t.privacy,
    terms: t.terms,
  }
  if (labels[name]) {
    const type = name === 'about' ? 'AboutPage' : 'WebPage'
    return [webPage(type), breadcrumb([home, [labels[name], route.path]])]
  }
  return []
}

function metaFor(route) {
  const { name, language, params } = route
  if (name === 'fact') {
    const fact = factBySlug(params.slug, language)
    if (fact)
      return { title: `${fact[language].title} | When?`, description: fact[language].description }
  }
  if (name === 'topic') {
    const topic = topicBySlug(params.slug, language)
    if (topic && factsForTopic(topic.id).length) {
      return { title: `${topic[language].title} | When?`, description: topic[language].description }
    }
  }
  return PAGE_META[name]?.[language] || PAGE_META.notFound[language]
}

// A slug that matches no content renders the not-found page, and is described as one.
function effectiveRoute(route) {
  if (route.name === 'fact' && !factBySlug(route.params.slug, route.language)) {
    return { ...route, name: 'notFound' }
  }
  if (route.name === 'topic') {
    const topic = topicBySlug(route.params.slug, route.language)
    if (!topic || !factsForTopic(topic.id).length) return { ...route, name: 'notFound' }
  }
  return route
}

export function buildHead(input) {
  const route = effectiveRoute(input)
  const { name, language } = route
  const meta = metaFor(route)
  const indexable = INDEXABLE.has(name)
  const url = absoluteUrl(route.path)
  const image = absoluteUrl(SOCIAL_IMAGES[language])
  const alternates = indexable ? alternatePaths(route) : null

  return {
    language,
    title: meta.title,
    description: meta.description,
    robots: indexable ? 'index,follow,max-image-preview:large,max-snippet:-1' : 'noindex,follow',
    canonical: indexable ? url : null,
    alternates: alternates
      ? [
          ...LANGUAGES.map((code) => ({ hreflang: code, href: absoluteUrl(alternates[code]) })),
          // Visitors whose language is neither gets the English version.
          { hreflang: 'x-default', href: absoluteUrl(alternates.en) },
        ]
      : [],
    og: {
      'og:type': name === 'fact' ? 'article' : 'website',
      'og:site_name': SITE_NAME,
      'og:title': meta.title,
      'og:description': meta.description,
      'og:url': url,
      'og:image': image,
      'og:image:width': String(SOCIAL_IMAGE_SIZE.width),
      'og:image:height': String(SOCIAL_IMAGE_SIZE.height),
      'og:image:alt': translations[language].seoImageAlt,
      'og:locale': languages[language].locale,
      'og:locale:alternate': LANGUAGES.filter((code) => code !== language).map(
        (code) => languages[code].locale,
      ),
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': meta.title,
      'twitter:description': meta.description,
      'twitter:image': image,
      'twitter:image:alt': translations[language].seoImageAlt,
    },
    jsonLd: indexable
      ? { '@context': 'https://schema.org', '@graph': structuredData(route, meta, url) }
      : null,
  }
}

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// JSON inside <script> must not be able to close the tag.
const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c')

const metaTags = (attribute, entries) =>
  Object.entries(entries).flatMap(([key, value]) =>
    (Array.isArray(value) ? value : [value]).map(
      (item) => `<meta ${attribute}="${key}" content="${escapeHtml(item)}" data-head />`,
    ),
  )

export function renderHead(head) {
  return [
    `<title>${escapeHtml(head.title)}</title>`,
    `<meta name="description" content="${escapeHtml(head.description)}" data-head />`,
    `<meta name="robots" content="${head.robots}" data-head />`,
    head.canonical && `<link rel="canonical" href="${head.canonical}" data-head />`,
    ...head.alternates.map(
      ({ hreflang, href }) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${href}" data-head />`,
    ),
    ...metaTags('property', head.og),
    ...metaTags('name', head.twitter),
    head.jsonLd && `<script type="application/ld+json" data-head>${safeJson(head.jsonLd)}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ')
}

// On navigation the tags written by renderHead (marked data-head) are replaced wholesale.
export function applyHead(head) {
  document.title = head.title
  document.documentElement.lang = head.language
  document.head.querySelectorAll('[data-head]').forEach((node) => node.remove())
  const template = document.createElement('template')
  template.innerHTML = renderHead(head).replace(/<title>.*?<\/title>/, '')
  document.head.append(...template.content.childNodes)
}
