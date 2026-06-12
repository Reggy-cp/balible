'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Shield, ChevronRight, User, Mail, Phone, FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import {
  getServiceForCheckout, createServiceBookingAction,
  type ServiceCheckoutMeta,
} from '@/lib/service-actions'

const LOADING_META: ServiceCheckoutMeta = {
  id: '', title: 'Loading…', area: '', price: 0,
  priceTypeKey: 'FIXED', priceLabel: '', image: '', instantConfirm: false, providerName: '',
}

const PRICE_TYPE_LABEL: Record<string, string> = {
  HOURLY: 'hour', DAILY: 'day', FIXED: 'booking',
}

function formatDate(s: string) {
  if (!s) return '—'
  const [y, m, d] = s.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function CheckoutInner() {
  const params = useSearchParams()
  const router = useRouter()

  const slug     = params.get('slug') ?? ''
  const date     = params.get('date') ?? ''
  const time     = params.get('time') ?? ''
  const duration = Number(params.get('duration') ?? 1)
  const guests   = Number(params.get('guests') ?? 1)

  const [meta, setMeta]         = useState<ServiceCheckoutMeta>(LOADING_META)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [notes, setNotes]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!slug) return
    getServiceForCheckout(slug).then(d => { if (d) setMeta(d) }).catch(() => {})
  }, [slug])

  const unit = meta.priceTypeKey === 'FIXED' ? 1 : duration
  const subtotal = meta.price * unit
  const serviceFee = Math.round(subtotal * 0.1)
  const total = subtotal + serviceFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return }
    setSubmitting(true)
    setError('')
    const res = await createServiceBookingAction({
      listingId: meta.id,
      startDate: time ? `${date}T${time}:00` : date,
      duration,
      guests,
      notes,
      guestName: name.trim(),
      guestEmail: email.trim(),
      guestPhone: phone.trim(),
    })
    setSubmitting(false)
    if (res.ok && res.bookingRef) {
      const pending = res.status === 'PENDING' ? '&pending=1' : ''
      router.push(`/services/confirm?ref=${res.bookingRef}&title=${encodeURIComponent(meta.title)}&date=${date}&time=${encodeURIComponent(time)}&total=${res.total ?? total}${pending}`)
    } else if (res.error === 'SIGN_IN_REQUIRED') {
      setError('SIGN_IN_REQUIRED')
    } else if (res.error === 'UNAVAILABLE') {
      setError('This service is no longer available for booking.')
    } else {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F3EEE5', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-[900px] mx-auto px-6 py-8 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-6 text-sm" style={{ color: '#6F675C' }}>
          <a href="/services" style={{ color: '#6F675C', textDecoration: 'none' }}>Services</a>
          <ChevronRight size={13} />
          <a href={`/services/${slug}`} style={{ color: '#6F675C', textDecoration: 'none' }}>{meta.title}</a>
          <ChevronRight size={13} />
          <span style={{ color: '#1D1D1D' }}>Checkout</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left — form */}
          <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-5">
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#1D1D1D', marginBottom: 4 }}>
              Complete your booking
            </h1>

            {/* Guest details */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1D1D1D', marginBottom: 16 }}>Your details</h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>Full name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
                    <input
                      value={name} onChange={e => setName(e.target.value)} required
                      placeholder="Your full name"
                      style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 36, paddingRight: 12, fontSize: 14, color: '#1D1D1D', outline: 'none', backgroundColor: '#FAFAF8', fontFamily: 'var(--font-inter)' }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>Email *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="your@email.com"
                      style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 36, paddingRight: 12, fontSize: 14, color: '#1D1D1D', outline: 'none', backgroundColor: '#FAFAF8', fontFamily: 'var(--font-inter)' }}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>WhatsApp / phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
                    <input
                      value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+62 ..."
                      style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 36, paddingRight: 12, fontSize: 14, color: '#1D1D1D', outline: 'none', backgroundColor: '#FAFAF8', fontFamily: 'var(--font-inter)' }}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>Special requests</label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-3 top-3" style={{ color: '#6F675C' }} />
                    <textarea
                      value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Anything the provider should know..."
                      rows={3}
                      style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 36, paddingRight: 12, paddingTop: 12, paddingBottom: 12, fontSize: 14, color: '#1D1D1D', outline: 'none', backgroundColor: '#FAFAF8', resize: 'none', fontFamily: 'var(--font-inter)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#F0F7F2', border: '1px solid #D4E8D9' }}>
              <Shield size={16} style={{ color: '#2E4A35', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: '#2E4A35', lineHeight: 1.5 }}>
                Your booking is protected. Payment is only released to the provider after your service is delivered.
              </p>
            </div>

            {error === 'SIGN_IN_REQUIRED' ? (
              <p style={{ fontSize: 13, color: '#B66A45', backgroundColor: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>
                Please{' '}
                <a
                  href={`/sign-in?redirect_url=${encodeURIComponent(`/services/checkout?${params.toString()}`)}`}
                  style={{ color: '#B66A45', fontWeight: 600, textDecoration: 'underline' }}
                >
                  sign in
                </a>{' '}
                to complete your booking — you&apos;ll be brought back here.
              </p>
            ) : error ? (
              <p style={{ fontSize: 13, color: '#B66A45', backgroundColor: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || !name || !email || !meta.id}
              className="w-full hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ height: 50, borderRadius: 12, backgroundColor: '#1D1D1D', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: submitting || !name || !email || !meta.id ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter)' }}
            >
              {submitting ? 'Confirming…' : meta.instantConfirm ? 'Confirm Booking' : 'Send Request'}
            </button>
          </form>

          {/* Right — summary */}
          <div className="lg:w-[320px] flex-shrink-0">
            <div className="bg-white rounded-xl p-5 sticky top-24" style={{ border: '1px solid #E8E4DE' }}>
              {meta.image && (
                <div className="rounded-xl overflow-hidden mb-4" style={{ height: 160 }}>
                  <img src={meta.image} alt={meta.title} className="w-full h-full object-cover" />
                </div>
              )}

              <p style={{ fontSize: 11, color: '#6F675C', marginBottom: 2 }}>{meta.area} · by {meta.providerName}</p>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#1D1D1D', marginBottom: 12 }}>
                {meta.title}
              </h3>

              <div className="space-y-2 mb-4 pb-4" style={{ borderBottom: '1px solid #F3EEE5' }}>
                <div className="flex justify-between">
                  <span style={{ fontSize: 13, color: '#6F675C' }}>Date</span>
                  <span style={{ fontSize: 13, color: '#1D1D1D', fontWeight: 500 }}>{formatDate(date)}</span>
                </div>
                {time && (
                  <div className="flex justify-between">
                    <span style={{ fontSize: 13, color: '#6F675C' }}>Time</span>
                    <span style={{ fontSize: 13, color: '#1D1D1D', fontWeight: 500 }}>
                      {(() => { const [h, m] = time.split(':').map(Number); const ampm = h < 12 ? 'AM' : 'PM'; return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}` })()}
                    </span>
                  </div>
                )}
                {meta.priceTypeKey !== 'FIXED' && (
                  <div className="flex justify-between">
                    <span style={{ fontSize: 13, color: '#6F675C' }}>Duration</span>
                    <span style={{ fontSize: 13, color: '#1D1D1D', fontWeight: 500 }}>{duration} {PRICE_TYPE_LABEL[meta.priceTypeKey]}{duration > 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ fontSize: 13, color: '#6F675C' }}>Guests</span>
                  <span style={{ fontSize: 13, color: '#1D1D1D', fontWeight: 500 }}>{guests}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span style={{ fontSize: 13, color: '#6F675C' }}>
                    IDR {meta.price.toLocaleString('id-ID')} × {unit} {PRICE_TYPE_LABEL[meta.priceTypeKey]}{unit > 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 13, color: '#1D1D1D' }}>IDR {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: 13, color: '#6F675C' }}>Service fee (10%)</span>
                  <span style={{ fontSize: 13, color: '#1D1D1D' }}>IDR {serviceFee.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #E8E4DE' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1D' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1D' }}>IDR {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <MobileNav />
    </div>
  )
}

export default function ServiceCheckoutPage() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  )
}
