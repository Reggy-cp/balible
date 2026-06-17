'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import {
  Menu, X, ChevronDown, LayoutDashboard, User,
  Leaf, Scissors, Landmark, Mountain, Waves, ChefHat, Sun, Users, Bike,
} from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'
import { useLanguage } from '@/contexts/LanguageContext'
import { LOCALES, type TranslationKey } from '@/lib/i18n'

type CategoryDef = { labelKey: TranslationKey; Icon: React.ElementType; slug: string }
const CATEGORIES: CategoryDef[] = [
  { labelKey: 'cat_wellness',  Icon: Leaf,      slug: 'wellness' },
  { labelKey: 'cat_art',       Icon: Scissors,  slug: 'art-craft' },
  { labelKey: 'cat_culture',   Icon: Landmark,  slug: 'culture' },
  { labelKey: 'cat_culinary',  Icon: ChefHat,   slug: 'culinary' },
  { labelKey: 'cat_spiritual', Icon: Sun,       slug: 'spiritual' },
  { labelKey: 'cat_nature',    Icon: Mountain,  slug: 'nature' },
  { labelKey: 'cat_water',     Icon: Waves,     slug: 'water-activities' },
  { labelKey: 'cat_experts',   Icon: Users,     slug: 'local-experts' },
  { labelKey: 'cat_rentals',   Icon: Bike,      slug: 'rentals' },
]

type NavLink = { labelKey: TranslationKey; href: string; hasDropdown: boolean }
const NAV_LINKS: NavLink[] = [
  { labelKey: 'nav_experiences',  href: '/search',       hasDropdown: true },
  { labelKey: 'nav_destinations', href: '/destinations', hasDropdown: false },
  { labelKey: 'nav_events',       href: '/events',       hasDropdown: false },
]

