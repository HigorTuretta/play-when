import React from 'react'
import { textForEvent } from '../../../i18n'
import { useI18n } from '../../../i18n/LanguageProvider'
import { getEventImage } from '../../game/api/imageService'
import { accentFor } from '../../game/categories'

function SummaryCard({ card, hit }) {
  const { language, formatYear } = useI18n()
  const image = getEventImage(card)

  return (
    <div className="summary-card">
      <span
        className="summary-thumb"
        style={{
          backgroundColor: accentFor(card.category),
          backgroundImage: image?.src ? `url(${image.src})` : undefined,
        }}
        aria-hidden="true"
      />
      <span className="summary-text">
        <span className={`summary-year ${hit ? 'is-hit' : 'is-miss'}`}>
          {formatYear(card.year)}
        </span>
        <span className="summary-title">{textForEvent(card, language).title}</span>
      </span>
    </div>
  )
}

export default function ResultSummary({ results }) {
  const { t } = useI18n()

  return (
    <section className="summary-panel" aria-labelledby="summary-heading">
      <h2 id="summary-heading" className="panel-label">
        {t.summaryTitle}
      </h2>
      <div className="summary-rows">
        {results.map((round) => {
          const chronological = [...round.ordered].sort((a, b) => a.year - b.year)
          const wasHit = (card) => {
            const playedAt = round.ordered.findIndex((item) => item.id === card.id)
            return round.correct[playedAt] === card.id
          }

          return (
            <div key={round.round} className="summary-row">
              <span className="summary-label">{t.roundLabel(round.round + 1)}</span>
              <div className="summary-cards">
                {chronological.map((card) => (
                  <SummaryCard key={card.id} card={card} hit={wasHit(card)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
