import React from 'react'
import { Link } from '../../app/router'
import { pathFor } from '../../config/routes'
import { useI18n } from '../../i18n/LanguageProvider'

// The invitation that closes every content page: back to the game.
export default function PlayCallout({ title, copy }) {
  const { t, language } = useI18n()
  return (
    <aside className="play-callout" aria-label={t.fact.ctaButton}>
      <div>
        <strong>{title || t.fact.ctaTitle}</strong>
        <p>{copy || t.fact.ctaCopy}</p>
      </div>
      <Link className="primary" to={pathFor('home', language)}>
        <span className="play-glyph" aria-hidden="true" />
        {t.fact.ctaButton}
      </Link>
    </aside>
  )
}
