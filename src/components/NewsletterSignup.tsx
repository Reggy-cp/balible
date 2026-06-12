'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export default function NewsletterSignup({ dark = false }: { dark?: boolean }) {
  const [email, setEmail]         = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const submit = () => {
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 4000)
  }

  if (subscribed) {
    return (
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 500, color: '#B58A4B', textAlign: 'center' }}>
        ✓ You&apos;re on the list! We&apos;ll be in touch soon.
      </p>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        className="flex-1 outline-none"
        style={{
          height: 46, borderRadius: 8, padding: '0 16px', fontSize: 14,
          color: '#1D1D1D', border: dark ? 'none' : '1px solid #E8E4DE',
          fontFamily: 'var(--font-inter)',
        }}
      />
      <button
        onClick={submit}
        className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0"
        style={{
          height: 46, padding: '0 24px', backgroundColor: '#B58A4B', color: 'white',
          borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
          whiteSpace: 'nowrap', fontFamily: 'var(--font-inter)',
        }}
      >
        Subscribe <ArrowRight size={14} />
      </button>
    </div>
  )
}
