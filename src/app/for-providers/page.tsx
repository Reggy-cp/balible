'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Star, Users, TrendingUp, Shield, Sparkles } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import { registerAsProviderAction } from '@/lib/service-actions'

const BENEFITS = [
  { Icon: Users,      title: 'Access Thousands of Guests', body: 'Reach international travelers staying in Bali who are actively looking for trusted local services.' },
  { Icon: TrendingUp, title: 'Grow Your Income',           body: 'Set your own prices and availability. Most providers earn IDR 3–15M per month through Balible.' },
  { Icon: Shield,     title: 'Verified & Trusted',         body: 'Balible verifies every provider. Guests book with confidence — which means more bookings for you.' },
  { Icon: Star,       title: 'Build Your Reputation',      body: 'Every booking earns you a review. A strong profile brings repeat guests and premium pricing power.' },
]

const CATEGORIES = [
  { emoji: '💆', label: 'Wellness & Beauty' },
  { emoji: '📸', label: 'Photography & Content' },
  { emoji: '🚗', label: 'Transportation' },
  { emoji: '🍽️', label: 'Food & Dining' },
  { emoji: '💍', label: 'Event & Wedding' },
  { emoji: '🧘', label: 'Fitness & Coaching' },
  { emoji: '🏡', label: 'Villa Service' },
  { emoji: '🐾', label: 'Pet Service' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Apply in minutes',     body: 'Fill in your business details and service category. Our team reviews within 48 hours.' },
  { step: '2', title: 'Create your listings', body: 'Add your services, photos, pricing, and availability. We help you get set up.' },
  { step: '3', title: 'Start getting booked', body: 'Guests discover you on Balible and book instantly or request a quote.' },
  { step: '4', title: 'Get paid',             body: 'Receive payment after each completed service. 90% goes to you — we keep 10%.' },
]

export default function ForProvidersPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription]  = useState('')
  const [phone, setPhone]              = useState('')
  const [submitting, setSubmitting]    = useState(false)
  const [success, setSuccess]          = useState(false)
  const [error, setError]              = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim() || !description.trim()) { setError('Please fill in all required fields.'); return }
    setSubmitting(true)
    setError('')
    const res = await registerAsProviderAction({ businessName: businessName.trim(), description: description.trim(), phone: phone.trim() })
    setSubmitting(false)
    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/provider'), 2000)
    } else {
      setError(res.error ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F3EEE5', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 lg:px-16 text-center" style={{ backgroundColor: '#1D1D1D' }}>
        <div className="max-w-[700px] mx-auto">
          <div className="flex items-center justify-center gap-2 mb-5">
            <Sparkles size={16} style={{ color: '#B58A4B' }} />
            <span style={{ fontSize: 13, color: '#B58A4B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>For Service Providers</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: 16 }}>
            Grow your business<br />with Balible
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 32 }}>
            Join hundreds of local providers reaching thousands of international travelers in Bali every month.
          </p>
          <a
            href="#apply"
            style={{ display: 'inline-flex', alignItems: 'center', height: 50, padding: '0 32px', backgroundColor: '#B58A4B', color: '#1D1D1D', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
            className="hover:opacity-90 transition-opacity"
          >
            Apply to join →
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 px-6 lg:px-16 bg-white">
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#1D1D1D', marginBottom: 6 }}>What services can you offer?</h2>
          <p style={{ fontSize: 14, color: '#6F675C', marginBottom: 28 }}>Balible accepts providers across 8 categories.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(c => (
              <div key={c.label} className="rounded-xl p-4 flex flex-col items-center gap-2" style={{ backgroundColor: '#F3EEE5', border: '1px solid #E8E4DE' }}>
                <span style={{ fontSize: 28 }}>{c.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1D', textAlign: 'center' }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 px-6 lg:px-16" style={{ backgroundColor: '#F3EEE5' }}>
        <div className="max-w-[1000px] mx-auto">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#1D1D1D', marginBottom: 10, textAlign: 'center' }}>Why join Balible?</h2>
          <p style={{ fontSize: 14, color: '#6F675C', marginBottom: 36, textAlign: 'center' }}>Built specifically for Bali — not a generic global platform.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ Icon, title, body }) => (
              <div key={title} className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
                <Icon size={26} style={{ color: '#B58A4B', marginBottom: 14 }} strokeWidth={1.5} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1D', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#6F675C', lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 px-6 lg:px-16 bg-white">
        <div className="max-w-[800px] mx-auto">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#1D1D1D', marginBottom: 36, textAlign: 'center' }}>How it works</h2>
          <div className="space-y-6">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#1D1D1D', fontSize: 15, fontWeight: 700 }}>
                  {step}
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1D', marginBottom: 4 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: '#6F675C', lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section id="apply" className="py-14 px-6 lg:px-16" style={{ backgroundColor: '#F3EEE5' }}>
        <div className="max-w-[560px] mx-auto">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#1D1D1D', marginBottom: 6, textAlign: 'center' }}>Apply to become a provider</h2>
          <p style={{ fontSize: 14, color: '#6F675C', marginBottom: 28, textAlign: 'center' }}>We review every application within 48 hours.</p>

          {success ? (
            <div className="bg-white rounded-2xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
              <CheckCircle size={40} style={{ color: '#2E4A35', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#1D1D1D', marginBottom: 8 }}>Application submitted!</h3>
              <p style={{ fontSize: 14, color: '#6F675C' }}>Redirecting you to your provider dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5" style={{ border: '1px solid #E8E4DE' }}>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>Business / service name *</label>
                <input
                  value={businessName} onChange={e => setBusinessName(e.target.value)} required
                  placeholder="e.g. Dewi Spa & Beauty"
                  style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, color: '#1D1D1D', outline: 'none', backgroundColor: '#FAFAF8', fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>Tell us about your service *</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)} required
                  placeholder="What do you offer? How many years of experience? Where in Bali do you operate?"
                  rows={4}
                  style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '12px 14px', fontSize: 14, color: '#1D1D1D', outline: 'none', backgroundColor: '#FAFAF8', resize: 'none', fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>WhatsApp / phone</label>
                <input
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+62 ..."
                  style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, color: '#1D1D1D', outline: 'none', backgroundColor: '#FAFAF8', fontFamily: 'var(--font-inter)' }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#B66A45', backgroundColor: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !businessName || !description}
                className="w-full hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ height: 50, borderRadius: 12, backgroundColor: '#1D1D1D', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: submitting || !businessName || !description ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter)' }}
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>

              <p style={{ fontSize: 12, color: '#9E9A94', textAlign: 'center' }}>
                You must be signed in to apply. <a href="/sign-in" style={{ color: '#B58A4B' }}>Sign in →</a>
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  )
}
