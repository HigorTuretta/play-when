import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/client'

export function inferCountryCode() {
  const locales = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const locale of locales) {
    try {
      const region = new Intl.Locale(locale).region
      if (region && /^[A-Z]{2}$/.test(region)) return region
    } catch {}
  }
  return 'UN'
}

export function countryFlag(code = 'UN') {
  if (!/^[A-Z]{2}$/.test(code) || code === 'UN') return '🌐'
  return String.fromCodePoint(...code.split('').map((char) => 127397 + char.charCodeAt()))
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'profiles', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createProfile(user, nickname) {
  const clean = nickname.trim().replace(/\s+/g, ' ')
  if (clean.length < 2 || clean.length > 24) throw new Error('invalid-nickname')

  const countryCode = inferCountryCode()
  const profileRef = doc(db, 'profiles', user.uid)
  const leaderboardRef = doc(db, 'leaderboard', user.uid)
  const batch = writeBatch(db)

  batch.set(profileRef, {
    nickname: clean,
    countryCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(leaderboardRef, {
    nickname: clean,
    countryCode,
    totalScore: 0,
    gamesPlayed: 0,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
  return { nickname: clean, countryCode }
}

export async function getLeaderboard() {
  const q = query(collection(db, 'leaderboard'), orderBy('totalScore', 'desc'), limit(10))
  const snap = await getDocs(q)
  return snap.docs.map((item, index) => ({ rank: index + 1, id: item.id, ...item.data() }))
}
