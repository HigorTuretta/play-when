// Images are resolved once, when rounds are exported (scripts/export-static-rounds.mjs):
// the Wikipedia search query often contains the event year, so it never reaches the client.
export const getEventImage = (event) => event?.image || null

function preloadBitmap(src, signal) {
  if (!src) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.fetchPriority = 'high'

    const cleanup = () => signal?.removeEventListener('abort', onAbort)
    const finish = async () => {
      try {
        await img.decode?.()
      } catch {}
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

export async function preloadEventImage(event, signal) {
  const image = getEventImage(event)
  try {
    await preloadBitmap(image?.src, signal)
    return image
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return null
  }
}
