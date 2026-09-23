import React from 'react'
import { useI18n } from '../../i18n/LanguageProvider'
import { useAuth } from './AuthProvider'

export default function AuthControls({ onLogout }) {
  const { t } = useI18n()
  const { user, profile, ready, login } = useAuth()

  // Until Firebase says who is signed in (and in prerendered HTML), an invisible button
  // holds the space, so the header does not jump when the real control appears.
  if (!ready) {
    return (
      <span className="auth-button auth-placeholder" aria-hidden="true">
        {t.signIn}
      </span>
    )
  }

  if (!user) {
    return (
      <button type="button" className="auth-button" onClick={login}>
        {t.signIn}
      </button>
    )
  }

  return (
    <div className="account-control">
      <span className="account-name">{profile?.nickname || t.account}</span>
      <button
        type="button"
        className="icon-button"
        onClick={onLogout}
        title={t.signOut}
        aria-label={t.signOut}
      >
        ×
      </button>
    </div>
  )
}
