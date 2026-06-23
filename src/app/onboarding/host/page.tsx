'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const INDONESIAN_BANKS = [
  'BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Danamon', 'Permata',
  'BTN', 'Maybank', 'OCBC NISP', 'Panin', 'Mega', 'BPD Bali', 'GoPay', 'OVO', 'Dana',
]

const AREAS = [
  { value: 'UBUD',      label: 'Ubud' },
  { value: 'CANGGU',    label: 'Canggu' },
  { value: 'KUTA',      label: 'Kuta' },
  { value: 'SEMINYAK',  label: 'Seminyak' },
  { value: 'ULUWATU',   label: 'Uluwatu' },
  { value: 'GIANYAR',   label: 'Gianyar' },
  { value: 'SANUR',     label: 'Sanur' },
  { value: 'NUSA_DUA',  label: 'Nusa Dua' },
  { value: 'AMED',      label: 'Amed' },
  { value: 'MEDEWI',    label: 'Medewi' },
  { value: 'JIMBARAN',  label: 'Jimbaran' },
  { value: 'KINTAMANI', label: 'Kintamani' },
  { value: 'SIDEMEN',   label: 'Sidemen' },
]

const STEPS = ['Your Profile', 'Bank Account']

const inputStyle: React.CSSProperties = {
  width: '100%', height: 46, borderRadius: 10, border: '1px solid #E8E4DE',
  padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)',
  color: '#111111', backgroundColor: 'white', outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: '#111111', marginBottom: 6,
}

