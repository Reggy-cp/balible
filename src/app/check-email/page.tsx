'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function CheckEmailContent() {
  const params = useSearchParams()
  const email = params.get('email') ?? 'your inbox'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F1EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'var(--font-inter)' }}>
      <Link href="/">
        <Image src="/logo-dark.png" alt="Balible" width={120} height={36} style={{ objectFit: 'contain', marginBottom: 40 }} />
      </Link>

      <div style={{ width: '100%', maxWidth: 440, backgroundColor: 'white', borderRadius: 16, padding: '48px 40px', textAlign: 'center', border: '1px solid #E8E4DE' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#F0F9F4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
          ✉️
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', margin: '0 0 12px' }}>
          Check your email
        </h1>
        <p style={{ fontSize: 15, color: '#6F675C', lineHeight: 1.7, margin: '0 0 28px' }}>
          We sent a verification link to <strong style={{ color: '#111111' }}>{email}</strong>. Click the link to activate your account.
        </p>
        <p style={{ fontSize: 13, color: '#9E9A94', lineHeight: 1.6, margin: '0 0 28px' }}>
          Didn&apos;t receive it? Check your spam folder. The link expires in 24 hours.
        </p>
        <Link
          href="/"
          style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
        >
          Continue to Balible →
        </Link>
      </div>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  )
}
