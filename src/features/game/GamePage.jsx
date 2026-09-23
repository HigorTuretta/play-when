import React from 'react'
import ErrorBanner from '../../components/ui/ErrorBanner'
import { errorText } from '../../i18n'
import { useI18n } from '../../i18n/LanguageProvider'
import ActionBar from './components/ActionBar'
import CardBoard from './components/CardBoard'
import GameHeader from './components/GameHeader'
import RoundComparison from './components/RoundComparison'
import RoundLoader from './components/RoundLoader'
import { TOTAL_ROUNDS } from './constants'
import { useGame } from './GameProvider'
import { useRoundTimer } from './hooks/useRoundTimer'

export default function GamePage() {
  const { t } = useI18n()
  const {
    mode,
    isRanked,
    round,
    streak,
    score,
    cards,
    reveal,
    locked,
    deadline,
    roundData,
    loading,
    busy,
    error,
    submit,
    timeUp,
    nextRound,
    moveCard,
    reorder,
  } = useGame()

  const progress = ((round + (reveal ? 1 : 0)) / TOTAL_ROUNDS) * 100
  const ready = roundData && !loading.active
  const seconds = useRoundTimer(deadline, Boolean(isRanked && ready && !reveal), timeUp)

  return (
    <>
      <GameHeader
        round={round}
        streak={streak}
        score={score}
        mode={mode}
        seconds={isRanked && ready && !reveal ? seconds : null}
      />
      <div className="progress-track">
        <div className="progress-value" style={{ width: `${progress}%` }} />
      </div>
      <ErrorBanner message={error && errorText(t, error)} />
      {ready ? (
        <>
          <CardBoard
            cards={cards}
            reveal={reveal}
            locked={locked}
            onMove={moveCard}
            onReorder={reorder}
          />
          <ActionBar
            reveal={reveal}
            busy={busy || (locked && !reveal)}
            isLastRound={round === TOTAL_ROUNDS - 1}
            onSubmit={submit}
            onNext={nextRound}
          />
          {reveal && <RoundComparison cards={cards} correctOrder={reveal.correctOrder} />}
        </>
      ) : (
        <RoundLoader progress={loading.progress} />
      )}
    </>
  )
}
