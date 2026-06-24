'use client'

import { useState } from 'react'

export default function ForHostsEarnings() {
  const [guests, setGuests]     = useState(2)
  const [price, setPrice]       = useState(500000)
  const [sessions, setSessions] = useState(10)

  const gross = price * guests * sessions
  const net   = Math.round(gross * 0.85)

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8" style={{ border: '1px solid #E8E4DE' }}>
      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', marginBottom: 6 }}>
        Estimate your earnings
      </h3>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginBottom: 24 }}>
        Adjust the sliders to see what you could earn each month.
      </p>

      <div className="space-y-6">
        {[
          { label: 'Price per person (IDR)',  value: price,    set: setPrice,    min: 100000, max: 2000000, step: 50000,  fmt: (v: number) => `IDR ${(v/1000).toFixed(0)}K` },
          { label: 'Guests per session',      value: guests,   set: setGuests,   min: 1,      max: 20,      step: 1,      fmt: (v: number) => `${v} guests` },
          { label: 'Sessions per month',      value: sessions, set: setSessions, min: 1,      max: 30,      step: 1,      fmt: (v: number) => `${v} sessions` },
        ].map(({ label, value, set, min, max, step, fmt }) => (
          <div key={label}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 700, color: '#C8A97E' }}>{fmt(value)}</span>
            </div>
            <input
              type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              className="w-full price-range"
              style={{ position: 'relative', top: 0 }}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-xl" style={{ backgroundColor: '#F5F1EB' }}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>Estimated monthly earnings</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 700, color: '#111111' }}>
            IDR {(net / 1_000_000).toFixed(1)}M
          </span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A7C59' }}>after 15% fee</span>
        </div>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginTop: 4 }}>
          Gross: IDR {(gross / 1_000_000).toFixed(1)}M · You keep 85%
        </p>
      </div>
    </div>
  )
}
