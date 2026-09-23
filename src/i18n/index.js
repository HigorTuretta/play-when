import { STORAGE_KEYS } from '../config/constants'
import { DEFAULT_LANGUAGE, LANGUAGES } from '../config/routes'
import { readString, writeString } from '../lib/storage'
import en from './locales/en'
import ptBR from './locales/pt-BR'

export { DEFAULT_LANGUAGE }

export const translations = { 'pt-BR': ptBR, en }

export const languages = {
  'pt-BR': { short: 'PT', label: 'Português', locale: 'pt_BR' },
  en: { short: 'EN', label: 'English', locale: 'en_US' },
}

export const isLanguage = (value) => LANGUAGES.includes(value)

// The language of a page comes from its URL. The saved choice only decides where a visitor
// who opens the Portuguese home page is sent the next time (see src/main.jsx).
export function savedLanguage() {
  const saved = readString(STORAGE_KEYS.language)
  return isLanguage(saved) ? saved : null
}

export const saveLanguage = (language) => writeString(STORAGE_KEYS.language, language)

// The card description follows the category, so a transport event can never be described
// as a film one. A round file may still carry its own text, which wins when it is there.
export function textForEvent(event, language) {
  const t = translations[language] || translations[DEFAULT_LANGUAGE]
  const english = language === 'en'
  return {
    title: english ? event.titleEn || event.titlePt || event.title : event.titlePt || event.title,
    category: t.categories[event.category] || event.category,
    short:
      (english ? event.shortEn : event.shortPt) ||
      t.categoryShort[event.category] ||
      t.fallbackShort,
  }
}

export const errorText = (t, code) => (code && t.errors[code]) || t.errors.generic
