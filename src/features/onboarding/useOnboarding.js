import { useCallback, useRef, useState } from 'react'
import { STORAGE_KEYS } from '../../config/constants'
import { readString, writeString } from '../../lib/storage'

export const ONBOARDING_STEPS = 3

export function useOnboarding() {
  const [step, setStep] = useState(-1)
  const seen = useRef(readString(STORAGE_KEYS.onboarding) === '1')

  const dismiss = useCallback(() => {
    seen.current = true
    writeString(STORAGE_KEYS.onboarding, '1')
    setStep(-1)
  }, [])

  const showIfNew = useCallback(() => {
    if (!seen.current) setStep(0)
  }, [])

  const next = useCallback(() => {
    if (step >= ONBOARDING_STEPS - 1) dismiss()
    else setStep(step + 1)
  }, [step, dismiss])

  return { step, showIfNew, next, dismiss }
}
