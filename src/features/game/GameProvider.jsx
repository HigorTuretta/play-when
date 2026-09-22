import React, { createContext, useContext } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useGameState } from './hooks/useGameState'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const { user, profile } = useAuth()
  const game = useGameState({ user, profile })
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used inside GameProvider')
  return context
}
