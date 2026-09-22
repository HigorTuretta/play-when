import React from 'react'
import { useI18n } from '../../i18n/LanguageProvider'

export default function StreakChip({ value }) {
  const { t } = useI18n()

  return (
    <div className="streak-chip" title={t.streakHint}>
      <span className="streak-flame" aria-hidden="true"><i /><b /></span>
      <span className="streak-value"><strong>{value}</strong><span>{t.streakUnit}</span></span>
    </div>
  )
}
