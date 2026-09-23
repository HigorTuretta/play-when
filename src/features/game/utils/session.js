import { STORAGE_KEYS } from '../../../config/constants'
import { readJSON, removeItem, writeJSON } from '../../../lib/storage'
import { GAME_MODES } from '../constants'

const KEY = STORAGE_KEYS.session

export const clearSession = () => removeItem(KEY)

// A game in progress survives reloads and page changes. Ranked sessions belong to the
// account that started them; normal sessions to whoever uses the browser.
export function saveSession({ uid, game, round, score, streak, results, roundState }) {
  const { cards, reveal, startedAt } = roundState
  writeJSON(KEY, {
    uid: game.mode === GAME_MODES.ranked ? uid : null,
    game,
    round,
    score,
    streak,
    results,
    roundState: {
      round,
      orderIds: cards.map((card) => card.id),
      reveal,
      startedAt: startedAt || null,
      years: reveal ? Object.fromEntries(cards.map((card) => [card.id, card.year])) : null,
    },
  })
}

export function loadSession(uid) {
  const saved = readJSON(KEY)
  const game = saved?.game
  if (!game?.id || !game.mode) return null
  if (game.mode === GAME_MODES.ranked && (!uid || saved.uid !== uid)) return null
  return {
    game,
    round: saved.round || 0,
    score: saved.score || 0,
    streak: saved.streak || 0,
    results: saved.results || [],
  }
}

export function restoreRound(gameId, round, data) {
  const saved = readJSON(KEY)
  const state = saved?.roundState
  if (saved?.game?.id !== gameId || state?.round !== round) return null

  const byId = Object.fromEntries(data.cards.map((card) => [card.id, card]))
  const ids = state.orderIds || []
  if (ids.length !== data.cards.length || !ids.every((id) => byId[id])) return null

  const cards = ids.map((id) =>
    state.reveal ? { ...byId[id], year: state.years?.[id] } : byId[id],
  )
  return { cards, reveal: state.reveal || null, startedAt: state.startedAt || null }
}
