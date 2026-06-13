'use client'

import Link from 'next/link'

const OPTIONS = [
  {
    href: '/sign-up/traveler',
    icon: '🌿',
    title: 'I\'m a Traveler',
    desc: 'Discover and book curated Bali experiences — surf lessons, cooking classes, spiritual rituals, and more.',
    cta: 'Continue as Traveler',
    ctaBg: '#111111',
    hoverBorder: '#111111',
    hoverShadow: 'rgba(17,17,17,0.12)',
  },
  {
    href: '/sign-up/host',
    icon: '🏡',
    title: 'I\'m a Host',
    desc: 'List your experiences, manage bookings, and connect with travellers from around the world.',
    cta: 'Continue as Host',
    ctaBg: '#C8A97E',
    hoverBorder: '#C8A97E',
    hoverShadow: 'rgba(200,169,126,0.2)',
  },
]

export default function SignUpChoosePage() {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F5F1EB',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px', fontFamily: 'var(--font-inter)',
    }}>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: 48 }}>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', letterSpacing: '0.02em', margin: 0 }}>BALIBLE</p>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#6F675C', textTransform: 'uppercase', margin: '6px 0 0' }}>CURATED EXPERIENCES IN BALI</p>
      </Link>

      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: 40, maxWidth: 440 }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 700, color: '#111111', margin: '0 0 12px' }}>
          Create your account
        </h1>
        <p style={{ fontSize: 15, color: '#6F675C', margin: 0, lineHeight: 1.6 }}>
          Tell us how you plan to use Balible so we can personalise your experience.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, width: '100%', maxWidth: 580 }}>
        {OPTIONS.map(opt => (
          <Link key={opt.href} href={opt.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: 'white', borderRadius: 20, padding: '36px 28px',
                border: '2px solid #E8E4DE', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 18, height: '100%',
                transition: 'border-color 0.18s, transform 0.18s, box-shadow 0.18s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = opt.hoverBorder
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = `0 10px 36px ${opt.hoverShadow}`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = '#E8E4DE'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: 44, lineHeight: 1 }}>{opt.icon}</span>
              <div>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', margin: '0 0 8px' }}>
                  {opt.title}
                </p>
                <p style={{ fontSize: 13, color: '#6F675C', margin: 0, lineHeight: 1.65 }}>
                  {opt.desc}
                </p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                <div style={{
                  display: 'inline-block', backgroundColor: opt.ctaBg, color: 'white',
                  padding: '11px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                }}>
                  {opt.cta}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p style={{ fontSize: 13, color: '#9E9A94', marginTop: 36, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/sign-in" style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }}>
          Sign in →
        </Link>
      </p>
    </div>
  )
}
