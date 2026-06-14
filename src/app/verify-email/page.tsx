'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const STATES = {
  success: {
    icon: '✅',
    iconBg: '#F0F9F4',
    title: 'Email verified!',
    body: "You're all set. Your Balible account is now fully activated.",
    cta: 'Explore experiences →',
    href: '/search',
  },
  expired: {
    icon: '⏰',
    iconBg: '#FEF9F0',
    title: 'Link expired',
    body: 'This verification link has expired. Sign in to request a new one.',
    cta: 'Go to sign in →',
    href: '/sign-in',
  },
  invalid: {
    icon: '❌',
    iconBg: '#FEF2F2',
    title: 'Invalid link',
    body: "This verification link doesn't look right. It may have already been used.",
    cta: 'Go to sign in →',
    href: '/sign-in',
  },
  missing: {
    icon: '🔗',
    iconBg: '#FEF2F2',
    title: 'Missing token',
    body: 'No verification token found. Please use the link from your email.',
    cta: 'Go home →',
    href: '/',
  },
}

function VerifyEmailContent() {
  const params = useSearchParams()
  const success = params.get('success')
  const error = params.get('error') as keyof typeof STATES | null

  const state = success ? STATES.success : STATES[error ?? 'invalid']

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F1EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'var(--font-inter)' }}>
      <Link href="/">
        <Image src="/logo-dark.png" alt="Balible" width={120} height={36} style={{ objectFit: 'contain', marginBottom: 40 }} />
      </Link>

      <div style={{ width: '100%', maxWidth: 440, backgroundColor: 'white', borderRadius: 16, padding: '48px 40px', textAlign: 'center', border: '1px solid #E8E4DE' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: state.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
          {state.icon}
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', margin: '0 0 12px' }}>
          {state.title}
        </h1>
        <p style={{ fontSize: 15, color: '#6F675C', lineHeight: 1.7, margin: '0 0 28px' }}>
          {state.body}
        </p>
        <Link
          href={state.href}
          style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
        >
          {state.cta}
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
