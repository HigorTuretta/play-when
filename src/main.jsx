import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './app/App'
import AppProviders from './app/AppProviders'
import { prepareRoute } from './app/routeData'
import { routeKey } from './app/routeKey'
import { LEGACY_STORAGE_KEYS } from './config/constants'
import { homePath, resolvePath } from './config/routes'
import { savedLanguage } from './i18n'
import { removeItem } from './lib/storage'
import './styles/index.css'

LEGACY_STORAGE_KEYS.forEach(removeItem)

// Someone who chose English before is taken from the Portuguese home page to the English
// one. Only an explicit choice does this: search engines (and first visits) always get the
// page the URL asks for.
function redirectToSavedLanguage() {
  const route = resolvePath(window.location.pathname)
  const saved = savedLanguage()
  if (route.name === 'home' && saved && saved !== route.language) {
    const { search, hash } = window.location
    window.history.replaceState(null, '', `${homePath(saved)}${search}${hash}`)
  }
}

async function start() {
  redirectToSavedLanguage()
  const route = resolvePath(window.location.pathname)
  await prepareRoute(route)

  const container = document.getElementById('root')
  const app = (
    <React.StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </React.StrictMode>
  )

  // Prerendered HTML for this very page is hydrated; anything else is rendered from scratch.
  if (container.hasChildNodes() && container.dataset.route === routeKey(route)) {
    hydrateRoot(container, app)
  } else {
    container.textContent = ''
    createRoot(container).render(app)
  }
}

start()
