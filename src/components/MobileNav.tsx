'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Search, User, LayoutDashboard, Globe } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LOCALES, type TranslationKey } from '@/lib/i18n'

const BASE_NAV: { Icon?: React.ElementType; favicon?: boolean; labelKey: TranslationKey; href: string | null }[] = [
  { Icon: Home,    labelKey: 'mob_home',     href: '/' },
  { Icon: Search,  labelKey: 'mob_explore',  href: '/search' },
  { favicon: true, labelKey: 'mob_ai_guide', href: null },
]

export default function MobileNav() {
  const pathname = usePathname()
  const { locale, setLocale, t } = useLanguage()
  const { data: session } = useSession()
  const isHost = session?.user?.role === 'OPERATOR' || session?.user?.role === 'ADMIN'
  const [langOpen, setLangOpen] = useState(false)

  const lastItem = isHost
    ? { Icon: LayoutDashboard, favicon: false as const, labelKey: 'mob_dashboard' as TranslationKey, href: '/dashboard' }
    : { Icon: User,            favicon: false as const, labelKey: 'mob_profile'   as TranslationKey, href: '/profile' }

  const NAV = [...BASE_NAV, lastItem]

  const isActive = (href: string | null) => href && (href === '/' ? pathname === '/' : pathname.startsWith(href))
  const currentLocale = LOCALES.find(l => l.code === locale)!

  return (
    <>
      {/* Language sheet — slides up above the nav */}
      {langOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setLangOpen(false)}
          />
          <div
            className="fixed left-4 right-4 z-50 md:hidden rounded-2xl bg-white shadow-xl overflow-hidden"
            style={{ bottom: 72, border: '1px solid #E8E4DE' }}
          >
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#6F675C', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 16px 8px' }}>
              Language
            </p>
            {LOCALES.map(loc => (
              <button
                key={loc.code}
                onClick={() => { setLocale(loc.code); setLangOpen(false) }}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
                style={{
                  fontFamily: 'var(--font-inter)', fontSize: 14, border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: locale === loc.code ? '#F5F1EB' : 'transparent',
                  color: '#111111', fontWeight: locale === loc.code ? 600 : 400,
                  borderTop: '1px solid #F5F1EB',
                }}
              >
                <span style={{ fontSize: 20 }}>{loc.flag}</span>
                {loc.label}
                {locale === loc.code && <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', backgroundColor: '#C8A97E', flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 bg-white z-50 md:hidden flex items-center"
        style={{ height: 64, borderTop: '1px solid #E8E4DE', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV.map(({ Icon, favicon, labelKey, href }) => {
          const active = isActive(href)
          const handleClick = href === null
            ? () => window.dispatchEvent(new CustomEvent('balible:open-chat'))
            : undefined

          const content = (
            <>
              {favicon
                ? (
                  <div style={{ width: 30, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image src="/icon.png" alt={t('mob_ai_guide')} width={30} height={30} style={{ borderRadius: '50%', opacity: active ? 1 : 0.65 }} />
                  </div>
                )
                : Icon && <Icon size={20} color={active ? '#C8A97E' : '#6F675C'} />
              }
              <span style={{
                fontFamily: 'var(--font-inter)', fontSize: 10,
                color: active ? '#C8A97E' : '#6F675C',
                fontWeight: active ? 600 : 400,
              }}>
                {t(labelKey)}
              </span>
            </>
          )

          return href ? (
            <a
              key={labelKey}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
              style={{ textDecoration: 'none' }}
            >
              {content}
            </a>
          ) : (
            <button
              key={labelKey}
              onClick={handleClick}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {content}
            </button>
          )
        })}

        {/* Language button */}
        <button
          onClick={() => setLangOpen(o => !o)}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{currentLocale.flag}</span>
          <span style={{
            fontFamily: 'var(--font-inter)', fontSize: 10,
            color: langOpen ? '#C8A97E' : '#6F675C',
            fontWeight: langOpen ? 600 : 400,
          }}>
            {currentLocale.code.toUpperCase()}
          </span>
        </button>
      </nav>
    </>
  )
}
