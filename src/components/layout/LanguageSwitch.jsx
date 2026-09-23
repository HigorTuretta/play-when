import React from 'react'
import { useRouter } from '../../app/router'
import { languages } from '../../i18n'
import { useI18n } from '../../i18n/LanguageProvider'
import { alternatePath } from '../../seo/alternates'

// Links, not buttons: each one points at the same page in the other language, which is
// also what search engines follow to find the translations.
export default function LanguageSwitch() {
  const { language, setLanguage, t } = useI18n()
  const { route } = useRouter()

  return (
    <nav className="language-switch" aria-label={t.language}>
      {Object.entries(languages).map(([code, meta]) => (
        <a
          key={code}
          href={alternatePath(route, code)}
          hrefLang={code}
          lang={code}
          className={language === code ? 'active' : ''}
          aria-current={language === code ? 'true' : undefined}
          title={meta.label}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
            event.preventDefault()
            setLanguage(code)
          }}
        >
          {meta.short}
        </a>
      ))}
    </nav>
  )
}
