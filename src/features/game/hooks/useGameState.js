import { useCallback, useEffect, useRef, useState } from 'react'
import { EVENTS, track } from '../../../lib/analytics'
import { decodeChallenge, encodeChallenge } from '../../challenge/challengeCode'
import { invalidateLeaderboard } from '../../leaderboard/leaderboardCache'
import { getRankedRound, loadCatalog, loadRoundIndex } from '../api/gameData'
import { preloadEventImage } from '../api/imageService'
import { getNormalRound, scoreNormalRound, validateNormalRounds } from '../api/normalService'
import {
  DAILY_LIMIT,
  GAME_MODES,
  RANKED_ROUND_SECONDS,
  ROUND_SIZE,
  TOTAL_ROUNDS,
} from '../constants'
import {
  appendHistory,
  eventNumber,
  mergeHistories,
  readLocalHistory,
  writeLocalHistory,
} from '../selection/history'
import { pickNormalGame } from '../selection/pickNormalGame'
import { pickRankedRounds } from '../selection/pickRankedRounds'
import { arrayMove } from '../utils/arrayMove'
import { roundNumberOf } from '../utils/roundSelection'
import { clearSession, loadSession, restoreRound, saveSession } from '../utils/session'
import { shuffle } from '../utils/shuffle'

const EMPTY_DAILY = { plays: 0, streak: 0 }
const EMPTY_ROUND = {
  data: null,
  cards: [],
  reveal: null,
  answer: null,
  startedAt: null,
  locked: false,
}
const LOADER_SETTLE_MS = 250
const ROUND_MS = RANKED_ROUND_SECONDS * 1000

// Firestore is only needed for ranked games, so its code is loaded on demand.
const loadRanked = () => import('../api/rankedService')
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const isPermissionDenied = (error) =>
  error?.code === 'permission-denied' || error?.cause?.code === 'permission-denied'

