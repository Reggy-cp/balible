import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/sign-in')

  const role = session.user.role
  if (role === 'OPERATOR' || role === 'ADMIN') redirect('/dashboard')
  if (role === 'TOURIST') redirect('/')

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F5F1EB',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: 'var(--font-inter)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Link href="/">
          <Image src="/logo-dark.png" alt="Balible" width={110} height={34} style={{ objectFit: 'contain' }} />
        </Link>
      </div>

      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#111111', margin: '0 0 12px', textAlign: 'center' }}>
        Welcome to Balible
      </h1>
      <p style={{ fontSize: 15, color: '#6F675C', margin: '0 0 48px', textAlign: 'center' }}>
        How are you joining us?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%', maxWidth: 520 }}>
        <Link href="/onboarding/traveler" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', borderRadius: 20, padding: '32px 24px', border: '2px solid #E8E4DE', textAlign: 'left', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 36 }}>🌿</span>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', margin: 0 }}>Traveler</p>
            <p style={{ fontSize: 13, color: '#6F675C', margin: 0, lineHeight: 1.6 }}>Discover and book curated experiences across Bali</p>
            <div style={{ marginTop: 'auto', backgroundColor: '#111111', color: 'white', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
              Continue as Traveler
            </div>
          </div>
        </Link>

        <Link href="/onboarding/host" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', borderRadius: 20, padding: '32px 24px', border: '2px solid #E8E4DE', textAlign: 'left', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 36 }}>🏡</span>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', margin: 0 }}>Host</p>
            <p style={{ fontSize: 13, color: '#6F675C', margin: 0, lineHeight: 1.6 }}>Share your expertise and welcome guests to your experience</p>
            <div style={{ marginTop: 'auto', backgroundColor: '#C8A97E', color: 'white', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
              Continue as Host
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
