import React from 'react'
import Modal from '../../components/ui/Modal'
import { useI18n } from '../../i18n/LanguageProvider'
import { ONBOARDING_STEPS } from './useOnboarding'

export default function OnboardingModal({ step, onNext, onSkip }) {
  const { t } = useI18n()
  if (step < 0 || step >= ONBOARDING_STEPS) return null

  const content = t.onboard[step]
  const last = step === ONBOARDING_STEPS - 1

  return (
    <Modal className="onboarding-modal" labelledBy="onboarding-title">
      <div className="onboarding-dots" aria-hidden="true">
        {Array.from({ length: ONBOARDING_STEPS }, (_, index) => (
          <span key={index} className={index <= step ? 'is-done' : ''} />
        ))}
      </div>
      <div className={`modal-icon onboarding-icon step-${step + 1}`} aria-hidden="true">
        {content.icon}
      </div>
      <h2 id="onboarding-title">{content.title}</h2>
      <p>{content.copy}</p>
      <div className="onboarding-actions">
        <button className="primary" onClick={onNext}>
          {last ? t.gotIt : t.next}
        </button>
        <button className="ghost" onClick={onSkip}>
          {t.skip}
        </button>
      </div>
    </Modal>
  )
}
