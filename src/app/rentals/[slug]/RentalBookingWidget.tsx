'use client'

import { useState, useMemo } from 'react'
import { ChevronRight, Shield } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'


function msPerPeriod(period: string) {
  const p = period.toLowerCase()
  if (p === 'per hour') return 3_600_000
  if (p === 'per week') return 604_800_000
  return 86_400_000
}

function periodUnit(period: string, n: number) {
  const u = period.toLowerCase().replace('per ', '')
  return `${n} ${u}${n !== 1 ? 's' : ''}`
}

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDay(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shortDate(iso: string) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${mon[Number(m) - 1]} ${Number(d)}`
}

export default function RentalBookingWidget({
  price, period, depositRaw, slug, title, image, area,
  serviceFeeRate = 0.1,
  flat = false,
}: {
  price: number
  period: string
  depositRaw: string | null
  slug: string
  title: string
  image: string
  area: string
  serviceFeeRate?: number
  /** flat=true: no card border/shadow/sticky — used inside the mobile sheet */
  flat?: boolean
}) {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const isHost = session?.user?.role === 'OPERATOR'
  const today = localToday()
  const [start, setStart] = useState('')
  const [end,   setEnd]   = useState('')
  const [units, setUnits] = useState(1)

  const calc = useMemo(() => {
    if (!start || !end) return null
    if (start < localToday()) return null               // safety net: reject past start
    const diff = new Date(end).getTime() - new Date(start).getTime()
    if (diff <= 0) return null
    const n   = Math.max(1, Math.ceil(diff / msPerPeriod(period)))
    const sub = n * price * units
    const fee = Math.round(sub * serviceFeeRate)
    return { n, sub, fee, total: sub + fee }
  }, [start, end, price, period, units])

  const deposit = depositRaw ? Number(depositRaw.replace(/\D/g, '')) : 0

  function reserve() {
    if (!calc) return
    const qs = new URLSearchParams({
      type: 'rental', slug, startDate: start, endDate: end,
      units: String(units), periods: String(calc.n), period,
      price: String(price), total: String(calc.total),
      deposit: String(deposit), title, image, area,
    })
    window.location.href = `/checkout?${qs}`
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#9E9A94', marginBottom: 4, display: 'block',
  }

  const inner = isHost ? (
    <div style={{ padding: flat ? '0' : '18px 22px' }}>
      <div style={{ padding: 16, borderRadius: 10, textAlign: 'center', backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE' }}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 4 }}>
          Booking not available for hosts
        </p>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', lineHeight: 1.5 }}>
          Host accounts cannot book rentals. Please use a guest account.
        </p>
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: flat ? '0' : '18px 22px' }}>

      {/* Dates */}
      <div style={{ border: '1.5px solid #E2DDD6', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '10px 14px', borderRight: '1px solid #E2DDD6' }}>
            <label style={labelStyle}>{t('pickup')}</label>
            <input
              type="date" value={start} min={today}
              onChange={e => {
                const val = e.target.value
                if (val && val < localToday()) return   // hard-block past dates
                setStart(val)
                if (end && addDay(val) > end) setEnd('')
              }}
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, fontWeight: 500, color: start ? '#111111' : '#C0B9B0', background: 'transparent', cursor: 'pointer' }}
            />
          </div>
          <div style={{ padding: '10px 14px' }}>
            <label style={labelStyle}>{t('return_label')}</label>
            <input
              type="date" value={end} min={start ? addDay(start) : today}
              onChange={e => {
                const val = e.target.value
                const minEnd = start ? addDay(start) : localToday()
                if (val && val < minEnd) return          // hard-block same/earlier day
                setEnd(val)
              }}
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, fontWeight: 500, color: end ? '#111111' : '#C0B9B0', background: 'transparent', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Duration pill */}
      {calc && (
        <div style={{ background: '#F5F1EB', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#6F675C', textAlign: 'center' }}>
          {shortDate(start)} → {shortDate(end)} · <strong style={{ color: '#111111' }}>{periodUnit(period, calc.n)}</strong>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label style={labelStyle}>{t('quantity')}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F9F7F5', borderRadius: 10, padding: '8px 12px', border: '1.5px solid #E2DDD6' }}>
          <button onClick={() => setUnits(u => Math.max(1, u - 1))}
            style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #E2DDD6', background: 'white', cursor: 'pointer', fontSize: 18, color: '#6F675C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            −
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#111111' }}>{units} unit{units !== 1 ? 's' : ''}</span>
          <button onClick={() => setUnits(u => u + 1)}
            style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #E2DDD6', background: 'white', cursor: 'pointer', fontSize: 18, color: '#6F675C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            +
          </button>
        </div>
      </div>

      {/* Price breakdown */}
      {calc && (
        <div style={{ background: '#F9F7F5', borderRadius: 10, padding: '12px 14px', border: '1px solid #EAE6E0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#6F675C' }}>
            <span>IDR {price.toLocaleString('id-ID')} × {periodUnit(period, calc.n)}{units > 1 ? ` × ${units}` : ''}</span>
            <span style={{ color: '#111111' }}>IDR {calc.sub.toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#6F675C' }}>
            <span>{t('service_fee')} ({Math.round(serviceFeeRate * 100)}%)</span>
            <span style={{ color: '#111111' }}>IDR {calc.fee.toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #E2DDD6', fontSize: 14, fontWeight: 700, color: '#111111' }}>
            <span>{t('total')}</span>
            <span style={{ fontFamily: 'var(--font-playfair)' }}>IDR {calc.total.toLocaleString('id-ID')}</span>
          </div>
          {deposit > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#9E9A94' }}>
              <span>{t('deposit_refundable')}</span>
              <span>IDR {deposit.toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={reserve}
        disabled={!calc}
        style={{
          width: '100%', height: 50, borderRadius: 12, border: 'none',
          background: calc ? '#111111' : '#E8E4DE',
          color: calc ? 'white' : '#B0A99E',
          fontSize: 15, fontWeight: 600, cursor: calc ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        {calc ? t('reserve_now') : t('select_dates_cta')}
        {calc && <ChevronRight size={16} />}
      </button>

      {/* Trust signals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#9E9A94' }}>
          <Shield size={12} style={{ color: '#4A7C59', flexShrink: 0 }} />
          {t('free_cancel_pickup')}
        </div>
        {deposit > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#9E9A94' }}>
            <Shield size={12} style={{ color: '#4A7C59', flexShrink: 0 }} />
            IDR {deposit.toLocaleString('id-ID')} deposit refunded on return
          </div>
        )}
      </div>
    </div>
  )

  /* ── Card mode (desktop sidebar) ── */
  if (!flat) {
    return (
      <div style={{ borderRadius: 16, border: '1.5px solid #E2DDD6', background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
        {/* Price header */}
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #F0EDE8' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#111111' }}>
              IDR {price.toLocaleString('id-ID')}
            </span>
            <span style={{ fontSize: 14, color: '#9E9A94' }}>{period}</span>
          </div>
        </div>
        {inner}
      </div>
    )
  }

  /* ── Flat mode (inside mobile bottom sheet) ── */
  return inner
}
