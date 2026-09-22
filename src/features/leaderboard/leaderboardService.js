import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { STORAGE_KEYS } from '../../config/constants'
import { db } from '../../lib/firebase'
import { readJSON, removeItem, writeJSON } from '../../lib/storage'

export const LEADERBOARD_SIZE = 10

// Every visit to the ranking costs LEADERBOARD_SIZE reads, so a copy is kept for a couple of
// minutes. Finishing a game drops it, so players see their own new score right away.
const CACHE_TTL_MS = 2 * 60 * 1000

export const invalidateLeaderboard = () => removeItem(STORAGE_KEYS.leaderboard)

export async function getLeaderboard() {
  const cached = readJSON(STORAGE_KEYS.leaderboard)
  if (Array.isArray(cached?.rows) && Date.now() - cached.at < CACHE_TTL_MS) return cached.rows

  const snap = await getDocs(query(collection(db, 'leaderboard'), orderBy('totalScore', 'desc'), limit(LEADERBOARD_SIZE)))
  const rows = snap.docs.map((item, index) => {
    const { nickname, countryCode, totalScore, gamesPlayed } = item.data()
    return { rank: index + 1, id: item.id, nickname, countryCode, totalScore, gamesPlayed }
  })
  writeJSON(STORAGE_KEYS.leaderboard, { at: Date.now(), rows })
  return rows
}
