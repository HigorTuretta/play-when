import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { inferCountryCode } from '../../lib/country'
import { db } from '../../lib/firebase/db'
import { RANKED_LEADERBOARD } from '../leaderboard/collections'
import { leaderboardEntryId } from '../leaderboard/entryId'
import { isValidNickname, normalizeNickname } from './nickname'

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'profiles', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// The ranked leaderboard entry is created with the profile, holding the same nickname and
// country; the rules check that both match.
export async function createProfile(user, nickname) {
  if (!isValidNickname(nickname)) throw new Error('invalid-nickname')

  const clean = normalizeNickname(nickname)
  const countryCode = inferCountryCode()
  const entryId = await leaderboardEntryId(user.uid)
  const batch = writeBatch(db)

  batch.set(doc(db, 'profiles', user.uid), {
    nickname: clean,
    countryCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(doc(db, RANKED_LEADERBOARD, entryId), {
    nickname: clean,
    countryCode,
    totalScore: 0,
    gamesPlayed: 0,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
  return { nickname: clean, countryCode }
}
