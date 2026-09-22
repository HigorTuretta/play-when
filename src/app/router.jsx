import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ROUTES } from '../config/constants'
import { track } from '../lib/analytics'

const knownPaths = new Set(Object.values(ROUTES))
const currentPath = () => (knownPaths.has(window.location.pathname) ? window.location.pathname : ROUTES.home)

const RouterContext = createContext(null)

export function RouterProvider({ children }) {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onPopState = () => setPath(currentPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((next) => {
    window.history.pushState({}, '', next)
    setPath(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    track('page_view', { page_path: next })
  }, [])

  const value = useMemo(() => ({ path, navigate }), [path, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const context = useContext(RouterContext)
  if (!context) throw new Error('useRouter must be used inside RouterProvider')
  return context
}
