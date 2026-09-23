import React from 'react'
import { Link, useRouter } from '../../app/router'
import { pathFor } from '../../config/routes'
import AuthControls from '../../features/auth/AuthControls'
import { useAuth } from '../../features/auth/AuthProvider'
import { useGame } from '../../features/game/GameProvider'
import { useI18n } from '../../i18n/LanguageProvider'
import LanguageSwitch from './LanguageSwitch'
import StreakChip from './StreakChip'

export default function Header() {
  const { t, language } = useI18n()
  const { route, navigate } = useRouter()
  const { user, profile, logout } = useAuth()
  const { daily, closeResults } = useGame()
  const home = pathFor('home', language)
  const ranking = pathFor('ranking', language)

  const handleLogout = async () => {
    await logout()
    navigate(home)
  }

  const current = (name) => (route.name === name ? 'page' : undefined)

  return (
    <header className="topbar">
      <Link className="brand brand-button" to={home} onClick={closeResults}>
        <span className="brand-dot" aria-hidden="true">
          W
        </span>
        <span>{t.gameName}</span>
      </Link>
      <nav className="main-nav" aria-label={t.nav.label}>
        <Link to={home} onClick={closeResults} aria-current={current('home')}>
          {t.home}
        </Link>
        <Link to={ranking} aria-current={current('ranking')}>
          {t.leaderboard}
        </Link>
      </nav>
      <div className="topbar-tools">
        {user && profile && daily.streak > 0 && <StreakChip value={daily.streak} />}
        <LanguageSwitch />
        <AuthControls onLogout={handleLogout} />
      </div>
    </header>
  )
}
