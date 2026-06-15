'use client'

import { useState, useEffect } from 'react'
import {
  User, Heart, CalendarDays, Settings, Star, MapPin, Clock,
  Edit2, Camera, Check, Home, Search, Map, X,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import { getUserData, getExperiencesForWishlist, cancelBookingAction, getExperienceMetaForModal, submitReviewAction, type UserData, type ExpWishlistMeta } from '@/lib/actions'

// ── Types ─────────────────────────────────────────────────────────────────────

type Booking = {
  id: string; title: string; area: string; date: string; time?: string
  guests: number; total: number; status: string
  rating: number | null; image: string; slug: string
  duration?: string; meetingPoint?: string; includes?: string[]
  latitude?: number; longitude?: number
}

// ── Nav tabs ───────────────────────────────────────────────────────────────────

const NAV_TABS = [
  { id: 'bookings',  label: 'Bookings',  Icon: CalendarDays },
  { id: 'wishlist',  label: 'Wishlist',  Icon: Heart },
  { id: 'reviews',   label: 'Reviews',   Icon: Star },
  { id: 'settings',  label: 'Settings',  Icon: Settings },
]

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Upcoming:  { bg: '#F0F7F2', color: '#4A7C59' },
    Completed: { bg: '#EEF2FF', color: '#4B6CB7' },
    Cancelled: { bg: '#FEF2F2', color: '#B66A45' },
    Pending:   { bg: '#FEF9EC', color: '#C8A97E' },
  }
  const s = map[status] ?? { bg: '#F5F1EB', color: '#6F675C' }
  return (
    <span style={{ ...s, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

// ── Review modal ───────────────────────────────────────────────────────────────

const RATING_LABELS = ['', 'Disappointing', 'Below average', 'Good', 'Very good', 'Exceptional']

function ReviewModal({ booking, onClose, onRefresh }: {
  booking: Booking
  onClose: () => void
  onRefresh: () => void
}) {
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [done, setDone]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const active = hover || rating

  const submit = async () => {
    if (!rating || !comment.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    const res = await submitReviewAction(booking.slug, rating, comment.trim())
    setSubmitting(false)
    if (!res.ok) { setError(res.error ?? 'Failed to submit review'); return }
    setDone(true)
    onRefresh()
    setTimeout(onClose, 1600)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pt-4 pb-4 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl overflow-y-auto" style={{ maxHeight: '85vh' }}>
        {done ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0F7F2' }}>
              <Check size={26} style={{ color: '#4A7C59' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>Review submitted!</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginTop: 6 }}>Thank you for sharing your experience.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 19, fontWeight: 700, color: '#111111' }}>Leave a Review</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} style={{ color: '#6F675C' }} />
              </button>
            </div>

            {/* Experience info */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ backgroundColor: '#F5F1EB' }}>
              <img src={booking.image} alt={booking.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>{booking.title}</p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{booking.area} · {booking.date}</p>
              </div>
            </div>

            {/* Star picker */}
            <div className="mb-5">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.1s' }}
                    className="hover:scale-110">
                    <Star size={30} fill={active >= i ? '#C8A97E' : 'none'} color={active >= i ? '#C8A97E' : '#E8E4DE'} />
                  </button>
                ))}
              </div>
              {active > 0 && (
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#C8A97E', marginTop: 6, fontWeight: 500 }}>
                  {RATING_LABELS[active]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-5">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your experience</label>
              <textarea
                value={comment}
                onChange={e => { if (e.target.value.length <= 500) setComment(e.target.value) }}
                placeholder="Tell others what you loved about this experience..."
                rows={4}
                style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', resize: 'none', outline: 'none', lineHeight: 1.6 }}
                onFocus={e => (e.target.style.borderColor = '#C8A97E')}
                onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
              />
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#C8C4BE', marginTop: 3, textAlign: 'right' }}>{comment.length}/500</p>
            </div>

            {error && <p style={{ fontSize: 12, color: '#B66A45', marginBottom: 8 }}>{error}</p>}
            <button
              onClick={submit}
              disabled={!rating || !comment.trim() || submitting}
              style={{
                width: '100%', height: 44, borderRadius: 10, border: 'none',
                backgroundColor: !rating || !comment.trim() || submitting ? '#E8E4DE' : '#111111',
                color: !rating || !comment.trim() || submitting ? '#6F675C' : 'white',
                fontSize: 14, fontWeight: 600,
                cursor: !rating || !comment.trim() || submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Booking detail modal ───────────────────────────────────────────────────────

function googleCalendarUrl(booking: Booking): string {
  const date = new Date(booking.date)
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const start = fmt(date)
  const end   = fmt(new Date(date.getTime() + 86400000))
  const details = [`Booking ref: ${booking.id}`, `Guests: ${booking.guests}`, booking.meetingPoint ? `Meeting point: ${booking.meetingPoint}` : ''].filter(Boolean).join('\n')
  const params = new URLSearchParams({ action: 'TEMPLATE', text: `${booking.title} – Balible`, dates: `${start}/${end}`, details, ...(booking.meetingPoint ? { location: `${booking.meetingPoint}, Bali` } : {}) })
  return `https://calendar.google.com/calendar/render?${params}`
}

function BookingDetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [meta, setMeta] = useState<{ meetingPoint: string | null; duration: string | null; includes: string[] } | null>(null)

  const meetingPoint = meta?.meetingPoint ?? booking.meetingPoint ?? null
  const duration     = meta?.duration     ?? booking.duration     ?? null
  const includes     = meta?.includes     ?? booking.includes     ?? []

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    getExperienceMetaForModal(booking.slug).then(d => { if (d) setMeta(d) }).catch(() => {})
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const row = (label: string, value: string) => (
    <div className="flex gap-3 py-3" style={{ borderBottom: '1px solid #F5F1EB' }}>
      <span style={{ fontSize: 13, color: '#6F675C', width: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#111111', fontWeight: 500 }}>{value}</span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full sm:max-w-lg bg-white sm:rounded-2xl overflow-hidden"
        style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: '20px 20px 0 0' }}>

        {/* Image */}
        <div className="relative flex-shrink-0" style={{ height: 200 }}>
          <img src={booking.image} alt={booking.title} className="w-full h-full object-cover" />
          <button onClick={onClose}
            className="absolute top-3 right-3 flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', color: 'white' }}>
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-3">
            <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex-1">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 4 }}>
            {booking.title}
          </h2>
          <div className="flex items-center gap-1 mb-4">
            <MapPin size={12} style={{ color: '#6F675C' }} />
            <span style={{ fontSize: 13, color: '#6F675C' }}>{booking.area}</span>
          </div>

          <div>
            {row('Booking ref', booking.id)}
            {row('Date', booking.date)}
            {booking.time && row('Time', booking.time)}
            {row('Guests', `${booking.guests} guest${booking.guests > 1 ? 's' : ''}`)}
            {duration && row('Duration', duration)}
            {meetingPoint && row('Meeting point', meetingPoint)}
            {row('Total paid', `IDR ${booking.total.toLocaleString('id-ID')}`)}
          </div>

          {includes.length > 0 && (
            <div className="mt-4">
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 8 }}>What's included</p>
              <ul className="space-y-1.5">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: 13, color: '#6F675C' }}>
                    <span style={{ color: '#4A7C59', marginTop: 1, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 pt-3" style={{ borderTop: '1px solid #F5F1EB', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          {/* Action buttons */}
          <div className="flex gap-2 mb-2">
            <a href={googleCalendarUrl({ ...booking, meetingPoint: meetingPoint ?? undefined, duration: duration ?? undefined, includes })} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{ height: 40, borderRadius: 8, border: '1px solid #C8A97E', backgroundColor: '#FEF9EC', color: '#C8A97E', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <CalendarDays size={13} /> Add to Calendar
            </a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((meetingPoint || booking.area) + ', Bali')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{ height: 40, borderRadius: 8, border: '1px solid #4A7C59', backgroundColor: '#F0F7F2', color: '#4A7C59', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <MapPin size={13} /> Open Maps
            </a>
          </div>
          {/* Primary buttons */}
          <div className="flex gap-2">
            <a href={`/experiences/${booking.slug}`}
              className="flex-1 flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{ height: 44, borderRadius: 10, backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              View experience
            </a>
            <button onClick={onClose}
              style={{ flex: 1, height: 44, border: '1px solid #E8E4DE', backgroundColor: 'white', borderRadius: 10, fontSize: 14, color: '#6F675C', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Bookings tab ───────────────────────────────────────────────────────────────

function BookingsTab({ dbBookings, onRefresh }: { dbBookings?: Booking[]; onRefresh: () => void }) {
  const [cancelled, setCancelled] = useState<Set<string>>(new Set())
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [reviewing, setReviewing] = useState<Booking | null>(null)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)

  const cancel = async (b: Booking) => {
    setCancelling(b.id)
    const res = await cancelBookingAction(b.id)
    setCancelling(null)
    if (res.ok) {
      setCancelled(s => new Set(s).add(b.id))
    } else {
      alert(res.error ?? 'Failed to cancel booking.')
    }
  }

  const allBookings = dbBookings ?? []

  return (
    <div className="space-y-4">
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>My Bookings</h2>
      {allBookings.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
          <CalendarDays size={28} style={{ color: '#C8A97E', margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>No bookings yet.</p>
          <a href="/search" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#C8A97E', textDecoration: 'underline' }}>Browse experiences →</a>
        </div>
      ) : allBookings.map(b => {
        const isCancelled = cancelled.has(b.id)
        const effectiveStatus = isCancelled ? 'Cancelled' : b.status
        return (
        <div key={b.id} className="bg-white rounded-xl p-4" style={{ border: '1px solid #E8E4DE', opacity: isCancelled ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          <div className="flex gap-4">
            <img src={b.image} alt={b.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <a href={`/experiences/${b.slug}`} style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111', textDecoration: 'none', lineHeight: 1.3 }} className="hover:opacity-70 transition-opacity">
                  {b.title}
                </a>
                <div className="flex-shrink-0"><StatusBadge status={effectiveStatus} /></div>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} style={{ color: '#6F675C' }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{b.area}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                <span style={{ fontSize: 12, color: '#6F675C' }}>📅 {b.date}{b.time ? ` · ${b.time}` : ''}</span>
                <span style={{ fontSize: 12, color: '#6F675C' }}>👤 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>IDR {b.total.toLocaleString('id-ID')}</span>
              </div>
              {/* Button row */}
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={() => setDetailBooking({ ...b, status: effectiveStatus })}
                  style={{ backgroundColor: '#FEF9EC', border: '1px solid #E8D9C4', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#C8A97E', fontWeight: 600 }}
                  className="hover:opacity-75 transition-opacity">
                  View details
                </button>
                {effectiveStatus === 'Completed' && !b.rating && (
                  <button onClick={() => setReviewing(b)}
                    style={{ backgroundColor: '#FEF9EC', border: '1px solid #E8D9C4', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#C8A97E', fontWeight: 600 }}
                    className="hover:opacity-80 transition-opacity">
                    Leave a review
                  </button>
                )}
                {effectiveStatus === 'Upcoming' && (
                  <button
                    onClick={() => cancel(b)}
                    disabled={cancelling === b.id}
                    style={{ height: 29, padding: '0 12px', border: '1px solid #FECACA', borderRadius: 6, fontSize: 12, color: '#B66A45', backgroundColor: 'white', cursor: cancelling === b.id ? 'default' : 'pointer', opacity: cancelling === b.id ? 0.6 : 1 }}>
                    {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
              {effectiveStatus === 'Completed' && b.rating && (
                <div className="flex items-center gap-1 mt-2">
                  {[1,2,3,4,5].map(i => <Star key={i} size={11} fill={i <= b.rating! ? '#C8A97E' : '#E8E4DE'} color={i <= b.rating! ? '#C8A97E' : '#E8E4DE'} />)}
                  <span style={{ fontSize: 12, color: '#6F675C', marginLeft: 2 }}>You rated this</span>
                </div>
              )}
              {effectiveStatus === 'Pending' && (
                <p className="mt-2" style={{ fontSize: 12, color: '#C8A97E' }}>Awaiting payment confirmation</p>
              )}
            </div>
          </div>
        </div>
        )
      })}

      {reviewing && (
        <ReviewModal
          booking={reviewing}
          onClose={() => setReviewing(null)}
          onRefresh={onRefresh}
        />
      )}
      {detailBooking && (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}
    </div>
  )
}

// ── Wishlist tab ───────────────────────────────────────────────────────────────

function WishlistTab({ dbSlugs }: { dbSlugs?: string[] }) {
  const [items, setItems] = useState<ExpWishlistMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const localSlugs: string[] = (() => {
      try { return JSON.parse(localStorage.getItem('balible_wishlist') ?? '[]') } catch { return [] }
    })()
    const slugs = Array.from(new Set([...(dbSlugs ?? []), ...localSlugs]))
    if (slugs.length === 0) { setLoading(false); return }
    getExperiencesForWishlist(slugs)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dbSlugs])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>
          My Wishlist{items.length > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: '#6F675C', marginLeft: 8 }}>({items.length})</span>}
        </h2>
        <a href="/wishlist" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#C8A97E', textDecoration: 'underline' }} className="hover:opacity-70 transition-opacity">
          Manage →
        </a>
      </div>
      {loading ? (
        <div className="py-12 text-center">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>Loading…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
          <Heart size={28} style={{ color: '#C8A97E', margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>No saved experiences yet.</p>
          <a href="/search" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#C8A97E', textDecoration: 'underline' }}>Browse experiences →</a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(exp => (
            <a
              key={exp.slug}
              href={`/experiences/${exp.slug}`}
              className="block bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
            >
              <div className="relative" style={{ height: 140 }}>
                <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                <Heart size={13} fill="#ef4444" color="#ef4444" style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'white', borderRadius: '50%', padding: 4, width: 24, height: 24 }} />
              </div>
              <div className="p-3.5">
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{exp.area}</p>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 600, color: '#111111', marginTop: 2, lineHeight: 1.3 }}>{exp.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Star size={11} fill="#C8A97E" color="#C8A97E" />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#111111' }}>{exp.rating.toFixed(1)}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#111111' }}>IDR {exp.price.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Reviews tab ────────────────────────────────────────────────────────────────

function ReviewsTab({ dbReviews }: { dbReviews?: UserData['reviews'] }) {
  const merged = dbReviews ?? []

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>My Reviews</h2>
      {merged.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
          <Star size={28} style={{ color: '#C8A97E', margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>No reviews yet.</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#9E9A94', marginTop: 4 }}>Complete a booking to leave your first review.</p>
        </div>
      ) : (
      <div className="space-y-4">
        {merged.map((r, i) => (
          <div key={i} className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
            <div className="flex items-start gap-3 mb-3">
              <img src={r.image} alt={r.experience} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1">
                <a href={`/experiences/${r.slug}`} style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">
                  {r.experience}
                </a>
                <p style={{ fontSize: 12, color: '#6F675C', marginTop: 2 }}>{r.date}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= r.rating ? '#C8A97E' : '#E8E4DE'} color={i <= r.rating ? '#C8A97E' : '#E8E4DE'} />)}
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{r.comment}"
            </p>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

// ── Settings tab ───────────────────────────────────────────────────────────────

const PROFILE_NOTIF_DEFAULTS = { bookingConfirm: true, reminders: true, offers: false }

function lsp<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}

function SettingsTab({ clerkName, clerkEmail }: { clerkName: string; clerkEmail: string }) { // props kept for backward compat
  const EXTRA_DEFAULTS = { phone: '', nationality: '' }
  const [extra, setExtra]   = useState(EXTRA_DEFAULTS)
  const [notifs, setNotifs] = useState(PROFILE_NOTIF_DEFAULTS)

  useEffect(() => {
    setExtra(lsp('balible_profile_extra', EXTRA_DEFAULTS))
    setNotifs(lsp('balible_profile_notifs', PROFILE_NOTIF_DEFAULTS))
  }, [])
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem('balible_profile_extra',  JSON.stringify(extra))
    localStorage.setItem('balible_profile_notifs', JSON.stringify(notifs))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>Account Settings</h2>

      {/* Clerk-managed fields — read-only */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111' }}>Account Information</h3>
          <span style={{ fontSize: 11, color: '#9E9A94', fontFamily: 'var(--font-inter)' }}>Managed via Clerk</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[{ label: 'Full Name', value: clerkName }, { label: 'Email', value: clerkEmail }].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <div style={{ height: 42, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#6F675C', backgroundColor: '#F9F8F6', display: 'flex', alignItems: 'center' }}>
                {f.value || <span style={{ color: '#C8C4BE' }}>—</span>}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#9E9A94', marginTop: 12, fontFamily: 'var(--font-inter)' }}>
          To update your name or email, use the account menu in the top-right corner.
        </p>
      </div>

      {/* Extra fields saved locally */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 16 }}>Additional Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {([{ label: 'Phone', key: 'phone' as const, placeholder: '+62 812 345 6789' }, { label: 'Nationality', key: 'nationality' as const, placeholder: 'e.g. Australian' }]).map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <input
                value={extra[f.key]}
                onChange={e => setExtra(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: '100%', height: 42, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#C8A97E')}
                onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 16 }}>Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'bookingConfirm', label: 'Booking confirmations', desc: 'Receive email when a booking is confirmed' },
            { key: 'reminders',      label: 'Experience reminders',  desc: '24-hour reminder before your experience' },
            { key: 'offers',         label: 'Special offers',        desc: 'Occasional deals and new experience alerts' },
          ].map(({ key, label, desc }) => {
            const on = notifs[key as keyof typeof notifs]
            return (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#111111' }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#6F675C', marginTop: 1 }}>{desc}</p>
                </div>
                <button
                  onClick={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof notifs] }))}
                  style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, backgroundColor: on ? '#111111' : '#E8E4DE', transition: 'background 0.2s', position: 'relative' }}
                >
                  <span style={{ display: 'block', width: 18, height: 18, borderRadius: 9, backgroundColor: 'white', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.2s' }} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={save}
        className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        style={{ height: 44, paddingInline: 24, borderRadius: 10, border: 'none', backgroundColor: saved ? '#4A7C59' : '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', minWidth: 140 }}
      >
        {saved ? <><Check size={14} /> Saved!</> : 'Save Changes'}
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const isLoaded = status !== 'loading'
  const isSignedIn = status === 'authenticated'
  const [activeTab, setActiveTab] = useState('bookings')
  const [dbData, setDbData] = useState<UserData | null>(null)
  const [localWishlistCount, setLocalWishlistCount] = useState(0)

  const loadDb = () => {
    if (isSignedIn) {
      getUserData().then(data => { if (data) setDbData(data) }).catch(() => {})
    }
  }

  useEffect(() => {
    if (isLoaded) {
      loadDb()
      setLocalWishlistCount(lsp<string[]>('balible_wishlist', []).length)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn])

  // Clerk user info with graceful fallbacks
  const displayName  = session?.user?.name || dbData?.name || 'Traveler'
  const displayEmail = session?.user?.email || dbData?.email || ''
  const displayImage = session?.user?.image || dbData?.image || null
  const memberSince: string | null = null

  // Stats derived from real data
  const tripsCount    = dbData?.bookings?.length ?? 0
  const reviewsCount  = dbData?.reviews?.length ?? 0
  const wishlistCount = dbData?.wishlistSlugs?.length ?? localWishlistCount

  const renderTab = () => {
    switch (activeTab) {
      case 'bookings': return <BookingsTab dbBookings={dbData?.bookings} onRefresh={loadDb} />
      case 'wishlist': return <WishlistTab dbSlugs={dbData?.wishlistSlugs} />
      case 'reviews':  return <ReviewsTab dbReviews={dbData?.reviews} />
      case 'settings': return <SettingsTab clerkName={displayName} clerkEmail={displayEmail} />
      default:         return <BookingsTab dbBookings={dbData?.bookings} onRefresh={loadDb} />
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      <div className="max-w-[1100px] mx-auto px-5 lg:px-8 py-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — Profile card */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 text-center" style={{ border: '1px solid #E8E4DE' }}>
              {/* Avatar */}
              <div className="relative mx-auto mb-4" style={{ width: 80, height: 80 }}>
                <img
                  src={displayImage ?? '/avatar-default.png'}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                  style={{ border: '3px solid white', boxShadow: '0 0 0 2px #C8A97E' }}
                />
                <button
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#111111', border: '2px solid white', cursor: 'pointer' }}
                >
                  <Camera size={12} style={{ color: 'white' }} />
                </button>
              </div>

              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>{displayName}</h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', marginTop: 3 }}>{displayEmail}</p>
              {memberSince && (
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginTop: 2 }}>Member since {memberSince}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5" style={{ borderTop: '1px solid #E8E4DE' }}>
                {[
                  { label: 'Trips',    value: tripsCount },
                  { label: 'Reviews',  value: reviewsCount },
                  { label: 'Saved',    value: wishlistCount },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>{s.value}</p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Tab nav — desktop */}
              <nav className="hidden lg:block mt-5 pt-4 space-y-1" style={{ borderTop: '1px solid #E8E4DE' }}>
                {NAV_TABS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: activeTab === id ? '#111111' : 'transparent',
                      color: activeTab === id ? 'white' : '#6F675C',
                      border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === id ? 600 : 400,
                      fontFamily: 'var(--font-inter)', textAlign: 'left',
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </nav>

            </div>
          </aside>

          {/* RIGHT — Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile tab bar */}
            <div className="lg:hidden flex gap-2 mb-5 overflow-x-auto scrollbar-none">
              {NAV_TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: activeTab === id ? '#111111' : 'white',
                    color: activeTab === id ? 'white' : '#6F675C',
                    border: `1px solid ${activeTab === id ? '#111111' : '#E8E4DE'}`,
                    fontSize: 13, fontWeight: activeTab === id ? 600 : 400, cursor: 'pointer',
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {renderTab()}
          </main>
        </div>
      </div>

      <Footer />
      {/* MOBILE BOTTOM NAV */}
      <MobileNav />
    </div>
  )
}
