const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
const USER_AGENT = 'PlayWhen/1.0 (https://github.com/HigorTuretta/play-when)'

// Resolves the card image once, at export time. The search query often carries the event
// year, so it must never reach the public round files; only the thumbnail and an opaque
// page link (by id, not by title) are published.
export async function resolveImage(query) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '0',
    gsrlimit: '3',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '720',
    pilicense: 'any',
    redirects: '1',
    format: 'json',
    maxlag: '5',
  })

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(`${WIKIPEDIA_API}?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    })
    const data = response.ok ? await response.json() : null
    if (!data || data.error?.code === 'maxlag') {
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
      continue
    }

    const page = Object.values(data.query?.pages || {})
      .filter((candidate) => candidate.thumbnail?.source)
      .sort(
        (a, b) => (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER),
      )[0]

    if (!page) return null
    const src = new URL(page.thumbnail.source)
    src.search = ''
    return { src: src.toString(), pageUrl: `https://en.wikipedia.org/?curid=${page.pageid}` }
  }

  throw new Error(`Wikipedia request failed for "${query}"`)
}

export async function resolveImages(cards) {
  const images = new Map()
  for (const card of cards) {
    if (images.has(card.id)) continue
    images.set(card.id, await resolveImage(card.imageQuery || card.titleEn || card.titlePt))
  }
  return images
}
