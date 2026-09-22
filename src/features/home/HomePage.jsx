import React from 'react'
import ErrorBanner from '../../components/ui/ErrorBanner'
import ShuffleArt from '../../components/ui/ShuffleArt'
import { useAuth } from '../auth/AuthProvider'
import { DAILY_LIMIT } from '../game/constants'
import { useGame } from '../game/GameProvider'
import { errorText } from '../../i18n'
import { useI18n } from '../../i18n/LanguageProvider'

function AttemptMeter({ plays, remaining }) {
  const { t } = useI18n()
  return (
    <div className="attempt-meter">
      <span className="meter-label">{t.todayPlays}</span>
      <div className="meter-dots">
        {Array.from({ length: DAILY_LIMIT }, (_, i) => <span key={i} className={i < plays ? 'is-used' : ''} />)}
        <span className="meter-remaining">{t.remainingAttempts(remaining)}</span>
      </div>
    </div>
  )
}

export default function HomePage({ onStart }) {
  const { t } = useI18n()
  const { user, profile, error: authError } = useAuth()
  const { daily, remaining, limitReached, error: gameError } = useGame()

  return (
    <>
      <ErrorBanner message={(authError || gameError) && errorText(t, gameError || authError)} />
      <section className="home">
        <div className="home-copy">
          <h1>{t.startTitle}</h1>
          <p className="lede">{t.startCopy}</p>
          {limitReached ? (
            <div className="limit-message"><span className="limit-badge" aria-hidden="true">!</span><span>{t.dailyLimit}</span></div>
          ) : (
            <div className="home-start">
              <button className="primary big" onClick={onStart}><span className="play-glyph" aria-hidden="true" />{t.startGame}</button>
              {user && profile && <AttemptMeter plays={daily.plays || 0} remaining={remaining} />}
            </div>
          )}
        </div>
        <ShuffleArt />
      </section>
    </>
  )
}
