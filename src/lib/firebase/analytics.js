import { getAnalytics, isSupported, logEvent } from 'firebase/analytics'
import { app, measurementId } from './app'

let analytics = null

async function instance() {
  if (!measurementId) return null
  if (!analytics) {
    analytics = isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null)
  }
  return analytics
}

export async function logAnalyticsEvent(name, params) {
  const target = await instance()
  if (!target) return
  try {
    logEvent(target, name, params)
  } catch {}
}
