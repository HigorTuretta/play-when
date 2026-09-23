import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { GAME_MODES } from '../game/constants'
import RankedAccessModal from './RankedAccessModal'

// Starting a ranked game needs a Google account with a nickname. A visitor gets the
// sign-in modal instead; a player without a nickname already sees the nickname modal.
export function useStartMode(onStart) {
  const { user, profile, ready } = useAuth()
  const [askLogin, setAskLogin] = useState(false)

  const start = (mode) => {
    if (mode === GAME_MODES.ranked) {
      if (!ready || (user && !profile)) return
      if (!user) {
        setAskLogin(true)
        return
      }
    }
    onStart(mode)
  }

  const modal = askLogin ? <RankedAccessModal onClose={() => setAskLogin(false)} /> : null
  return { start, modal }
}
