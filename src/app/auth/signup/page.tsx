'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUpPage() {
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div
      className="min-h-screen flex items-center justify-center relative py-10"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1600&auto=format&fit=crop&q=80')" }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} />

      {/* Card */}
      <div
        className="relative z-10 w-full bg-white"
        style={{ maxWidth: 400, borderRadius: 16, padding: '40px 36px' }}
      >
        {/* Logo */}
        <a href="/" className="flex flex-col items-center leading-none mb-8">
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>BALIBLE</span>
          <span style={{ fontSize: 8, letterSpacing: '0.2em', color: '#6F675C', textTransform: 'uppercase', marginTop: 2 }}>CURATED EXPERIENCES IN BALI</span>
        </a>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#111111', textAlign: 'center', marginBottom: 6 }}>
          Create account
        </h1>
        <p style={{ fontSize: 14, color: '#6F675C', textAlign: 'center', marginBottom: 24 }}>
          Join Balible and discover amazing experiences in Bali
        </p>

        {/* Full name */}
        <div className="mb-4">
          <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 6 }}>Full name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Made Sari"
            className="w-full outline-none transition-colors"
            style={{ height: 44, border: '1px solid #E8E4DE', borderRadius: 8, padding: '0 14px', fontSize: 14, color: '#111111', backgroundColor: 'white' }}
            onFocus={e => (e.target.style.borderColor = '#C8A97E')}
            onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 6 }}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="hello@balible.com"
            className="w-full outline-none transition-colors"
            style={{ height: 44, border: '1px solid #E8E4DE', borderRadius: 8, padding: '0 14px', fontSize: 14, color: '#111111', backgroundColor: 'white' }}
            onFocus={e => (e.target.style.borderColor = '#C8A97E')}
            onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 6 }}>Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full outline-none transition-colors"
              style={{ height: 44, border: '1px solid #E8E4DE', borderRadius: 8, padding: '0 40px 0 14px', fontSize: 14, color: '#111111', backgroundColor: 'white' }}
              onFocus={e => (e.target.style.borderColor = '#C8A97E')}
              onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6F675C', display: 'flex', alignItems: 'center' }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5 mb-5">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ accentColor: '#111111', width: 15, height: 15, cursor: 'pointer', marginTop: 2, flexShrink: 0 }}
          />
          <label htmlFor="terms" style={{ fontSize: 13, color: '#6F675C', cursor: 'pointer', lineHeight: 1.5 }}>
            I agree to the{' '}
            <a href="/help" style={{ color: '#111111', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/help" style={{ color: '#111111', textDecoration: 'underline' }}>Privacy Policy</a>
          </label>
        </div>

        {/* Create account button */}
        <button
          disabled={!agreed}
          className="w-full flex items-center justify-center font-medium transition-opacity"
          style={{
            height: 44,
            backgroundColor: agreed ? '#C8A97E' : '#E8E4DE',
            color: agreed ? 'white' : '#6F675C',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: agreed ? 'pointer' : 'not-allowed',
          }}
        >
          Create Account
        </button>

        <p style={{ fontSize: 13, color: '#6F675C', textAlign: 'center', marginTop: 20 }}>
          Already have an account?{' '}
          <a href="/auth/signin" style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
