export const NICKNAME_MIN = 2
export const NICKNAME_MAX = 24

// Letters and digits in any script, plus _ . - and single inner spaces. Mirrors
// validNickname() in firestore.rules, which rejects anything else.
const NICKNAME_PATTERN = /^[\p{L}\p{N}_.-]+( [\p{L}\p{N}_.-]+)*$/u

export const normalizeNickname = (nickname) => nickname.normalize('NFC').trim().replace(/\s+/g, ' ')

export const isValidNickname = (nickname) => {
  const clean = normalizeNickname(nickname)
  return (
    clean.length >= NICKNAME_MIN && clean.length <= NICKNAME_MAX && NICKNAME_PATTERN.test(clean)
  )
}
