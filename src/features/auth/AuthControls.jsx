import React from 'react'
import { useI18n } from '../../i18n/LanguageProvider'
import { useAuth } from './AuthProvider'

export default function AuthControls({ onLogout }) {
  const { t } = useI18n()
  const { user, profile, login } = useAuth()

  if (!user)
    return (
      <button className="auth-button" onClick={login}>
        {t.signIn}
      </button>
    )

  return (
    <div className="account-control">
      <span className="account-name">{profile?.nickname || t.account}</span>
      <button className="icon-button" onClick={onLogout} title={t.signOut} aria-label={t.signOut}>
        ×
      </button>
    </div>
  )
}