export default function HostOnboardingPage() {
  const router = useRouter()
  const [step, setStep]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [checking, setChecking] = useState(true)

  // Step 1 — Profile
  const [businessName, setBusinessName] = useState('')
  const [bio, setBio]                   = useState('')
  const [phone, setPhone]               = useState('')
  const [area, setArea]                 = useState('')
  const [website, setWebsite]           = useState('')

  // Step 2 — Bank
  const [payoutBank, setPayoutBank]       = useState('')
  const [payoutAccount, setPayoutAccount] = useState('')
  const [payoutName, setPayoutName]       = useState('')

  // Check onboarding status and prefill
  useEffect(() => {
    fetch('/api/onboarding/host/status')
      .then(r => r.json())
      .then(d => {
        if (d.complete) { router.replace('/dashboard'); return }
        if (d.profile) {
          setBusinessName(d.profile.businessName ?? '')
          setBio(d.profile.bio ?? '')
          setPhone(d.profile.phone ?? '')
          setArea(d.profile.area ?? '')
          setWebsite(d.profile.website ?? '')
          if (d.profileComplete) setStep(2)
        }
        setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [router])

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/onboarding/host/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName, description: bio, phone, area, website }),
    })
    setLoading(false)
    if (!res.ok) { setError((await res.json()).error ?? 'Something went wrong.'); return }
    setStep(2)
  }

  async function handlePayout(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await fetch('/api/onboarding/host/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payoutBank, payoutAccountNumber: payoutAccount, payoutAccountName: payoutName }),
    })
    setLoading(false)
    router.push('/dashboard')
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E8E4DE', borderTopColor: '#111111', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F1EB', fontFamily: 'var(--font-inter)', padding: '40px 16px' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Link href="/">
          <Image src="/logo-dark.png" alt="Balible" width={110} height={34} style={{ objectFit: 'contain' }} />
        </Link>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 400, margin: '0 auto 40px' }}>
        {STEPS.map((label, i) => {
          const n    = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: n < STEPS.length ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  backgroundColor: done ? '#2D5A3D' : active ? '#111111' : '#E8E4DE',
                  color: done || active ? 'white' : '#9E9A94',
                }}>
                  {done ? '✓' : n}
                </div>
                <span style={{ fontSize: 11, color: active ? '#111111' : '#9E9A94', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {n < STEPS.length && (
                <div style={{ flex: 1, height: 2, backgroundColor: done ? '#2D5A3D' : '#E8E4DE', margin: '0 8px', marginBottom: 20 }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div style={{ backgroundColor: 'white', borderRadius: 20, padding: '36px 32px', maxWidth: 480, margin: '0 auto', border: '1px solid #E8E4DE' }}>

        {/* Step 1 — Profile */}
        {step === 1 && (
          <form onSubmit={handleProfile}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', margin: '0 0 6px' }}>
              Tell us about yourself
            </h2>
            <p style={{ fontSize: 14, color: '#6F675C', margin: '0 0 28px', lineHeight: 1.6 }}>
              This is what guests will see on your public host profile.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Business / Brand name <span style={{ color: '#B66A45' }}>*</span>
              </label>
              <input
                type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Salsa Spa, Made's Kitchen, Bali Surf Co."
                style={inputStyle}
              />
              <p style={{ fontSize: 12, color: '#9E9A94', marginTop: 5 }}>
                The name guests will see when browsing your listings.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                About you <span style={{ color: '#B66A45' }}>*</span>
              </label>
              <textarea
                required value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Tell guests who you are, your background, and what makes your experience special…"
                style={{ ...inputStyle, height: 110, padding: '12px 14px', resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>WhatsApp / Phone <span style={{ color: '#B66A45' }}>*</span></label>
                <input
                  type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+62 812 3456 7890"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Primary area <span style={{ color: '#B66A45' }}>*</span></label>
                <select required value={area} onChange={e => setArea(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Website <span style={{ color: '#9E9A94', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="url" value={website} onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourbrand.com"
                style={inputStyle}
              />
            </div>

            {error && <p style={{ fontSize: 13, color: '#B66A45', marginBottom: 16 }}>{error}</p>}

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', height: 46, borderRadius: 10, backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Saving…' : 'Continue →'}
            </button>
          </form>
        )}

        {/* Step 2 — Bank Account */}
        {step === 2 && (
          <form onSubmit={handlePayout}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', margin: '0 0 6px' }}>
              How should we pay you?
            </h2>
            <p style={{ fontSize: 14, color: '#6F675C', margin: '0 0 16px', lineHeight: 1.6 }}>
              All payments go to Balible first. We disburse your earnings within 3 business days of each completed booking, minus our platform fee.
            </p>

            {/* Info banner */}
            <div style={{ backgroundColor: '#F5F1EB', borderRadius: 12, padding: '14px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
              <p style={{ fontSize: 13, color: '#6F675C', margin: 0, lineHeight: 1.6 }}>
                Your bank details are stored securely and used only for earning disbursements. You can update them anytime from your dashboard settings.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Bank name</label>
              <input
                type="text" value={payoutBank} onChange={e => setPayoutBank(e.target.value)}
                placeholder="e.g. BCA, Mandiri, BNI"
                list="bank-list"
                style={inputStyle}
              />
              <datalist id="bank-list">
                {INDONESIAN_BANKS.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Account number</label>
              <input
                type="text" value={payoutAccount} onChange={e => setPayoutAccount(e.target.value)}
                placeholder="e.g. 1234567890"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Account holder name</label>
              <input
                type="text" value={payoutName} onChange={e => setPayoutName(e.target.value)}
                placeholder="Full name exactly as on your bank account"
                style={inputStyle}
              />
            </div>

            {error && <p style={{ fontSize: 13, color: '#B66A45', marginBottom: 16 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button" onClick={() => setStep(1)}
                style={{ flex: 1, height: 46, borderRadius: 10, backgroundColor: 'white', color: '#111111', fontSize: 14, fontWeight: 500, border: '1px solid #E8E4DE', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                type="submit" disabled={loading}
                style={{ flex: 2, height: 46, borderRadius: 10, backgroundColor: '#2D5A3D', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Setting up…' : 'Go to Dashboard 🎉'}
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#9E9A94', textAlign: 'center', marginTop: 16 }}>
              You can skip bank details for now and add them later.{' '}
              <button
                type="button" onClick={() => router.push('/dashboard')}
                style={{ background: 'none', border: 'none', color: '#111111', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Skip for now
              </button>
            </p>
          </form>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#9E9A94', marginTop: 24 }}>
        Already set up?{' '}
        <Link href="/dashboard" style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }}>
          Go to your dashboard →
        </Link>
      </p>
    </div>
  )
}
