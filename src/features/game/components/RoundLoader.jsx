import React from 'react'
import ShuffleArt from '../../../components/ui/ShuffleArt'
import { useI18n } from '../../../i18n/LanguageProvider'
import { ROUND_SIZE } from '../constants'

export default function RoundLoader({ progress }) {
  const { t } = useI18n()
  const ready = Math.min(progress, ROUND_SIZE)
  const phrase = t.loaderPhrases[Math.min(progress, t.loaderPhrases.length - 1)]

  return (
    <section className="round-loader" aria-live="polite" aria-label={t.loadingAria}>
      <ShuffleArt />
      <strong>{phrase}</strong>
      <span>{t.imagesReady(ready, ROUND_SIZE)}</span>
      <div className="loader-progress">
        <i style={{ width: `${(ready / ROUND_SIZE) * 100}%` }} />
      </div>
    </section>
  )
}
