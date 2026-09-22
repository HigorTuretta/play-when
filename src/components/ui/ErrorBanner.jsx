import React from 'react'

export default function ErrorBanner({ message }) {
  if (!message) return null
  return <div className="inline-error">{message}</div>
}
