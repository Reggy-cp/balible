const LINKS = [
  { label: 'Experiences',   href: '/search' },
  // Services feature hidden
  // { label: 'Services',      href: '/services' },
  { label: 'Destinations',  href: '/destinations' },
  { label: 'Meet Our Hosts',  href: '/hosts' },
  { label: 'For Hosts',       href: '/for-hosts' },
  // { label: 'For Providers',   href: '/for-providers' },
]

export default function Footer() {
  return (
    <footer className="pt-10 px-6 pb-20 md:pb-8" style={{ backgroundColor: '#111111' }}>
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: 'white', textDecoration: 'none' }}>BALIBLE</a>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>© 2026 Balible. All rights reserved.</p>
        <div className="flex gap-6">
          {LINKS.map(({ label, href }) => (
            <a key={label} href={href} style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}
