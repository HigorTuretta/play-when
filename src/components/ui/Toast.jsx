import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ToastContext = createContext(null)
const VISIBLE_MS = 2400

// Short confirmations ("Copied!") in a polite live region, instead of browser alerts.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef()

  useEffect(() => () => clearTimeout(timer.current), [])

  const show = useCallback((message, tone = 'ok') => {
    clearTimeout(timer.current)
    setToast({ id: Date.now(), message, tone })
    timer.current = setTimeout(() => setToast(null), VISIBLE_MS)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`toast toast-${toast.tone}`}>
            <span className="toast-dot" aria-hidden="true" />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
