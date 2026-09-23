import React, { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../../i18n/LanguageProvider'
import { copyToClipboard, shareRowsFrom, shareTextFrom } from '../share'

const COPIED_VISIBLE_MS = 1800
const CELL_STAGGER_MS = 35

export default function ShareGrid({ results, score }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const timer = useRef()
  const rows = shareRowsFrom(results)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    await copyToClipboard(shareTextFrom(results, score))
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), COPIED_VISIBLE_MS)
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
                  style={{
                    '--share-delay': `${(rowIndex * row.length + cellIndex) * CELL_STAGGER_MS}ms`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="share-side">
        <p>{t.shareCopy}</p>
        <button className="outline" onClick={copy}>
          {copied ? t.copied : t.copyShare}
        </button>
      </div>
    </section>
  )
}
