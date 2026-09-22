import React from 'react'
import { languages } from '../../i18n'
import { useI18n } from '../../i18n/LanguageProvider'

export default function LanguageSwitch() {
  const { language, setLanguage, t } = useI18n()

  return (
    <div className="language-switch" role="group" aria-label={t.language}>
      {Object.entries(languages).map(([code, meta]) => (
        <button
          key={code}
          type="button"
          className={language === code ? 'active' : ''}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
        >
          {meta.short}
        </button>
      ))}
    </div>
  )
}
