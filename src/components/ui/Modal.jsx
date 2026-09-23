import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// A dialog over the page, rendered into <body> so no transformed ancestor can trap it.
// With onClose it can be dismissed with Escape or by clicking the backdrop; without it
// (e.g. the required nickname) it stays until its own action.
export default function Modal({ className, labelledBy, onClose, children }) {
  const dialog = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    const first = dialog.current?.querySelector('input, button, a[href]')
    first?.focus({ preventScroll: true })
    return () => previous?.focus?.()
  }, [])

  useEffect(() => {
    if (!onClose) return undefined
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const onBackdrop = (event) => {
    if (onClose && event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onBackdrop}>
      <section
        ref={dialog}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </section>
    </div>,
    document.body,
  )
}
