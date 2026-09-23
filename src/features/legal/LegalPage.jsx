import React from 'react'
import { Link } from '../../app/router'
import { pathFor } from '../../config/routes'
import { DEFAULT_LANGUAGE } from '../../i18n'
import { useI18n } from '../../i18n/LanguageProvider'
import { legalContent } from './legalContent'

export default function LegalPage({ type }) {
  const { language, t } = useI18n()
  const [title, ...paragraphs] =
    legalContent[type][language] || legalContent[type][DEFAULT_LANGUAGE]

  return (
    <article className="page-card legal-page">
      <nav className="legal-tabs" aria-label={t.nav.footer}>
        <Link
          to={pathFor('privacy', language)}
          className={type === 'privacy' ? 'is-active' : ''}
          aria-current={type === 'privacy' ? 'page' : undefined}
        >
          {t.privacy}
        </Link>
        <Link
          to={pathFor('terms', language)}
          className={type === 'terms' ? 'is-active' : ''}
          aria-current={type === 'terms' ? 'page' : undefined}
        >
          {t.terms}
        </Link>
      </nav>
      <h1>{title}</h1>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <small>{t.lastUpdated}</small>
    </article>
  )
}
