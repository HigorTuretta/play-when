import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
} from 'firebase/firestore'
import { app, useEmulators } from './app'

let db
try {
  db = initializeFirestore(app, { localCache: persistentLocalCache({}) })
} catch {
  db = getFirestore(app)
}

if (useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080)

export { db }
