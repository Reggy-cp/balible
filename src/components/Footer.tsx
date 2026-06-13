import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Experiences',    href: '/search' },
  { label: 'Destinations',   href: '/destinations' },
  { label: 'Meet Our Hosts', href: '/hosts' },
  { label: 'For Hosts',      href: '/for-hosts' },
  { label: 'Journal',        href: '/blog' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms',          href: '/terms' },
]

export default function Footer() {
  return (
    <footer className="pt-10 px-6 pb-36 md:pb-8" style={{ backgroundColor: '#111111' }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <a href="/" style={{ textDecoration: 'none' }}>
            <Image src="/logo-dark.png" alt="Balible" width={100} height={30} style={{ objectFit: 'contain', height: 30, width: 'auto' }} />
          </a>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>© 2026 Balible. All rights reserved.</p>
          <div className="flex gap-5">
            {LEGAL_LINKS.map(({ label, href }) => (
              <a key={label} href={href} style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
