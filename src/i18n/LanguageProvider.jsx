import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getInitialLanguage, languages, saveLanguage, translations } from './index'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((next) => {
    if (!languages[next]) return
    setLanguageState(next)
    saveLanguage(next)
  }, [])

  const value = useMemo(() => {
    const t = translations[language]
    const formatYear = (year) => (year < 0 ? `${Math.abs(year)} ${t.bc}` : String(year))
    return { language, setLanguage, t, formatYear }
  }, [language, setLanguage])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useI18n must be used inside LanguageProvider')
  return context
}
