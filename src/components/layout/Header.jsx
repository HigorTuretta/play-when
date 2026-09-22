import React from 'react'
import { useRouter } from '../../app/router'
import { ROUTES } from '../../config/constants'
import AuthControls from '../../features/auth/AuthControls'
import { useAuth } from '../../features/auth/AuthProvider'
import { useGame } from '../../features/game/GameProvider'
import { useI18n } from '../../i18n/LanguageProvider'
import LanguageSwitch from './LanguageSwitch'
import StreakChip from './StreakChip'

export default function Header() {
  const { t } = useI18n()
  const { path, navigate } = useRouter()
  const { user, profile, logout } = useAuth()
  const { daily, closeResults } = useGame()

  const goHome = () => {
    closeResults()
    navigate(ROUTES.home)
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.home)
  }

  return (
    <header className="topbar">
      <button className="brand brand-button" onClick={goHome}>
        <span className="brand-dot">W</span>
        <span>{t.gameName}</span>
      </button>
      <nav className="main-nav">
        <button className={path === ROUTES.home ? 'active' : ''} onClick={goHome}>{t.home}</button>
        <button className={path === ROUTES.leaderboard ? 'active' : ''} onClick={() => navigate(ROUTES.leaderboard)}>{t.leaderboard}</button>
      </nav>
      <div className="topbar-tools">
        {user && profile && daily.streak > 0 && <StreakChip value={daily.streak} />}
        <LanguageSwitch />
        <AuthControls onLogout={handleLogout} />
      </div>
    </header>
  )
}
