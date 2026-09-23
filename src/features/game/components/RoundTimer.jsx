import React from 'react'
import { useI18n } from '../../../i18n/LanguageProvider'
import { RANKED_ROUND_SECONDS } from '../constants'

const WARNING_AT = 10
const CRITICAL_AT = 5

const clock = (seconds) => `00:${String(seconds).padStart(2, '0')}`

// Quiet while there is time, then warmer in the last ten seconds and urgent in the last
// five. The ring empties as time runs out.
export default function RoundTimer({ seconds }) {
  const { t } = useI18n()
  if (seconds === null) return null

  const tone = seconds <= CRITICAL_AT ? 'is-critical' : seconds <= WARNING_AT ? 'is-warning' : ''
  const share = seconds / RANKED_ROUND_SECONDS

  return (
    <div className={`round-timer ${tone}`} role="timer" aria-label={t.timer.label(seconds)}>
      <span className="timer-ring" style={{ '--timer-share': share }} aria-hidden="true" />
      <span className="timer-value" aria-hidden="true">
        {clock(seconds)}
      </span>
      <span className="sr-only" aria-live="assertive">
        {seconds === WARNING_AT || seconds === CRITICAL_AT ? t.timer.announce(seconds) : ''}
      </span>
    </div>
  )
}
