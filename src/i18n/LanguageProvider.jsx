import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { useRouter } from '../app/router'
import { alternatePath } from '../seo/alternates'
import { languages, saveLanguage, translations } from './index'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const { route, navigate } = useRouter()
  const language = route.language

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // Switching language opens the same page in the other language.
  const setLanguage = useCallback(
    (next) => {
      if (!languages[next] || next === language) return
      saveLanguage(next)
      navigate(alternatePath(route, next), { replace: false })
    },
    [language, route, navigate],
  )

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
