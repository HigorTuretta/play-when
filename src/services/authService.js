import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/client'

export const observeAuth = (callback) => onAuthStateChanged(auth, callback)
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signOutUser = () => signOut(auth)
