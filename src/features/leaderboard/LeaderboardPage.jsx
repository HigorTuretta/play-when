import React, { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useI18n } from '../../i18n/LanguageProvider'
import { countryFlag } from '../../lib/country'
import { useAuth } from '../auth/AuthProvider'
import { getLeaderboard } from './leaderboardService'

const ROW_STAGGER_MS = 45

function LeaderboardRow({ row, index, isYou }) {
  const { t } = useI18n()
  return (
    <div
      className={`leaderboard-row ${isYou ? 'is-you' : ''}`}
      style={{ '--row-delay': `${index * ROW_STAGGER_MS}ms` }}
    >
      <span className="rank">{row.rank}</span>
      <span className="flag" title={row.countryCode}>
        {countryFlag(row.countryCode)}
      </span>
      <strong>{isYou ? t.you : row.nickname}</strong>
      <span className="games-count">
        {row.gamesPlayed || 0} {t.games}
      </span>
      <b>
        {Number(row.totalScore || 0).toLocaleString()} {t.points}
      </b>
    </div>
  )
}

export default function LeaderboardPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getLeaderboard()
      .then((data) => active && setRows(data))
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  let content
  if (loading)
    content = (
      <div className="center-loader">
        <LoaderCircle className="spin" />
      </div>
    )
  else if (!rows.length) content = <p className="empty-state">{t.noLeaderboard}</p>
  else {
    content = (
      <div className="leaderboard-list">
        {rows.map((row, index) => (
          <LeaderboardRow key={row.id} row={row} index={index} isYou={row.id === user?.uid} />
        ))}
      </div>
    )
  }

  return (
    <section className="page-card leaderboard-page">
      <div className="page-badge" aria-hidden="true">
        ★
      </div>
      <p className="eyebrow">{t.leaderboard}</p>
      <h1>{t.leaderboardTitle}</h1>
      <p className="subtitle">{t.leaderboardCopy}</p>
      {content}
    </section>
  )
}
