import React from 'react'
import { textForEvent } from '../../../i18n'
import { useI18n } from '../../../i18n/LanguageProvider'

function Chip({ card, className }) {
  const { language, formatYear } = useI18n()
  return (
    <span className={`comparison-chip ${className}`}>
      {className !== 'is-answer' && <i aria-hidden="true" />}
      <b>{formatYear(card.year)}</b>
      <em>{textForEvent(card, language).title}</em>
    </span>
  )
}

function ComparisonRow({ label, children }) {
  return (
    <div className="comparison-row">
      <span className="comparison-label">{label}</span>
      <div className="comparison-chips">{children}</div>
    </div>
  )
}

export default function RoundComparison({ cards, correctOrder }) {
  const { t } = useI18n()
  const chronological = [...cards].sort((a, b) => a.year - b.year)

  return (
    <section className="reveal-block">
      <div className="comparison-panel">
        <p className="panel-label">{t.diffTitle}</p>
        <div className="comparison-rows">
          <ComparisonRow label={t.yourOrder}>
            {cards.map((card, index) => (
              <Chip key={card.id} card={card} className={correctOrder[index] === card.id ? 'is-hit' : 'is-miss'} />
            ))}
          </ComparisonRow>
          <ComparisonRow label={t.rightOrder}>
            {chronological.map((card) => <Chip key={card.id} card={card} className="is-answer" />)}
          </ComparisonRow>
        </div>
      </div>
    </section>
  )
}