type MobileLink = { labelKey: TranslationKey; href: string }
const MOBILE_LINKS: MobileLink[] = [
  { labelKey: 'nav_experiences',  href: '/search' },
  { labelKey: 'nav_destinations', href: '/destinations' },
  { labelKey: 'nav_events',       href: '/events' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const { data: session, status } = useSession()
  const isLoaded = status !== 'loading'
  const isSignedIn = status === 'authenticated'
  const user = session?.user
  const isHost = user?.role === 'OPERATOR' || user?.role === 'ADMIN'
  const dashboardHref = user?.role === 'ADMIN' ? '/admin' : '/dashboard'
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const { locale, setLocale, t } = useLanguage()
  const currentLocale = LOCALES.find(l => l.code === locale)!

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white" style={{ height: 64, borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between px-5 lg:px-12 max-w-[1440px] mx-auto" style={{ height: 64 }}>

          {/* Logo */}
          <a href="/" className="flex-shrink-0 flex items-center" style={{ textDecoration: 'none', height: '100%' }}>
            <Image src="/logo-dark.png" alt="Balible" width={120} height={36} style={{ objectFit: 'contain', height: 36, width: 'auto', display: 'block' }} priority />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ labelKey, href, hasDropdown }) =>
              hasDropdown ? (
                <div key={labelKey} className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen(o => !o)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg transition-colors hover:bg-stone-50"
                    style={{
                      fontFamily: 'var(--font-inter)', fontSize: 14,
                      color: isActive(href) ? '#C8A97E' : '#111111',
                      fontWeight: isActive(href) ? 600 : 400,
                      background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    {t(labelKey)}
                    <ChevronDown
                      size={13}
                      style={{ color: '#6F675C', transition: 'transform 0.15s', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  {dropOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl"
                      style={{ width: 280, border: '1px solid #E8E4DE', padding: '12px 8px' }}
                    >
                      <a
                        href="/search"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors"
                        style={{ textDecoration: 'none', marginBottom: 4 }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5F1EB' }}>
                          <span style={{ fontSize: 14 }}>🌟</span>
                        </div>
                        <div>
                          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{t('nav_all_experiences')}</p>
                          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>Browse all 16+ experiences</p>
                        </div>
                      </a>
                      <div style={{ height: 1, backgroundColor: '#F5F1EB', marginBottom: 8, marginInline: 8 }} />
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 10, fontWeight: 700, color: '#6F675C', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px 8px' }}>
                        {t('nav_browse_category')}
                      </p>
                      {CATEGORIES.map(({ labelKey: catKey, Icon, slug }) => (
                        <a
                          key={slug}
                          href={`/categories/${slug}`}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                          style={{ textDecoration: 'none' }}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F1EB' }}>
                            <Icon size={13} style={{ color: '#C8A97E' }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>{t(catKey)}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={labelKey}
                  href={href}
                  className="px-3 py-2 rounded-lg transition-colors hover:bg-stone-50"
                  style={{
                    fontFamily: 'var(--font-inter)', fontSize: 14, textDecoration: 'none',
                    color: isActive(href) ? '#C8A97E' : '#111111',
                    fontWeight: isActive(href) ? 600 : 400,
                  }}
                >
                  {t(labelKey)}
                </a>
              )
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isLoaded && isSignedIn && <NotificationBell />}

            {/* Language dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                style={{ border: '1px solid #E8E4DE', background: 'white', cursor: 'pointer' }}
                aria-label="Select language"
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>{currentLocale.flag}</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#111111' }}>
                  {currentLocale.code.toUpperCase()}
                </span>
                <ChevronDown size={11} style={{ color: '#6F675C', transition: 'transform 0.15s', transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg py-1" style={{ minWidth: 140, border: '1px solid #E8E4DE', zIndex: 200 }}>
                  {LOCALES.map(loc => (
                    <button
                      key={loc.code}
                      onClick={() => { setLocale(loc.code); setLangOpen(false) }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 transition-colors"
                      style={{
                        fontFamily: 'var(--font-inter)', fontSize: 13, border: 'none', cursor: 'pointer', textAlign: 'left',
                        background: locale === loc.code ? '#F5F1EB' : 'transparent',
                        color: '#111111', fontWeight: locale === loc.code ? 600 : 400,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{loc.flag}</span>
                      {loc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!isLoaded ? (
              <div className="hidden sm:flex items-center gap-2">
                <div style={{ width: 64, height: 34, borderRadius: 10, backgroundColor: '#F5F1EB' }} />
                <div style={{ width: 76, height: 34, borderRadius: 10, backgroundColor: '#E8E4DE' }} />
              </div>
            ) : isSignedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                {isHost && (
                  <a
                    href={dashboardHref}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-stone-50"
                    style={{
                      fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 500,
                      color: isActive(dashboardHref) ? '#C8A97E' : '#6F675C', textDecoration: 'none',
                    }}
                  >
                    <LayoutDashboard size={14} />
                    {t('nav_dashboard')}
                  </a>
                )}
                {/* Avatar dropdown */}
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen(o => !o)}
                    className="flex items-center justify-center rounded-full overflow-hidden"
                    style={{ width: 36, height: 36, border: '2px solid #E8E4DE', cursor: 'pointer', background: 'none', padding: 0 }}
                  >
                    <img src={user?.image ?? '/avatar-default.png'} alt={user?.name ?? 'Account'} className="w-full h-full object-cover" />
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg py-1" style={{ minWidth: 180, border: '1px solid #E8E4DE', zIndex: 200 }}>
                      <a href={isHost ? dashboardHref : '/profile'} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', textDecoration: 'none' }}>
                        {isHost
                          ? <><LayoutDashboard size={14} style={{ color: '#6F675C' }} /> {t('nav_dashboard')}</>
                          : <><User size={14} style={{ color: '#6F675C' }} /> {t('nav_profile')}</>
                        }
                      </a>
                      <div style={{ borderTop: '1px solid #F5F1EB', margin: '4px 0' }} />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 transition-colors"
                        style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#B66A45', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        {t('nav_sign_out')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="/sign-in"
                  className="px-4 py-2 rounded-lg transition-colors hover:bg-stone-50"
                  style={{
                    fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 500,
                    color: '#111111', textDecoration: 'none', border: '1px solid #E8E4DE',
                  }}
                >
                  {t('nav_sign_in')}
                </a>
                <a
                  href={pathname === '/for-hosts' ? '/sign-up/host' : '/sign-up'}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600,
                    color: 'white', textDecoration: 'none', backgroundColor: '#111111',
                  }}
                >
                  {t('nav_sign_up')}
                </a>
              </div>
            )}

            {/* Hamburger */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-stone-50 transition-colors"
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} style={{ color: '#111111' }} /> : <Menu size={22} style={{ color: '#111111' }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="lg:hidden absolute left-0 right-0 bg-white shadow-xl overflow-y-auto"
            style={{ top: 64, borderBottom: '1px solid #E8E4DE', zIndex: 100, maxHeight: 'calc(100vh - 128px)' }}
          >
            <div className="px-4 pt-3 pb-2 space-y-1">
              {MOBILE_LINKS.map(({ labelKey, href }) => (
                <a
                  key={labelKey}
                  href={href}
                  className="flex items-center px-4 py-3 rounded-xl transition-colors hover:bg-stone-50"
                  style={{
                    fontFamily: 'var(--font-inter)', fontSize: 15, textDecoration: 'none',
                    color: isActive(href) ? '#C8A97E' : '#111111',
                    fontWeight: isActive(href) ? 600 : 400,
                  }}
                >
                  {t(labelKey)}
                  {isActive(href) && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#C8A97E' }} />}
                </a>
              ))}
            </div>

            {/* Mobile auth section */}
            <div className="px-4 pb-5 pt-3" style={{ borderTop: '1px solid #F5F1EB' }}>
              {isLoaded && isSignedIn ? (
                <div className="space-y-1">
                  <a href={isHost ? dashboardHref : '/profile'} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', textDecoration: 'none' }}>
                    <img src={user?.image ?? '/avatar-default.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                    {user?.name ?? (isHost ? t('nav_dashboard') : t('nav_profile'))}
                  </a>
                  <a href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', textDecoration: 'none' }}>
                    <span style={{ fontSize: 16 }}>🤍</span> {t('nav_wishlist')}
                  </a>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#B66A45', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    {t('nav_sign_out')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <a href="/sign-in" style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E4DE', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#111111', textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
                    {t('nav_sign_in')}
                  </a>
                  <a href={pathname === '/for-hosts' ? '/sign-up/host' : '/sign-up'} style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
                    {t('nav_sign_up')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
