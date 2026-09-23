import { GITHUB_URL } from '../../config/constants'

export const shareRowsFrom = (results) =>
  results.map((round) => round.ordered.map((card, index) => round.correct[index] === card.id))

export function shareTextFrom(results, score) {
  const rows = shareRowsFrom(results)
    .map((row) => row.map((hit) => (hit ? '🟩' : '🟥')).join(''))
    .join('\n')
  return `When? — ${score} pts\n${rows}\n${GITHUB_URL}`
}

function copyWithTextarea(text) {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  try {
    document.execCommand('copy')
  } catch {}
  document.body.removeChild(area)
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    copyWithTextarea(text)
  }
}
