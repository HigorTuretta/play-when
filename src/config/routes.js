// Every public page exists once per language, each under its own path, so search engines
// can index both versions and link them with hreflang. The language of a page comes from
// its path; there is no separate language prefix except for the English home page.
export const LANGUAGES = ['pt-BR', 'en']
export const DEFAULT_LANGUAGE = 'pt-BR'

const STATIC_PAGES = {
  home: { 'pt-BR': '/', en: '/en' },
  howToPlay: { 'pt-BR': '/como-jogar', en: '/how-to-play' },
  about: { 'pt-BR': '/sobre', en: '/about' },
  ranking: { 'pt-BR': '/ranking', en: '/leaderboard' },
  history: { 'pt-BR': '/historia', en: '/history' },
  privacy: { 'pt-BR': '/privacidade', en: '/privacy' },
  terms: { 'pt-BR': '/termos', en: '/terms' },
}

// Pages with a slug. Topic and fact slugs are translated per language by the content
// registry (src/content), so the alternate path needs the slug in the other language.
const SLUG_PAGES = {
  topic: { 'pt-BR': '/historia/', en: '/history/' },
  fact: { 'pt-BR': '/fatos/', en: '/facts/' },
  challenge: { 'pt-BR': '/desafio/', en: '/challenge/' },
}

const SLUG_PATTERN = /^[a-z0-9-]+$/
const CHALLENGE_PATTERN = /^[A-Za-z0-9_-]+$/

const byPath = new Map()
for (const [name, paths] of Object.entries(STATIC_PAGES)) {
  for (const language of LANGUAGES) byPath.set(paths[language], { name, language })
}

const normalize = (pathname) => {
  const clean = pathname.replace(/\/{2,}/g, '/')
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean
}

export function resolvePath(pathname) {
  const path = normalize(pathname || '/')
  const page = byPath.get(path)
  if (page) return { ...page, params: {}, path }

  for (const [name, prefixes] of Object.entries(SLUG_PAGES)) {
    for (const language of LANGUAGES) {
      const prefix = prefixes[language]
      if (!path.startsWith(prefix)) continue
      const slug = path.slice(prefix.length)
      const valid = name === 'challenge' ? CHALLENGE_PATTERN.test(slug) : SLUG_PATTERN.test(slug)
      if (slug && !slug.includes('/') && valid) return { name, language, params: { slug }, path }
    }
  }

  // Unknown paths still render in a language: the English one when the path looks English.
  const language = /^\/(en|about|how-to-play|leaderboard|history|facts|challenge)(\/|$)/.test(path)
    ? 'en'
    : DEFAULT_LANGUAGE
  return { name: 'notFound', language, params: {}, path }
}

export function pathFor(name, language, params = {}) {
  if (STATIC_PAGES[name]) return STATIC_PAGES[name][language]
  if (SLUG_PAGES[name]) return `${SLUG_PAGES[name][language]}${params.slug}`
  return STATIC_PAGES.home[language]
}

export const homePath = (language) => STATIC_PAGES.home[language]
export const isStaticPage = (name) => Boolean(STATIC_PAGES[name])
export const staticPageNames = () => Object.keys(STATIC_PAGES)
