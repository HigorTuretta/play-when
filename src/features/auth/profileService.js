import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { inferCountryCode } from '../../lib/country'

export const NICKNAME_MIN = 2
export const NICKNAME_MAX = 24

// Letters and digits in any script, plus _ . - and single inner spaces. Mirrors
// validNickname() in firestore.rules, which rejects anything else.
const NICKNAME_PATTERN = /^[\p{L}\p{N}_.-]+( [\p{L}\p{N}_.-]+)*$/u

export const normalizeNickname = (nickname) => nickname.normalize('NFC').trim().replace(/\s+/g, ' ')
export const isValidNickname = (nickname) => {
  const clean = normalizeNickname(nickname)
  return clean.length >= NICKNAME_MIN && clean.length <= NICKNAME_MAX && NICKNAME_PATTERN.test(clean)
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
