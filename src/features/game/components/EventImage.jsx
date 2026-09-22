import React, { useEffect, useState } from 'react'
import { getEventImage } from '../api/imageService'
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

// The credit links to the article by id and does not name it: article titles often
// contain the year, and this link is in the page before the answer is revealed.
const CREDIT = 'Wikipedia'

export default function EventImage({ event, showCredit = false }) {
  const image = getEventImage(event)
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [image?.src])

  if (!image?.src || failed) return <ImageFallback category={event.category} />

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
        title={CREDIT}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {CREDIT}
      </a>
    </>
  )
}
