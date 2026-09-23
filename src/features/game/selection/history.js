import { STORAGE_KEYS } from '../../../config/constants'
import { readJSON, writeJSON } from '../../../lib/storage'

// The recent-facts history is a plain list of event numbers ("event-238" -> 238), oldest
// first. It is small on purpose: HISTORY_LIMIT numbers fit in about 2 KB, so a signed-in
// player's copy is a single Firestore document written once per game, never per round.
export const HISTORY_LIMIT = 480

export const eventNumber = (id) => Number(String(id).replace('event-', ''))

const isEventNumber = (value) => Number.isInteger(value) && value > 0

// Adds events at the recent end. An event seen again moves to the end instead of being
// listed twice.
export function appendHistory(history, events) {
  const fresh = new Set(events)
  return [...history.filter((event) => !fresh.has(event)), ...fresh].slice(-HISTORY_LIMIT)
}

// Merging the account copy with this device's copy keeps everything both have seen.
export const mergeHistories = (remote, local) => appendHistory(remote, local)

export function readLocalHistory() {
  const saved = readJSON(STORAGE_KEYS.factHistory)
  return Array.isArray(saved?.events) ? saved.events.filter(isEventNumber) : []
}

export const writeLocalHistory = (events) => writeJSON(STORAGE_KEYS.factHistory, { events })

export const encodeHistory = (events) => events.join(' ')

export const decodeHistory = (text) =>
  typeof text === 'string'
    ? text.split(' ').map(Number).filter(isEventNumber).slice(-HISTORY_LIMIT)
    : []

// How much each recently seen event should be avoided. Only the most recent part of the
// history counts — RECENT_SHARE of the pool — so once most of the catalogue has been
// played, the events seen longest ago come back first. Newer sightings weigh more.
const RECENT_SHARE = 0.6
const SEEN_PENALTY = 10

export function recencyPenalties(history, poolSize) {
  const window = Math.max(1, Math.floor(poolSize * RECENT_SHARE))
  const recent = history.slice(-window)
  const penalties = new Map()
  recent.forEach((event, position) => {
    const freshness = (position + 1) / recent.length
    penalties.set(event, SEEN_PENALTY * (1 + freshness))
  })
  return penalties
}
