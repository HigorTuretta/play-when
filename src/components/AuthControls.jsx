import React from 'react'

export default function AuthControls({ user, profile, onLogin, onLogout, t }) {
  if (!user) return <button className="auth-button" onClick={onLogin}>{t.signIn}</button>
  return (
    <div className="account-control">
      <span className="account-name">{profile?.nickname || t.account}</span>
      <button className="icon-button" onClick={onLogout} title={t.signOut} aria-label={t.signOut}>×</button>
    </div>
  )
}
