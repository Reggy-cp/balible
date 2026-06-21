'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChevronUp, Shield, Award, Clock, Edit2, Lock, MapPin } from 'lucide-react'
import Image from 'next/image'
import MobileNav from '@/components/MobileNav'
import { createBookingAction, createRentalBookingAction, getExperienceForCheckout, getBookingStatusAction, getExperienceScheduleAction, getBookedSlotsAction, type ExpCheckoutMeta } from '@/lib/actions'
import { createEventBookingAction } from '@/lib/event-actions'

const STEPS = ['Experience & Date', 'Your Details', 'Payment', 'Confirmation']
type Step = 0 | 1 | 2 | 3

// ── Experience lookup (loaded from DB) ────────────────────────────────────────

const LOADING_META: ExpCheckoutMeta = { title: 'Loading…', area: '', price: 0, image: '', serviceFeeRate: 0.1, meetingPoint: '', minGuests: 1, maxGuests: 8, blockedDates: [] }

function formatDate(s: string): string {
  if (!s) return 'Date not selected'
  const [y, m, d] = s.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function formatTime(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function genRef(slug: string, date: string) {
  const hash = (slug + date).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return `BAL-${date.replace(/-/g, '').slice(2) || '000000'}-${(hash % 9000 + 1000)}`
}

// ── Time-slot helpers ─────────────────────────────────────────────────────────

type ScheduleDay = { day: string; enabled: boolean; open: string; close: string }

function parseTimeMins(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function generateSlots(open: string, close: string, bookedGuests: Record<string, number>, maxGuests: number): string[] {
  const start = parseTimeMins(open), end = parseTimeMins(close)
  const slots: string[] = []
  for (let t = start; t < end; t += 30) {
    const key = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
    if ((bookedGuests[key] ?? 0) < maxGuests) slots.push(key)
  }
  return slots
}

// ── Shared types ───────────────────────────────────────────────────────────────

type BookingData = {
  title: string; area: string; image: string; meetingPoint: string
  date: string; time: string; rawTime: string
  pricePerPerson: number; serviceFeeRate: number
  slug: string; rawDate: string; maxGuests: number; minGuests: number
}

// ── Step indicator ─────────────────────────────────────────────────────────────

const STEP_SHORT = ['Details', 'Info', 'Pay', 'Done']

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center mb-6">
      {STEPS.map((label, i) => {
        const done = i < current, active = i === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: done ? '#4A7C59' : active ? '#111111' : '#E8E4DE', color: done || active ? 'white' : '#6F675C', fontSize: 11, fontFamily: 'var(--font-inter)' }}
              >
                {done ? '✓' : i + 1}
              </div>
              {/* short label on mobile, full label on sm+ */}
              <span className="hidden xs:inline sm:hidden" style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: active ? 600 : 400, color: active ? '#111111' : done ? '#4A7C59' : '#9E9A94', whiteSpace: 'nowrap' }}>
                {STEP_SHORT[i]}
              </span>
              <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#111111' : done ? '#4A7C59' : '#6F675C', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-1.5 sm:mx-3" style={{ height: 1, backgroundColor: i < current ? '#4A7C59' : '#E8E4DE', minWidth: 8 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Mobile compact summary ─────────────────────────────────────────────────────

function MobileBookingSummary({ booking, guests, total, editing, onEdit }: { booking: BookingData; guests: number; total: number; editing?: boolean; onEdit: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
      {/* Always-visible row */}
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 p-4" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <img src={booking.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.title}</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', margin: 0 }}>{booking.date}{booking.time ? ` · ${booking.time}` : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 700, color: '#111111' }}>IDR {total.toLocaleString('id-ID')}</span>
          <ChevronUp size={15} style={{ color: '#6F675C', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
        </div>
      </button>
      {/* Expandable detail */}
      {open && (
        <div style={{ borderTop: '1px solid #E8E4DE', padding: '12px 16px' }}>
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontSize: 12, color: '#6F675C' }}>Guests</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#111111' }}>{guests} guest{guests > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span style={{ fontSize: 12, color: '#6F675C' }}>Service fee ({Math.round(booking.serviceFeeRate * 100)}%)</span>
            <span style={{ fontSize: 13, color: '#111111' }}>IDR {Math.round(booking.pricePerPerson * guests * booking.serviceFeeRate).toLocaleString('id-ID')}</span>
          </div>
          {!editing && (
            <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8A97E', fontSize: 13, fontFamily: 'var(--font-inter)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
              <Edit2 size={12} /> Edit booking details
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Booking summary sidebar ────────────────────────────────────────────────────

function BookingSummary({ booking, guests, editing, onEdit, numSlots = 1, numDates = 1, rawDate, extraDates = [] }: { booking: BookingData; guests: number; editing?: boolean; onEdit: () => void; numSlots?: number; numDates?: number; rawDate?: string; extraDates?: string[] }) {
  const sub = booking.pricePerPerson * guests * numSlots * numDates
  const fee = Math.round(sub * booking.serviceFeeRate)
  const total = sub + fee

  return (
    <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE', position: 'sticky', top: 88 }}>
      <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 16 }}>Booking Summary</h3>

      <div className="flex gap-3 pb-4" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <img src={booking.image} alt={booking.title} className="flex-shrink-0 rounded-lg object-cover" style={{ width: 72, height: 72 }} />
        <div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 600, color: '#111111', lineHeight: 1.3 }}>{booking.title}</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginTop: 3 }}>{booking.area}</p>
        </div>
      </div>

      <div className="py-4" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex justify-between items-start">
          <div>
            {[
              { label: 'Date',   value: extraDates.length > 0 ? [rawDate ?? '', ...extraDates].sort().map(d => { const parts = d.split('-'); return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+(parts[1]??'1')-1]} ${+(parts[2]??'1')}` }).join(', ') : booking.date },
              ...(booking.time ? [{ label: 'Time', value: booking.time }] : []),
              { label: 'Guests', value: `${guests} guest${guests > 1 ? 's' : ''}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-1.5 mb-1">
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', width: 40 }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
          {!editing && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8A97E', fontSize: 13, fontFamily: 'var(--font-inter)' }}
            >
              <Edit2 size={12} /> Edit
            </button>
          )}
        </div>
      </div>

      {booking.meetingPoint && (
        <div className="py-4" style={{ borderBottom: '1px solid #E8E4DE' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 600, color: '#6F675C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Meeting point</p>
          <div className="flex items-start gap-2">
            <MapPin size={13} style={{ color: '#C8A97E', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', lineHeight: 1.5 }}>{booking.meetingPoint}</p>
          </div>
        </div>
      )}

      <div className="pt-4 space-y-2">
        <div className="flex justify-between">
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>
            IDR {booking.pricePerPerson.toLocaleString('id-ID')} × {guests} guest{guests > 1 ? 's' : ''}{numSlots * numDates > 1 ? ` × ${numSlots * numDates} sessions` : ''}
          </span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>IDR {sub.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>Service fee ({Math.round(booking.serviceFeeRate * 100)}%)</span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>IDR {fee.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #E8E4DE', marginTop: 4 }}>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111' }}>Total</span>
          <div className="text-right">
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>IDR {total.toLocaleString('id-ID')}</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>Taxes included</p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 space-y-2.5" style={{ borderTop: '1px solid #E8E4DE' }}>
        {[
          { Icon: Shield, text: 'Secure SSL payment' },
          { Icon: Clock,  text: 'Free cancellation within 24h' },
          { Icon: Award,  text: 'Instant booking confirmation' },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon size={13} style={{ color: '#4A7C59' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A7C59', fontWeight: 500 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 1: Experience & Date ──────────────────────────────────────────────────

function StepExperience({ booking, guests, setGuests, onNext, slots, selectedRawTimes, setSelectedRawTimes, dayDisabled }: {
  booking: BookingData; guests: number; setGuests: (n: number) => void; onNext: () => void
  slots: string[]; selectedRawTimes: string[]; setSelectedRawTimes: (t: string[]) => void; dayDisabled?: boolean
}) {
  return (
    <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
      <div className="flex justify-between items-start mb-5">
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>1. Experience &amp; Date</h2>
        <ChevronUp size={18} style={{ color: '#6F675C' }} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 6 }}>Experience</label>
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ border: '1px solid #E8E4DE', backgroundColor: '#F5F1EB' }}>
            <img src={booking.image} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{booking.title}</p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{booking.area}</p>
            </div>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 6 }}>Date</label>
          <div className="p-3 rounded-lg" style={{ border: '1px solid #E8E4DE', backgroundColor: '#F5F1EB' }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{booking.date}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 8 }}>Time</label>
        {dayDisabled ? (
          <div className="p-3 rounded-lg" style={{ border: '1px solid #E8C4C4', backgroundColor: '#FBEFEF' }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#C0504D' }}>
              This experience is not available on the selected date. Please go back and choose a different date.
            </p>
          </div>
        ) : slots.length > 0 ? (
          <div className="flex flex-wrap gap-2 overflow-y-auto" style={{ maxHeight: 140 }}>
            {slots.map(slot => {
              const isSel = selectedRawTimes.includes(slot)
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedRawTimes(isSel ? selectedRawTimes.filter(t => t !== slot) : [...selectedRawTimes, slot])}
                  style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: isSel ? 600 : 400,
                    backgroundColor: isSel ? '#111111' : 'white',
                    color: isSel ? 'white' : '#111111',
                    border: `1px solid ${isSel ? '#111111' : '#E8E4DE'}`,
                    cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'all 0.15s',
                  }}
                >
                  {formatTime(slot)}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="p-3 rounded-lg" style={{ border: '1px solid #E8E4DE', backgroundColor: '#F5F1EB' }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>
              {booking.time || 'No time available'}
            </p>
          </div>
        )}
      </div>

      <div className="mb-5">
        <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 6 }}>Participants</label>
        <select
          value={guests}
          onChange={e => setGuests(Number(e.target.value))}
          className="outline-none"
          style={{ height: 44, border: '1px solid #E8E4DE', borderRadius: 8, padding: '0 14px', fontSize: 14, color: '#111111', backgroundColor: 'white', width: '100%', cursor: 'pointer' }}
        >
          {Array.from({ length: booking.maxGuests - booking.minGuests + 1 }, (_, i) => booking.minGuests + i).map(n => (
            <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
          ))}
        </select>
        {booking.minGuests > 1 && (
          <p style={{ fontSize: 12, color: '#6F675C', marginTop: 5 }}>Minimum {booking.minGuests} guests required for this experience.</p>
        )}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: '#F0F7F2' }}>
        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#4A7C59' }}>
          <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>✓</span>
        </div>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A7C59' }}>Your booking will be confirmed instantly.</p>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-lg mb-6" style={{ backgroundColor: '#FDF8F4' }}>
        <Clock size={14} style={{ color: '#C8A97E', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>Free cancellation up to 24 hours before the experience.</p>
      </div>

      <button
        onClick={onNext}
        disabled={dayDisabled || (slots.length > 0 && selectedRawTimes.length === 0)}
        className="w-full flex items-center justify-center hover:opacity-90 transition-opacity"
        style={{
          height: 48,
          backgroundColor: (dayDisabled || (slots.length > 0 && selectedRawTimes.length === 0)) ? '#E8E4DE' : '#111111',
          color: (dayDisabled || (slots.length > 0 && selectedRawTimes.length === 0)) ? '#9E9A94' : 'white',
          borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none',
          cursor: (dayDisabled || (slots.length > 0 && selectedRawTimes.length === 0)) ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-inter)',
        }}
      >
        {dayDisabled ? 'Date not available' : slots.length > 0 && selectedRawTimes.length === 0 ? 'Select a time to continue' : 'Continue to Details →'}
      </button>
    </div>
  )
}

// ── Step 2: Your Details ───────────────────────────────────────────────────────

type ContactFields = { fullName: string; email: string; phone: string; requests: string }

function StepDetails({ contact, setContact, onNext }: { contact: ContactFields; setContact: (c: ContactFields) => void; onNext: () => void }) {
  const [errors, setErrors] = useState({ fullName: '', email: '' })
  const set = (k: keyof ContactFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContact({ ...contact, [k]: e.target.value })
    if (k === 'fullName' || k === 'email') setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const handleNext = () => {
    const errs = { fullName: '', email: '' }
    if (!contact.fullName.trim()) errs.fullName = 'Full name is required'
    if (!contact.email.trim()) errs.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) errs.email = 'Enter a valid email address'
    if (errs.fullName || errs.email) { setErrors(errs); return }
    onNext()
  }

  return (
    <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
      <div className="flex justify-between items-start mb-5">
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>2. Your Details</h2>
        <ChevronUp size={18} style={{ color: '#6F675C' }} />
      </div>
      <div className="space-y-4">
        {([
          { id: 'fullName', label: 'Full name',                   placeholder: 'Sarah Kim',                                     type: 'text' },
          { id: 'email',    label: 'Email address',               placeholder: 'sarah@example.com',                             type: 'email' },
          { id: 'phone',    label: 'Phone number (optional)',     placeholder: '+62 812 3456 7890',                             type: 'tel' },
          { id: 'requests', label: 'Special requests (optional)', placeholder: 'Any dietary requirements, accessibility needs…', type: 'textarea' },
        ] as { id: keyof ContactFields; label: string; placeholder: string; type: string }[]).map(f => (
          <div key={f.id}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 6 }}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                value={contact[f.id]} onChange={set(f.id)}
                placeholder={f.placeholder} rows={3} className="w-full outline-none resize-none"
                style={{ border: '1px solid #E8E4DE', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#111111', backgroundColor: 'white', fontFamily: 'var(--font-inter)' }}
                onFocus={e => (e.target.style.borderColor = '#C8A97E')}
                onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
              />
            ) : (
              <input
                type={f.type} value={contact[f.id]} onChange={set(f.id)}
                placeholder={f.placeholder} className="w-full outline-none"
                style={{ height: 44, border: `1px solid ${errors[f.id as 'fullName' | 'email'] ? '#C0504D' : '#E8E4DE'}`, borderRadius: 8, padding: '0 14px', fontSize: 14, color: '#111111', backgroundColor: 'white' }}
                onFocus={e => (e.target.style.borderColor = errors[f.id as 'fullName' | 'email'] ? '#C0504D' : '#C8A97E')}
                onBlur={e => (e.target.style.borderColor = errors[f.id as 'fullName' | 'email'] ? '#C0504D' : '#E8E4DE')}
              />
            )}
            {errors[f.id as 'fullName' | 'email'] && (
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#C0504D', marginTop: 4 }}>
                {errors[f.id as 'fullName' | 'email']}
              </p>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleNext}
        className="w-full flex items-center justify-center hover:opacity-90 transition-opacity mt-6"
        style={{ height: 48, backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
      >
        Continue to Payment →
      </button>
    </div>
  )
}

// ── Step 3: Payment ────────────────────────────────────────────────────────────

function StepPayment({ total, onPay, paying, error }: { total: number; onPay: () => void; paying: boolean; error: string | null }) {
  return (
    <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
      <div className="flex justify-between items-start mb-5">
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>3. Payment</h2>
        <ChevronUp size={18} style={{ color: '#6F675C' }} />
      </div>

      <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#F5F1EB' }}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.6 }}>
          You&apos;ll complete payment in a secure window powered by Midtrans.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Visa', 'Mastercard', 'GoPay', 'OVO', 'QRIS', 'Bank Transfer'].map(method => (
            <span key={method} style={{
              fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 600,
              color: '#6F675C', backgroundColor: 'white',
              border: '1px solid #E8E4DE', borderRadius: 6,
              padding: '3px 8px', letterSpacing: '0.02em',
            }}>
              {method}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg mb-5" style={{ backgroundColor: '#FBEFEF', border: '1px solid #E8C4C4' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#C0504D' }}>{error}</p>
        </div>
      )}

      <button
        onClick={onPay}
        disabled={paying}
        className="w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        style={{ height: 52, backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: paying ? 'wait' : 'pointer', opacity: paying ? 0.7 : 1, fontFamily: 'var(--font-inter)' }}
      >
        <Lock size={15} />
        {paying ? 'Opening secure payment…' : `Pay IDR ${total.toLocaleString('id-ID')}`}
      </button>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', textAlign: 'center', marginTop: 10 }}>
        Payments processed securely by Midtrans
      </p>
    </div>
  )
}

// ── Step 4: Confirmation ───────────────────────────────────────────────────────

function StepConfirmation({ booking, guests, bookingRef, payStatus = 'paid' }: { booking: BookingData; guests: number; bookingRef?: string | null; payStatus?: 'paid' | 'pending' }) {
  const sub = booking.pricePerPerson * guests
  const fee = Math.round(sub * booking.serviceFeeRate)
  const total = sub + fee
  const ref = bookingRef ?? genRef(booking.slug, booking.rawDate)

  const [liveStatus, setLiveStatus] = useState<'paid' | 'pending'>(payStatus)

  // Poll booking status every 5 s while pending, stop once confirmed or after 30 min
  useEffect(() => {
    if (liveStatus !== 'pending' || !bookingRef) return
    let attempts = 0
    const MAX = 360 // 30 min at 5 s intervals
    const id = setInterval(async () => {
      attempts++
      const result = await getBookingStatusAction(bookingRef)
      if (result?.status === 'CONFIRMED') {
        setLiveStatus('paid')
        clearInterval(id)
      } else if (attempts >= MAX) {
        clearInterval(id)
      }
    }, 5000)
    return () => clearInterval(id)
  }, [bookingRef, liveStatus])

  const pending = liveStatus === 'pending'

  return (
    <div className="bg-white rounded-xl p-8 text-center" style={{ border: '1px solid #E8E4DE' }}>
      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: pending ? '#FEF9EC' : '#F0F7F2', transition: 'background-color 0.5s' }}>
        {pending
          ? <span style={{ fontSize: 28 }}>⏳</span>
          : <span style={{ fontSize: 28, color: '#4A7C59' }}>✓</span>}
      </div>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#111111', marginBottom: 8 }}>
        {pending ? 'Waiting for payment…' : 'Booking Confirmed!'}
      </h2>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', marginBottom: 6 }}>
        {pending
          ? 'Complete your transfer using the instructions from Midtrans. This page will update automatically once your payment is received.'
          : 'Your booking has been saved to your profile. A confirmation email is on its way.'}
      </p>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', marginBottom: pending ? 16 : 32 }}>
        Ref: <span style={{ fontWeight: 600, color: '#111111', letterSpacing: '0.05em' }}>{ref}</span>
      </p>

      {pending && (
        <div className="flex items-center justify-center gap-2 mb-8">
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C8A97E', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 13, color: '#C8A97E', fontWeight: 500 }}>Checking payment status…</span>
        </div>
      )}

      <div className="flex items-center gap-3 p-4 rounded-xl text-left mx-auto max-w-sm mb-8" style={{ border: '1px solid #E8E4DE', backgroundColor: '#F5F1EB' }}>
        <img src={booking.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        <div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 600, color: '#111111' }}>{booking.title}</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>{booking.date} · {booking.time}</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>{guests} guest{guests > 1 ? 's' : ''} · IDR {total.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/profile" className="flex items-center justify-center hover:opacity-90 transition-opacity" style={{ height: 44, backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '0 24px', fontFamily: 'var(--font-inter)' }}>
          View my bookings
        </a>
        <a href="/search" className="flex items-center justify-center hover:opacity-70 transition-opacity" style={{ height: 44, border: '1px solid #E8E4DE', color: '#111111', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '0 24px', fontFamily: 'var(--font-inter)' }}>
          Explore more →
        </a>
      </div>
    </div>
  )
}

// ── Rental: Step 1 summary ────────────────────────────────────────────────────

function StepRentalSummary({ title, area, image, startDate, endDate, units, periods, period, price, total, deposit, onNext }: {
  title: string; area: string; image: string
  startDate: string; endDate: string; units: number; periods: number; period: string
  price: number; total: number; deposit: number; onNext: () => void
}) {
  const fmtDate = (s: string) => {
    if (!s) return '—'
    const [y, m, d] = s.split('-').map(Number)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[m - 1]} ${d}, ${y}`
  }
  const periodLabel = (n: number) => {
    const unit = period.replace('per ', '')
    return `${n} ${unit}${n !== 1 ? 's' : ''}`
  }
  const subtotal = price * periods * units
  const fee = total - subtotal
  const feePct = subtotal > 0 ? Math.round((fee / subtotal) * 100) : 0

  return (
    <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
      <div className="flex justify-between items-start mb-5">
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>1. Rental Summary</h2>
        <ChevronUp size={18} style={{ color: '#6F675C' }} />
      </div>

      {/* Item card */}
      <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ border: '1px solid #E8E4DE', backgroundColor: '#F5F1EB' }}>
        <img src={image} alt={title} className="rounded-lg object-cover flex-shrink-0" style={{ width: 56, height: 56 }} />
        <div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 600, color: '#111111' }}>{title}</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{area}</p>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Pick-up', value: fmtDate(startDate) },
          { label: 'Return',  value: fmtDate(endDate) },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 rounded-lg" style={{ border: '1px solid #E8E4DE', backgroundColor: 'white' }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 600, color: '#9E9A94', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Period + units */}
      <div className="flex items-center gap-2 mb-5 px-1">
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>{periodLabel(periods)}</span>
        {units > 1 && <><span style={{ color: '#D1CBC2' }}>·</span><span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>{units} unit{units > 1 ? 's' : ''}</span></>}
      </div>

      {/* Price breakdown */}
      <div className="rounded-xl p-4 space-y-2 mb-5" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="flex justify-between">
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>
            IDR {price.toLocaleString('id-ID')} × {periodLabel(periods)}{units > 1 ? ` × ${units}` : ''}
          </span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>IDR {subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>Service fee ({feePct}%)</span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>IDR {fee.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #E8E4DE' }}>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 700, color: '#111111' }}>Total</span>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111' }}>IDR {total.toLocaleString('id-ID')}</span>
        </div>
        {deposit > 0 && (
          <div className="flex justify-between pt-1">
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#9E9A94' }}>+ Deposit at pickup (refundable)</span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#9E9A94' }}>IDR {deposit.toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg mb-6" style={{ backgroundColor: '#FDF8F4' }}>
        <Clock size={14} style={{ color: '#C8A97E', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>Free cancellation up to 24 hours before your pick-up date.</p>
      </div>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center hover:opacity-90 transition-opacity"
        style={{ height: 48, backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
      >
        Continue to Details →
      </button>
    </div>
  )
}

// ── Rental: Booking summary sidebar ──────────────────────────────────────────

function RentalBookingSummary({ title, area, image, startDate, endDate, units, periods, period, price, total, deposit }: {
  title: string; area: string; image: string
  startDate: string; endDate: string; units: number; periods: number; period: string
  price: number; total: number; deposit: number
}) {
  const fmtDate = (s: string) => {
    if (!s) return '—'
    const [y, m, d] = s.split('-').map(Number)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[m - 1]} ${d}, ${y}`
  }
  const subtotal = price * periods * units
  const fee = total - subtotal
  const feePct = subtotal > 0 ? Math.round((fee / subtotal) * 100) : 0
  const periodLabel = (n: number) => { const u = period.replace('per ', ''); return `${n} ${u}${n !== 1 ? 's' : ''}` }

  return (
    <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE', position: 'sticky', top: 88 }}>
      <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 16 }}>Rental Summary</h3>
      <div className="flex gap-3 pb-4" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <img src={image} alt={title} className="flex-shrink-0 rounded-lg object-cover" style={{ width: 72, height: 72 }} />
        <div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 600, color: '#111111', lineHeight: 1.3 }}>{title}</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginTop: 3 }}>{area}</p>
        </div>
      </div>
      <div className="py-4" style={{ borderBottom: '1px solid #E8E4DE' }}>
        {[
          { label: 'Pick-up', value: fmtDate(startDate) },
          { label: 'Return',  value: fmtDate(endDate) },
          { label: 'Duration', value: periodLabel(periods) },
          ...(units > 1 ? [{ label: 'Units', value: String(units) }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5 mb-1">
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', width: 56 }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>
      <div className="pt-4 space-y-2">
        <div className="flex justify-between">
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>
            IDR {price.toLocaleString('id-ID')} × {periodLabel(periods)}{units > 1 ? ` × ${units}` : ''}
          </span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>IDR {subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>Service fee ({feePct}%)</span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>IDR {fee.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #E8E4DE', marginTop: 4 }}>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111' }}>Total</span>
          <div className="text-right">
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>IDR {total.toLocaleString('id-ID')}</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>Taxes included</p>
          </div>
        </div>
        {deposit > 0 && (
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#9E9A94', marginTop: 4 }}>
            + IDR {deposit.toLocaleString('id-ID')} deposit collected at pickup (refundable)
          </p>
        )}
      </div>
      <div className="mt-5 pt-4 space-y-2.5" style={{ borderTop: '1px solid #E8E4DE' }}>
        {[
          { Icon: Shield, text: 'Secure SSL payment' },
          { Icon: Clock,  text: 'Free cancellation within 24h' },
          { Icon: Award,  text: 'Instant booking confirmation' },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon size={13} style={{ color: '#4A7C59' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A7C59', fontWeight: 500 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Rental: Confirmation ──────────────────────────────────────────────────────

function StepRentalConfirmation({ title, area, image, startDate, endDate, units, total, bookingRef, payStatus = 'paid' }: {
  title: string; area: string; image: string
  startDate: string; endDate: string; units: number; total: number
  bookingRef?: string | null; payStatus?: 'paid' | 'pending'
}) {
  const fmtDate = (s: string) => {
    if (!s) return '—'
    const [y, m, d] = s.split('-').map(Number)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[m - 1]} ${d}, ${y}`
  }
  const ref = bookingRef ?? `BAL-${startDate.replace(/-/g, '').slice(2)}-R${Math.floor(Math.random() * 9000) + 1000}`

  const [liveStatus, setLiveStatus] = useState<'paid' | 'pending'>(payStatus)

  useEffect(() => {
    if (liveStatus !== 'pending' || !bookingRef) return
    let attempts = 0
    const MAX = 360
    const id = setInterval(async () => {
      attempts++
      const result = await getBookingStatusAction(bookingRef)
      if (result?.status === 'CONFIRMED') { setLiveStatus('paid'); clearInterval(id) }
      else if (attempts >= MAX) clearInterval(id)
    }, 5000)
    return () => clearInterval(id)
  }, [bookingRef, liveStatus])

  const pending = liveStatus === 'pending'

  return (
    <div className="bg-white rounded-xl p-8 text-center" style={{ border: '1px solid #E8E4DE' }}>
      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: pending ? '#FEF9EC' : '#F0F7F2' }}>
        {pending ? <span style={{ fontSize: 28 }}>⏳</span> : <span style={{ fontSize: 28, color: '#4A7C59' }}>✓</span>}
      </div>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#111111', marginBottom: 8 }}>
        {pending ? 'Waiting for payment…' : 'Rental Confirmed!'}
      </h2>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', marginBottom: 6 }}>
        {pending
          ? 'Complete your transfer using the instructions from Midtrans. This page will update automatically once your payment is received.'
          : 'Your rental has been saved to your profile. A confirmation email is on its way.'}
      </p>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', marginBottom: pending ? 16 : 32 }}>
        Ref: <span style={{ fontWeight: 600, color: '#111111', letterSpacing: '0.05em' }}>{ref}</span>
      </p>

      {pending && (
        <div className="flex items-center justify-center gap-2 mb-8">
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C8A97E', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 13, color: '#C8A97E', fontWeight: 500 }}>Checking payment status…</span>
        </div>
      )}

      <div className="flex items-center gap-3 p-4 rounded-xl text-left mx-auto max-w-sm mb-8" style={{ border: '1px solid #E8E4DE', backgroundColor: '#F5F1EB' }}>
        <img src={image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        <div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 600, color: '#111111' }}>{title}</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>{fmtDate(startDate)} → {fmtDate(endDate)}</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>{units} unit{units > 1 ? 's' : ''} · IDR {total.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/profile" className="flex items-center justify-center hover:opacity-90 transition-opacity" style={{ height: 44, backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '0 24px', fontFamily: 'var(--font-inter)' }}>
          View my bookings
        </a>
        <a href="/categories/rentals" className="flex items-center justify-center hover:opacity-70 transition-opacity" style={{ height: 44, border: '1px solid #E8E4DE', color: '#111111', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '0 24px', fontFamily: 'var(--font-inter)' }}>
          Browse rentals →
        </a>
      </div>
    </div>
  )
}

// ── Rental checkout flow ──────────────────────────────────────────────────────

const RENTAL_STEPS = ['Rental Summary', 'Your Details', 'Payment', 'Confirmation']

function RentalCheckout({ params }: { params: URLSearchParams }) {
  const slug       = params.get('slug')       || ''
  const startDate  = params.get('startDate')  || ''
  const endDate    = params.get('endDate')    || ''
  const units      = Math.max(1, parseInt(params.get('units')   || '1') || 1)
  const periods    = Math.max(1, parseInt(params.get('periods') || '1') || 1)
  const period     = params.get('period')     || 'per day'
  const price      = parseInt(params.get('price')   || '0') || 0
  const total      = parseInt(params.get('total')   || '0') || 0
  const deposit    = parseInt(params.get('deposit') || '0') || 0

  const title      = params.get('title')      || 'Rental'
  const image      = params.get('image')      || ''
  const area       = params.get('area')       || ''

  const [step, setStep]         = useState<Step>(0)
  const [contact, setContact]   = useState<ContactFields>({ fullName: '', email: '', phone: '', requests: '' })
  const [paying, setPaying]     = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [paidRef, setPaidRef]   = useState<string | null>(null)
  const [payStatus, setPayStatus] = useState<'paid' | 'pending'>('paid')

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!clientKey || document.getElementById('midtrans-snap')) return
    const s = document.createElement('script')
    s.id = 'midtrans-snap'
    s.src = clientKey.startsWith('SB-')
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js'
    s.setAttribute('data-client-key', clientKey)
    document.body.appendChild(s)
  }, [])

  const startPayment = async () => {
    if (paying) return
    setPaying(true)
    setPayError(null)
    try {
      const res = await createRentalBookingAction({
        slug,
        startDate,
        endDate,
        units,
        guestName: contact.fullName || 'Guest',
        guestEmail: contact.email || '',
        guestPhone: contact.phone || undefined,
        notes: contact.requests || undefined,
      })
      if (!res.ok || !res.snapToken || !res.bookingRef) {
        setPayError(res.error ?? 'Could not start payment. Please try again.')
        setPaying(false)
        return
      }
      const snap = (window as unknown as { snap?: { pay: (token: string, opts: Record<string, () => void>) => void } }).snap
      if (!snap) {
        setPayError('The payment window failed to load. Please refresh and try again.')
        setPaying(false)
        return
      }
      const ref = res.bookingRef
      snap.pay(res.snapToken, {
        onSuccess: () => { setPaidRef(ref); setPayStatus('paid'); setStep(3); setPaying(false) },
        onPending: () => { setPaidRef(ref); setPayStatus('pending'); setStep(3); setPaying(false) },
        onError:   () => { setPayError('Payment failed — you have not been charged. Please try again.'); setPaying(false) },
        onClose:   () => { setPaying(false) },
      })
    } catch {
      setPayError('Something went wrong. Please try again.')
      setPaying(false)
    }
  }

  const rentalProps = { title, area, image, startDate, endDate, units, periods, period, price, total, deposit }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <nav className="bg-white" style={{ height: 56, borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between h-full px-6 lg:px-16 max-w-[1440px] mx-auto">
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Image src="/logo-dark.png" alt="Balible" width={120} height={36} style={{ objectFit: 'contain', height: 32, width: 'auto', display: 'block' }} priority />
          </a>
          <div className="flex items-center gap-1.5">
            <Lock size={12} style={{ color: '#4A7C59' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A7C59' }}>Secure booking</span>
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 py-6 pb-24 md:pb-10">
        <h1 className="mb-5 hidden sm:block" style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#111111' }}>
          Checkout
        </h1>

        {step < 3 && (
          <div className="flex items-center mb-6">
            {RENTAL_STEPS.map((label, i) => {
              const done = i < step, active = i === step
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: done ? '#4A7C59' : active ? '#111111' : '#E8E4DE', color: done || active ? 'white' : '#6F675C', fontSize: 11, fontFamily: 'var(--font-inter)' }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#111111' : done ? '#4A7C59' : '#6F675C', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                  </div>
                  {i < RENTAL_STEPS.length - 1 && (
                    <div className="flex-1 mx-1.5 sm:mx-3" style={{ height: 1, backgroundColor: i < step ? '#4A7C59' : '#E8E4DE', minWidth: 8 }} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Mobile compact rental summary — shown above form on steps 1–2 */}
        {step > 0 && step < 3 && (
          <div className="lg:hidden mb-4 bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
            <div className="flex items-center gap-3 p-4">
              {image && <img src={image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', margin: 0 }}>
                  {startDate && endDate ? `${startDate} → ${endDate}` : area}
                  {units > 1 ? ` · ${units} units` : ''}
                </p>
              </div>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 700, color: '#111111', flexShrink: 0 }}>
                IDR {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {step === 0 && <StepRentalSummary {...rentalProps} onNext={() => setStep(1)} />}
            {step === 1 && <StepDetails contact={contact} setContact={setContact} onNext={() => setStep(2)} />}
            {step === 2 && <StepPayment total={total} onPay={startPayment} paying={paying} error={payError} />}
            {step === 3 && <StepRentalConfirmation title={title} area={area} image={image} startDate={startDate} endDate={endDate} units={units} total={total} bookingRef={paidRef} payStatus={payStatus} />}
          </div>
          {step < 3 && (
            <div className="hidden lg:block" style={{ width: 340, flexShrink: 0 }}>
              <RentalBookingSummary {...rentalProps} />
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  )
}

// ── Event checkout flow ───────────────────────────────────────────────────────

const EVENT_STEPS = ['Event Summary', 'Your Details', 'Payment', 'Confirmation']

function EventCheckout({ params }: { params: URLSearchParams }) {
  const { data: session } = useSession()
  const slug      = params.get('slug')    || ''
  const title     = params.get('title')   || 'Event'
  const image     = params.get('image')   || ''
  const location  = params.get('location') || ''
  const dateStr   = params.get('date')    || ''
  const timeStr   = params.get('time')    || ''
  const price     = parseInt(params.get('price') || '0') || 0
  const feeRate   = parseFloat(params.get('feeRate') || '0.1') || 0.1
  const initTickets = Math.max(1, parseInt(params.get('tickets') || '1') || 1)

  const [step, setStep]         = useState<Step>(0)
  const [tickets, setTickets]   = useState(initTickets)
  const [contact, setContact]   = useState<ContactFields>({ fullName: '', email: '', phone: '', requests: '' })
  const [paying, setPaying]     = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [paidRef, setPaidRef]   = useState<string | null>(null)
  const [isFree, setIsFree]     = useState(false)

  useEffect(() => {
    if (!session?.user) return
    setContact(c => ({ ...c, fullName: c.fullName || session.user?.name || '', email: c.email || session.user?.email || '' }))
  }, [session])

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!clientKey || document.getElementById('midtrans-snap')) return
    const s = document.createElement('script')
    s.id = 'midtrans-snap'
    s.src = clientKey.startsWith('SB-') ? 'https://app.sandbox.midtrans.com/snap/snap.js' : 'https://app.midtrans.com/snap/snap.js'
    s.setAttribute('data-client-key', clientKey)
    document.body.appendChild(s)
  }, [])

  const sub   = price * tickets
  const fee   = price === 0 ? 0 : Math.round(sub * feeRate)
  const total = sub + fee

  const startPayment = async () => {
    if (paying) return
    setPaying(true)
    setPayError(null)
    try {
      const res = await createEventBookingAction({
        slug,
        tickets,
        guestName: contact.fullName || 'Guest',
        guestEmail: contact.email || '',
        guestPhone: contact.phone || undefined,
        notes: contact.requests || undefined,
      })
      if (!res.ok) {
        setPayError(res.error ?? 'Could not complete booking. Please try again.')
        setPaying(false)
        return
      }
      if (price === 0) {
        setIsFree(true)
        setPaidRef(res.bookingRef ?? null)
        setStep(3)
        setPaying(false)
        return
      }
      if (!res.snapToken || !res.bookingRef) {
        setPayError('Could not start payment. Please try again.')
        setPaying(false)
        return
      }
      const snap = (window as unknown as { snap?: { pay: (token: string, opts: Record<string, () => void>) => void } }).snap
      if (!snap) {
        setPayError('The payment window failed to load. Please refresh and try again.')
        setPaying(false)
        return
      }
      const ref = res.bookingRef
      snap.pay(res.snapToken, {
        onSuccess: () => { setPaidRef(ref); setStep(3); setPaying(false) },
        onPending: () => { setPaidRef(ref); setStep(3); setPaying(false) },
        onError:   () => { setPayError('Payment failed — you have not been charged. Please try again.'); setPaying(false) },
        onClose:   () => { setPaying(false) },
      })
    } catch {
      setPayError('Something went wrong. Please try again.')
      setPaying(false)
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <nav className="bg-white" style={{ height: 56, borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between h-full px-6 lg:px-16 max-w-[1440px] mx-auto">
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Image src="/logo-dark.png" alt="Balible" width={120} height={36} style={{ objectFit: 'contain', height: 32, width: 'auto', display: 'block' }} priority />
          </a>
          <div className="flex items-center gap-1.5">
            <Lock size={12} style={{ color: '#4A7C59' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A7C59' }}>Secure booking</span>
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 py-6 pb-24 md:pb-10">
        <h1 className="mb-5 hidden sm:block" style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#111111' }}>Checkout</h1>

        {step < 3 && (
          <div className="flex items-center mb-6">
            {EVENT_STEPS.map((label, i) => {
              const done = i < step, active = i === step
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: done ? '#4A7C59' : active ? '#111111' : '#E8E4DE', color: done || active ? 'white' : '#6F675C', fontSize: 11 }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#111111' : done ? '#4A7C59' : '#6F675C', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                  </div>
                  {i < EVENT_STEPS.length - 1 && (
                    <div className="flex-1 mx-1.5 sm:mx-3" style={{ height: 1, backgroundColor: i < step ? '#4A7C59' : '#E8E4DE', minWidth: 8 }} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {step === 0 && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E8E4DE' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>Event Summary</h2>
                <div className="flex gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid #E8E4DE' }}>
                  {image && <img src={image} alt={title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />}
                  <div>
                    <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 4 }}>{title}</p>
                    <p style={{ fontSize: 13, color: '#6F675C', marginBottom: 2 }}>📅 {dateStr}{timeStr ? ` · ${timeStr}` : ''}</p>
                    <p style={{ fontSize: 13, color: '#6F675C' }}>📍 {location}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#6F675C', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Number of tickets</label>
                  <div className="flex items-center gap-3" style={{ background: '#F9F7F5', borderRadius: 10, padding: '10px 14px', border: '1.5px solid #E2DDD6', width: 'fit-content' }}>
                    <button onClick={() => setTickets(t => Math.max(1, t - 1))}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2DDD6', background: 'white', cursor: 'pointer', fontSize: 18, color: '#6F675C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ minWidth: 60, textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#111111' }}>{tickets} ticket{tickets > 1 ? 's' : ''}</span>
                    <button onClick={() => setTickets(t => t + 1)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2DDD6', background: 'white', cursor: 'pointer', fontSize: 18, color: '#6F675C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                {price > 0 && (
                  <div className="mb-6" style={{ background: '#F9F7F5', borderRadius: 10, padding: '14px 16px', border: '1px solid #EAE6E0' }}>
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
                {price === 0 && (
                  <div className="mb-6 flex items-center gap-2" style={{ background: '#F0FAF4', border: '1px solid #B8E0C8', borderRadius: 10, padding: '12px 16px' }}>
                    <span style={{ fontSize: 14, color: '#2D6A4F', fontWeight: 600 }}>🎟 Free event — no payment required</span>
                  </div>
                )}
                <button onClick={() => setStep(1)}
                  style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', background: '#111111', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Continue →
                </button>
              </div>
            )}
            {step === 1 && <StepDetails contact={contact} setContact={setContact} onNext={() => setStep(2)} />}
            {step === 2 && <StepPayment total={price === 0 ? 0 : total} onPay={startPayment} paying={paying} error={payError} />}
            {step === 3 && (
              <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #E8E4DE' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#F0FAF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>🎟</div>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', marginBottom: 8 }}>
                  {isFree ? "You're registered!" : "Tickets confirmed!"}
                </h2>
                <p style={{ fontSize: 14, color: '#6F675C', marginBottom: 20, lineHeight: 1.7 }}>
                  {isFree ? `You're all set for ${title}. We'll see you there!` : `Your tickets for ${title} are confirmed. Check your email for details.`}
                </p>
                {paidRef && <p style={{ fontSize: 12, color: '#9E9A94', marginBottom: 24 }}>Booking ref: {paidRef.slice(0, 8).toUpperCase()}</p>}
                <a href="/profile?tab=bookings" style={{ display: 'inline-block', padding: '14px 32px', background: '#111111', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                  View my bookings →
                </a>
              </div>
            )}
          </div>

          {step < 3 && (
            <div className="hidden lg:block" style={{ width: 320, flexShrink: 0 }}>
              <div className="bg-white rounded-xl p-5 sticky" style={{ top: 88, border: '1px solid #E8E4DE' }}>
                <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 14 }}>Event Summary</h3>
                {image && <img src={image} alt={title} className="w-full rounded-xl object-cover mb-4" style={{ height: 140 }} />}
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 8 }}>{title}</p>
                <p style={{ fontSize: 13, color: '#6F675C', marginBottom: 4 }}>📅 {dateStr}{timeStr ? ` · ${timeStr}` : ''}</p>
                <p style={{ fontSize: 13, color: '#6F675C', marginBottom: 14 }}>📍 {location}</p>
                {price > 0 && (
                  <div style={{ borderTop: '1px solid #E8E4DE', paddingTop: 12 }}>
                    <div className="flex justify-between mb-1" style={{ fontSize: 13, color: '#6F675C' }}>
                      <span>{tickets} ticket{tickets > 1 ? 's' : ''} × IDR {price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between" style={{ fontSize: 14, fontWeight: 700, color: '#111111', marginTop: 8 }}>
                      <span>Total</span>
                      <span>IDR {total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}
                {price === 0 && <p style={{ fontSize: 14, fontWeight: 700, color: '#2D6A4F' }}>Free event</p>}
              </div>
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  )
}

// ── Inner (reads params) ───────────────────────────────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6F675C', fontSize: 14 }}>Loading…</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    const callbackUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/checkout'
    return (
      <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 440, backgroundColor: 'white', borderRadius: 16, padding: '48px 40px', textAlign: 'center', border: '1px solid #E8E4DE' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#F5F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>
            🔒
          </div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', margin: '0 0 10px' }}>
            Sign in to continue
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.7, margin: '0 0 28px' }}>
            You need an account to complete your booking. It only takes a minute.
          </p>
          <a
            href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            style={{ display: 'block', width: '100%', height: 46, lineHeight: '46px', borderRadius: 10, backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginBottom: 12 }}
          >
            Sign in
          </a>
          <a
            href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            style={{ display: 'block', width: '100%', height: 46, lineHeight: '46px', borderRadius: 10, border: '1px solid #E8E4DE', backgroundColor: 'white', color: '#111111', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            Create an account
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function CheckoutInner() {
  const params = useSearchParams()
  const { data: session } = useSession()

  if (params.get('type') === 'rental') {
    return <RentalCheckout params={params} />
  }

  if (params.get('type') === 'event') {
    return <EventCheckout params={params} />
  }

  const slug      = params.get('slug')      || 'pottery-making-class'
  const rawDate   = params.get('date')      || ''
  const rawTimes      = (params.get('times') || params.get('time') || '').split(',').filter(Boolean)
  const extraDates    = (params.get('extraDates') || '').split(',').filter(Boolean)
  const maxGuests = Math.max(1, parseInt(params.get('maxGuests') || '8') || 8)
  const initGuests = Math.max(1, Math.min(maxGuests, parseInt(params.get('guests') || '1') || 1))

  const [expMeta, setExpMeta] = useState<ExpCheckoutMeta>(LOADING_META)
  const [step, setStep] = useState<Step>(0)
  const [guests, setGuests] = useState(initGuests)
  const [contact, setContact] = useState<ContactFields>({
    fullName: '',
    email: '',
    phone: '',
    requests: '',
  })

  // Pre-fill from session once it resolves (session is null on first render)
  useEffect(() => {
    if (!session?.user) return
    setContact(c => ({
      ...c,
      fullName: c.fullName || session.user?.name || '',
      email: c.email || session.user?.email || '',
    }))
  }, [session])
  const [selectedRawTimes, setSelectedRawTimes] = useState<string[]>(rawTimes)
  const [schedule, setSchedule] = useState<ScheduleDay[] | null>(null)
  const [bookedGuests, setBookedGuests] = useState<Record<string, number>>({})

  // Load experience from DB — price and fee rate shown here are display-only;
  // the charged amount is recomputed server-side in createBookingAction
  useEffect(() => {
    getExperienceForCheckout(slug).then(data => {
      if (data) {
        setExpMeta(data)
        // Clamp current guest count to [minGuests, maxGuests] once real values load
        setGuests(g => Math.max(data.minGuests, Math.min(data.maxGuests, g)))
      }
    }).catch(() => {})
  }, [slug])

  useEffect(() => {
    getExperienceScheduleAction(slug).then(s => { if (s) setSchedule(s as ScheduleDay[]) })
  }, [slug])

  useEffect(() => {
    if (!rawDate) return
    getBookedSlotsAction(slug, rawDate).then(setBookedGuests)
  }, [slug, rawDate])

  // Resolve the schedule entry for the booked date.
  // Use local noon (T12:00:00) rather than midnight so the day-of-week is
  // correct for users in UTC− timezones (parsing ISO dates as UTC midnight
  // would shift the DOW by one for them).
  const scheduledDay = (() => {
    if (!schedule || !rawDate) return null
    const dow = new Date(rawDate + 'T12:00:00').getDay()
    const idx = dow === 0 ? 6 : dow - 1
    return schedule[idx] ?? null
  })()
  const dayDisabled = (schedule !== null && !!rawDate && scheduledDay?.enabled === false)
    || (!!rawDate && (expMeta.blockedDates ?? []).includes(rawDate))

  const slots = (() => {
    if (!rawDate || dayDisabled) return []
    let open = '08:00', close = '20:00'
    if (scheduledDay?.enabled) { open = scheduledDay.open; close = scheduledDay.close }
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    const nowMins = now.getHours() * 60 + now.getMinutes()
    return generateSlots(open, close, bookedGuests, expMeta.maxGuests || maxGuests)
      .filter(slot => rawDate !== todayStr || parseTimeMins(slot) > nowMins)
  })()

  const booking: BookingData = {
    title: expMeta.title, area: expMeta.area, image: expMeta.image, meetingPoint: expMeta.meetingPoint,
    date: formatDate(rawDate), time: selectedRawTimes.map(formatTime).join(', '), rawTime: selectedRawTimes.join(','),
    pricePerPerson: expMeta.price, serviceFeeRate: expMeta.serviceFeeRate,
    slug, rawDate, maxGuests: expMeta.maxGuests || maxGuests, minGuests: expMeta.minGuests || 1,
  }

  const numSlots = Math.max(1, selectedRawTimes.length)
  const numDates = Math.max(1, 1 + extraDates.length)
  const sub   = booking.pricePerPerson * guests * numSlots * numDates
  const fee   = Math.round(sub * booking.serviceFeeRate)
  const total = sub + fee

  const [paying, setPaying]           = useState(false)
  const [payError, setPayError]       = useState<string | null>(null)
  const [paidRef, setPaidRef]         = useState<string | null>(null)
  const [payStatus, setPayStatus]     = useState<'paid' | 'pending'>('paid')

  // Load Midtrans Snap script (sandbox vs production derived from the key prefix)
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!clientKey || document.getElementById('midtrans-snap')) return
    const s = document.createElement('script')
    s.id = 'midtrans-snap'
    s.src = clientKey.startsWith('SB-')
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js'
    s.setAttribute('data-client-key', clientKey)
    document.body.appendChild(s)
  }, [])

  const startPayment = async () => {
    if (paying) return
    setPaying(true)
    setPayError(null)
    try {
      const res = await createBookingAction({
        slug: booking.slug,
        rawDate: booking.rawDate,
        extraDates: extraDates.length > 0 ? extraDates : undefined,
        rawTime: booking.rawTime || undefined,
        numSlots,
        guests,
        guestName: contact.fullName || 'Guest',
        guestEmail: contact.email || '',
        guestPhone: contact.phone || undefined,
        notes: contact.requests || undefined,
      })
      if (!res.ok || !res.snapToken || !res.bookingRef) {
        setPayError(res.error ?? 'Could not start payment. Please try again.')
        setPaying(false)
        return
      }
      const snap = (window as unknown as { snap?: { pay: (token: string, opts: Record<string, () => void>) => void } }).snap
      if (!snap) {
        setPayError('The payment window failed to load. Please refresh the page and try again.')
        setPaying(false)
        return
      }
      const ref = res.bookingRef
      snap.pay(res.snapToken, {
        onSuccess: () => { setPaidRef(ref); setPayStatus('paid'); setStep(3); setPaying(false) },
        onPending: () => { setPaidRef(ref); setPayStatus('pending'); setStep(3); setPaying(false) },
        onError:   () => { setPayError('Payment failed — you have not been charged. Please try again.'); setPaying(false) },
        onClose:   () => { setPaying(false) },
      })
    } catch {
      setPayError('Something went wrong. Please try again.')
      setPaying(false)
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <nav className="bg-white" style={{ height: 56, borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between h-full px-6 lg:px-16 max-w-[1440px] mx-auto">
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Image src="/logo-dark.png" alt="Balible" width={120} height={36} style={{ objectFit: 'contain', height: 32, width: 'auto', display: 'block' }} priority />
          </a>
          <div className="flex items-center gap-1.5">
            <Lock size={12} style={{ color: '#4A7C59' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A7C59' }}>Secure booking</span>
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 py-6 pb-24 md:pb-10">
        <h1 className="mb-5 hidden sm:block" style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#111111' }}>
          Checkout
        </h1>

        {step < 3 && <StepIndicator current={step} />}

        {/* Mobile compact booking summary — above form, hidden on desktop */}
        {step < 3 && (
          <div className="lg:hidden mb-4">
            <MobileBookingSummary booking={booking} guests={guests} total={total} editing={step === 0} onEdit={() => { setStep(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {step === 0 && <StepExperience booking={booking} guests={guests} setGuests={setGuests} onNext={() => setStep(1)} slots={slots} selectedRawTimes={selectedRawTimes} setSelectedRawTimes={setSelectedRawTimes} dayDisabled={dayDisabled} />}
            {step === 1 && <StepDetails contact={contact} setContact={setContact} onNext={() => setStep(2)} />}
            {step === 2 && <StepPayment total={total} onPay={startPayment} paying={paying} error={payError} />}
            {step === 3 && <StepConfirmation booking={booking} guests={guests} bookingRef={paidRef} payStatus={payStatus} />}
          </div>
          {/* Full sidebar — desktop only */}
          {step < 3 && (
            <div className="hidden lg:block" style={{ width: 340, flexShrink: 0 }}>
              <BookingSummary booking={booking} guests={guests} editing={step === 0} onEdit={() => { setStep(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }} numSlots={numSlots} numDates={numDates} rawDate={rawDate} extraDates={extraDates} />
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  )
}

// ── Page export (Suspense required for useSearchParams) ───────────────────────

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6F675C', fontSize: 14 }}>Loading checkout…</p>
      </div>
    }>
      <AuthGate>
        <CheckoutInner />
      </AuthGate>
    </Suspense>
  )
}
