import React from 'react'
import { Link } from '../../app/router'
import { pathFor } from '../../config/routes'
import { useI18n } from '../../i18n/LanguageProvider'

export default function NotFoundPage() {
  const { t, language } = useI18n()
  return (
    <section className="page-card content-page not-found">
      <div className="page-badge" aria-hidden="true">
        ?
      </div>
      <p className="eyebrow">404</p>
      <h1>{t.notFound.title}</h1>
      <p className="lede">{t.notFound.copy}</p>
      <Link className="primary" to={pathFor('home', language)}>
        <span className="play-glyph" aria-hidden="true" />
        {t.notFound.cta}
      </Link>
    </section>
  )
}
