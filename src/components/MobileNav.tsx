'use client'

import { usePathname } from 'next/navigation'
import { Home, Search, Map, Heart, User } from 'lucide-react'

const NAV = [
  { Icon: Home,   label: 'Home',    href: '/' },
  { Icon: Search, label: 'Explore', href: '/search' },
  { Icon: Map,    label: 'Map',     href: '/map' },
  { Icon: Heart,  label: 'Wishlist',href: '/wishlist' },
  { Icon: User,   label: 'Profile', href: '/profile' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white z-50 md:hidden flex items-center"
      style={{ height: 64, borderTop: '1px solid #E8E4DE', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV.map(({ Icon, label, href }) => {
        const active = isActive(href)
        return (
          <a
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            style={{ textDecoration: 'none' }}
          >
            <Icon
              size={20}
              color={active ? '#C8A97E' : '#6F675C'}
              fill={active && href === '/wishlist' ? '#C8A97E' : 'none'}
            />
            <span style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 10,
              color: active ? '#C8A97E' : '#6F675C',
              fontWeight: active ? 600 : 400,
            }}>
              {label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
