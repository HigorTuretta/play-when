import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { STORAGE_KEYS } from '../../config/constants'
import { db } from '../../lib/firebase/db'
import { LEGACY_LEADERBOARD, RANKED_LEADERBOARD } from './collections'
import { readCachedRows, writeCachedRows } from './leaderboardCache'

// The rules allow listing at most this many entries at a time.
export const LEADERBOARD_SIZE = 10

const BOARDS = {
  ranked: { collection: RANKED_LEADERBOARD, cacheKey: STORAGE_KEYS.leaderboard },
  legacy: { collection: LEGACY_LEADERBOARD, cacheKey: STORAGE_KEYS.legacyLeaderboard },
}

// Only public fields leave this function: rank, nickname, country, games and score, plus
// the entry id, used to highlight the player's own row (see entryId.js).
export async function getLeaderboard(board = 'ranked') {
  const { collection: name, cacheKey } = BOARDS[board]
  const cached = readCachedRows(cacheKey)
  if (cached) return cached

  const snap = await getDocs(
    query(collection(db, name), orderBy('totalScore', 'desc'), limit(LEADERBOARD_SIZE)),
  )
  const rows = snap.docs.map((item, index) => {
    const { nickname, countryCode, totalScore, gamesPlayed } = item.data()
    return { rank: index + 1, id: item.id, nickname, countryCode, totalScore, gamesPlayed }
  })
  writeCachedRows(cacheKey, rows)
  return rows
}
