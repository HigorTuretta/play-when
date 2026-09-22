import React from 'react'
import { AuthProvider } from '../features/auth/AuthProvider'
import { GameProvider } from '../features/game/GameProvider'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { RouterProvider } from './router'

export default function AppProviders({ children }) {
  return (
    <LanguageProvider>
      <RouterProvider>
        <AuthProvider>
          <GameProvider>{children}</GameProvider>
        </AuthProvider>
      </RouterProvider>
    </LanguageProvider>
  )
}
