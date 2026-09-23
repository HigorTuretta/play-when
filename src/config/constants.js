export const STORAGE_KEYS = {
  // v3: sessions now carry the game mode and the ranked round timer.
  session: 'when-session-v3',
  onboarding: 'when-onboarding-seen-v1',
  language: 'when-language-v1',
  leaderboard: 'when-ranked-leaderboard-v1',
  legacyLeaderboard: 'when-legacy-leaderboard-v1',
  factHistory: 'when-fact-history-v1',
}

// Keys written by earlier versions; removed on startup.
export const LEGACY_STORAGE_KEYS = [
  'when-firebase-session-v1',
  'when-firebase-session-v2',
  'when-event-image-cache-v2',
  'when-leaderboard-v1',
]
