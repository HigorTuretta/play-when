import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { EVENTS, setTrackingEnabled, track } from '../../lib/analytics'

const AuthContext = createContext(null)

const loadAuthService = () => import('./authService')
const loadProfileService = () => import('./profileService')

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  // Kept once loaded so sign-in can open its popup straight from the click: Safari blocks
  // popups opened after an await.
  const service = useRef(null)

  useEffect(() => {
    let alive = true
    let unsubscribe = () => {}

    loadAuthService()
      .then((module) => {
        if (!alive) return
        service.current = module
        unsubscribe = module.observeAuth(async (nextUser) => {
          setTrackingEnabled(Boolean(nextUser))
          setUser(nextUser)
          setError(null)
          if (nextUser) {
            try {
              const { getProfile } = await loadProfileService()
              setProfile(await getProfile(nextUser.uid))
            } catch {
              setError('generic')
            }
          } else {
            setProfile(null)
          }
          setReady(true)
        })
      })
      .catch(() => {
        if (!alive) return
        setError('generic')
        setReady(true)
      })

    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  const login = useCallback(async () => {
    track(EVENTS.loginStarted, { method: 'google' })
    try {
      setError(null)
      const module = service.current || (await loadAuthService())
      await module.signInWithGoogle()
      track(EVENTS.loginCompleted, { method: 'google' })
      return true
    } catch (e) {
      console.error('Sign-in failed', e)
      // Closing the popup is a choice, not an error worth a banner.
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        setError('generic')
      }
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    const module = service.current || (await loadAuthService())
    await module.signOutUser()
  }, [])

  const saveNickname = useCallback(
    async (nickname) => {
      if (!user) return
      try {
        setBusy(true)
        const { createProfile } = await loadProfileService()
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
