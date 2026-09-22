import { useCallback, useEffect, useRef, useState } from 'react'

const SETTLE_DELAY_MS = 285
const BURST_DURATION_MS = 900

const findCard = (cardId) =>
  [...document.querySelectorAll('[data-card-id]')].find((el) => el.dataset.cardId === String(cardId))

export function useDustBurst() {
  const [burst, setBurst] = useState(null)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const trigger = useCallback((cardId, fallbackRect) => {
    later(() => requestAnimationFrame(() => {
      const rect = findCard(cardId)?.getBoundingClientRect() || fallbackRect
      if (!rect) return
      const id = Date.now()
      setBurst({ id, x: rect.left + rect.width / 2, y: rect.bottom })
      later(() => setBurst((current) => (current?.id === id ? null : current)), BURST_DURATION_MS)
    }), SETTLE_DELAY_MS)
  }, [])

  return { burst, trigger }
}
