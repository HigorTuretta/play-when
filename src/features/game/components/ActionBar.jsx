import React from 'react'
import { useI18n } from '../../../i18n/LanguageProvider'
import { ROUND_SIZE } from '../constants'

function RoundFeedback({ hits, gain }) {
  const { t } = useI18n()
  const tone = hits === ROUND_SIZE ? 'ok' : hits > 0 ? 'partial' : 'bad'
  const icon = hits === ROUND_SIZE ? '✓' : hits > 0 ? hits : '!'
  const title = hits === ROUND_SIZE ? t.perfect : hits > 0 ? t.partial(hits, ROUND_SIZE) : t.none

  return (
    <div className={`feedback feedback-${tone}`}>
      <div className="feedback-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{gain > 0 ? t.award(gain) : t.noAward}</span>
      </div>
    </div>
  )
}

export default function ActionBar({ reveal, busy, isLastRound, onSubmit, onNext }) {
  const { t } = useI18n()

  return (
    <section className={`actions ${reveal ? 'is-checked' : ''}`}>
      {reveal ? (
        <>
          <RoundFeedback hits={reveal.hits} gain={reveal.gain} />
          <button className="primary" onClick={onNext} disabled={busy}>{isLastRound ? t.seeResult : t.nextRound} →</button>
        </>
      ) : (
        <>
          <p className="drag-hint">{t.dragHint}<span>{t.imageDisclaimer}</span></p>
          <button className="primary" onClick={onSubmit} disabled={busy}>{t.submit} ✓</button>
        </>
      )}
    </section>
  )
}
