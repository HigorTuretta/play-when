import React, { useState } from 'react'
import Modal from '../../components/ui/Modal'
import { useI18n } from '../../i18n/LanguageProvider'
import { useAuth } from './AuthProvider'
import { NICKNAME_MAX, isValidNickname } from './nickname'

export default function NicknameModal() {
  const { t } = useI18n()
  const { user, profile, busy, saveNickname } = useAuth()
  const [nickname, setNickname] = useState('')

  if (!user || profile) return null

  const canSubmit = isValidNickname(nickname) && !busy
  const submit = () => canSubmit && saveNickname(nickname)

  return (
    <Modal className="nickname-modal" labelledBy="nickname-title">
      <div className="modal-icon nickname-icon" aria-hidden="true">
        @
      </div>
      <h2 id="nickname-title">{t.profileTitle}</h2>
      <p>{t.profileCopy}</p>
      <label>
        <span>{t.nickname}</span>
        <input
          value={nickname}
          maxLength={NICKNAME_MAX}
          autoFocus
          placeholder={t.nicknamePlaceholder}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <small>{t.nicknameHint}</small>
      </label>
      <button className="primary block" disabled={!canSubmit} onClick={submit}>
        {t.saveNickname}
      </button>
    </Modal>
  )
}
