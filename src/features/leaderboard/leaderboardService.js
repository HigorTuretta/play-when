import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export const LEADERBOARD_SIZE = 10

export async function getLeaderboard() {
  const snap = await getDocs(query(collection(db, 'leaderboard'), orderBy('totalScore', 'desc'), limit(LEADERBOARD_SIZE)))
  return snap.docs.map((item, index) => ({ rank: index + 1, id: item.id, ...item.data() }))
}
