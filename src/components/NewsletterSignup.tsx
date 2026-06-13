'use client'

import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

const LS_KEY = 'balible_newsletter_subscribed'

export default function NewsletterSignup({ dark = false, source = 'blog' }: { dark?: boolean; source?: string }) {
  const [email, setEmail]           = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    try { if (localStorage.getItem(LS_KEY)) setSubscribed(true) } catch {}
  }, [])

  const submit = async () => {
    if (!email.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? 'Something went wrong. Please try again.')
        return
      }
      try { localStorage.setItem(LS_KEY, '1') } catch {}
      setSubscribed(true)
      setEmail('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (subscribed) {
    return (
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 500, color: '#C8A97E', textAlign: 'center' }}>
        ✓ You&apos;re on the list! We&apos;ll be in touch soon.
      </p>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="flex-1 outline-none"
          style={{
            height: 46, borderRadius: 8, padding: '0 16px', fontSize: 14,
            color: '#111111', border: dark ? 'none' : '1px solid #E8E4DE',
            fontFamily: 'var(--font-inter)',
          }}
        />
        <button
          onClick={submit}
          disabled={submitting}
          className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0"
          style={{
            height: 46, padding: '0 24px', backgroundColor: '#C8A97E', color: 'white',
            borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none',
            cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1,
            whiteSpace: 'nowrap', fontFamily: 'var(--font-inter)',
          }}
        >
          {submitting ? 'Subscribing…' : <>Subscribe <ArrowRight size={14} /></>}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-center" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#C0504D' }}>
          {error}
        </p>
      )}
    </div>
  )
}
