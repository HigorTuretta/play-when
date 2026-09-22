import { useEffect, useRef, useState } from 'react'

const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3)

export function useAnimatedNumber(target, duration = 560) {
  const [value, setValue] = useState(target)
  const valueRef = useRef(target)

  useEffect(() => {
    const from = valueRef.current
    if (from === target) return undefined

    const start = performance.now()
    let frame = 0
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const next = Math.round(from + (target - from) * easeOutCubic(progress))
      valueRef.current = next
      setValue(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
