'use client'

import { usePathname } from 'next/navigation'
import { Home, Search, Map, MessageCircle, User } from 'lucide-react'

const NAV = [
  { Icon: Home,          label: 'Home',    href: '/' },
  { Icon: Search,        label: 'Explore', href: '/search' },
  { Icon: Map,           label: 'Map',     href: '/map' },
  { Icon: MessageCircle, label: 'Chat',    href: null },
  { Icon: User,          label: 'Profile', href: '/profile' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const isActive = (href: string | null) => href && (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white z-50 md:hidden flex items-center"
      style={{ height: 64, borderTop: '1px solid #E8E4DE', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV.map(({ Icon, label, href }) => {
        const active = isActive(href)
        const handleClick = href === null
          ? () => window.dispatchEvent(new CustomEvent('balible:open-chat'))
          : undefined

        const content = (
          <>
            <Icon size={20} color={active ? '#C8A97E' : '#6F675C'} />
            <span style={{
              fontFamily: 'var(--font-inter)', fontSize: 10,
              color: active ? '#C8A97E' : '#6F675C',
              fontWeight: active ? 600 : 400,
            }}>
              {label}
            </span>
          </>
        )

        return href ? (
          <a
            key={label}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            style={{ textDecoration: 'none' }}
          >
            {content}
          </a>
        ) : (
          <button
            key={label}
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
