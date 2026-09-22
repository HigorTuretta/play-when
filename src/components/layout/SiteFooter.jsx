import React from 'react'
import { useRouter } from '../../app/router'
import { GITHUB_URL, ROUTES } from '../../config/constants'
import { useI18n } from '../../i18n/LanguageProvider'

const TAGLINE = 'Six rounds. Four cards. One timeline.'

const Dot = () => <span className="footer-dot">•</span>

export default function SiteFooter() {
  const { t } = useI18n()
  const { navigate } = useRouter()

  return (
    <footer className="site-footer">
      <p className="footer-tagline">{TAGLINE}</p>
      <button onClick={() => navigate(ROUTES.privacy)}>{t.privacy}</button>
      <Dot />
      <button onClick={() => navigate(ROUTES.terms)}>{t.terms}</button>
      <Dot />
      <span>{t.developedBy} <strong>Turetta</strong></span>
      <Dot />
      <a href={GITHUB_URL} target="_blank" rel="noreferrer">{t.github}</a>
    </footer>
  )
}
