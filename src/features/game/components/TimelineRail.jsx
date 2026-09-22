import React from 'react'
import { useI18n } from '../../../i18n/LanguageProvider'
import { ROUND_SIZE } from '../constants'

export default function TimelineRail() {
  const { t } = useI18n()

  return (
    <div className="timeline-rail" aria-hidden="true">
      <span className="rail-label">{t.oldest}</span>
      <div className="rail-track">
        <span className="rail-line" />
        {Array.from({ length: ROUND_SIZE }, (_, i) => <span key={i} className="rail-node" />)}
      </div>
      <span className="rail-label">{t.newest}</span>
    </div>
  )
}
