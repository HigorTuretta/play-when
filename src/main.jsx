import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import AppProviders from './app/AppProviders'
import { LEGACY_STORAGE_KEYS } from './config/constants'
import { removeItem } from './lib/storage'
import './styles/index.css'

LEGACY_STORAGE_KEYS.forEach(removeItem)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
