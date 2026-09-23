import React, { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import Breadcrumbs from '../../components/content/Breadcrumbs'
import ContentSections from '../../components/content/ContentSections'
import PlayCallout from '../../components/content/PlayCallout'
import { pathFor } from '../../config/routes'
import { rankingContent } from '../../content/pages/ranking'
import { useI18n } from '../../i18n/LanguageProvider'
import { countryFlag } from '../../lib/country'
import { useAuth } from '../auth/AuthProvider'
import { leaderboardEntryId } from './entryId'

const ROW_STAGGER_MS = 45

function LeaderboardRow({ row, index, isYou }) {
  const { t } = useI18n()
  return (
    <li
      className={`leaderboard-row ${isYou ? 'is-you' : ''}`}
      style={{ '--row-delay': `${index * ROW_STAGGER_MS}ms` }}
    >
      <span className="rank">{row.rank}</span>
      <span className="flag" title={row.countryCode} role="img" aria-label={row.countryCode}>
        {countryFlag(row.countryCode)}
      </span>
      <strong>{isYou ? t.you : row.nickname}</strong>
      <span className="games-count">
        {row.gamesPlayed || 0} {t.games}
      </span>
      <b>
        {Number(row.totalScore || 0).toLocaleString()} {t.points}
      </b>
    </li>
  )
}

// The list itself is loaded in the browser (it changes all the time); the page around it
// is prerendered. The list area keeps a minimum height so the page does not jump.
function Board({ board }) {
  const { t } = useI18n()
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, rows: [] })
  const [you, setYou] = useState(null)

  useEffect(() => {
    let active = true
    setState({ loading: true, rows: [] })
    import('./leaderboardService')
      .then(({ getLeaderboard }) => getLeaderboard(board))
      .then((rows) => active && setState({ loading: false, rows }))
      .catch(() => active && setState({ loading: false, rows: [] }))
    return () => {
      active = false
    }
  }, [board])

  // Ranked entries are keyed by a hash of the uid; the legacy ones by the uid itself.
  useEffect(() => {
    let active = true
    if (!user) setYou(null)
    else if (board === 'legacy') setYou(user.uid)
    else leaderboardEntryId(user.uid).then((id) => active && setYou(id))
    return () => {
      active = false
    }
  }, [user, board])

  if (state.loading) {
    return (
      <div className="leaderboard-body center-loader" aria-busy="true">
        <LoaderCircle className="spin" aria-hidden="true" />
      </div>
    )
  }
  if (!state.rows.length) {
    return (
      <div className="leaderboard-body">
        <p className="empty-state">{t.noLeaderboard}</p>
      </div>
    )
  }
  return (
    <ol className="leaderboard-body leaderboard-list">
      {state.rows.map((row, index) => (
        <LeaderboardRow key={row.id} row={row} index={index} isYou={row.id === you} />
      ))}
    </ol>
  )
}

export default function LeaderboardPage() {
  const { t, language } = useI18n()
  const [board, setBoard] = useState('ranked')

  return (
    <article className="page-card leaderboard-page">
      <Breadcrumbs
        items={[
          [t.home, pathFor('home', language)],
          [t.nav.ranking, pathFor('ranking', language)],
        ]}
      />
      <div className="page-badge" aria-hidden="true">
        ★
      </div>
      <header>
        <p className="eyebrow">{t.leaderboard}</p>
        <h1>{t.leaderboardTitle}</h1>
        <p className="subtitle">{t.leaderboardCopy}</p>
      </header>

      <div id="board-panel" role="tabpanel" aria-labelledby={`board-tab-${board}`}>      
        <Board board={board} />
      </div>

      <ContentSections sections={rankingContent[language].sections} />
      <PlayCallout />
    </article>
  )
}