async function scoreRankedRound(payload, orderedIds) {
  const ranked = await loadRanked()
  try {
    return await ranked.submitRankedRound({ ...payload, orderedIds })
  } catch (e) {
    // The rules refuse an order that reaches the server after the round's time.
    if (!isPermissionDenied(e)) throw e
    return ranked.submitTimedOutRound(payload)
  }
}

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

  // Values read by callbacks that must not be recreated on every change.
  const latest = useRef({})
  latest.current = { uid, game, round, roundState, streak }
  const history = useRef(null)
  const previousUid = useRef(uid)
  const submitting = useRef(false)

  const resetGame = useCallback((next = {}) => {
    setGame(next.game || null)
    setRound(next.round || 0)
    setScore(next.score || 0)
    setStreak(next.streak || 0)
    setResults(next.results || [])
    setRoundState(EMPTY_ROUND)
  }, [])

  // --- Recent-facts history (see src/features/game/selection/history.js) --------------

  const getHistory = () => {
    if (!history.current) history.current = readLocalHistory()
    return history.current
  }

  const recordDealt = useCallback(
    (events) => {
      const next = appendHistory(getHistory(), events)
      history.current = next
      writeLocalHistory(next)
      if (uid) {
        loadRanked()
          .then(({ saveHistory }) => saveHistory(uid, next))
          .catch(() => {})
      }
    },
    [uid],
  )

  // --- Account state and resuming ------------------------------------------------------

  // A normal game in progress resumes as soon as the page loads, signed in or not.
  useEffect(() => {
    const saved = loadSession(null)
    if (saved?.game.mode !== GAME_MODES.normal) return
    resetGame(saved)
    setStatus('playing')
  }, [resetGame])

  useEffect(() => {
    if (previousUid.current && !uid) {
      if (latest.current.game?.mode === GAME_MODES.ranked) {
        clearSession()
        resetGame()
        setStatus('home')
      }
      setDaily(EMPTY_DAILY)
    }
    previousUid.current = uid
  }, [uid, resetGame])

  useEffect(() => {
    if (!uid || !hasProfile) return undefined
    let alive = true

    loadRanked()
      .then(async (ranked) => {
        const account = await ranked.getAccountState(uid)
        if (!alive) return
        setDaily(account.daily)

        // This device's history and the account's are merged, and the account copy is
        // only rewritten when this device adds something to it.
        const merged = mergeHistories(account.history, getHistory())
        history.current = merged
        writeLocalHistory(merged)
        if (merged.join() !== account.history.join())
          ranked.saveHistory(uid, merged).catch(() => {})

        const saved = loadSession(uid)
        if (saved?.game.mode !== GAME_MODES.ranked) return
        // The saved game may have been finished on another device. Resuming it would make
        // every submission fail, so a game known to be closed is dropped. A check that
        // could not be made keeps the session: submitting will say so soon enough.
        if ((await ranked.getOpenGame(uid, saved.game.id)) === false) {
          clearSession()
          return
        }
        if (!alive || latest.current.game) return
        resetGame(saved)
        setStatus('playing')
      })
      .catch(() => alive && setError('generic'))

    return () => {
      alive = false
    }
  }, [uid, hasProfile, resetGame])

  // --- Loading a round ----------------------------------------------------------------

  const gameId = game?.id
  useEffect(() => {
    const current = latest.current.game
    if (status !== 'playing' || !current) return undefined

    const controller = new AbortController()
    const alive = () => !controller.signal.aborted
    const ranked = current.mode === GAME_MODES.ranked
    setLoading({ active: true, progress: 0 })
    setRoundState(EMPTY_ROUND)

    const load = async () => {
      let data
      let answer = null
      if (ranked) data = await getRankedRound(current.roundIds[round])
      else ({ data, answer } = await getNormalRound(current.rounds[round]))
      if (!alive()) return

      const restored = restoreRound(current.id, round, data)
      let completed = 0
      await Promise.allSettled(
        data.cards.map((card) =>
          preloadEventImage(card, controller.signal).finally(() => {
            completed += 1
            if (alive()) setLoading({ active: true, progress: completed })
          }),
        ),
      )
      await wait(LOADER_SETTLE_MS)
      if (!alive()) return

      // The ranked clock starts on the server right before the cards appear.
      let startedAt = restored?.startedAt || null
      if (ranked && !restored?.reveal && !startedAt) {
        const service = await loadRanked()
        ;({ startedAt } = await service.startRankedRound(latest.current.uid, current.id, round))
        if (!alive()) return
      }

      setRoundState({
        data,
        cards: restored?.cards || shuffle(data.cards),
        reveal: restored?.reveal || null,
        answer,
        startedAt,
        locked: Boolean(restored?.reveal),
      })
      setLoading({ active: false, progress: completed })
    }

    load().catch((e) => {
      console.error('Failed to load the round', e)
      if (alive()) setError('generic')
    })
    return () => controller.abort()
  }, [status, gameId, round])

  useEffect(() => {
    if (status !== 'playing' || !game || loading.active || !roundState.data) return
    saveSession({ uid, game, round, score, streak, results, roundState })
  }, [status, game, uid, round, score, streak, results, roundState, loading.active])

  // --- Starting a game ----------------------------------------------------------------

  const startNormal = async (rounds, challenge) => {
    const factRounds =
      rounds ||
      pickNormalGame(await loadCatalog(), getHistory()).map((facts) => facts.map((f) => f.id))
    const numbers = factRounds.map((facts) => facts.map(eventNumber))
    recordDealt(numbers.flat())
    track(EVENTS.gameStarted, { mode: GAME_MODES.normal })
    track(EVENTS.normalGameStarted, { challenge: Boolean(challenge) })
    return {
      id: `normal-${crypto.randomUUID()}`,
      mode: GAME_MODES.normal,
      rounds: factRounds,
      challenge: challenge || encodeChallenge(numbers),
      fromLink: Boolean(challenge),
    }
  }

  const startRanked = async () => {
    const [index, ranked] = await Promise.all([loadRoundIndex(), loadRanked()])
    await ranked.ensureLeaderboardEntry(uid, profile)
    const started = await ranked.startRankedGame(uid, (isUsed) =>
      pickRankedRounds(index, getHistory(), isUsed),
    )
    setDaily(started.daily)
    recordDealt(
      started.game.roundIds.flatMap((roundId) => index.rounds[roundNumberOf(roundId) - 1]),
    )
    track(EVENTS.gameStarted, { mode: GAME_MODES.ranked })
    track(EVENTS.rankedGameStarted, { daily_play: started.daily.plays })
    return started.game
  }

  const begin = async (mode, { rounds = null, challenge = null } = {}) => {
    if (busy) return false
    if (mode === GAME_MODES.ranked && !(uid && hasProfile)) return false
    try {
      setBusy(true)
      setError(null)
      const created =
        mode === GAME_MODES.ranked ? await startRanked() : await startNormal(rounds, challenge)
      clearSession()
      resetGame({ game: created })
      setStatus('playing')
      return true
    } catch (e) {
      console.error('Failed to start a game', e)
      if (e?.message === 'daily-limit') setDaily((current) => ({ ...current, plays: DAILY_LIMIT }))
      else setError(e?.message === 'pool-exhausted' ? 'poolExhausted' : 'generic')
      return false
    } finally {
      setBusy(false)
    }
  }

  // A challenge link deals the exact facts of a friend's normal game.
  const beginChallenge = async (code) => {
    const numbers = decodeChallenge(code)
    const rounds = numbers && (await validateNormalRounds(numbers).catch(() => null))
    if (!rounds) {
      setError('challengeInvalid')
      return false
    }
    track(EVENTS.challengeStarted)
    return begin(GAME_MODES.normal, { rounds, challenge: code })
  }

  // --- Playing a round ----------------------------------------------------------------

  const moveCard = useCallback((from, to) => {
    setRoundState((state) => {
      if (state.locked || to < 0 || to >= state.cards.length) return state
      return { ...state, cards: arrayMove(state.cards, from, to) }
    })
  }, [])

  const reorder = useCallback((activeId, overId) => {
    setRoundState((state) => {
      if (state.locked || activeId === overId) return state
      const from = state.cards.findIndex((card) => card.id === activeId)
      const to = state.cards.findIndex((card) => card.id === overId)
      return { ...state, cards: arrayMove(state.cards, from, to) }
    })
  }, [])

  // `expired` marks an order sent by the timer rather than by the player.
  const submit = useCallback(
    async ({ expired = false } = {}) => {
      const {
        uid: player,
        game: current,
        round: index,
        roundState: state,
        streak: before,
      } = latest.current
      if (!current || !state.data || state.reveal || submitting.current) return
      submitting.current = true
      setBusy(true)
      setError(null)
      setRoundState((s) => ({ ...s, locked: true }))

      const orderedIds = state.cards.map((card) => card.id)
      try {
        const result =
          current.mode === GAME_MODES.ranked
            ? await scoreRankedRound(
                {
                  uid: player,
                  gameId: current.id,
                  roundId: current.roundIds[index],
                  roundIndex: index,
                  streakBefore: before,
                },
                orderedIds,
              )
            : scoreNormalRound(orderedIds, state.answer, before)

        const revealed = state.cards.map((card) => ({ ...card, year: result.years[card.id] }))
        const timedOut = Boolean(result.timedOut)
        setRoundState((s) => ({
          ...s,
          cards: revealed,
          locked: true,
          reveal: {
            correctOrder: result.correctOrder,
            hits: result.hits,
            gain: result.score,
            timedOut,
            expired: expired === true || timedOut,
          },
        }))
        setStreak(result.streakAfter)
        setResults((list) => [
          ...list,
          {
            round: index,
            hits: result.hits,
            perfect: result.hits === ROUND_SIZE,
            timedOut,
            ordered: revealed,
            correct: result.correctOrder,
          },
        ])
        if (result.score > 0) setScore((value) => value + result.score)
      } catch (e) {
        console.error('Failed to submit round', e)
        setRoundState((s) => ({ ...s, locked: false }))
        const ranked = current.mode === GAME_MODES.ranked
        if (ranked && (await (await loadRanked()).getOpenGame(player, current.id)) === false) {
          clearSession()
          resetGame()
          setStatus('home')
          setError('sessionExpired')
        } else {
          setError('generic')
        }
      } finally {
        submitting.current = false
        setBusy(false)
      }
    },
    [resetGame],
  )

  // At zero the cards lock and the current order is submitted, exactly as if the player
  // had confirmed it.
  const timeUp = useCallback(() => {
    setRoundState((s) => (s.reveal ? s : { ...s, locked: true }))
    submit({ expired: true })
  }, [submit])

  const nextRound = async () => {
    if (busy) return
    if (round < TOTAL_ROUNDS - 1) {
      setRound((value) => value + 1)
      return
    }

    if (game.mode === GAME_MODES.normal) {
      setStatus('finished')
      clearSession()
      track(EVENTS.gameCompleted, { mode: GAME_MODES.normal, score })
      return
    }

    try {
      setBusy(true)
      const { finishRankedGame, creditDailyStreak } = await loadRanked()
      const finalScore = await finishRankedGame({
        uid,
        gameId: game.id,
        hits: results.map((result) => result.hits),
      })
      setScore(finalScore)
      setStatus('finished')
      clearSession()
      invalidateLeaderboard()
      track(EVENTS.gameCompleted, { mode: GAME_MODES.ranked, score: finalScore })
      track(EVENTS.rankedGameCompleted, { score: finalScore })
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

  const clearError = useCallback(() => setError(null), [])

  const isRanked = game?.mode === GAME_MODES.ranked
  const remaining = Math.max(0, DAILY_LIMIT - (daily.plays || 0))
  const deadline =
    isRanked && roundState.startedAt && !roundState.reveal ? roundState.startedAt + ROUND_MS : null

  return {
    status,
    game,
    mode: game?.mode || null,
    isRanked,
    round,
    roundData: roundState.data,
    cards: roundState.cards,
    reveal: roundState.reveal,
    locked: roundState.locked,
    deadline,
    score,
    streak,
    results,
    daily,
    remaining,
    rankedLimitReached: Boolean(uid && hasProfile && remaining === 0),
    loading,
    busy,
    error,
    begin,
    beginChallenge,
    submit,
    timeUp,
    nextRound,
    moveCard,
    reorder,
    closeResults,
    clearError,
  }
}
