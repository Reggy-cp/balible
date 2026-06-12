'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Clock, Calendar, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'

function formatDate(s: string) {
  if (!s) return '—'
  const [y, m, d] = s.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function ConfirmInner() {
  const params = useSearchParams()
  const ref     = params.get('ref') ?? ''
  const title   = params.get('title') ?? 'Your service'
  const date    = params.get('date') ?? ''
  const time    = params.get('time') ?? ''
  const total   = Number(params.get('total') ?? 0)
  const pending = params.get('pending') === '1'

  const formatTime = (t: string) => {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F3EEE5', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-[520px] mx-auto px-6 py-16 pb-24 text-center">

        {/* Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: pending ? '#FDF8F4' : '#F0F7F2' }}>
          {pending
            ? <Clock size={40} style={{ color: '#B58A4B' }} />
            : <CheckCircle size={40} style={{ color: '#2E4A35' }} />}
        </div>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#1D1D1D', marginBottom: 8 }}>
          {pending ? 'Request Sent!' : 'Booking Confirmed!'}
        </h1>
        <p style={{ fontSize: 15, color: '#6F675C', lineHeight: 1.6, marginBottom: 32 }}>
          {pending ? (
            <>Your request for <strong style={{ color: '#1D1D1D' }}>{title}</strong> has been sent. The provider will confirm within 24 hours.</>
          ) : (
            <>Your booking for <strong style={{ color: '#1D1D1D' }}>{title}</strong> is confirmed. The provider will be in touch shortly.</>
          )}
        </p>

        {/* Booking details card */}
        <div className="bg-white rounded-2xl p-6 text-left mb-8" style={{ border: '1px solid #E8E4DE' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, color: '#6F675C' }}>Booking reference</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1D1D1D', fontFamily: 'monospace' }}>{ref}</span>
            </div>
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid #F3EEE5', paddingTop: 12 }}>
              <div className="flex items-center gap-2">
                <Calendar size={14} style={{ color: '#6F675C' }} />
                <span style={{ fontSize: 13, color: '#6F675C' }}>Service date</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1D1D1D' }}>
                {formatDate(date)}{time ? ` · ${formatTime(time)}` : ''}
              </span>
            </div>
            {total > 0 && (
              <div className="flex items-center justify-between" style={{ borderTop: '1px solid #F3EEE5', paddingTop: 12 }}>
                <span style={{ fontSize: 13, color: '#6F675C' }}>{pending ? 'Total if confirmed' : 'Total'}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1D' }}>IDR {total.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>
        </div>

        {/* What's next */}
        <div className="bg-white rounded-xl p-5 text-left mb-8" style={{ border: '1px solid #E8E4DE' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1D', marginBottom: 12 }}>What happens next?</h3>
          <ol className="space-y-3">
            {[
              'Save your booking reference — you\'ll need it for any changes.',
              pending
                ? 'The provider will review your request and respond within 24 hours.'
                : 'The provider will contact you within 24 hours to arrange details.',
              'Check your WhatsApp — they may reach out there too.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#B58A4B', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/services"
            className="flex-1 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            style={{ height: 46, borderRadius: 12, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 14, fontWeight: 500, color: '#1D1D1D', textDecoration: 'none' }}
          >
            Browse more services
          </a>
          <a
            href="/"
            className="flex-1 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ height: 46, borderRadius: 12, backgroundColor: '#1D1D1D', fontSize: 14, fontWeight: 600, color: 'white', textDecoration: 'none' }}
          >
            Back to home <ArrowRight size={14} />
          </a>
        </div>

      </div>
      <MobileNav />
    </div>
  )
}

export default function ServiceConfirmPage() {
  return (
    <Suspense>
      <ConfirmInner />
    </Suspense>
  )
}
