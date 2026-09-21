import React, { useEffect, useMemo, useState } from 'react'
import { Camera, Clapperboard, Cpu, FlaskConical, Gamepad2, Globe2, Landmark, Music2, Rocket, Trophy, Wifi } from 'lucide-react'

// Bump this whenever the image resolver changes so an old, unrelated result is
// never kept in the browser after a relevance fix.
const CACHE_KEY = 'when-event-image-cache-v2'

const categoryIcons = {
  'História': Landmark,
  'Tecnologia': Cpu,
  'Ciência': FlaskConical,
  'Espaço': Rocket,
  'Invenções': Cpu,
  'Exploração': Globe2,
  'Cultura': Camera,
  'Games': Gamepad2,
  'Internet': Wifi,
  'Cinema & TV': Clapperboard,
  'Música': Music2,
  'Esportes': Trophy,
  'Brasil': Landmark,
}

const readCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
}

const writeCache = (cache) => {
  try {
    const entries = Object.entries(cache)
    const trimmed = Object.fromEntries(entries.slice(Math.max(0, entries.length - 260)))
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed))
  } catch {}
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

  // Searching encyclopaedia articles first keeps the image tied to the event.
  // A direct Commons file search often ranks files that merely share one word
  // with the query (a ship for "SMS", for example).
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, { signal })
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

const cacheKeyFor = (event) => `event:${event.id}`

async function resolveCommonsImage(event, signal) {
  const cacheKey = cacheKeyFor(event)
  const cached = readCache()[cacheKey]
  if (cached?.src) return cached

  const result = await searchWikipedia(event.imageQuery || event.titleEn || event.titlePt || event.title, signal)
  if (!result) return null

  const cache = readCache()
  cache[cacheKey] = result
  writeCache(cache)
  return result
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

export async function preloadCommonsImage(event, signal) {
  try {
    const image = await resolveCommonsImage(event, signal)
    if (image?.src) await preloadBitmap(image.src, signal)
    return image
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return null
  }
}

export default function CommonsImage({ event, checked = false, categoryLabel }) {
  const cacheKey = cacheKeyFor(event)
  const initial = useMemo(() => readCache()[cacheKey] || null, [cacheKey])
  const [image, setImage] = useState(initial)
  const [failed, setFailed] = useState(false)
  const Icon = categoryIcons[event.category] || Globe2

  useEffect(() => {
    setFailed(false)

    const cached = readCache()[cacheKey]
    if (cached?.src) {
      setImage(cached)
      return undefined
    }

    setImage(null)

    const controller = new AbortController()
    let mounted = true

    resolveCommonsImage(event, controller.signal)
      .then((result) => {
        if (!mounted) return
        if (!result) {
          setFailed(true)
          return
        }
        setImage(result)
      })
      .catch((error) => {
        if (error?.name !== 'AbortError' && mounted) setFailed(true)
      })

    return () => {
      mounted = false
      controller.abort()
    }
  }, [cacheKey, event])

  if (!image || failed) {
    return (
      <div className="visual-fallback" aria-hidden="true">
        <div className="fallback-orbit orbit-a" />
        <div className="fallback-orbit orbit-b" />
        <Icon size={64} strokeWidth={1.7} />
        <span>{categoryLabel || event.category}</span>
      </div>
    )
  }

  const credit = [image.artist, image.license].filter(Boolean).join(' · ') || 'Wikimedia Commons'

  return (
    <>
      <img
        src={image.src}
        alt=""
        className="card-image is-visible"
        draggable="false"
        decoding="async"
        loading="eager"
        onError={() => setFailed(true)}
      />
      <a
        className={`image-credit ${checked ? 'is-revealed' : ''}`}
        href={image.pageUrl}
        target="_blank"
        rel="noreferrer"
        title={credit}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {credit}
      </a>
    </>
  )
}
