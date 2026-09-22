import React from 'react'

const PUFFS = [
  { sx: -52, x: -96, y: -34, size: 30, delay: 0, scale: 1.2, blur: 1.2 },
  { sx: -24, x: -48, y: -66, size: 22, delay: 40, scale: 1, blur: 0.8 },
  { sx: 26, x: 52, y: -62, size: 20, delay: 70, scale: 1.05, blur: 0.7 },
  { sx: 51, x: 102, y: -30, size: 31, delay: 20, scale: 1.22, blur: 1.3 },
  { sx: -9, x: -30, y: -58, size: 17, delay: 110, scale: 0.9, blur: 0.5 },
  { sx: 12, x: 34, y: -70, size: 16, delay: 130, scale: 0.88, blur: 0.5 },
]

export default function DustBurst({ burst }) {
  if (!burst) return null

  return (
    <div className="dust-burst" style={{ left: burst.x, top: burst.y }} aria-hidden="true">
      <span className="dust-ring" />
      {PUFFS.map((puff, i) => (
        <span
          key={`${burst.id}-${i}`}
          className={`dust-puff puff-${i % 4}`}
          style={{
            '--dust-start-x': `${puff.sx}px`,
            '--dust-x': `${puff.x}px`,
            '--dust-y': `${puff.y}px`,
            '--dust-size': `${puff.size}px`,
            '--dust-scale': puff.scale,
            '--dust-blur': `${puff.blur}px`,
            '--dust-delay': `${puff.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}
