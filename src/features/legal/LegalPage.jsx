import React from 'react'
import { useRouter } from '../../app/router'
import { ROUTES } from '../../config/constants'
import { DEFAULT_LANGUAGE } from '../../i18n'
import { useI18n } from '../../i18n/LanguageProvider'
import { legalContent } from './legalContent'

export default function LegalPage({ type }) {
  const { language, t } = useI18n()
  const { navigate } = useRouter()
  const [title, ...paragraphs] =
    legalContent[type][language] || legalContent[type][DEFAULT_LANGUAGE]

  return (
    <article className="page-card legal-page">
      <div className="legal-tabs">
        <button
          className={type === 'privacy' ? 'is-active' : ''}
          onClick={() => navigate(ROUTES.privacy)}
        >
          {t.privacy}
        </button>
        <button
          className={type === 'terms' ? 'is-active' : ''}
          onClick={() => navigate(ROUTES.terms)}
        >
          {t.terms}
        </button>
      </div>
      <h1>{title}</h1>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
      <small>{t.lastUpdated}</small>
    </article>
  )
}
