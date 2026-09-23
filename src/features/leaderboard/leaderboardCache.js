import { STORAGE_KEYS } from '../../config/constants'
import { readJSON, removeItem, writeJSON } from '../../lib/storage'

// Every visit to the ranking costs one read per row shown, so a copy is kept for a couple
// of minutes. Finishing a ranked game drops it, so players see their new score right away.
const CACHE_TTL_MS = 2 * 60 * 1000

export const invalidateLeaderboard = () => removeItem(STORAGE_KEYS.leaderboard)

export function readCachedRows(key) {
  const cached = readJSON(key)
  return Array.isArray(cached?.rows) && Date.now() - cached.at < CACHE_TTL_MS ? cached.rows : null
}

export const writeCachedRows = (key, rows) => writeJSON(key, { at: Date.now(), rows })
