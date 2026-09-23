import React, { useEffect, useState } from 'react'
import ErrorBanner from '../../components/ui/ErrorBanner'
import { errorText } from '../../i18n'
import { useI18n } from '../../i18n/LanguageProvider'
import { useGame } from '../game/GameProvider'
import { decodeChallenge } from './challengeCode'

// /desafio/<code> and /challenge/<code>: a friend's normal game, ready to replay.
export default function ChallengePage({ code, onAccept }) {
  const { t } = useI18n()
  const { busy, error } = useGame()
  // Checked after mounting: the prerendered page is shared by every challenge code.
  const [valid, setValid] = useState(true)
  useEffect(() => setValid(Boolean(decodeChallenge(code))), [code])

  return (
    <section className="page-card content-page challenge-page">
      <div className="page-badge" aria-hidden="true">
        ⚔
      </div>
      <p className="eyebrow">{t.challenge.eyebrow}</p>
      <h1>{t.challenge.title}</h1>
      <p className="lede">{valid ? t.challenge.copy : t.challenge.invalid}</p>
      <ErrorBanner message={error && errorText(t, error)} />
      {valid && (
        <button type="button" className="primary big" onClick={onAccept} disabled={busy}>
          <span className="play-glyph" aria-hidden="true" />
          {t.challenge.cta}
        </button>
      )}
    </section>
  )
}
