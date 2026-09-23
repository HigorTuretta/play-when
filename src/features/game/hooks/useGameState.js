import { useCallback, useEffect, useRef, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { track } from '../../../lib/analytics'
import {
  creditDailyStreak,
  finishGame,
  getDailyState,
  isGameOpen,
  startGame,
  startGuestGame,
  submitGuestRound,
  submitRound,
} from '../api/gameService'
import { preloadEventImage } from '../api/imageService'
import { getRound } from '../api/roundService'
import { invalidateLeaderboard } from '../../leaderboard/leaderboardService'
import { DAILY_LIMIT, ROUND_SIZE, TOTAL_ROUNDS } from '../constants'
import { clearSession, loadSession, restoreRound, saveSession } from '../utils/session'
import { shuffle } from '../utils/shuffle'

const EMPTY_DAILY = { plays: 0, streak: 0 }
const EMPTY_ROUND = { data: null, cards: [], reveal: null }
const LOADER_SETTLE_MS = 250

export function useGameState({ user, profile }) {
  const uid = user?.uid
  const hasProfile = Boolean(profile)

  const [daily, setDaily] = useState(EMPTY_DAILY)
  const [status, setStatus] = useState('home')
  const [game, setGame] = useState(null)
  const [round, setRound] = useState(0)
  const [roundState, setRoundState] = useState(EMPTY_ROUND)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState({ active: false, progress: 0 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const previousUid = useRef(uid)

  const resetGame = useCallback((next = {}) => {
    setGame(next.game || null)
    setRound(next.round || 0)
    setScore(next.score || 0)
    setStreak(next.streak || 0)
    setResults(next.results || [])
    setRoundState(EMPTY_ROUND)
  }, [])

  useEffect(() => {
    if (previousUid.current && !uid) {
      clearSession()
      resetGame()
      setDaily(EMPTY_DAILY)
      setStatus('home')
    }
    previousUid.current = uid
  }, [uid, resetGame])

  useEffect(() => {
    if (!uid || !hasProfile) return undefined
    let alive = true

    getDailyState(uid)
      .then(async (state) => {
        if (!alive) return
        setDaily(state)
        const saved = loadSession(uid)
        if (!saved) return
        // The saved game may have been finished on another device, or belong to an
        // account state that no longer exists. Resuming it would make every submission
        // fail against the rules, so a session known to be unplayable is dropped. A check
        // that could not be made keeps the session: submitting will say so soon enough.
        if ((await isGameOpen(uid, saved.game.id)) === false) {
          clearSession()
          return
        }
        if (!alive) return
        resetGame(saved)
        setStatus('playing')
      })
      .catch(() => alive && setError('generic'))

    return () => {
      alive = false
    }
  }, [uid, hasProfile, resetGame])

  useEffect(() => {
    const roundId = game?.roundIds?.[round]
    if (status !== 'playing' || !roundId) return undefined

    const controller = new AbortController()
    const alive = () => !controller.signal.aborted
    setLoading({ active: true, progress: 0 })
    setRoundState(EMPTY_ROUND)

    getRound(roundId)
      .then(async (data) => {
        if (!alive()) return
        setRoundState(
          restoreRound(game.id, round, data) || { data, cards: shuffle(data.cards), reveal: null },
        )

        let completed = 0
        await Promise.allSettled(
          data.cards.map((card) =>
            preloadEventImage(card, controller.signal).finally(() => {
              completed += 1
              if (alive()) setLoading({ active: true, progress: completed })
            }),
          ),
        )

        if (alive())
          setTimeout(
            () => alive() && setLoading({ active: false, progress: completed }),
            LOADER_SETTLE_MS,
          )
      })
      .catch(() => alive() && setError('generic'))

    return () => controller.abort()
  }, [status, game?.id, round])

  useEffect(() => {
    if (status !== 'playing' || !game || game.guest || !uid || loading.active || !roundState.data)
      return
    saveSession({ uid, game, round, score, streak, results, roundState })
  }, [status, game, uid, round, score, streak, results, roundState, loading.active])

  const begin = useCallback(async () => {
    if (user && !profile) return false
    try {
      setError(null)
      let created
      if (user) {
        const started = await startGame(user.uid)
        created = started.game
        setDaily(started.daily)
        track('game_start', { daily_play: started.daily.plays, mode: 'account' })
      } else {
        created = startGuestGame()
        track('game_start', { mode: 'guest' })
      }
      resetGame({ game: created })
      setStatus('playing')
      return true
    } catch (e) {
      console.error('Failed to start a game', e)
      if (e?.message === 'daily-limit') setDaily((current) => ({ ...current, plays: DAILY_LIMIT }))
      else setError(e?.message === 'pool-exhausted' ? 'poolExhausted' : 'generic')
      return false
    }
  }, [user, profile, resetGame])

  const moveCard = useCallback((from, to) => {
    setRoundState((state) => {
      if (state.reveal || to < 0 || to >= state.cards.length) return state
      return { ...state, cards: arrayMove(state.cards, from, to) }
    })
  }, [])

  const reorder = useCallback((activeId, overId) => {
    setRoundState((state) => {
      if (state.reveal || activeId === overId) return state
      const from = state.cards.findIndex((card) => card.id === activeId)
      const to = state.cards.findIndex((card) => card.id === overId)
      return { ...state, cards: arrayMove(state.cards, from, to) }
    })
  }, [])

  const submit = async () => {
    if (roundState.reveal || !game || busy) return
    try {
      setBusy(true)
      setError(null)
      const payload = {
        roundId: game.roundIds[round],
        orderedIds: roundState.cards.map((card) => card.id),
        streakBefore: streak,
      }
      const result =
        uid && !game.guest
          ? await submitRound({ ...payload, uid, gameId: game.id, roundIndex: round })
          : await submitGuestRound(payload)

      const revealed = roundState.cards.map((card) => ({ ...card, year: result.years[card.id] }))
      setRoundState((state) => ({
        ...state,
        cards: revealed,
        reveal: { correctOrder: result.correctOrder, hits: result.hits, gain: result.score },
      }))
      setStreak(result.streakAfter)
      setResults((current) => [
        ...current,
        {
          round,
          hits: result.hits,
          perfect: result.hits === ROUND_SIZE,
          ordered: revealed,
          correct: result.correctOrder,
        },
      ])
      if (result.score > 0) setScore((value) => value + result.score)
      track('round_submit', { round: round + 1, hits: result.hits, score: result.score })
    } catch (e) {
      console.error('Failed to submit round', e)
      if (uid && !game.guest && (await isGameOpen(uid, game.id)) === false) {
        clearSession()
        resetGame()
        setStatus('home')
        setError('sessionExpired')
      } else {
        setError('generic')
      }
    } finally {
      setBusy(false)
    }
  }

  const nextRound = async () => {
    if (busy) return
    if (round < TOTAL_ROUNDS - 1) {
      setRound((value) => value + 1)
      return
    }

    if (!uid || game.guest) {
      setStatus('finished')
      clearSession()
      track('game_complete', { score, mode: 'guest' })
      return
    }

    try {
      setBusy(true)
      const finalScore = await finishGame({
        uid,
        gameId: game.id,
        hits: results.map((result) => result.hits),
      })
      setScore(finalScore)
      setStatus('finished')
      clearSession()
      invalidateLeaderboard()
      track('game_complete', { score: finalScore, mode: 'account' })
      try {
        setDaily(await creditDailyStreak(uid, daily))
      } catch {}
    } catch (e) {
      console.error('Failed to finish the game', e)
      setError('generic')
    } finally {
      setBusy(false)
    }
  }

  const closeResults = useCallback(() => {
    setStatus((current) => (current === 'finished' ? 'home' : current))
  }, [])

  const remaining = Math.max(0, DAILY_LIMIT - (daily.plays || 0))

  return {
    status,
    game,
    round,
    roundData: roundState.data,
    cards: roundState.cards,
    reveal: roundState.reveal,
    score,
    streak,
    results,
    daily,
    remaining,
    limitReached: Boolean(uid && hasProfile && remaining === 0),
    isRanked: Boolean(uid && hasProfile && game && !game.guest),
    loading,
    busy,
    error,
    begin,
    submit,
    nextRound,
    moveCard,
    reorder,
    closeResults,
  }
}
