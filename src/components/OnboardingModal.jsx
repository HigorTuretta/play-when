import React from 'react'

const STEP_COUNT = 3

export default function OnboardingModal({ step, t, onNext, onSkip }) {
  if (step < 0 || step >= STEP_COUNT) return null
  const content = t.onboard[step]
  const last = step === STEP_COUNT - 1

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <div className="onboarding-dots" aria-hidden="true">
          {Array.from({ length: STEP_COUNT }).map((_, index) => (
            <span key={index} className={index <= step ? 'is-done' : ''} />
          ))}
        </div>
        <div className={`modal-icon onboarding-icon step-${step + 1}`} aria-hidden="true">{content.icon}</div>
        <h2 id="onboarding-title">{content.title}</h2>
        <p>{content.copy}</p>
        <div className="onboarding-actions">
          <button className="primary" onClick={onNext}>{last ? t.gotIt : t.next}</button>
          <button className="ghost" onClick={onSkip}>{t.skip}</button>
        </div>
      </section>
    </div>
  )
}
