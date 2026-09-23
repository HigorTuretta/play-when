import React from 'react'
import { Link } from '../../app/router'
import { pathFor } from '../../config/routes'
import { AUTHOR_NAME, GITHUB_URL } from '../../config/site'
import { useI18n } from '../../i18n/LanguageProvider'

const TAGLINE = 'Six rounds. Four cards. One timeline.'

export default function SiteFooter() {
  const { t, language } = useI18n()
  const links = [
    ['howToPlay', t.nav.howToPlay],
    ['about', t.nav.about],
    ['history', t.nav.history],
    ['ranking', t.nav.ranking],
    ['privacy', t.privacy],
    ['terms', t.terms],
  ]

  return (
    <footer className="site-footer">
      <p className="footer-tagline">{TAGLINE}</p>
      <nav aria-label={t.nav.footer}>
        <ul className="footer-links">
          {links.map(([name, label]) => (
            <li key={name}>
              <Link to={pathFor(name, language)}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="footer-credit">
        {t.developedBy} <strong>{AUTHOR_NAME}</strong>
        <span className="footer-dot" aria-hidden="true">
          •
        </span>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          {t.github}
        </a>
      </p>
    </footer>
  )
}
