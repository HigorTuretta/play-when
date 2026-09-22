import React, { useEffect, useState } from 'react'
import { getCachedImage, resolveEventImage } from '../api/imageService'
import { iconFor } from '../categories'

function ImageFallback({ category }) {
  const Icon = iconFor(category)
  return (
    <div className="visual-fallback" aria-hidden="true">
      <div className="fallback-orbit orbit-a" />
      <div className="fallback-orbit orbit-b" />
      <Icon size={64} strokeWidth={1.7} />
    </div>
  )
}

export default function EventImage({ event, showCredit = false }) {
  const [image, setImage] = useState(() => getCachedImage(event))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
    const cached = getCachedImage(event)
    if (cached?.src) {
      setImage(cached)
      return undefined
    }

    setImage(null)
    const controller = new AbortController()
    resolveEventImage(event, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        if (result) setImage(result)
        else setFailed(true)
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') setFailed(true)
      })

    return () => controller.abort()
  }, [event])

  if (!image || failed) return <ImageFallback category={event.category} />

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
        className={`image-credit ${showCredit ? 'is-revealed' : ''}`}
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
