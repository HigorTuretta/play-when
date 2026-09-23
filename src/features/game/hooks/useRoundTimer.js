import { useEffect, useRef, useState } from 'react'

const TICK_MS = 250

// Counts down to a deadline measured on the wall clock, not by adding up ticks: a tab
// that was throttled or paused catches up the moment it runs again, and never gains time.
// onExpire runs once per deadline.
export function useRoundTimer(deadline, active, onExpire) {
  const [now, setNow] = useState(() => Date.now())
  const expire = useRef(onExpire)
  const fired = useRef(null)

  useEffect(() => {
    expire.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!active || !deadline) return undefined
    const tick = () => {
      const current = Date.now()
      setNow(current)
      if (current >= deadline && fired.current !== deadline) {
        fired.current = deadline
        expire.current?.()
      }
    }
    tick()
    const timer = setInterval(tick, TICK_MS)
    return () => clearInterval(timer)
  }, [deadline, active])

  if (!deadline) return null
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}
