import React from 'react'
import { ToastProvider } from '../components/ui/Toast'
import { AuthProvider } from '../features/auth/AuthProvider'
import { GameProvider } from '../features/game/GameProvider'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { RouterProvider } from './router'

export default function AppProviders({ initialPath, children }) {
  return (
    <RouterProvider initialPath={initialPath}>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <GameProvider>{children}</GameProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </RouterProvider>
  )
}
