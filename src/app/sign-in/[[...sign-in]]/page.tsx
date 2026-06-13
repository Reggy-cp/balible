import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F5F1EB',
      display: 'flex', fontFamily: 'var(--font-inter)',
    }}>

      {/* ── Left brand panel (desktop only) ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: 420, flexShrink: 0, backgroundColor: '#111111',
          flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px 40px',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: 'white', letterSpacing: '0.04em', margin: 0 }}>BALIBLE</p>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', margin: '6px 0 0' }}>CURATED EXPERIENCES IN BALI</p>
        </Link>

        <div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 34, fontWeight: 700, color: 'white', lineHeight: 1.25, margin: '0 0 16px' }}>
            Your next Bali adventure awaits.
          </p>
          <p style={{ fontSize: 14, color: '#9E9A94', lineHeight: 1.7, margin: 0 }}>
            Sign in to manage bookings, save wishlists, and access your personalised experience feed.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#C8A97E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16 }}>🌿</span>
          </div>
          <p style={{ fontSize: 12, color: '#6F675C', margin: 0, lineHeight: 1.5 }}>
            Over 80+ curated experiences <br />across 13 areas in Bali
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
      }}>

        {/* Mobile logo */}
        <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', letterSpacing: '0.02em', margin: 0 }}>BALIBLE</p>
            <p style={{ fontSize: 10, letterSpacing: '0.18em', color: '#6F675C', textTransform: 'uppercase', margin: '4px 0 0' }}>CURATED EXPERIENCES IN BALI</p>
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#111111', margin: '0 0 8px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: '#6F675C', margin: 0 }}>
              Sign in to your Balible account
            </p>
          </div>

          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/"
            appearance={{
              variables: {
                colorPrimary: '#111111',
                colorBackground: '#FFFFFF',
                colorText: '#111111',
                colorTextSecondary: '#6F675C',
                borderRadius: '12px',
                fontFamily: 'var(--font-inter)',
              },
              elements: {
                rootBox: { width: '100%' },
                card: {
                  width: '100%',
                  boxShadow: '0 2px 16px rgba(17,17,17,0.07)',
                  border: '1px solid #E8E4DE',
                  borderRadius: 16,
                },
                headerTitle: { fontFamily: 'var(--font-playfair)', fontWeight: 600 },
                headerSubtitle: { display: 'none' },
                formButtonPrimary: {
                  backgroundColor: '#111111',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                },
                footerActionLink: { color: '#C8A97E', fontWeight: 600 },
              },
            }}
          />

          <p style={{ fontSize: 13, color: '#9E9A94', marginTop: 24, textAlign: 'center' }}>
            New to Balible?{' '}
            <Link href="/sign-up" style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }}>
              Create an account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
