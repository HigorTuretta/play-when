import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setTrackingEnabled, track } from '../../lib/analytics'
import { observeAuth, signInWithGoogle, signOutUser } from './authService'
import { createProfile, getProfile } from './profileService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(
    () =>
      observeAuth(async (nextUser) => {
        setTrackingEnabled(Boolean(nextUser))
        setUser(nextUser)
        setError(null)
        if (nextUser) {
          try {
            setProfile(await getProfile(nextUser.uid))
          } catch {
            setError('generic')
          }
        } else {
          setProfile(null)
        }
        setReady(true)
      }),
    [],
  )

  const login = useCallback(async () => {
    try {
      setError(null)
      await signInWithGoogle()
      track('login', { method: 'google' })
    } catch {
      setError('generic')
    }
  }, [])

  const logout = useCallback(() => signOutUser(), [])

  const saveNickname = useCallback(
    async (nickname) => {
      if (!user) return
      try {
        setBusy(true)
        setProfile(await createProfile(user, nickname))
        track('sign_up', { method: 'google' })
      } catch {
        setError('generic')
      } finally {
        setBusy(false)
      }
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, profile, ready, busy, error, login, logout, saveNickname }),
    [user, profile, ready, busy, error, login, logout, saveNickname],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
