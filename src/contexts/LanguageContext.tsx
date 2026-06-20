'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { type Locale, type TranslationKey, getT } from '@/lib/i18n'
import { getUserLocaleAction, updateUserLocaleAction } from '@/lib/actions'

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

function isValidLocale(v: string | null | undefined): v is Locale {
  return v === 'en' || v === 'id'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    if (session?.user) {
      // Signed in: load from DB, fall back to localStorage
      getUserLocaleAction().then(dbLocale => {
        if (isValidLocale(dbLocale)) {
          setLocaleState(dbLocale)
        } else {
          const stored = localStorage.getItem('balible_locale')
          if (isValidLocale(stored)) setLocaleState(stored)
        }
      })
    } else {
      // Anonymous: use localStorage only
      const stored = localStorage.getItem('balible_locale')
      if (isValidLocale(stored)) setLocaleState(stored)
    }
  }, [session?.user?.email])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('balible_locale', l)
    document.documentElement.lang = l
    if (session?.user) updateUserLocaleAction(l)
  }, [session?.user?.email])

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
