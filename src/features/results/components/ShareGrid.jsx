import React, { useEffect, useState } from 'react'
import { useToast } from '../../../components/ui/Toast'
import { EVENTS, track } from '../../../lib/analytics'
import { useI18n } from '../../../i18n/LanguageProvider'
import { canUseWebShare, copyToClipboard, shareRowsFrom, shareTextFrom } from '../share'

const CELL_STAGGER_MS = 35

export default function ShareGrid({ results, score, mode, challenge }) {
  const { t, language } = useI18n()
  const toast = useToast()
  // Web Share is decided after mounting: it is a browser capability, unknown when the
  // page is rendered ahead of time.
  const [webShare, setWebShare] = useState(false)
  const rows = shareRowsFrom(results)

  useEffect(() => setWebShare(canUseWebShare()), [])

  const text = () => shareTextFrom({ results, score, mode, challenge, language })
  const trackShare = (name, method) => {
    track(name, { mode, method })
    if (challenge) track(EVENTS.challengeShared, { method })
  }

  const copy = async () => {
    if (await copyToClipboard(text())) {
      toast(t.share.copied)
      trackShare(EVENTS.resultCopied, 'clipboard')
    } else {
      toast(t.share.failed, 'error')
    }
  }

  const share = async () => {
    try {
      await navigator.share({ text: text() })
      trackShare(EVENTS.resultShared, 'web_share')
    } catch (error) {
      // Closing the share sheet is not a failure; anything else falls back to copying.
      if (error?.name !== 'AbortError') await copy()
    }
  }

  return (
    <section className="share-panel" aria-labelledby="share-title">
      <div>
        <h2 id="share-title" className="panel-label">
          {t.share.title}
        </h2>
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
        <div className="share-actions">
          {webShare && (
            <button type="button" className="primary small" onClick={share}>
              {t.share.share}
            </button>
          )}
          <button type="button" className="outline" onClick={copy}>
            {t.share.copy}
          </button>
        </div>
      </div>
    </section>
  )
}
