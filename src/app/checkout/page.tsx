'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronUp, Shield, Award, Clock, Edit2, Lock } from 'lucide-react'
import MobileNav from '@/components/MobileNav'

const STEPS = ['Experience & Date', 'Your Details', 'Payment', 'Confirmation']
type Step = 0 | 1 | 2 | 3

// ── Experience lookup ──────────────────────────────────────────────────────────

type ExpMeta = { title: string; area: string; image: string; price: number }

const EXPERIENCE_DB: Record<string, ExpMeta> = {
  'pottery-making-class':      { title: 'Pottery Making Class',         area: 'Ubud',     price: 450000, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&auto=format&fit=crop&q=80' },
  'silver-jewelry-workshop':   { title: 'Silver Jewelry Workshop',      area: 'Canggu',   price: 550000, image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&auto=format&fit=crop&q=80' },
  'batik-painting-workshop':   { title: 'Batik Painting Workshop',      area: 'Ubud',     price: 380000, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&auto=format&fit=crop&q=80' },
  'traditional-batik-workshop':{ title: 'Traditional Batik Workshop',   area: 'Ubud',     price: 420000, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&auto=format&fit=crop&q=80' },
  'sound-healing-journey':     { title: 'Sound Healing Journey',        area: 'Ubud',     price: 350000, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&auto=format&fit=crop&q=80' },
  'sunrise-yoga-class':        { title: 'Sunrise Yoga & Meditation',    area: 'Canggu',   price: 250000, image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&auto=format&fit=crop&q=80' },
  'water-temple-purification': { title: 'Water Temple Purification',    area: 'Gianyar',  price: 600000, image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=200&auto=format&fit=crop&q=80' },
  'uluwatu-kecak-sunset':      { title: 'Uluwatu Sunset & Kecak Dance', area: 'Uluwatu',  price: 450000, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&auto=format&fit=crop&q=80' },
  'balinese-cooking-class':    { title: 'Balinese Cooking Class',       area: 'Seminyak', price: 480000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&auto=format&fit=crop&q=80' },
  'jimbaran-seafood-sunset':   { title: 'Jimbaran Seafood & Sunset',    area: 'Jimbaran', price: 350000, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&auto=format&fit=crop&q=80' },
  'beginner-surf-lesson':      { title: 'Beginner Surf Lesson',         area: 'Kuta',     price: 320000, image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=200&auto=format&fit=crop&q=80' },
  'snorkeling-amed':           { title: 'Snorkeling at Amed Reef',      area: 'Amed',     price: 420000, image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=200&auto=format&fit=crop&q=80' },
  'rice-terrace-walk':         { title: 'Tegalalang Rice Terrace Walk', area: 'Ubud',     price: 280000, image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=200&auto=format&fit=crop&q=80' },
  'natural-dye-workshop':      { title: 'Natural Dye Workshop',         area: 'Sidemen',  price: 380000, image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop&q=80' },
  'wood-carving-workshop':     { title: 'Wood Carving Workshop',        area: 'Ubud',     price: 500000, image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&auto=format&fit=crop&q=80' },
  'rattan-weaving-class':      { title: 'Rattan Weaving Class',         area: 'Sidemen',  price: 350000, image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=200&auto=format&fit=crop&q=80' },
}

const FALLBACK = EXPERIENCE_DB['pottery-making-class']

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
  title: string; area: string; image: string
  date: string; time: string; rawTime: string
  pricePerPerson: number; serviceFeeRate: number
  slug: string; rawDate: string; maxGuests: number
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

function BookingSummary({ booking, guests, editing, onEdit }: { booking: BookingData; guests: number; editing?: boolean; onEdit: () => void }) {
  const sub = booking.pricePerPerson * guests
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
              { label: 'Date',   value: booking.date },
              { label: 'Time',   value: booking.time },
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

      <div className="pt-4 space-y-2">
        <div className="flex justify-between">
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>
            IDR {booking.pricePerPerson.toLocaleString('id-ID')} × {guests} guest{guests > 1 ? 's' : ''}
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

      <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid #E8E4DE' }}>
        {[{ Icon: Shield, text: 'Secure Payment' }, { Icon: Award, text: 'Best Price Guarantee' }, { Icon: Clock, text: '24/7 Support' }].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon size={13} style={{ color: '#4A7C59' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 1: Experience & Date ──────────────────────────────────────────────────

function StepExperience({ booking, guests, setGuests, onNext, slots, selectedRawTime, setSelectedRawTime }: {
  booking: BookingData; guests: number; setGuests: (n: number) => void; onNext: () => void
  slots: string[]; selectedRawTime: string; setSelectedRawTime: (t: string) => void
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
        {slots.length > 0 ? (
          <div className="flex flex-wrap gap-2 overflow-y-auto" style={{ maxHeight: 140 }}>
            {slots.map(slot => {
              const isSel = slot === selectedRawTime
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedRawTime(isSel ? '' : slot)}
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
          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}
        </select>
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
        disabled={slots.length > 0 && !selectedRawTime}
        className="w-full flex items-center justify-center hover:opacity-90 transition-opacity"
        style={{
          height: 48,
          backgroundColor: slots.length > 0 && !selectedRawTime ? '#E8E4DE' : '#111111',
          color: slots.length > 0 && !selectedRawTime ? '#9E9A94' : 'white',
          borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none',
          cursor: slots.length > 0 && !selectedRawTime ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-inter)',
        }}
      >
        {slots.length > 0 && !selectedRawTime ? 'Select a time to continue' : 'Continue to Details →'}
      </button>
    </div>
  )
}

// ── Step 2: Your Details ───────────────────────────────────────────────────────

type ContactFields = { fullName: string; email: string; phone: string; requests: string }

function StepDetails({ contact, setContact, onNext }: { contact: ContactFields; setContact: (c: ContactFields) => void; onNext: () => void }) {
  const set = (k: keyof ContactFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setContact({ ...contact, [k]: e.target.value })

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
                style={{ height: 44, border: '1px solid #E8E4DE', borderRadius: 8, padding: '0 14px', fontSize: 14, color: '#111111', backgroundColor: 'white' }}
                onFocus={e => (e.target.style.borderColor = '#C8A97E')}
                onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center hover:opacity-90 transition-opacity mt-6"
        style={{ height: 48, backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
      >
        Continue to Payment →
      </button>
    </div>
  )
}

// ── Step 3: Payment ────────────────────────────────────────────────────────────

function StepPayment({ total, onNext }: { total: number; onNext: () => void }) {
  const [method, setMethod] = useState<'card' | 'transfer' | 'gopay'>('card')
  return (
    <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
      <div className="flex justify-between items-start mb-5">
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>3. Payment</h2>
        <ChevronUp size={18} style={{ color: '#6F675C' }} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {[{ id: 'card', label: 'Credit Card' }, { id: 'transfer', label: 'Bank Transfer' }, { id: 'gopay', label: 'GoPay / OVO' }].map(m => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id as typeof method)}
            className="py-2 rounded-lg transition-all"
            style={{ fontSize: 12, fontWeight: method === m.id ? 600 : 400, backgroundColor: method === m.id ? '#111111' : 'white', color: method === m.id ? 'white' : '#6F675C', border: `1px solid ${method === m.id ? '#111111' : '#E8E4DE'}`, cursor: 'pointer', fontFamily: 'var(--font-inter)', lineHeight: 1.3, padding: '8px 4px' }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {method === 'card' && (
        <div className="space-y-4">
          {[
            { label: 'Card number',     placeholder: '1234 5678 9012 3456', colSpan: 'full' },
            { label: 'Expiry date',     placeholder: 'MM / YY',             colSpan: 'half' },
            { label: 'CVV',             placeholder: '123',                  colSpan: 'half' },
            { label: 'Cardholder name', placeholder: 'Sarah Kim',           colSpan: 'full' },
          ].map((f, i, arr) => {
            if (f.colSpan === 'half' && arr[i - 1]?.colSpan === 'half') {
              return null
            }
            if (f.colSpan === 'half') {
              return (
                <div className="grid grid-cols-2 gap-4" key={f.label}>
                  {[arr[i], arr[i + 1]].map(ff => ff && (
                    <div key={ff.label}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 6 }}>{ff.label}</label>
                      <input placeholder={ff.placeholder} className="w-full outline-none" style={{ height: 44, border: '1px solid #E8E4DE', borderRadius: 8, padding: '0 14px', fontSize: 14, color: '#111111', backgroundColor: 'white' }} onFocus={e => (e.target.style.borderColor = '#C8A97E')} onBlur={e => (e.target.style.borderColor = '#E8E4DE')} />
                    </div>
                  ))}
                </div>
              )
            }
            return (
              <div key={f.label}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input placeholder={f.placeholder} className="w-full outline-none" style={{ height: 44, border: '1px solid #E8E4DE', borderRadius: 8, padding: '0 14px', fontSize: 14, color: '#111111', backgroundColor: 'white' }} onFocus={e => (e.target.style.borderColor = '#C8A97E')} onBlur={e => (e.target.style.borderColor = '#E8E4DE')} />
              </div>
            )
          })}
        </div>
      )}
      {method === 'transfer' && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.6 }}>
            You'll receive bank transfer details via email. Please transfer within 24 hours to secure your spot.
          </p>
        </div>
      )}
      {method === 'gopay' && (
        <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#F5F1EB' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
            You'll be redirected to GoPay / OVO to complete payment securely.
          </p>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-6"
        style={{ height: 52, backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
      >
        <Lock size={15} />
        Pay IDR {total.toLocaleString('id-ID')}
      </button>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', textAlign: 'center', marginTop: 10 }}>
        Protected by 256-bit SSL encryption
      </p>
    </div>
  )
}

// ── Step 4: Confirmation ───────────────────────────────────────────────────────

function StepConfirmation({ booking, guests }: { booking: BookingData; guests: number }) {
  const sub = booking.pricePerPerson * guests
  const fee = Math.round(sub * booking.serviceFeeRate)
  const total = sub + fee
  const ref = genRef(booking.slug, booking.rawDate)

  return (
    <div className="bg-white rounded-xl p-8 text-center" style={{ border: '1px solid #E8E4DE' }}>
      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F0F7F2' }}>
        <span style={{ fontSize: 28, color: '#4A7C59' }}>✓</span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#111111', marginBottom: 8 }}>
        Booking Confirmed!
      </h2>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', marginBottom: 6 }}>
        Your booking has been saved to your profile.
      </p>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', marginBottom: 32 }}>
        Ref: <span style={{ fontWeight: 600, color: '#111111', letterSpacing: '0.05em' }}>{ref}</span>
      </p>

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

// ── Inner (reads params) ───────────────────────────────────────────────────────

function CheckoutInner() {
  const params = useSearchParams()
  const slug      = params.get('slug')      || 'pottery-making-class'
  const rawDate   = params.get('date')      || ''
  const rawTime   = params.get('time')      || ''
  const maxGuests = Math.max(1, parseInt(params.get('maxGuests') || '8') || 8)
  const initGuests = Math.max(1, Math.min(maxGuests, parseInt(params.get('guests') || '1') || 1))

  const baseExp = EXPERIENCE_DB[slug] || FALLBACK

  const [step, setStep] = useState<Step>(0)
  const [guests, setGuests] = useState(initGuests)
  const [contact, setContact] = useState<ContactFields>({ fullName: '', email: '', phone: '', requests: '' })
  const [selectedRawTime, setSelectedRawTime] = useState(rawTime)
  const [schedule, setSchedule] = useState<ScheduleDay[] | null>(null)
  const [bookedGuests, setBookedGuests] = useState<Record<string, number>>({})
  const [serviceFeeRate, setServiceFeeRate] = useState(0.1)
  const [expPrice, setExpPrice] = useState(baseExp.price)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('balible_service_fee')
      if (stored) setServiceFeeRate(parseFloat(JSON.parse(stored)) / 100)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`balible_exp_data_${slug}`)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.price) setExpPrice(Number(data.price))
      }
    } catch {}
  }, [slug])

  useEffect(() => {
    const raw = localStorage.getItem(`balible_schedule_${slug}`)
    if (raw) setSchedule(JSON.parse(raw))
  }, [slug])

  useEffect(() => {
    if (!rawDate) return
    const raw = localStorage.getItem(`balible_booked_${slug}_${rawDate}`)
    setBookedGuests(raw ? JSON.parse(raw) : {})
  }, [slug, rawDate])

  // Build available time slots for the booked date
  const slots = (() => {
    if (!rawDate) return []
    let open = '08:00', close = '20:00'
    if (schedule) {
      const dow = new Date(rawDate).getDay()
      const idx = dow === 0 ? 6 : dow - 1
      const day = schedule[idx]
      if (!day?.enabled) return []
      open = day.open; close = day.close
    }
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    const nowMins = now.getHours() * 60 + now.getMinutes()
    return generateSlots(open, close, bookedGuests, maxGuests)
      .filter(slot => rawDate !== todayStr || parseTimeMins(slot) > nowMins)
  })()

  const booking: BookingData = {
    title: baseExp.title, area: baseExp.area, image: baseExp.image,
    date: formatDate(rawDate), time: formatTime(selectedRawTime), rawTime: selectedRawTime,
    pricePerPerson: expPrice, serviceFeeRate,
    slug, rawDate, maxGuests,
  }

  const sub   = booking.pricePerPerson * guests
  const fee   = Math.round(sub * booking.serviceFeeRate)
  const total = sub + fee

  const confirmAndSave = () => {
    const ref = genRef(booking.slug, booking.rawDate)
    try {
      const prev = JSON.parse(localStorage.getItem('balible_bookings') ?? '[]')
      localStorage.setItem('balible_bookings', JSON.stringify([
        { id: ref, title: booking.title, area: booking.area, image: booking.image, date: booking.date, time: booking.time, guests, total, status: 'Upcoming', rating: null, slug: booking.slug },
        ...prev.filter((b: { id: string }) => b.id !== ref),
      ]))
      // Track booked guests per slot for capacity enforcement
      if (booking.rawTime) {
        const slotKey = `balible_booked_${booking.slug}_${booking.rawDate}`
        const prevSlots: Record<string, number> = JSON.parse(localStorage.getItem(slotKey) ?? '{}')
        prevSlots[booking.rawTime] = (prevSlots[booking.rawTime] ?? 0) + guests
        localStorage.setItem(slotKey, JSON.stringify(prevSlots))
      }
    } catch {}
    setStep(3)
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <nav className="bg-white" style={{ height: 56, borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between h-full px-6 lg:px-16 max-w-[1440px] mx-auto">
          <a href="/" className="flex flex-col leading-none" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111' }}>BALIBLE</span>
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
            {step === 0 && <StepExperience booking={booking} guests={guests} setGuests={setGuests} onNext={() => setStep(1)} slots={slots} selectedRawTime={selectedRawTime} setSelectedRawTime={setSelectedRawTime} />}
            {step === 1 && <StepDetails contact={contact} setContact={setContact} onNext={() => setStep(2)} />}
            {step === 2 && <StepPayment total={total} onNext={confirmAndSave} />}
            {step === 3 && <StepConfirmation booking={booking} guests={guests} />}
          </div>
          {/* Full sidebar — desktop only */}
          {step < 3 && (
            <div className="hidden lg:block" style={{ width: 340, flexShrink: 0 }}>
              <BookingSummary booking={booking} guests={guests} editing={step === 0} onEdit={() => { setStep(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
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
      <CheckoutInner />
    </Suspense>
  )
}
