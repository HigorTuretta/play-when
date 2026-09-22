import { STORAGE_KEYS } from '../../../config/constants'
import { readJSON, removeItem, writeJSON } from '../../../lib/storage'

const KEY = STORAGE_KEYS.session

export const clearSession = () => removeItem(KEY)

export function saveSession({ uid, game, round, score, streak, results, roundState }) {
  const { cards, reveal } = roundState
  writeJSON(KEY, {
    uid,
    gameId: game.id,
    roundIds: game.roundIds,
    round,
    score,
    streak,
    results,
    finished: false,
    roundState: {
      round,
      orderIds: cards.map((card) => card.id),
      reveal,
      years: reveal ? Object.fromEntries(cards.map((card) => [card.id, card.year])) : null,
    },
  })
}

export function loadSession(uid) {
  const saved = readJSON(KEY)
  if (saved?.uid !== uid || saved.finished || !saved.gameId) return null
  return {
    game: { id: saved.gameId, roundIds: saved.roundIds, guest: false },
    round: saved.round || 0,
    score: saved.score || 0,
    streak: saved.streak || 0,
    results: saved.results || [],
  }
}

export function restoreRound(gameId, round, data) {
  const saved = readJSON(KEY)
  const state = saved?.roundState
  if (saved?.gameId !== gameId || state?.round !== round) return null

  const byId = Object.fromEntries(data.cards.map((card) => [card.id, card]))
  const ids = state.orderIds || []
  if (ids.length !== data.cards.length || !ids.every((id) => byId[id])) return null

  const cards = ids.map((id) => (state.reveal ? { ...byId[id], year: state.years?.[id] } : byId[id]))
  return { data, cards, reveal: state.reveal || null }
}
