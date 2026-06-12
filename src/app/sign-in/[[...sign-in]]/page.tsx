import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F1EB',
        fontFamily: 'var(--font-inter)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', letterSpacing: '0.02em', marginBottom: 4 }}>
            BALIBLE
          </p>
          <p style={{ fontSize: 12, letterSpacing: '0.18em', color: '#6F675C', textTransform: 'uppercase' }}>
            CURATED EXPERIENCES IN BALI
          </p>
        </div>
        <SignIn
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
              card: { boxShadow: '0 4px 24px rgba(17,17,17,0.08)', border: '1px solid #E8E4DE' },
              headerTitle: { fontFamily: 'var(--font-playfair)', fontWeight: 600 },
              formButtonPrimary: { backgroundColor: '#111111', color: '#FFFFFF', fontWeight: 600, '&:hover': { backgroundColor: '#C8A97E' } },
            },
          }}
        />
      </div>
    </div>
  )
}
