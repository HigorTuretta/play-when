import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'

// Firebase is never part of the initial bundle: these modules are only reached through
// dynamic imports (auth on startup, Firestore once a player signs in or opens the
// ranking), so a guest playing a normal game never downloads the Firestore SDK.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const measurementId = firebaseConfig.measurementId
export const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'

export const app = initializeApp(firebaseConfig)

// App Check attests that requests come from this app, which keeps scripts holding the
// public API key from running up reads and writes. It turns on when a reCAPTCHA Enterprise
// site key is configured; enforce it in the Firebase console once its metrics look right.
const appCheckSiteKey = import.meta.env.VITE_APPCHECK_SITE_KEY
if (appCheckSiteKey) {
  if (import.meta.env.DEV) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  })
}
