import { logEvent } from 'firebase/analytics'
import { analyticsPromise } from '../firebase/client'

export async function track(name, params = {}) {
  const analytics = await analyticsPromise
  if (!analytics) return
  try { logEvent(analytics, name, params) } catch {}
}
