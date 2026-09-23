import React from 'react'
import Modal from '../../components/ui/Modal'
import { useI18n } from '../../i18n/LanguageProvider'
import { useAuth } from '../auth/AuthProvider'

// Shown when a visitor picks the ranked mode: it needs a Google account, because only
// signed-in games can be verified and credited to the ranking.
export default function RankedAccessModal({ onClose }) {
  const { t } = useI18n()
  const { login } = useAuth()

  const signIn = async () => {
    if (await login()) onClose()
  }

  return (
    <Modal className="ranked-modal" labelledBy="ranked-access-title" onClose={onClose}>
      <div className="modal-icon ranked-icon" aria-hidden="true">
        ★
      </div>
      <h2 id="ranked-access-title">{t.rankedAccess.title}</h2>
      <p>{t.rankedAccess.copy}</p>
      <ul className="ranked-perks">
        {t.rankedAccess.perks.map((perk) => (
          <li key={perk}>{perk}</li>
        ))}
      </ul>
      <div className="onboarding-actions">
        <button type="button" className="primary" onClick={signIn}>
          {t.signIn}
        </button>
        <button type="button" className="ghost" onClick={onClose}>
          {t.rankedAccess.notNow}
        </button>
      </div>
    </Modal>
  )
}
