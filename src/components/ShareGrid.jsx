import React, { useState } from 'react'

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/HigorTuretta/play-when'

export const shareRowsFrom = (results) =>
  results.map((round) => round.ordered.map((card, index) => round.correct[index] === card.id))

export const shareTextFrom = (results, score) => {
  const rows = shareRowsFrom(results)
    .map((row) => row.map((hit) => (hit ? '🟩' : '🟥')).join(''))
    .join('\n')
  return `When? — ${score} pts\n${rows}\n${GITHUB_URL}`
}

export default function ShareGrid({ results, score, t }) {
  const [copied, setCopied] = useState(false)
  const rows = shareRowsFrom(results)

  const copy = async () => {
    const text = shareTextFrom(results, score)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard is unavailable over http or when the permission is denied;
      // a selectable textarea still lets the player copy by hand.
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(area)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="share-panel">
      <div>
        <p className="panel-label">{t.shareTitle}</p>
        <div className="share-grid" aria-hidden="true">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="share-row">
              {row.map((hit, cellIndex) => (
                <span
                  key={cellIndex}
                  className={`share-cell ${hit ? 'is-hit' : 'is-miss'}`}
                  style={{ '--share-delay': `${(rowIndex * 4 + cellIndex) * 35}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="share-side">
        <p>{t.shareCopy}</p>
        <button className="outline" onClick={copy}>{copied ? t.copied : t.copyShare}</button>
      </div>
    </section>
  )
}
