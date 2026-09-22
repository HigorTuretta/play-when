export const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/HigorTuretta/play-when'

export const STORAGE_KEYS = {
  session: 'when-firebase-session-v1',
  onboarding: 'when-onboarding-seen-v1',
  language: 'when-language-v1',
  imageCache: 'when-event-image-cache-v2',
}

export const ROUTES = {
  home: '/',
  leaderboard: '/leaderboard',
  privacy: '/privacy',
  terms: '/terms',
}
