import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { inferCountryCode } from '../../lib/country'

export const NICKNAME_MIN = 2
export const NICKNAME_MAX = 24

export const normalizeNickname = (nickname) => nickname.trim().replace(/\s+/g, ' ')
export const isValidNickname = (nickname) => {
  const { length } = normalizeNickname(nickname)
  return length >= NICKNAME_MIN && length <= NICKNAME_MAX
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'profiles', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createProfile(user, nickname) {
  if (!isValidNickname(nickname)) throw new Error('invalid-nickname')

  const clean = normalizeNickname(nickname)
  const countryCode = inferCountryCode()
  const batch = writeBatch(db)

  batch.set(doc(db, 'profiles', user.uid), {
    nickname: clean,
    countryCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(doc(db, 'leaderboard', user.uid), {
    nickname: clean,
    countryCode,
    totalScore: 0,
    gamesPlayed: 0,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
  return { nickname: clean, countryCode }
}
