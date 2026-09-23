import { beforeAll, describe, expect, test } from 'vitest'
import { pathFor, resolvePath } from '../../src/config/routes'
import { loadFacts } from '../../src/content/facts/store'
import { scoreGame } from '../../src/features/game/scoring'
import { alternatePath } from '../../src/seo/alternates'
import { buildHead } from '../../src/seo/head'

beforeAll(() => loadFacts())

describe('routes', () => {
  test('every page has a path per language, and each path resolves back to it', () => {
    for (const name of ['home', 'howToPlay', 'about', 'ranking', 'history', 'privacy', 'terms']) {
      for (const language of ['pt-BR', 'en']) {
        const route = resolvePath(pathFor(name, language))
        expect(route).toMatchObject({ name, language })
      }
    }
  })

  test('slug pages and unknown paths', () => {
    expect(resolvePath('/fatos/apollo-11')).toMatchObject({ name: 'fact', language: 'pt-BR' })
    expect(resolvePath('/history/science/')).toMatchObject({ name: 'topic', language: 'en' })
    expect(resolvePath('/nada')).toMatchObject({ name: 'notFound', language: 'pt-BR' })
    expect(resolvePath('/facts/../x')).toMatchObject({ name: 'notFound' })
  })

  test('translations point at the same content', () => {
    expect(alternatePath(resolvePath('/fatos/queda-da-bastilha'), 'en')).toBe(
      '/facts/storming-of-the-bastille',
    )
    expect(alternatePath(resolvePath('/historia/guerras'), 'en')).toBe('/history/wars')
    expect(alternatePath(resolvePath('/leaderboard'), 'pt-BR')).toBe('/ranking')
  })
})

describe('head', () => {
  test('the home page describes the game without invented ratings', () => {
    const head = buildHead(resolvePath('/'))
    expect(head.title).toBe('When? | Jogo de Cronologia e História Online')
    expect(head.canonical).toMatch(/\/$/)
    expect(head.alternates.map((link) => link.hreflang)).toEqual(['pt-BR', 'en', 'x-default'])
    const app = head.jsonLd['@graph'].find((node) => node['@type'] === 'SoftwareApplication')
    expect(app).toMatchObject({ applicationCategory: 'GameApplication', operatingSystem: 'Web' })
    expect(app.offers.price).toBe('0')
    expect(JSON.stringify(head.jsonLd)).not.toMatch(/"(aggregateRating|review)"/)
  })

  test('fact pages are articles with breadcrumbs; unknown slugs are not indexed', () => {
    const head = buildHead(resolvePath('/facts/apollo-11'))
    const types = head.jsonLd['@graph'].map((node) => node['@type'])
    expect(types).toEqual(['Article', 'BreadcrumbList'])
    expect(head.og['og:type']).toBe('article')
    const missing = buildHead(resolvePath('/facts/does-not-exist'))
    expect(missing.robots).toMatch(/noindex/)
    expect(missing.canonical).toBeNull()
  })

  test('challenge links are not indexed', () => {
    expect(buildHead(resolvePath('/desafio/abc')).robots).toMatch(/noindex/)
  })
})

describe('scoring', () => {
  test('matches the rules: 25 per card, 50 per perfect round, +20 per perfect streak', () => {
    expect(scoreGame([4, 4, 4, 4, 4, 4])).toBe(1200)
    expect(scoreGame([4, 4, 2, 4, 0, 4])).toBe(670)
    expect(scoreGame([0, 0, 0, 0, 0, 0])).toBe(0)
  })
})
