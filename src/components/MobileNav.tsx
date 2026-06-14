'use client'

import React from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Search, User } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { TranslationKey } from '@/lib/i18n'

const NAV: { Icon?: React.ElementType; favicon?: boolean; labelKey: TranslationKey; href: string | null }[] = [
  { Icon: Home,    labelKey: 'mob_home',     href: '/' },
  { Icon: Search,  labelKey: 'mob_explore',  href: '/search' },
  { favicon: true, labelKey: 'mob_ai_guide', href: null },
  { Icon: User,    labelKey: 'mob_profile',  href: '/profile' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const isActive = (href: string | null) => href && (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
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
    </nav>
  )
}
