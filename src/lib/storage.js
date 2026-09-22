export function readString(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

export function writeString(key, value) {
  try { localStorage.setItem(key, value) } catch {}
}

export function removeItem(key) {
  try { localStorage.removeItem(key) } catch {}
}

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export const writeJSON = (key, value) => writeString(key, JSON.stringify(value))
