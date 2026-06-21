'use client'

import { useState } from 'react'
import { Ticket } from 'lucide-react'

export default function EventBookingCard({
  slug, title, image, location, dateStr, timeStr, price, feeRate,
}: {
  slug: string
  title: string
  image: string
  location: string
  dateStr: string
  timeStr: string
  price: number
  feeRate: number
}) {
  const [tickets, setTickets] = useState(1)

  const sub   = price * tickets
  const fee   = price === 0 ? 0 : Math.round(sub * feeRate)
  const total = sub + fee

  function reserve() {
    const qs = new URLSearchParams({
      type: 'event', slug, title, image, location,
      date: dateStr, time: timeStr,
      price: String(price), feeRate: String(feeRate),
      tickets: String(tickets),
    })
    window.location.href = `/checkout?${qs}`
  }

  return (
    <>
      {price > 0 && (
        <div className="mb-5">
          <label style={{ fontSize: 11, fontWeight: 700, color: '#9E9A94', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
            Number of tickets
          </label>
          <div className="flex items-center gap-3" style={{ background: '#F9F7F5', borderRadius: 10, padding: '8px 12px', border: '1px solid #E8E4DE', width: 'fit-content' }}>
            <button
              onClick={() => setTickets(t => Math.max(1, t - 1))}
              style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #E8E4DE', background: 'white', cursor: 'pointer', fontSize: 18, color: '#6F675C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              −
            </button>
            <span style={{ minWidth: 50, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#111111' }}>
              {tickets} ticket{tickets > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setTickets(t => t + 1)}
              style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #E8E4DE', background: 'white', cursor: 'pointer', fontSize: 18, color: '#6F675C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              +
            </button>
          </div>
        </div>
      )}

      {price > 0 && (
        <div className="mb-5" style={{ background: '#F9F7F5', borderRadius: 10, padding: '12px 14px', border: '1px solid #EAE6E0' }}>
          <div className="flex justify-between mb-2" style={{ fontSize: 13, color: '#6F675C' }}>
            <span>IDR {price.toLocaleString('id-ID')} × {tickets} ticket{tickets > 1 ? 's' : ''}</span>
            <span style={{ color: '#111111' }}>IDR {sub.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between mb-3" style={{ fontSize: 13, color: '#6F675C' }}>
            <span>Service fee ({Math.round(feeRate * 100)}%)</span>
            <span style={{ color: '#111111' }}>IDR {fee.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between" style={{ fontSize: 14, fontWeight: 700, color: '#111111', borderTop: '1px solid #E2DDD6', paddingTop: 10 }}>
            <span>Total</span>
            <span>IDR {total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}

      <button
        onClick={reserve}
        style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', background: '#111111', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Ticket size={16} />
        {price === 0 ? 'Register — Free' : 'Book tickets'}
      </button>
      <p className="text-center mt-3" style={{ fontSize: 11, color: '#C8C4BE' }}>
        Free cancellation up to 24h before the event
      </p>
    </>
  )
}
