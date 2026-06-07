import { Search, Map, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Minimal nav */}
      <nav className="bg-white" style={{ height: 64, borderBottom: '1px solid #E8E4DE', flexShrink: 0 }}>
        <div className="flex items-center h-full px-6 max-w-[1440px] mx-auto">
          <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', textDecoration: 'none' }}>BALIBLE</a>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">

        {/* Decorative image */}
        <div className="relative mb-10" style={{ width: 220, height: 220 }}>
          <div className="w-full h-full rounded-full overflow-hidden" style={{ border: '4px solid white', boxShadow: '0 0 0 1px #E8E4DE' }}>
            <img
              src="https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&auto=format&fit=crop&q=80"
              alt="Bali temple"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Floating 404 badge */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full"
            style={{ backgroundColor: '#111111', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
          >
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#C8A97E' }}>404</span>
          </div>
        </div>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#111111', marginBottom: 12 }}>
          Lost in Bali
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: '#6F675C', maxWidth: 400, lineHeight: 1.7, marginBottom: 10 }}>
          The page you're looking for has wandered off into the rice terraces.
        </p>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginBottom: 40 }}>
          Don't worry — there's plenty of beauty elsewhere.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-14">
          <a
            href="/"
            className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ height: 48, padding: '0 28px', backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
          >
            <Home size={15} /> Back to Home
          </a>
          <a
            href="/search"
            className="flex items-center justify-center gap-2 hover:opacity-70 transition-opacity"
            style={{ height: 48, padding: '0 28px', border: '1px solid #E8E4DE', color: '#111111', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)', backgroundColor: 'white' }}
          >
            <Search size={15} /> Browse Experiences
          </a>
          <a
            href="/map"
            className="flex items-center justify-center gap-2 hover:opacity-70 transition-opacity"
            style={{ height: 48, padding: '0 28px', border: '1px solid #E8E4DE', color: '#111111', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)', backgroundColor: 'white' }}
          >
            <Map size={15} /> Open Map
          </a>
        </div>

        {/* Quick links */}
        <div className="w-full max-w-sm">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Popular pages</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Pottery Classes',    href: '/experiences/pottery-making-class' },
              { label: 'Sound Healing',      href: '/experiences/sound-healing-journey' },
              { label: 'Surf Lessons',       href: '/experiences/beginner-surf-lesson' },
              { label: 'Kecak Sunset',       href: '/experiences/uluwatu-kecak-sunset' },
              { label: 'Destinations',       href: '/destinations' },
              { label: 'Become a Host',      href: '/for-hosts' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-center py-2.5 rounded-xl hover:opacity-70 transition-opacity"
                style={{ backgroundColor: 'white', border: '1px solid #E8E4DE', fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', textDecoration: 'none' }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
