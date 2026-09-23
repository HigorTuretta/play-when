// Ranked leaderboard entries are stored under a SHA-256 of the player's uid, not the uid
// itself: the leaderboard is public, and this keeps account ids out of it. The rules
// compute the same hash (hashing.sha256) to check that players only write their own entry.
export async function leaderboardEntryId(uid) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uid))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
