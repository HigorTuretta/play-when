// Google Analytics (through Firebase) only runs for signed-in players: the privacy policy
// promises that visitors who never sign in are not tracked, so their events (including
// login_started) are dropped, not queued. VITE_ANALYTICS_FOR_GUESTS=true lifts that, but
// only do it after updating the privacy policy. Parameters must never carry personal data
// (no uid, e-mail or nickname): only the mode, scores and similar game facts.
const GUEST_ANALYTICS = import.meta.env.VITE_ANALYTICS_FOR_GUESTS === 'true'
let signedIn = false

export function setTrackingEnabled(enabled) {
  signedIn = Boolean(enabled)
}

export function track(name, params = {}) {
  if (!(signedIn || GUEST_ANALYTICS) || typeof window === 'undefined') return
  import('./firebase/analytics')
    .then(({ logAnalyticsEvent }) => logAnalyticsEvent(name, params))
    .catch(() => {})
}

// The analytics vocabulary, in one place so event names stay consistent.
export const EVENTS = {
  gameStarted: 'game_started',
  gameCompleted: 'game_completed',
  normalGameStarted: 'normal_game_started',
  rankedGameStarted: 'ranked_game_started',
  rankedGameCompleted: 'ranked_game_completed',
  resultShared: 'result_shared',
  resultCopied: 'result_copied',
  loginStarted: 'login_started',
  loginCompleted: 'login_completed',
  challengeShared: 'challenge_shared',
  challengeStarted: 'challenge_started',
  pageView: 'page_view',
}
