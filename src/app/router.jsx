import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { resolvePath } from '../config/routes'
import { prepareRoute } from './routeData'

const RouterContext = createContext(null)

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

// A tiny history-API router: the app only has a handful of page types, and every public
// page is also prerendered to static HTML (scripts/prerender.mjs), so a full routing
// library would add weight without adding anything the pages need.
export function RouterProvider({ initialPath, children }) {
  const [route, setRoute] = useState(() => resolvePath(initialPath ?? window.location.pathname))

  useEffect(() => {
    const onPopState = async () => {
      const next = resolvePath(window.location.pathname)
      await prepareRoute(next)
      setRoute(next)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Content a page needs (e.g. the fact pages) is loaded before the page is shown, so
  // navigating never flashes an empty page.
  const navigate = useCallback(async (path, { replace = false } = {}) => {
    const next = resolvePath(path)
    await prepareRoute(next)
    if (replace) window.history.replaceState({}, '', next.path)
    else window.history.pushState({}, '', next.path)
    setRoute(next)
    if (!replace) scrollToTop()
  }, [])

  const value = useMemo(() => ({ route, path: route.path, navigate }), [route, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const context = useContext(RouterContext)
  if (!context) throw new Error('useRouter must be used inside RouterProvider')
  return context
}

const isModifiedClick = (event) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey

// A real link (crawlable, opens in a new tab with a modifier key) that navigates in place.
export function Link({ to, onClick, children, ...props }) {
  const { navigate } = useRouter()

  const handleClick = (event) => {
    onClick?.(event)
    if (event.defaultPrevented || isModifiedClick(event) || props.target) return
    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
