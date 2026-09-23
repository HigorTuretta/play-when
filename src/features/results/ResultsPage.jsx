import React from 'react'
import { Link } from '../../app/router'
import { pathFor } from '../../config/routes'
import { useI18n } from '../../i18n/LanguageProvider'
import { useAuth } from '../auth/AuthProvider'
import { GAME_MODES, GREAT_SCORE } from '../game/constants'
import { useGame } from '../game/GameProvider'
import { useStartMode } from '../modes/useStartMode'
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

export default function ResultsPage({ onPlay }) {
  const { t, language } = useI18n()
  const { user, profile, login } = useAuth()
  const { score, results, daily, remaining, rankedLimitReached, mode, game } = useGame()
  const { start, modal } = useStartMode(onPlay)

  const signedIn = Boolean(user && profile)
  const ranked = mode === GAME_MODES.ranked
  const totalHits = results.reduce((total, round) => total + round.hits, 0)
  const perfectRounds = results.filter((round) => round.perfect).length

  return (
    <section className="finish-card">
      <span className="finish-blob" aria-hidden="true" />
      <div className="finish-inner">
        <div className="page-badge" aria-hidden="true">
          ★
        </div>
        <p className="eyebrow">
          {t.endGame}
          <span className={`mode-tag mode-tag-${mode}`}>{t.modes[mode].tag}</span>
        </p>
        <h1>{score >= GREAT_SCORE ? t.finishGreat : t.finishTry}</h1>

        <div className="stats-grid">
          <StatCard label={t.statScore} value={score} />
          <StatCard label={t.statHits} value={totalHits} />
          <StatCard label={t.statPerfect} value={perfectRounds} />
          <StatCard label={t.statStreak} value={signedIn ? daily.streak || 0 : 0} accent />
        </div>

        <p className="finish-note">
          {ranked ? t.results.rankedSaved : t.results.normalNote}
          {game?.challenge && !ranked && game.fromLink ? ` ${t.results.challengeIntro}` : ''}
        </p>

        {results.length > 0 && (
          <ShareGrid
            results={results}
            score={score}
            mode={mode}
            challenge={ranked ? null : game?.challenge}
          />
        )}

        {!signedIn && (
          <div className="login-callout">
            <strong>{t.results.loginForRanked}</strong>
            <button type="button" className="primary small" onClick={login}>
              {t.signIn}
            </button>
          </div>
        )}

        {results.length > 0 && <ResultSummary results={results} />}

        <div className="finish-actions">
          <button type="button" className="primary" onClick={() => start(GAME_MODES.normal)}>
            {t.results.playNormal}
          </button>
          {rankedLimitReached ? (
            <div className="limit-message">
              <span className="limit-badge" aria-hidden="true">
                !
              </span>
              <span>{t.completedToday}</span>
            </div>
          ) : (
            <button type="button" className="outline" onClick={() => start(GAME_MODES.ranked)}>
              {signedIn ? t.results.playRankedLeft(remaining) : t.results.playRanked}
            </button>
          )}
          <Link className="outline" to={pathFor('ranking', language)}>
            {t.leaderboard}
          </Link>
        </div>
      </div>
      {modal}
    </section>
  )
}
