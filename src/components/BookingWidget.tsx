'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function MiniCalendar({ selected, onSelect }: { selected: string | null; onSelect: (d: string) => void }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const toStr = (d: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded hover:bg-ivory transition-colors">
          <ChevronLeft size={13} style={{ color: '#111111' }} />
        </button>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center rounded hover:bg-ivory transition-colors">
          <ChevronRight size={13} style={{ color: '#111111' }} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="flex items-center justify-center" style={{ height: 26, fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} style={{ width: 32, height: 32 }} />
          const ds = toStr(day)
          const isPast = ds < todayStr
          const isToday = ds === todayStr
          const isSel = ds === selected
          return (
            <button
              key={ds}
              disabled={isPast}
              onClick={() => !isPast && onSelect(ds)}
              style={{
                width: 32, height: 32, borderRadius: 6, margin: '0 auto',
                fontFamily: 'var(--font-inter)', fontSize: 12,
                fontWeight: isSel ? 600 : 400,
                backgroundColor: isSel ? '#111111' : 'transparent',
                color: isSel ? 'white' : '#111111',
                border: isToday && !isSel ? '2px solid #C8A97E' : '1px solid transparent',
                opacity: isPast ? 0.3 : 1,
                cursor: isPast ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 0.15s',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function BookingWidget({ price, slug }: { price: number; slug?: string }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [guests, setGuests] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)

  const formatted = price.toLocaleString('id-ID')

  return (
    <div className="bg-white rounded-xl p-6 sticky top-24" style={{ border: '1px solid #E8E4DE' }}>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>From</span>
      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', marginTop: 2 }}>
        <span style={{ color: '#C8A97E' }}>IDR</span> {formatted}
      </p>

      <div className="mt-5">
        <p className="mb-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>Select date</p>
        <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} />
      </div>

      <div className="mt-5">
        <p className="mb-1.5" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>Guests</p>
        <select
          value={guests}
          onChange={e => setGuests(Number(e.target.value))}
          className="w-full px-3 py-2.5 rounded-md outline-none appearance-none cursor-pointer hover:border-gold transition-colors"
          style={{ border: '1px solid #E8E4DE', fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', backgroundColor: 'white' }}
        >
          {[1,2,3,4,5,6,7,8].map(n => (
            <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
          ))}
        </select>
      </div>

      {selectedDate && (
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
          <div className="flex justify-between">
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>
              IDR {formatted} × {guests} guest{guests > 1 ? 's' : ''}
            </span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>
              IDR {(price * guests).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}

      <a
        href={
          selectedDate
            ? `/checkout?slug=${slug ?? ''}&date=${selectedDate}&guests=${guests}`
            : '/checkout'
        }
        className="w-full mt-4 flex items-center justify-center font-medium hover:opacity-90 transition-opacity"
        style={{ height: 44, backgroundColor: '#111111', color: 'white', borderRadius: 8, fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'flex' }}
      >
        {selectedDate ? 'Book this experience' : 'Check availability'}
      </a>

      <button
        className="w-full mt-3 flex items-center justify-center gap-1.5 hover:opacity-70 transition-opacity"
        onClick={() => setWishlisted(!wishlisted)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}
      >
        <Heart size={13} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#6F675C'} />
        {wishlisted ? 'Saved to wishlist' : '♡ Add to wishlist'}
      </button>
    </div>
  )
}
