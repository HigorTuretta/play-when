import React from 'react'
import { ArrowLeft, ArrowRight, GripVertical } from 'lucide-react'
import { textForEvent } from '../../../i18n'
import { useI18n } from '../../../i18n/LanguageProvider'
import { accentFor } from '../categories'
import EventImage from './EventImage'

const stopDrag = (e) => e.stopPropagation()

export default function CardContent({ card, revealed = false, status = '', correctPosition, onMoveLeft, onMoveRight }) {
  const { language, t, formatYear } = useI18n()
  const text = textForEvent(card, language)
  const showControls = !revealed && (onMoveLeft || onMoveRight)

  return (
    <>
      <div className="card-art" style={{ '--accent': accentFor(card.category) }}>
        <EventImage event={card} showCredit={revealed} />
        <span className="art-scrim" aria-hidden="true" />
        <span className="category-chip">{text.category}</span>
        <span className="card-grip" aria-hidden="true"><GripVertical size={15} /></span>
        {status && <span className={`card-result-dot ${status}`} aria-hidden="true"><i /></span>}
      </div>
      <div className="card-body">
        <h2>{text.title}</h2>
        <p>{text.short}</p>
        {revealed && (
          <div className="answer-reveal">
            <span className="year-reveal">{formatYear(card.year)}</span>
            <span className={`correct-position ${status}`}>{t.correctPosition(correctPosition)}</span>
          </div>
        )}
        {showControls && (
          <div className="mobile-controls">
            <button onPointerDown={stopDrag} onClick={onMoveLeft} disabled={!onMoveLeft} aria-label={t.moveLeft}><ArrowLeft size={16} /></button>
            <button onPointerDown={stopDrag} onClick={onMoveRight} disabled={!onMoveRight} aria-label={t.moveRight}><ArrowRight size={16} /></button>
          </div>
        )}
      </div>
    </>
  )
}
