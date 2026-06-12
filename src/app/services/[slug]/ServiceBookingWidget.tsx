'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react'

type Props = {
  slug: string
  title: string
  price: number
  priceType: string
  priceLabel: string
  area: string
  image: string
  instantConfirm: boolean
}

function generateTimeSlots() {
  const slots: { value: string; label: string }[] = []
  for (let h = 7; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) break
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      const ampm = h < 12 ? 'AM' : 'PM'
      const h12  = h % 12 || 12
      slots.push({ value: `${hh}:${mm}`, label: `${h12}:${mm} ${ampm}` })
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export default function ServiceBookingWidget({
  slug, price, priceType, priceLabel, instantConfirm,
}: Props) {
  const router = useRouter()
  const [date, setDate]       = useState('')
  const [time, setTime]       = useState('')
  const [guests, setGuests]   = useState(1)
  const [duration, setDuration] = useState(1)

  const unit       = priceType === 'FIXED' ? 1 : duration
  const subtotal   = Math.round(price * unit)
  const serviceFee = Math.round(subtotal * 0.1)
  const total      = subtotal + serviceFee

  const durationOptions =
    priceType === 'HOURLY' ? [1, 1.5, 2, 3, 4] :
    priceType === 'DAILY'  ? [1, 2, 3, 5, 7] :
    null

  const canBook = date && time

  const handleBook = () => {
    if (!canBook) return
    const params = new URLSearchParams({
      slug, date, time,
      duration: String(duration),
      guests: String(guests),
    })
    router.push(`/services/checkout?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E8E4DE', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

      {/* Price */}
      <div className="mb-5">
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#1D1D1D' }}>
          IDR {price.toLocaleString('id-ID')}
          <span style={{ fontSize: 14, fontWeight: 400, color: '#6F675C', marginLeft: 4 }}>{priceLabel}</span>
        </p>
      </div>

      {/* Date + Time side by side */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>Date</label>
          <div className="relative">
            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 32, paddingRight: 8, fontSize: 13, color: '#1D1D1D', outline: 'none', backgroundColor: '#FAFAF8', fontFamily: 'var(--font-inter)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>Time</label>
          <div className="relative">
            <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C', zIndex: 1 }} />
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 32, paddingRight: 8, fontSize: 13, color: time ? '#1D1D1D' : '#9E9A94', outline: 'none', backgroundColor: '#FAFAF8', appearance: 'none', fontFamily: 'var(--font-inter)' }}
            >
              <option value="">Select</option>
              {TIME_SLOTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Duration */}
      {durationOptions && (
        <div className="mb-4">
          <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>
            Duration ({priceType === 'HOURLY' ? 'hours' : 'days'})
          </label>
          <div className="flex gap-2 flex-wrap">
            {durationOptions.map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                style={{
                  height: 36, paddingInline: 14, borderRadius: 8, fontSize: 13, cursor: 'pointer',
                  backgroundColor: duration === d ? '#1D1D1D' : 'white',
                  color: duration === d ? 'white' : '#6F675C',
                  border: `1px solid ${duration === d ? '#1D1D1D' : '#E8E4DE'}`,
                  fontWeight: duration === d ? 600 : 400,
                }}
              >
                {d} {priceType === 'HOURLY' ? (d === 1 ? 'hr' : 'hrs') : (d === 1 ? 'day' : 'days')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Guests */}
      <div className="mb-5">
        <label style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D', display: 'block', marginBottom: 6 }}>Guests</label>
        <div className="relative">
          <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
          <select
            value={guests}
            onChange={e => setGuests(Number(e.target.value))}
            style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 32, paddingRight: 12, fontSize: 14, color: '#1D1D1D', outline: 'none', backgroundColor: '#FAFAF8', appearance: 'none', fontFamily: 'var(--font-inter)' }}
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price summary */}
      <div className="space-y-2 mb-4 py-3" style={{ borderTop: '1px solid #F3EEE5' }}>
        {priceType !== 'FIXED' && (
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 13, color: '#6F675C' }}>
              IDR {price.toLocaleString('id-ID')} × {unit} {priceType === 'HOURLY' ? (unit === 1 ? 'hr' : 'hrs') : (unit === 1 ? 'day' : 'days')}
            </span>
            <span style={{ fontSize: 13, color: '#1D1D1D' }}>IDR {subtotal.toLocaleString('id-ID')}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 13, color: '#6F675C' }}>Service fee (10%)</span>
          <span style={{ fontSize: 13, color: '#1D1D1D' }}>IDR {serviceFee.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #F3EEE5' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1D' }}>Total</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1D' }}>IDR {total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleBook}
        disabled={!canBook}
        className="w-full hover:opacity-90 transition-opacity disabled:opacity-40"
        style={{ height: 48, borderRadius: 12, backgroundColor: '#1D1D1D', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: canBook ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-inter)' }}
      >
        {instantConfirm ? 'Book Now' : 'Request to Book'}
      </button>

      {instantConfirm && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <CheckCircle size={13} style={{ color: '#2E4A35' }} />
          <p style={{ fontSize: 12, color: '#2E4A35' }}>Instant confirmation — no waiting</p>
        </div>
      )}

      <p className="mt-4 text-center" style={{ fontSize: 12, color: '#9E9A94' }}>You won't be charged yet</p>
    </div>
  )
}
