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

const CATEGORIES = [
  { label: 'Wellness & Healing', Icon: Leaf,      slug: 'wellness' },
  { label: 'Art & Craft',       Icon: Scissors,  slug: 'art-craft' },
  { label: 'Culture',           Icon: Landmark,  slug: 'culture' },
  { label: 'Culinary',          Icon: ChefHat,   slug: 'culinary' },
  { label: 'Spiritual',         Icon: Sun,       slug: 'spiritual' },
  { label: 'Nature & Outdoors', Icon: Mountain,  slug: 'nature' },
  { label: 'Water Activities',  Icon: Waves,     slug: 'water-activities' },
  { label: 'Local Experts',     Icon: Users,     slug: 'local-experts' },
  { label: 'Rentals',           Icon: Bike,      slug: 'rentals' },
]

const NAV_LINKS = [
  { label: 'Experiences',  href: '/search',       hasDropdown: true },
  { label: 'Destinations',  href: '/destinations',   hasDropdown: false },
  { label: 'Events',        href: '/events',         hasDropdown: false },
  { label: 'For Hosts',     href: '/for-hosts',      hasDropdown: false },
]

const MOBILE_LINKS = [
  { label: 'Experiences',   href: '/search' },
  { label: 'Destinations',  href: '/destinations' },
  { label: 'Events',        href: '/events' },
  { label: 'For Hosts',     href: '/for-hosts' },
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
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
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
        <div className="flex items-center justify-between h-full px-5 lg:px-12 max-w-[1440px] mx-auto">

          {/* Logo */}
          <a href="/" className="flex-shrink-0" style={{ textDecoration: 'none' }}>
            <Image src="/logo-light.png" alt="Balible" width={120} height={36} style={{ objectFit: 'contain', height: 36, width: 'auto' }} priority />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href, hasDropdown }) =>
              hasDropdown ? (
                <div key={label} className="relative" ref={dropRef}>
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
                    {label}
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
                          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>All Experiences</p>
                          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>Browse all 16+ experiences</p>
                        </div>
                      </a>
                      <div style={{ height: 1, backgroundColor: '#F5F1EB', marginBottom: 8, marginInline: 8 }} />
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 10, fontWeight: 700, color: '#6F675C', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px 8px' }}>
                        Browse by category
                      </p>
                      {CATEGORIES.map(({ label: catLabel, Icon, slug }) => (
                        <a
                          key={slug}
                          href={`/categories/${slug}`}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                          style={{ textDecoration: 'none' }}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F1EB' }}>
                            <Icon size={13} style={{ color: '#C8A97E' }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>{catLabel}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={label}
                  href={href}
                  className="px-3 py-2 rounded-lg transition-colors hover:bg-stone-50"
                  style={{
                    fontFamily: 'var(--font-inter)', fontSize: 14, textDecoration: 'none',
                    color: isActive(href) ? '#C8A97E' : '#111111',
                    fontWeight: isActive(href) ? 600 : 400,
                  }}
                >
                  {label}
                </a>
              )
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isLoaded && isSignedIn && <NotificationBell />}
            {!isLoaded ? (
              <div className="hidden sm:flex items-center gap-2">
                <div style={{ width: 64, height: 34, borderRadius: 10, backgroundColor: '#F5F1EB' }} />
                <div style={{ width: 76, height: 34, borderRadius: 10, backgroundColor: '#E8E4DE' }} />
              </div>
            ) : isSignedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                {isHost && (
                  <a
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-stone-50"
                    style={{
                      fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 500,
                      color: isActive('/dashboard') ? '#C8A97E' : '#6F675C', textDecoration: 'none',
                    }}
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
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
                      <a href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', textDecoration: 'none' }}>
                        <User size={14} style={{ color: '#6F675C' }} /> Profile
                      </a>
                      {isHost && (
                        <a href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', textDecoration: 'none' }}>
                          <LayoutDashboard size={14} style={{ color: '#6F675C' }} /> Dashboard
                        </a>
                      )}
                      <div style={{ borderTop: '1px solid #F5F1EB', margin: '4px 0' }} />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 transition-colors"
                        style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#B66A45', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        Sign out
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
                  Sign in
                </a>
                <a
                  href="/sign-up"
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600,
                    color: 'white', textDecoration: 'none', backgroundColor: '#111111',
                  }}
                >
                  Sign up
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
              {MOBILE_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center px-4 py-3 rounded-xl transition-colors hover:bg-stone-50"
                  style={{
                    fontFamily: 'var(--font-inter)', fontSize: 15, textDecoration: 'none',
                    color: isActive(href) ? '#C8A97E' : '#111111',
                    fontWeight: isActive(href) ? 600 : 400,
                  }}
                >
                  {label}
                  {isActive(href) && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#C8A97E' }} />}
                </a>
              ))}
            </div>

            {/* Mobile auth section */}
            <div className="px-4 pb-5 pt-3" style={{ borderTop: '1px solid #F5F1EB' }}>
              {isLoaded && isSignedIn ? (
                <div className="space-y-1">
                  {isHost && (
                    <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', textDecoration: 'none', fontWeight: 500 }}>
                      <LayoutDashboard size={16} style={{ color: '#6F675C' }} /> Dashboard
                    </a>
                  )}
                  <a href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', textDecoration: 'none' }}>
                    <img src={user?.image ?? '/avatar-default.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                    {user?.name ?? 'My account'}
                  </a>
                  <a href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', textDecoration: 'none' }}>
                    <span style={{ fontSize: 16 }}>🤍</span> Wishlist
                  </a>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#B66A45', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <a href="/sign-in" style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E4DE', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#111111', textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
                    Sign in
                  </a>
                  <a href="/sign-up" style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
                    Sign up
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
