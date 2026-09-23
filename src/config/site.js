// The public address of the site. Canonical links, Open Graph tags, the sitemap, robots.txt
// and shared results are all built from it, so moving to a new domain only means setting
// VITE_PUBLIC_SITE_URL (in .env locally, in the Netlify environment in production).
const DEFAULT_SITE_URL = 'https://playwhen.netlify.app'

export const SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(
  /\/+$/,
  '',
)
export const SITE_NAME = 'When?'
export const AUTHOR_NAME = 'Turetta'
export const GITHUB_URL =
  import.meta.env.VITE_GITHUB_URL || 'https://github.com/HigorTuretta/play-when'

// Social preview images, rendered by scripts/render-brand-images.mjs (1200×630).
export const SOCIAL_IMAGES = {
  'pt-BR': '/og/when-pt-BR.png',
  en: '/og/when-en.png',
}
export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 }

export const absoluteUrl = (path = '/') => `${SITE_URL}${path === '/' ? '/' : path}`
