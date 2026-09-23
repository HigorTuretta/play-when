import { STORAGE_KEYS } from '../config/constants'
import { readString, writeString } from '../lib/storage'
import ptBR from './locales/pt-BR'
import en from './locales/en'

export const translations = { 'pt-BR': ptBR, en }

export const languages = {
  'pt-BR': { short: 'PT', label: 'Português' },
  en: { short: 'EN', label: 'English' },
}

export const DEFAULT_LANGUAGE = 'pt-BR'

export function getInitialLanguage() {
  const saved = readString(STORAGE_KEYS.language)
  if (saved && languages[saved]) return saved
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en'
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
