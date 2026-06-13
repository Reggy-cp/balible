import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function HostSignUpPage() {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F5F1EB',
      display: 'flex', fontFamily: 'var(--font-inter)',
    }}>

      {/* Left panel */}
      <div
        className="hidden lg:flex"
        style={{
          width: 380, flexShrink: 0, backgroundColor: '#4A3728',
          flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px 40px',
        }}
      >
        <Link href="/sign-up" style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '0.04em', margin: 0 }}>BALIBLE</p>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', margin: '6px 0 0' }}>CURATED EXPERIENCES IN BALI</p>
        </Link>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 36 }}>🏡</span>
            <span style={{ fontSize: 14, color: '#C8A97E', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Host</span>
          </div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1.3, margin: '0 0 14px' }}>
            Share your passion with the world.
          </p>
          <p style={{ fontSize: 13, color: '#BFB5A8', lineHeight: 1.7, margin: 0 }}>
            List your experiences, set your own schedule, and welcome guests from around the world to discover authentic Bali.
          </p>
        </div>

        <Link href="/sign-up" style={{ fontSize: 13, color: '#BFB5A8', textDecoration: 'none' }}>
          ← Choose a different account type
        </Link>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
      }}>

        {/* Mobile header */}
        <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/sign-up" style={{ textDecoration: 'none' }}>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', letterSpacing: '0.02em', margin: 0 }}>BALIBLE</p>
            <p style={{ fontSize: 10, letterSpacing: '0.18em', color: '#6F675C', textTransform: 'uppercase', margin: '4px 0 0' }}>CURATED EXPERIENCES IN BALI</p>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 18 }}>🏡</span>
            <span style={{ fontSize: 13, color: '#6F675C', fontWeight: 500 }}>Joining as a Host</span>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#111111', margin: '0 0 6px' }}>
              Create your host account
            </h1>
            <p style={{ fontSize: 14, color: '#6F675C', margin: 0 }}>
              Start sharing your Bali experiences with guests.
            </p>
          </div>

          <SignUp
            routing="path"
            path="/sign-up/host"
            signInUrl="/sign-in"
            forceRedirectUrl="/onboarding/host"
            appearance={{
              variables: {
                colorPrimary: '#C8A97E',
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
                formButtonPrimary: { backgroundColor: '#C8A97E', color: '#FFFFFF', fontWeight: 600, fontSize: '14px' },
                footerActionLink: { color: '#111111', fontWeight: 600 },
              },
            }}
          />

          <p style={{ fontSize: 13, color: '#9E9A94', marginTop: 20, textAlign: 'center' }}>
            Looking to book instead?{' '}
            <Link href="/sign-up/traveler" style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }}>
              Sign up as Traveler
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
