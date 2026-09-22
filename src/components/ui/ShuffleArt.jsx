import React from 'react'

export default function ShuffleArt() {
  return (
    <div className="shuffle-art" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={`shuffle-card shuffle-card-${n}`}><i /><b /></span>
      ))}
      <span className="shuffle-clock"><i /><i /></span>
    </div>
  )
}
