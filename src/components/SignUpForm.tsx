'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const GOOGLE_SVG = (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

interface Props {
  role: 'TOURIST' | 'OPERATOR'
  /** Left panel background color */
  panelBg: string
  /** Left panel headline */
  headline: string
  /** Left panel sub-copy */
  subCopy: string
  /** Page heading (right panel) */
  heading: string
  /** Submit button label */
  submitLabel: string
  /** Where to redirect after successful signup */
  redirectTo: string
  /** Small link shown at bottom of form */
  switchLink: React.ReactNode | null
}

export default function SignUpForm({ role, panelBg, headline, subCopy, heading, submitLabel, redirectTo, switchLink }: Props) {
  const router = useRouter()
  const { update } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    const signInRes = await signIn('credentials', { email, password, redirect: false })
    if (signInRes?.ok) await update()
    setLoading(false)
    if (signInRes?.error) {
      const fallback = redirectTo !== '/' ? `/sign-in?callbackUrl=${encodeURIComponent(redirectTo)}` : '/sign-in'
      router.push(fallback)
    } else {
      router.push(`/check-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(redirectTo)}`)
      router.refresh()
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 46, borderRadius: 10, border: '1px solid #E8E4DE',
    padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)',
    color: '#111111', backgroundColor: 'white', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F1EB', display: 'flex', fontFamily: 'var(--font-inter)' }}>

      {/* Left brand panel */}
      <div className="hidden lg:flex" style={{ width: 420, flexShrink: 0, backgroundColor: panelBg, flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Image src="/logo-light.png" alt="Balible" width={130} height={40} style={{ objectFit: 'contain', height: 40, width: 'auto' }} />
        </Link>
        <div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 34, fontWeight: 700, color: 'white', lineHeight: 1.25, margin: '0 0 16px' }}>
            {headline}
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            {subCopy}
          </p>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>80+ curated experiences across 13 areas in Bali</p>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/">
            <Image src="/logo-dark.png" alt="Balible" width={110} height={34} style={{ objectFit: 'contain' }} />
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#111111', margin: '0 0 6px' }}>{heading}</h1>
          <p style={{ fontSize: 14, color: '#6F675C', margin: '0 0 24px' }}>Join Balible — it&apos;s free</p>

          {/* Google */}
          <button
            type="button"
            onClick={() => {
              const callbackUrl = role === 'OPERATOR'
                ? `/auth/google-host-callback?next=${encodeURIComponent(redirectTo)}`
                : redirectTo
              signIn('google', { callbackUrl })
            }}
            className="flex items-center justify-center gap-3 w-full hover:bg-stone-50 transition-colors"
            style={{ height: 46, borderRadius: 10, border: '1px solid #E8E4DE', backgroundColor: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#111111', fontFamily: 'var(--font-inter)', marginBottom: 20 }}
          >
            {GOOGLE_SVG}
            Continue with Google
          </button>

          <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E8E4DE' }} />
            <span style={{ fontSize: 12, color: '#9E9A94' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E8E4DE' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111111', marginBottom: 6 }}>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111111', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111111', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111111', marginBottom: 6 }}>Confirm password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••" style={inputStyle} />
            </div>
            {error && <p style={{ fontSize: 13, color: '#B66A45', marginBottom: 14 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full hover:opacity-90 transition-opacity"
              style={{ height: 46, borderRadius: 10, backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : submitLabel}
            </button>
          </form>

          <p style={{ fontSize: 13, color: '#9E9A94', marginTop: 20, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link
              href={redirectTo !== '/' ? `/sign-in?callbackUrl=${encodeURIComponent(redirectTo)}` : '/sign-in'}
              style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign in →
            </Link>
          </p>
          {switchLink && <p style={{ fontSize: 13, color: '#9E9A94', marginTop: 8, textAlign: 'center' }}>{switchLink}</p>}
        </div>
      </div>
    </div>
  )
}
