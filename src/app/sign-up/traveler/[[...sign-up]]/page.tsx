import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function TravelerSignUpPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#F5F1EB', fontFamily: 'var(--font-inter)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ textAlign: 'center' }}>
          <Link href="/sign-up" style={{ textDecoration: 'none' }}>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', letterSpacing: '0.02em', marginBottom: 4 }}>BALIBLE</p>
            <p style={{ fontSize: 12, letterSpacing: '0.18em', color: '#6F675C', textTransform: 'uppercase', marginBottom: 0 }}>CURATED EXPERIENCES IN BALI</p>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 20 }}>🌿</span>
            <span style={{ fontSize: 14, color: '#6F675C', fontWeight: 500 }}>Joining as a Traveler</span>
          </div>
        </div>

        <SignUp
          routing="path"
          path="/sign-up/traveler"
          forceRedirectUrl="/onboarding/traveler"
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
              card: { boxShadow: '0 4px 24px rgba(17,17,17,0.08)', border: '1px solid #E8E4DE' },
              headerTitle: { fontFamily: 'var(--font-playfair)', fontWeight: 600 },
              formButtonPrimary: { backgroundColor: '#111111', color: '#FFFFFF', fontWeight: 600 },
            },
          }}
        />

        <p style={{ fontSize: 13, color: '#9E9A94', textAlign: 'center' }}>
          Want to host instead?{' '}
          <Link href="/sign-up/host" style={{ color: '#C8A97E', fontWeight: 600, textDecoration: 'none' }}>Sign up as Host</Link>
        </p>
      </div>
    </div>
  )
}
