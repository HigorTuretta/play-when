import React, { useState } from 'react'
import { AtSign, Check } from 'lucide-react'

export default function NicknameModal({ open, t, onSubmit, busy }) {
  const [nickname, setNickname] = useState('')
  const valid = nickname.trim().length >= 2 && nickname.trim().length <= 24
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="nickname-modal" role="dialog" aria-modal="true" aria-labelledby="nickname-title">
        <div className="modal-icon"><AtSign size={24}/></div>
        <h2 id="nickname-title">{t.profileTitle}</h2>
        <p>{t.profileCopy}</p>
        <label>
          <span>{t.nickname}</span>
          <input value={nickname} maxLength={24} autoFocus onChange={(e)=>setNickname(e.target.value)} placeholder={t.nicknamePlaceholder} onKeyDown={(e)=>{ if(e.key==='Enter'&&valid&&!busy) onSubmit(nickname) }} />
          <small>{t.nicknameHint}</small>
        </label>
        <button className="primary" disabled={!valid || busy} onClick={()=>onSubmit(nickname)}><Check size={17}/>{t.saveNickname}</button>
      </section>
    </div>
  )
}
