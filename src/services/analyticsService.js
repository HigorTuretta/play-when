import { logEvent } from 'firebase/analytics'
import { getAnalyticsInstance } from '../firebase/client'

let trackingEnabled = false

export function setTrackingEnabled(enabled) {
  trackingEnabled = Boolean(enabled)
}

export async function track(name, params = {}) {
  if (!trackingEnabled) return
  const analytics = await getAnalyticsInstance()
  if (!analytics) return
  try { logEvent(analytics, name, params) } catch {}
}
