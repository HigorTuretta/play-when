import React, { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { countryFlag, getLeaderboard } from '../services/userService'

export default function LeaderboardPage({ t, currentUid }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ let active=true; getLeaderboard().then((data)=>active&&setRows(data)).finally(()=>active&&setLoading(false)); return()=>{active=false} },[])
  return (
    <section className="page-card leaderboard-page">
      <div className="page-badge" aria-hidden="true">★</div>
      <p className="eyebrow">{t.leaderboard}</p>
      <h1>{t.leaderboardTitle}</h1>
      <p className="subtitle">{t.leaderboardCopy}</p>
      {loading ? <div className="center-loader"><LoaderCircle className="spin"/></div> : rows.length ? (
        <div className="leaderboard-list">
          {rows.map((row, index)=><div key={row.id} className={`leaderboard-row ${row.id===currentUid?'is-you':''}`} style={{'--row-delay':`${index*45}ms`}}>
            <span className="rank">{row.rank}</span>
            <span className="flag" title={row.countryCode}>{countryFlag(row.countryCode)}</span>
            <strong>{row.id===currentUid?t.you:row.nickname}</strong>
            <span className="games-count">{row.gamesPlayed||0} {t.games}</span>
            <b>{Number(row.totalScore||0).toLocaleString()} {t.points}</b>
          </div>)}
        </div>
      ) : <p className="empty-state">{t.noLeaderboard}</p>}
    </section>
  )
}
