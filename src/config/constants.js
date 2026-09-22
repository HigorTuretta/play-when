export const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/HigorTuretta/play-when'

export const STORAGE_KEYS = {
  // v2: sessions saved before the ranked/guest round pools were split cannot be resumed.
  session: 'when-firebase-session-v2',
  onboarding: 'when-onboarding-seen-v1',
  language: 'when-language-v1',
  leaderboard: 'when-leaderboard-v1',
}

// Keys written by earlier versions; removed on startup.
export const LEGACY_STORAGE_KEYS = ['when-firebase-session-v1', 'when-event-image-cache-v2']

export const ROUTES = {
  home: '/',
  leaderboard: '/leaderboard',
  privacy: '/privacy',
  terms: '/terms',
}
