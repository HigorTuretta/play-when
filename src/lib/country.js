export function inferCountryCode() {
  const locales = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const locale of locales) {
    try {
      const region = new Intl.Locale(locale).region
      if (region && /^[A-Z]{2}$/.test(region)) return region
    } catch {}
  }
  return 'UN'
}

export function countryFlag(code = 'UN') {
  if (!/^[A-Z]{2}$/.test(code) || code === 'UN') return '🌐'
  return String.fromCodePoint(...code.split('').map((char) => 127397 + char.charCodeAt()))
}
