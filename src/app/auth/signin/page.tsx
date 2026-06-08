'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import MobileNav from '@/components/MobileNav'

export default function SignInPage() {
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div
      className="min-h-screen flex items-center justify-center relative pb-16 md:pb-0"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&auto=format&fit=crop&q=80')" }}
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
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: '#6F675C', textAlign: 'center', marginBottom: 24 }}>
          Sign in to continue your journey
        </p>

        {/* Social buttons */}
        <button
          className="w-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          style={{ height: 44, border: '1px solid #E8E4DE', borderRadius: 8, fontSize: 14, color: '#111111', backgroundColor: 'white', cursor: 'pointer', marginBottom: 12 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button
          className="w-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          style={{ height: 44, border: '1px solid #E8E4DE', borderRadius: 8, fontSize: 14, color: '#111111', backgroundColor: 'white', cursor: 'pointer', marginBottom: 20 }}
        >
          <svg width="17" height="17" viewBox="0 0 814 1000" fill="#111111">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.9 0 663.8 0 541.8c0-207.3 133.6-316.3 265.1-316.3 70 0 128.2 46.4 171.8 46.4 42.6 0 109.4-49.1 190.2-49.1zm-159.9-305.1c30.5-38.9 53.5-93.2 53.5-147.4 0-7.7-.6-15.4-1.9-21.7-50.6 1.9-110.8 33.7-147.4 75.8-28.5 32.4-55.1 86.7-55.1 141.7 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.3 1.3 13.3 1.3 45.1 0 102.9-30.3 135.7-68.9z"/>
          </svg>
          Continue with Apple
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div style={{ flex: 1, height: 1, backgroundColor: '#E8E4DE' }} />
          <span style={{ fontSize: 13, color: '#6F675C' }}>or</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E8E4DE' }} />
        </div>

        {/* Email field */}
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

        {/* Password field */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <label style={{ fontSize: 13, fontWeight: 500, color: '#111111' }}>Password</label>
            <a href="/help" style={{ fontSize: 13, color: '#C8A97E', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Forgot password?</a>
          </div>
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

        {/* Remember me */}
        <div className="flex items-center gap-2 mb-5 mt-3">
          <input type="checkbox" id="remember" style={{ accentColor: '#111111', width: 15, height: 15, cursor: 'pointer' }} />
          <label htmlFor="remember" style={{ fontSize: 13, color: '#6F675C', cursor: 'pointer' }}>Remember me</label>
        </div>

        {/* Sign in button */}
        <button
          className="w-full flex items-center justify-center font-medium hover:opacity-90 transition-opacity"
          style={{ height: 44, backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
        >
          Sign In
        </button>

        <p style={{ fontSize: 13, color: '#6F675C', textAlign: 'center', marginTop: 20 }}>
          Don&apos;t have an account?{' '}
          <a href="/auth/signup" style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">
            Sign up
          </a>
        </p>
      </div>
      <MobileNav />
    </div>
  )
}
