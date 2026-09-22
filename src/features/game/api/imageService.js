import { STORAGE_KEYS } from '../../../config/constants'
import { readJSON, writeJSON } from '../../../lib/storage'

const MAX_CACHE_ENTRIES = 260
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'

const cacheKeyFor = (event) => `event:${event.id}`
const readCache = () => readJSON(STORAGE_KEYS.imageCache, {}) || {}

function writeCache(cache) {
  const entries = Object.entries(cache)
  writeJSON(STORAGE_KEYS.imageCache, Object.fromEntries(entries.slice(-MAX_CACHE_ENTRIES)))
}

async function searchWikipedia(query, signal) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '0',
    gsrlimit: '3',
    prop: 'pageimages|info',
    piprop: 'thumbnail|name',
    pithumbsize: '720',
    pilicense: 'any',
    inprop: 'url',
    redirects: '1',
    format: 'json',
    origin: '*',
  })

  const response = await fetch(`${WIKIPEDIA_API}?${params}`, { signal })
  if (!response.ok) throw new Error('wikipedia-request-failed')

  const data = await response.json()
  const page = Object.values(data?.query?.pages || {})
    .filter((candidate) => candidate.thumbnail?.source)
    .sort((a, b) => (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER))[0]

  if (!page) return null
  return {
    src: page.thumbnail.source,
    pageUrl: page.fullurl,
    title: page.title || 'Wikipedia',
    artist: page.title || '',
    license: 'Wikipedia',
  }
}

function preloadBitmap(src, signal) {
  if (!src) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.fetchPriority = 'high'

    const cleanup = () => signal?.removeEventListener('abort', onAbort)
    const finish = async () => {
      try { await img.decode?.() } catch {}
      cleanup()
      resolve()
    }
    const fail = () => {
      cleanup()
      reject(new Error('image-preload-failed'))
    }
    const onAbort = () => {
      img.src = ''
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }

    if (signal?.aborted) {
      onAbort()
      return
    }

    signal?.addEventListener('abort', onAbort, { once: true })
    img.onload = finish
    img.onerror = fail
    img.src = src
    if (img.complete && img.naturalWidth > 0) finish()
  })
}

export const getCachedImage = (event) => readCache()[cacheKeyFor(event)] || null

export async function resolveEventImage(event, signal) {
  const cached = getCachedImage(event)
  if (cached?.src) return cached

  const result = await searchWikipedia(event.imageQuery || event.titleEn || event.titlePt || event.title, signal)
  if (!result) return null

  writeCache({ ...readCache(), [cacheKeyFor(event)]: result })
  return result
}

export async function preloadEventImage(event, signal) {
  try {
    const image = await resolveEventImage(event, signal)
    if (image?.src) await preloadBitmap(image.src, signal)
    return image
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return null
  }
}
