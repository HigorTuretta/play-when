import React from 'react'
import { LogIn, LogOut, UserRound } from 'lucide-react'

export default function AuthControls({ user, profile, onLogin, onLogout, t }) {
  if (!user) return <button className="auth-button" onClick={onLogin}><LogIn size={16}/>{t.signIn}</button>
  return (
    <div className="account-control">
      <span className="account-name"><UserRound size={15}/>{profile?.nickname || t.account}</span>
      <button className="icon-button" onClick={onLogout} title={t.signOut} aria-label={t.signOut}><LogOut size={16}/></button>
    </div>
  )
}
