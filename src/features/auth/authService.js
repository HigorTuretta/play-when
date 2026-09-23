import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../../lib/firebase/auth'

export const observeAuth = (callback) => onAuthStateChanged(auth, callback)
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signOutUser = () => signOut(auth)
