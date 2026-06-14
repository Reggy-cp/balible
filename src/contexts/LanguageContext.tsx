'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { type Locale, type TranslationKey, getT } from '@/lib/i18n'

type LanguageCtx = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageCtx>({
  locale: 'en',
  setLocale: () => {},
  t: getT('en'),
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const stored = localStorage.getItem('balible_locale') as Locale | null
    if (stored === 'en' || stored === 'id' || stored === 'ru') setLocaleState(stored)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('balible_locale', l)
    document.documentElement.lang = l
  }, [])

  const t = useCallback((key: TranslationKey) => getT(locale)(key), [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
