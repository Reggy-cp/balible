'use client'

import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  const NAV_LINKS = [
    { labelKey: 'nav_experiences',  href: '/search' },
    { labelKey: 'nav_destinations', href: '/destinations' },
    { labelKey: 'nav_meet_hosts',   href: '/hosts' },
    { labelKey: 'nav_for_hosts',    href: '/for-hosts' },
    { labelKey: 'nav_journal',      href: '/blog' },
  ] as const

  const LEGAL_LINKS = [
    { labelKey: 'footer_privacy', href: '/privacy' },
    { labelKey: 'footer_terms',   href: '/terms' },
  ] as const

  return (
    <footer className="pt-10 px-6 pb-36 md:pb-8" style={{ backgroundColor: '#111111' }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <a href="/" style={{ textDecoration: 'none' }}>
            <Image src="/logo-light.png" alt="Balible" width={100} height={30} style={{ objectFit: 'contain', height: 30, width: 'auto' }} />
          </a>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map(({ labelKey, href }) => (
              <a key={labelKey} href={href} style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }} className="hover:text-white transition-colors">
                {t(labelKey)}
              </a>
            ))}
          </div>
        </div>
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{t('footer_copy')}</p>
          <div className="flex gap-5">
            {LEGAL_LINKS.map(({ labelKey, href }) => (
              <a key={labelKey} href={href} style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }} className="hover:text-white transition-colors">
                {t(labelKey)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
