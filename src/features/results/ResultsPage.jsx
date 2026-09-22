import React from 'react'
import { useRouter } from '../../app/router'
import { ROUTES } from '../../config/constants'
import { useI18n } from '../../i18n/LanguageProvider'
import { useAuth } from '../auth/AuthProvider'
import { GREAT_SCORE } from '../game/constants'
import { useGame } from '../game/GameProvider'
import ResultSummary from './components/ResultSummary'
import ShareGrid from './components/ShareGrid'

function StatCard({ label, value, accent = false }) {
  return (
    <div className={`stat-card ${accent ? 'is-accent' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default function ResultsPage({ onPlayAgain }) {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const { user, profile, login } = useAuth()
  const { score, results, daily, remaining, limitReached, isRanked } = useGame()

  const signedIn = Boolean(user && profile)
  const totalHits = results.reduce((total, round) => total + round.hits, 0)
  const perfectRounds = results.filter((round) => round.perfect).length

  return (
    <section className="finish-card">
      <span className="finish-blob" aria-hidden="true" />
      <div className="finish-inner">
        <div className="page-badge" aria-hidden="true">★</div>
        <p className="eyebrow">{t.endGame}</p>
        <h1>{score >= GREAT_SCORE ? t.finishGreat : t.finishTry}</h1>

        <div className="stats-grid">
          <StatCard label={t.statScore} value={score} />
          <StatCard label={t.statHits} value={totalHits} />
          <StatCard label={t.statPerfect} value={perfectRounds} />
          <StatCard label={t.statStreak} value={signedIn ? daily.streak || 0 : 0} accent />
        </div>

        {results.length > 0 && <ShareGrid results={results} score={score} />}

        {!isRanked && (
          <div className="login-callout">
            <strong>{t.loginToSave}</strong>
            <button className="primary small" onClick={login}>{t.signIn}</button>
          </div>
        )}

        {results.length > 0 && <ResultSummary results={results} />}

        <div className="finish-actions">
          {limitReached ? (
            <div className="limit-message"><span className="limit-badge" aria-hidden="true">!</span><span>{t.completedToday}</span></div>
          ) : (
            <button className="primary" onClick={onPlayAgain}>{signedIn ? t.playAgain(remaining) : t.startGame}</button>
          )}
          <button className="outline" onClick={() => navigate(ROUTES.leaderboard)}>{t.leaderboard}</button>
        </div>
      </div>
    </section>
  )
}
