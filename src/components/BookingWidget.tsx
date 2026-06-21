'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Heart, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getExperienceScheduleAction, getBookedSlotsAction, toggleWishlistAction } from '@/lib/actions'
import { useLanguage } from '@/contexts/LanguageContext'

const WISHLIST_KEY = 'balible_wishlist'
function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]') } catch { return [] }
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

type ScheduleDay = { day: string; enabled: boolean; open: string; close: string }

function dowToScheduleIdx(dow: number) {
  return dow === 0 ? 6 : dow - 1
}

function parseTimeMins(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function parseDurationMins(dur: string): number {
  const num = parseFloat(dur)
  if (isNaN(num)) return 120
  // treat as hours if > 0 and < 24, otherwise minutes
  return dur.toLowerCase().includes('min') ? Math.round(num) : Math.round(num * 60)
}

function minsToLabel(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function generateSlots(open: string, close: string, durMins: number): string[] {
  const start = parseTimeMins(open)
  const end   = parseTimeMins(close)
  const slots: string[] = []
  for (let t = start; t + durMins <= end; t += 30) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`)
  }
  return slots
}

function MiniCalendar({
  selected, onSelect, schedule, blockedDates = [],
}: {
  selected: string | null
  onSelect: (d: string) => void
  schedule: ScheduleDay[] | null
  blockedDates?: string[]
}) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const toStr = (d: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const hasSchedule = schedule && schedule.some(d => d.enabled)

  const isAvailable = (d: number) => {
    const dateStr = toStr(d)
    if (blockedDates.includes(dateStr)) return false
    if (!hasSchedule) return true
    const dow = new Date(year, month, d).getDay()
    return schedule![dowToScheduleIdx(dow)].enabled
  }

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const prev = () => { if (isCurrentMonth) return; if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} disabled={isCurrentMonth} className="w-6 h-6 flex items-center justify-center rounded hover:bg-ivory transition-colors" style={{ opacity: isCurrentMonth ? 0.25 : 1, cursor: isCurrentMonth ? 'default' : 'pointer' }}>
          <ChevronLeft size={13} style={{ color: '#111111' }} />
        </button>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={next} className="w-6 h-6 flex items-center justify-center rounded hover:bg-ivory transition-colors">
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
          const unavailable = !isAvailable(day)
          const disabled = isPast || unavailable
          const isToday = ds === todayStr
          const isSel = ds === selected
          return (
            <button key={ds} disabled={disabled} onClick={() => !disabled && onSelect(ds)}
              title={unavailable && !isPast ? 'Closed on this day' : undefined}
              style={{
                width: 32, height: 32, borderRadius: 6, margin: '0 auto',
                fontFamily: 'var(--font-inter)', fontSize: 12,
                fontWeight: isSel ? 600 : 400,
                backgroundColor: isSel ? '#111111' : 'transparent',
                color: isSel ? 'white' : unavailable ? '#C8C4BE' : '#111111',
                border: isToday && !isSel ? '2px solid #C8A97E' : '1px solid transparent',
                opacity: isPast ? 0.3 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 0.15s',
                textDecoration: unavailable && !isPast ? 'line-through' : 'none',
              }}>
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function BookingWidget({ price, slug, duration, maxGuests = 8, embedded = false, rating, totalReviews, blockedDates = [] }: { price: number; slug?: string; duration?: string; maxGuests?: number; embedded?: boolean; rating?: number; totalReviews?: number; blockedDates?: string[] }) {
  const { t } = useLanguage()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [guests, setGuests] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const { status } = useSession()
  const [schedule, setSchedule] = useState<ScheduleDay[] | null>(null)
  const [bookedGuests, setBookedGuests] = useState<Record<string, number>>({})

  const effectivePrice     = price
  const effectiveDuration  = duration
  const effectiveMaxGuests = maxGuests

  const getNow = () => {
    const n = new Date()
    return {
      todayStr: `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`,
      nowMins: n.getHours() * 60 + n.getMinutes(),
    }
  }
  const [currentTime, setCurrentTime] = useState(getNow)

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(getNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Initialise wishlist state from localStorage
  useEffect(() => {
    if (!slug) return
    setWishlisted(getWishlist().includes(slug))
  }, [slug])

  useEffect(() => {
    if (!slug) return
    getExperienceScheduleAction(slug).then(s => { if (s) setSchedule(s as ScheduleDay[]) })
  }, [slug])

  // Reload booked guest counts whenever the selected date changes
  useEffect(() => {
    if (!slug || !selectedDate) { setBookedGuests({}); return }
    getBookedSlotsAction(slug, selectedDate).then(setBookedGuests)
  }, [slug, selectedDate])

  // Clear selected date/time if no longer available
  useEffect(() => {
    if (!selectedDate || !schedule) return
    const idx = dowToScheduleIdx(new Date(selectedDate + 'T12:00:00').getDay())
    if (!schedule[idx]?.enabled) { setSelectedDate(null); setSelectedTime(null) }
  }, [schedule, selectedDate])

  // Clear selectedTime if it's in the past or fully booked
  useEffect(() => {
    if (!selectedDate || !selectedTime) return
    const { todayStr, nowMins } = currentTime
    const pastCheck = selectedDate === todayStr && parseTimeMins(selectedTime) <= nowMins
    const fullCheck = (bookedGuests[selectedTime] ?? 0) >= effectiveMaxGuests
    if (pastCheck || fullCheck) setSelectedTime(null)
  }, [selectedDate, selectedTime, bookedGuests, currentTime, effectiveMaxGuests])

  // When a time slot is picked, clamp guest count to remaining capacity
  const handleTimeSelect = (slot: string) => {
    setSelectedTime(prev => {
      if (prev === slot) return null
      const remaining = effectiveMaxGuests - (bookedGuests[slot] ?? 0)
      setGuests(g => Math.min(g, remaining))
      return slot
    })
  }

  // Clear time when date changes
  const handleDateSelect = (d: string) => {
    setSelectedDate(d)
    setSelectedTime(null)
  }

  const formatted = effectivePrice.toLocaleString('id-ID')
  const hasSchedule = schedule && schedule.some(d => d.enabled)

  const daySchedule = (() => {
    if (!selectedDate || !schedule) return null
    const row = schedule[dowToScheduleIdx(new Date(selectedDate + 'T12:00:00').getDay())]
    return row?.enabled ? row : null
  })()

  const durMins = effectiveDuration ? parseDurationMins(effectiveDuration) : 120
  const { todayStr, nowMins } = currentTime

  const allTimeSlots = (daySchedule
    ? generateSlots(daySchedule.open, daySchedule.close, durMins)
    : selectedDate
      ? generateSlots('08:00', '20:00', durMins)
      : []
  ).filter(slot => selectedDate !== todayStr || parseTimeMins(slot) > nowMins)

  const slots = allTimeSlots.filter(slot =>
    (bookedGuests[slot] ?? 0) + guests <= effectiveMaxGuests
  )

  // Max remaining spots across all time slots for the selected date
  const maxRemaining = allTimeSlots.length > 0
    ? Math.max(...allTimeSlots.map(slot => effectiveMaxGuests - (bookedGuests[slot] ?? 0)))
    : 0
  const noSlotsForGuests = selectedDate && allTimeSlots.length > 0 && slots.length === 0 && maxRemaining > 0

  const endTimeLabel = (slot: string) => {
    const end = parseTimeMins(slot) + durMins
    return minsToLabel(end)
  }

  return (
    <div className={embedded ? '' : 'bg-white rounded-xl p-6 sticky top-24'} style={embedded ? {} : { border: '1px solid #E8E4DE' }}>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>From</span>
      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', marginTop: 2 }}>
        <span style={{ color: '#C8A97E' }}>IDR</span> {formatted}
      </p>
      {rating !== undefined && totalReviews !== undefined && totalReviews > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <span style={{ color: '#C8A97E', fontSize: 13, lineHeight: 1 }}>★</span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 700, color: '#111111' }}>{rating.toFixed(1)}</span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>({totalReviews} reviews)</span>
        </div>
      )}

      {hasSchedule && (
        <div className="mt-3 flex flex-wrap gap-1">
          {schedule!.map(d => (
            <span key={d.day} style={{
              padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500,
              backgroundColor: d.enabled ? '#F0EDE8' : 'transparent',
              color: d.enabled ? '#111111' : '#C8C4BE',
              border: d.enabled ? '1px solid #E8E4DE' : '1px solid transparent',
            }}>{d.day}</span>
          ))}
        </div>
      )}

      {/* Date picker */}
      <div className="mt-5">
        <p className="mb-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>Select date</p>
        <MiniCalendar selected={selectedDate} onSelect={handleDateSelect} schedule={schedule} blockedDates={blockedDates} />
      </div>

      {/* Time slots — shown after a date is selected */}
      {selectedDate && slots.length > 0 && (
        <div className="mt-5">
          <p className="mb-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>
            Select time {effectiveDuration && <span style={{ color: '#9E9A94' }}>· {effectiveDuration}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {slots.map(slot => {
              const isSel = slot === selectedTime
              const remaining = effectiveMaxGuests - (bookedGuests[slot] ?? 0)
              const isAlmostFull = remaining <= 3
              return (
                <button key={slot} onClick={() => handleTimeSelect(slot)}
                  style={{
                    padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: isSel ? 600 : 400,
                    backgroundColor: isSel ? '#111111' : 'white',
                    color: isSel ? 'white' : '#111111',
                    border: isSel ? '1px solid #111111' : '1px solid #E8E4DE',
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: 'var(--font-inter)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                    lineHeight: 1.2,
                  }}>
                  <span>
                    {minsToLabel(parseTimeMins(slot))}
                    {isSel && <span style={{ opacity: 0.65, marginLeft: 4, fontSize: 11 }}>→ {endTimeLabel(slot)}</span>}
                  </span>
                  <span style={{
                    fontSize: 9,
                    color: isSel ? 'rgba(255,255,255,0.65)' : isAlmostFull ? '#B66A45' : '#B0AA9E',
                    fontWeight: 400,
                  }}>
                    {remaining} left
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedDate && slots.length === 0 && !noSlotsForGuests && (
        <p style={{ fontSize: 12, color: '#B66A45', marginTop: 12 }}>No available slots for this date.</p>
      )}

      {noSlotsForGuests && (
        <div className="flex items-start gap-2 mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FEF3ED', border: '1px solid #F5C9AE' }}>
          <AlertCircle size={15} style={{ color: '#B66A45', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#B66A45', marginBottom: 2 }}>
              Not enough spots for {guests} guests
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#9E5A35' }}>
              Only {maxRemaining} spot{maxRemaining !== 1 ? 's' : ''} remaining for this date. Please select {maxRemaining === 1 ? '1 guest' : `up to ${maxRemaining} guests`} to see available times.
            </p>
          </div>
        </div>
      )}

      {/* Guests */}
      <div className="mt-5">
        <p className="mb-1.5" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{t('guests')}</p>
        <select value={guests} onChange={e => setGuests(Number(e.target.value))}
          className="w-full px-3 py-2.5 rounded-md outline-none appearance-none cursor-pointer"
          style={{ border: '1px solid #E8E4DE', fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', backgroundColor: 'white' }}>
          {Array.from(
            { length: selectedTime
                ? effectiveMaxGuests - (bookedGuests[selectedTime] ?? 0)
                : effectiveMaxGuests },
            (_, i) => i + 1
          ).map(n => (
            <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      {selectedDate && selectedTime && (
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
          <div className="flex justify-between mb-1">
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{t('date_time')}</span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#111111' }}>
              {minsToLabel(parseTimeMins(selectedTime))} – {endTimeLabel(selectedTime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>
              IDR {formatted} × {guests} guest{guests > 1 ? 's' : ''}
            </span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>
              IDR {(effectivePrice * guests).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}

      <a
        href={
          selectedDate && selectedTime
            ? `/checkout?slug=${slug ?? ''}&date=${selectedDate}&time=${selectedTime}&guests=${guests}&maxGuests=${effectiveMaxGuests}`
            : '#'
        }
        onClick={e => { if (!selectedDate || !selectedTime) e.preventDefault() }}
        className="w-full mt-4 flex items-center justify-center font-medium hover:opacity-90 transition-opacity"
        style={{
          height: 44, borderRadius: 8, fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 500,
          textDecoration: 'none', display: 'flex',
          backgroundColor: selectedDate && selectedTime ? '#111111' : '#E8E4DE',
          color: selectedDate && selectedTime ? 'white' : '#9E9A94',
          cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed',
        }}>
        {!selectedDate ? t('select_date') : !selectedTime ? t('select_time') : t('book_experience')}
      </a>

      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#4A7C59', textAlign: 'center', marginTop: 10 }}>
        ✓ {t('free_cancel_24h')}
      </p>

      {slug && (
        <button
          className="w-full mt-3 flex items-center justify-center gap-1.5 hover:opacity-70 transition-opacity"
          onClick={async () => {
            const next = !wishlisted
            setWishlisted(next)
            const list = getWishlist()
            const updated = next ? [...list, slug] : list.filter(s => s !== slug)
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
            window.dispatchEvent(new CustomEvent('balible:wishlist', { detail: { slug, saved: next } }))
            if (status === 'authenticated') await toggleWishlistAction(slug)
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}
        >
          <Heart size={13} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#6F675C'} />
          {wishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
        </button>
      )}
    </div>
  )
}
