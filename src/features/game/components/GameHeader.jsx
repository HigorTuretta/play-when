import React, { useEffect, useRef, useState } from 'react'
import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber'
import { useI18n } from '../../../i18n/LanguageProvider'
import { TOTAL_ROUNDS } from '../constants'

const GAIN_VISIBLE_MS = 1100

function ScorePill({ score }) {
  const { t } = useI18n()
  const displayed = useAnimatedNumber(score)
  const previous = useRef(score)
  const [gain, setGain] = useState(null)

  useEffect(() => {
    const diff = score - previous.current
    previous.current = score
    if (diff <= 0) return undefined

    const id = Date.now()
    setGain({ id, value: diff })
    const timer = setTimeout(() => setGain((current) => (current?.id === id ? null : current)), GAIN_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className={`score-pill ${gain ? 'is-gaining' : ''}`}>
      <span className="score-mark" aria-hidden="true" />
      <span className="score-value">{displayed}</span>
      <span className="score-unit">{t.pointsShort}</span>
      {gain && <span key={gain.id} className="score-float">+{gain.value}</span>}
    </div>
  )
}

export default function GameHeader({ round, streak, score }) {
  const { t } = useI18n()

  return (
    <section className="game-head">
      <div>
        <p className="eyebrow">{t.round(round + 1, TOTAL_ROUNDS)}</p>
        <h1>{t.gameTitle}</h1>
        <p className="subtitle">{t.gameSubtitle}</p>
      </div>
      <div className="game-head-right">
        <div className="streak-card"><span>{t.streak}</span><strong>{streak}x</strong></div>
        <ScorePill score={score} />
      </div>
    </section>
  )
}
