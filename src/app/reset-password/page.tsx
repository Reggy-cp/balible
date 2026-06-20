'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Check } from 'lucide-react'
import { resetPasswordAction } from '@/lib/actions'

function ResetPasswordForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState<string | null>(null)

  if (!token) {
    return (
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#B66A45', textAlign: 'center' }}>
        Invalid or missing reset link. Please request a new one from your account settings.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setSubmitting(true)
    const res = await resetPasswordAction(token, password)
    setSubmitting(false)
    if (!res.ok) { setError(res.error ?? 'Something went wrong.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0F7F2' }}>
          <Check size={26} style={{ color: '#4A7C59' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', marginBottom: 8 }}>Password updated</h2>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginBottom: 24 }}>
          Your password has been changed. You can now sign in with your new password.
        </p>
        <a href="/sign-in" style={{
          display: 'inline-block', padding: '12px 28px', backgroundColor: '#111111', color: 'white',
          borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)',
        }}>
          Sign in →
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6F675C', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          New Password
        </label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 44px 0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => (e.target.style.borderColor = '#C8A97E')}
            onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
          />
          <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9E9A94', padding: 0 }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6F675C', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showCf ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
            required
            style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 44px 0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => (e.target.style.borderColor = '#C8A97E')}
            onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
          />
          <button type="button" onClick={() => setShowCf(v => !v)} tabIndex={-1}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9E9A94', padding: 0 }}>
            {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#B66A45' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center hover:opacity-90 transition-opacity"
        style={{ height: 46, backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: 'var(--font-inter)' }}
      >
        {submitting ? 'Updating…' : 'Set new password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <a href="/" className="flex flex-col items-center mb-8" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111' }}>BALIBLE</span>
        </a>
        <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #E8E4DE' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', marginBottom: 6 }}>
            Choose a new password
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginBottom: 24, lineHeight: 1.6 }}>
            Enter a new password for your account.
          </p>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
