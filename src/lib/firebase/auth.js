import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth'
import { app, useEmulators } from './app'

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// `npm run dev:emulators` (with `npm run emulators` running) points the app at the local
// Auth emulator instead of production.
if (useEmulators) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
