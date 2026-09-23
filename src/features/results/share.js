import { absoluteUrl } from '../../config/site'
import { homePath, pathFor } from '../../config/routes'
import { translations } from '../../i18n'
import { GAME_MODES, ROUND_SIZE, TOTAL_ROUNDS } from '../game/constants'

// One row per round, one square per card. The squares only say whether each card was in
// the right place, never which card or which year.
export const shareRowsFrom = (results) =>
  results.map((round) => round.ordered.map((card, index) => round.correct[index] === card.id))

const HIT = '🟩'
const MISS = '🟥'
const TIMEOUT = '⏱️'

// Where a shared result leads. A normal game links to a challenge with the same cards
// (/desafio/<code>, see challengeCode.js); a ranked game, whose rounds can never be
// replayed, links to the home page. Any future challenge type only needs a new branch here.
export function shareUrlFor({ mode, challenge, language }) {
  if (mode === GAME_MODES.normal && challenge) {
    return absoluteUrl(pathFor('challenge', language, { slug: challenge }))
  }
  return absoluteUrl(homePath(language))
}

export function shareTextFrom({ results, score, mode, challenge, language }) {
  const t = translations[language].share
  const hits = results.reduce((total, round) => total + round.hits, 0)
  const grid = shareRowsFrom(results)
    .map((row, index) => {
      const squares = row.map((hit) => (hit ? HIT : MISS)).join('')
      return results[index].timedOut ? `${squares} ${TIMEOUT}` : squares
    })
    .join('\n')
  const invite = mode === GAME_MODES.normal && challenge ? t.challengeNormal : t.challengeRanked

  return [
    `When? 🕰️ ${t.modeLine[mode]}`,
    `${t.points(score)} · ${t.hits(hits, TOTAL_ROUNDS * ROUND_SIZE)}`,
    grid,
    '',
    invite,
    shareUrlFor({ mode, challenge, language }),
  ].join('\n')
}

function copyWithTextarea(text) {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {}
  document.body.removeChild(area)
  return copied
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return copyWithTextarea(text)
  }
}

export const canUseWebShare = () =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function'
