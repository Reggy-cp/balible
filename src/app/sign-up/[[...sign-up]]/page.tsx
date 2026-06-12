'use client'

import Link from 'next/link'

export default function SignUpChoosePage() {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F5F1EB',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: 'var(--font-inter)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', letterSpacing: '0.02em', margin: 0 }}>BALIBLE</p>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#6F675C', textTransform: 'uppercase', margin: '4px 0 0' }}>CURATED EXPERIENCES IN BALI</p>
        </Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, fontWeight: 700, color: '#111111', margin: '0 0 10px' }}>
          Join Balible
        </h1>
        <p style={{ fontSize: 15, color: '#6F675C', margin: 0 }}>
          How would you like to use Balible?
        </p>
      </div>

      {/* Two cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%', maxWidth: 560 }}>

        {/* Traveler */}
        <Link href="/sign-up/traveler" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'white', borderRadius: 20, padding: '36px 28px',
            border: '2px solid #E8E4DE', cursor: 'pointer', transition: 'all 0.18s',
            display: 'flex', flexDirection: 'column', gap: 16, height: '100%',
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.border = '2px solid #111111'
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 32px rgba(17,17,17,0.12)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.border = '2px solid #E8E4DE'
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: 40 }}>🌿</span>
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', margin: '0 0 8px' }}>
                Traveler
              </p>
              <p style={{ fontSize: 13, color: '#6F675C', margin: 0, lineHeight: 1.6 }}>
                Discover and book curated experiences across Bali — surfing, cooking classes, rice field walks, and more.
              </p>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              <div style={{
                display: 'inline-block', backgroundColor: '#111111', color: 'white',
                padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              }}>
                Sign up as Traveler
              </div>
            </div>
          </div>
        </Link>

        {/* Host */}
        <Link href="/sign-up/host" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'white', borderRadius: 20, padding: '36px 28px',
            border: '2px solid #E8E4DE', cursor: 'pointer', transition: 'all 0.18s',
            display: 'flex', flexDirection: 'column', gap: 16, height: '100%',
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.border = '2px solid #C8A97E'
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 32px rgba(200,169,126,0.2)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.border = '2px solid #E8E4DE'
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: 40 }}>🏡</span>
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', margin: '0 0 8px' }}>
                Host
              </p>
              <p style={{ fontSize: 13, color: '#6F675C', margin: 0, lineHeight: 1.6 }}>
                Share your passion and expertise. List experiences, manage bookings, and welcome guests.
              </p>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              <div style={{
                display: 'inline-block', backgroundColor: '#C8A97E', color: 'white',
                padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              }}>
                Sign up as Host
              </div>
            </div>
          </div>
        </Link>
      </div>

      <p style={{ fontSize: 13, color: '#9E9A94', marginTop: 32, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/sign-in" style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  )
}
