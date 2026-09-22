import React from 'react'

export default function Modal({ className, labelledBy, children }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className={className} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </section>
    </div>
  )
}
