import React from 'react'
import ErrorBanner from '../../components/ui/ErrorBanner'
import ShuffleArt from '../../components/ui/ShuffleArt'
import { errorText } from '../../i18n'
import { useI18n } from '../../i18n/LanguageProvider'
import { useAuth } from '../auth/AuthProvider'
import { useGame } from '../game/GameProvider'
import ModeSelector from '../modes/ModeSelector'
import HomeGuide from './HomeGuide'

// The game comes first: title, the two modes and nothing else above the fold. The guide
// below explains the game for new players and for search engines.
export default function HomePage({ onStart }) {
  const { t } = useI18n()
  const { error: authError } = useAuth()
  const { error: gameError } = useGame()

  return (
    <>
      <ErrorBanner message={(authError || gameError) && errorText(t, gameError || authError)} />
      <section className="home" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="eyebrow home-kicker">{t.homeKicker}</p>
          <h1 id="home-title">{t.startTitle}</h1>
          <p className="lede">{t.startCopy}</p>
          <ModeSelector onStart={onStart} />
        </div>
        <ShuffleArt />
      </section>
      <HomeGuide />
    </>
  )
}
