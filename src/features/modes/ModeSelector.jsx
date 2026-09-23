import React from 'react'
import { useI18n } from '../../i18n/LanguageProvider'
import { useAuth } from '../auth/AuthProvider'
import { DAILY_LIMIT, GAME_MODES } from '../game/constants'
import { useGame } from '../game/GameProvider'
import { useStartMode } from './useStartMode'

function DailyDots({ plays }) {
  return (
    <span className="meter-dots" aria-hidden="true">
      {Array.from({ length: DAILY_LIMIT }, (_, i) => (
        <span key={i} className={i < plays ? 'is-used' : ''} />
      ))}
    </span>
  )
}

// The two ways to play, side by side. The ranked card's last line changes once the player
// is known (sign-in requirement for visitors, games left today for players) and keeps the
// same height either way, so nothing moves when authentication finishes.
export default function ModeSelector({ onStart }) {
  const { t } = useI18n()
  const { user, profile } = useAuth()
  const { daily, remaining, rankedLimitReached, busy } = useGame()
  const { start, modal } = useStartMode(onStart)
  const player = Boolean(user && profile)

  return (
    <div className="mode-picker" role="group" aria-label={t.modes.label}>
      <button
        type="button"
        className="mode-card mode-card-normal"
        onClick={() => start(GAME_MODES.normal)}
        disabled={busy}
      >
        <span className="mode-icon" aria-hidden="true">
          <span className="play-glyph" />
        </span>
        <span className="mode-text">
          <strong>{t.modes.normal.title}</strong>
          <span>{t.modes.normal.copy}</span>
          <small>{t.modes.normal.detail}</small>
        </span>
      </button>
      <button
        type="button"
        className="mode-card mode-card-ranked"
        onClick={() => start(GAME_MODES.ranked)}
        disabled={busy || rankedLimitReached}
      >
        <span className="mode-icon" aria-hidden="true">
          ★
        </span>
        <span className="mode-text">
          <strong>{t.modes.ranked.title}</strong>
          <span>{t.modes.ranked.copy}</span>
          {player ? (
            <small className="mode-meter">
              <DailyDots plays={daily.plays || 0} />
              {t.modes.ranked.remaining(remaining)}
            </small>
          ) : (
            <small>{t.modes.ranked.detail}</small>
          )}
        </span>
      </button>
      {rankedLimitReached && (
        <p className="limit-message">
          <span className="limit-badge" aria-hidden="true">
            !
          </span>
          <span>{t.dailyLimit}</span>
        </p>
      )}
      {modal}
    </div>
  )
}
