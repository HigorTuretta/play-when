import React from 'react'
import { accentFor } from '../categories'
import { textForEvent } from '../i18n'
import { getCachedImage } from './CommonsImage'

export default function ResultSummary({ results, language, t, displayYear }) {
  return (
    <section className="summary-panel">
      <p className="panel-label">{t.summaryTitle}</p>
      <div className="summary-rows">
        {results.map((round) => {
          const chronological = [...round.ordered].sort((a, b) => a.year - b.year)
          return (
            <div key={round.round} className="summary-row">
              <span className="summary-label">{t.roundLabel(round.round + 1)}</span>
              <div className="summary-cards">
                {chronological.map((card) => {
                  const playedAt = round.ordered.findIndex((item) => item.id === card.id)
                  const hit = round.correct[playedAt] === card.id
                  const image = getCachedImage(card)
                  const localized = textForEvent(card, language)
                  return (
                    <div key={card.id} className="summary-card">
                      <span
                        className="summary-thumb"
                        style={{
                          backgroundColor: accentFor(card.category),
                          backgroundImage: image?.src ? `url(${image.src})` : undefined,
                        }}
                        aria-hidden="true"
                      />
                      <span className="summary-text">
                        <span className={`summary-year ${hit ? 'is-hit' : 'is-miss'}`}>{displayYear(card.year)}</span>
                        <span className="summary-title">{localized.title}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
