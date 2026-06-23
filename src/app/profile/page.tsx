'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  User, Heart, CalendarDays, Settings, Star, MapPin, Clock,
  Edit2, Camera, Check, Home, Search, Map, X, MessageCircle, Send,
  Ticket, Users,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getUserData, getExperiencesForWishlist, cancelBookingAction, getExperienceMetaForModal, submitReviewAction, getUserProfileSettingsAction, updateUserProfileSettingsAction, requestPasswordResetAction, type UserData, type ExpWishlistMeta } from '@/lib/actions'
import { cancelEventBookingAction } from '@/lib/event-actions'
import { getOrCreateConversationAction, getMessagesAction, sendMessageAction, listUserConversationsAction, type ChatMessage, type ConversationSummary } from '@/lib/chat-actions'

// ── Types ─────────────────────────────────────────────────────────────────────

type Booking = {
  id: string; title: string; area: string; date: string; time?: string
  guests: number; total: number; status: string; cancellable?: boolean
  rating: number | null; image: string; slug: string; category?: string
  duration?: string; meetingPoint?: string; includes?: string[]
  latitude?: number; longitude?: number; operatorId?: string; host?: string
}

// ── Nav tabs ───────────────────────────────────────────────────────────────────

const NAV_TABS = [
  { id: 'bookings',  label: 'Bookings',  Icon: CalendarDays },
  { id: 'messages',  label: 'Messages',  Icon: MessageCircle },
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
            <a href={`/${booking.category === 'RENTALS' ? 'rentals' : 'experiences'}/${booking.slug}`}
              className="flex-1 flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{ height: 44, borderRadius: 10, backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              {booking.category === 'RENTALS' ? 'View rental' : 'View experience'}
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

// ── Chat modal ────────────────────────────────────────────────────────────────

function ChatModal({ operatorId, hostName, onClose }: { operatorId: string; hostName: string; onClose: () => void }) {
  const [convId, setConvId]     = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const inputRef                 = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getOrCreateConversationAction(operatorId).then(r => {
      if (r.ok && r.conversationId) {
        setConvId(r.conversationId)
        getMessagesAction(r.conversationId).then(m => { if (m) setMessages(m) })
      }
    })
  }, [operatorId])

  // Poll every 5 s
  useEffect(() => {
    if (!convId) return
    const id = setInterval(() => {
      getMessagesAction(convId).then(m => { if (m) setMessages(m) })
    }, 5000)
    return () => clearInterval(id)
  }, [convId])

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 150) }, [convId])

  const send = async () => {
    if (!convId || !input.trim() || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    await sendMessageAction(convId, text)
    const updated = await getMessagesAction(convId)
    if (updated) setMessages(updated)
    setSending(false)
  }

  const fmtTime = (d: Date) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4 pointer-events-none">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md pointer-events-auto flex flex-col" style={{ height: 'min(480px, 85svh)', border: '1px solid #E8E4DE', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #F0EDE8' }}>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} style={{ color: '#C8A97E' }} />
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111' }}>{hostName}</span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={18} style={{ color: '#6F675C' }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!convId && <p style={{ fontSize: 13, color: '#9E9A94', textAlign: 'center', marginTop: 20 }}>Connecting…</p>}
            {convId && messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 30 }}>
                <MessageCircle size={28} style={{ color: '#D1CDC7', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: '#9E9A94' }}>Start the conversation!</p>
                <p style={{ fontSize: 12, color: '#C8C4BE', marginTop: 4 }}>Ask your host about the experience, meeting point, or anything else.</p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.isOwn ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '75%' }}>
                  <div style={{ backgroundColor: m.isOwn ? '#111111' : '#F5F1EB', color: m.isOwn ? 'white' : '#111111', padding: '9px 14px', borderRadius: m.isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 14, lineHeight: 1.5 }}>
                    {m.content}
                  </div>
                  <p style={{ fontSize: 10, color: '#9E9A94', marginTop: 3, textAlign: m.isOwn ? 'right' : 'left' }}>{fmtTime(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', borderTop: '1px solid #F0EDE8', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Type a message…"
              disabled={!convId}
              style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 16, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }}
            />
            <button onClick={send} disabled={!input.trim() || sending || !convId}
              style={{ width: 40, height: 40, borderRadius: 10, border: 'none', backgroundColor: input.trim() && convId ? '#111111' : '#E8E4DE', cursor: input.trim() && convId ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={16} style={{ color: input.trim() && convId ? 'white' : '#9E9A94' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Bookings tab ───────────────────────────────────────────────────────────────

function CancelConfirmModal({ booking, onConfirm, onClose, cancelling }: {
  booking: Booking
  onConfirm: () => void
  onClose: () => void
  cancelling: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
        <div className="px-6 pt-6 pb-2">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 8 }}>Cancel booking?</h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.6, marginBottom: 12 }}>
            You're about to cancel <strong style={{ color: '#111111' }}>{booking.title}</strong> on <strong style={{ color: '#111111' }}>{booking.date}</strong>.
          </p>
          <div style={{ backgroundColor: '#FEF9EC', border: '1px solid #E8D4B8', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', fontWeight: 600, marginBottom: 4 }}>Refund of IDR {booking.total.toLocaleString('id-ID')}</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.6 }}>
              Your refund will be processed within 3–5 business days and may take a further 3–7 days to appear on your payment method.
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onConfirm}
            disabled={cancelling}
            style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', backgroundColor: '#B66A45', color: 'white', fontSize: 14, fontWeight: 600, cursor: cancelling ? 'default' : 'pointer', opacity: cancelling ? 0.7 : 1, fontFamily: 'var(--font-inter)' }}
          >
            {cancelling ? 'Cancelling…' : 'Yes, cancel booking'}
          </button>
          <button
            onClick={onClose}
            disabled={cancelling}
            style={{ flex: 1, height: 42, borderRadius: 10, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 14, color: '#6F675C', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
          >
            Keep booking
          </button>
        </div>
      </div>
    </div>
  )
}

type EventBookingItem = NonNullable<UserData['eventBookings']>[number]

function BookingsTab({ dbBookings, dbEventBookings, onRefresh }: { dbBookings?: Booking[]; dbEventBookings?: EventBookingItem[]; onRefresh: () => void }) {
  const [cancelled, setCancelled] = useState<Set<string>>(new Set())
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancellingEvent, setCancellingEvent] = useState<string | null>(null)
  const [reviewing, setReviewing] = useState<Booking | null>(null)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const [chatBooking, setChatBooking] = useState<Booking | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null)
  const [confirmCancelEvent, setConfirmCancelEvent] = useState<EventBookingItem | null>(null)

  const cancel = async (b: Booking) => {
    setCancelling(b.id)
    const res = await cancelBookingAction(b.id)
    setCancelling(null)
    if (res.ok) {
      setCancelled(s => new Set(s).add(b.id))
      setConfirmCancel(null)
    } else {
      alert(res.error ?? 'Failed to cancel booking.')
    }
  }

  const cancelEvent = async (b: EventBookingItem) => {
    setCancellingEvent(b.id)
    const res = await cancelEventBookingAction(b.id)
    setCancellingEvent(null)
    if (res.ok) {
      setCancelled(s => new Set(s).add(b.id))
      setConfirmCancelEvent(null)
    } else {
      alert(res.error ?? 'Failed to cancel booking.')
    }
  }

  const allBookings = dbBookings ?? []
  const allEventBookings = dbEventBookings ?? []
  const hasAny = allBookings.length > 0 || allEventBookings.length > 0

  return (
    <div className="space-y-4">
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>My Bookings</h2>
      {!hasAny ? (
        <div className="bg-white rounded-xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
          <CalendarDays size={28} style={{ color: '#C8A97E', margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>No bookings yet.</p>
          <a href="/search" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#C8A97E', textDecoration: 'underline' }}>Browse experiences →</a>
        </div>
      ) : (
        <>
          {/* ── Experiences ── */}
          {allBookings.length > 0 && (
            <>
              {allEventBookings.length > 0 && (
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9E9A94', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Experiences</p>
              )}
              {allBookings.map(b => {
                const isCancelled = cancelled.has(b.id)
                const effectiveStatus = isCancelled ? 'Cancelled' : b.status
                return (
                  <div key={b.id} className="bg-white rounded-xl p-4" style={{ border: '1px solid #E8E4DE', opacity: isCancelled ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    <div className="flex gap-4">
                      <img src={b.image} alt={b.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <a href={`/${b.category === 'RENTALS' ? 'rentals' : 'experiences'}/${b.slug}`} style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111', textDecoration: 'none', lineHeight: 1.3 }} className="hover:opacity-70 transition-opacity">
                            {b.title}
                          </a>
                          <div className="flex-shrink-0"><StatusBadge status={effectiveStatus} /></div>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={11} style={{ color: '#6F675C' }} />
                          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{b.area}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                          <span style={{ fontSize: 12, color: '#6F675C', display: 'inline-flex', alignItems: 'center', gap: 4 }}><CalendarDays size={11} />{b.date}{b.time ? ` · ${b.time}` : ''}</span>
                          <span style={{ fontSize: 12, color: '#6F675C', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={11} />{b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>IDR {b.total.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <button onClick={() => setDetailBooking({ ...b, status: effectiveStatus })}
                            style={{ backgroundColor: '#FEF9EC', border: '1px solid #E8D9C4', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#C8A97E', fontWeight: 600 }}
                            className="hover:opacity-75 transition-opacity">
                            View details
                          </button>
                          {b.operatorId && (
                            <button onClick={() => setChatBooking(b)}
                              style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#6F675C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
                              className="hover:opacity-75 transition-opacity">
                              <MessageCircle size={12} />
                              Message Host
                            </button>
                          )}
                          {effectiveStatus === 'Completed' && !b.rating && (
                            <button onClick={() => setReviewing(b)}
                              style={{ backgroundColor: '#FEF9EC', border: '1px solid #E8D9C4', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#C8A97E', fontWeight: 600 }}
                              className="hover:opacity-80 transition-opacity">
                              Leave a review
                            </button>
                          )}
                          {b.cancellable && !isCancelled && (
                            <button onClick={() => setConfirmCancel(b)}
                              style={{ height: 29, padding: '0 12px', border: '1px solid #FECACA', borderRadius: 6, fontSize: 12, color: '#B66A45', backgroundColor: 'white', cursor: 'pointer' }}>
                              Cancel &amp; Refund
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
            </>
          )}

          {/* ── Event tickets ── */}
          {allEventBookings.length > 0 && (
            <>
              {allBookings.length > 0 && (
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9E9A94', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8, marginBottom: 4 }}>Event Tickets</p>
              )}
              {allEventBookings.map(b => {
                const isCancelled = cancelled.has(b.id)
                const effectiveStatus = isCancelled ? 'Cancelled' : b.status
                return (
                  <div key={b.id} className="bg-white rounded-xl p-4" style={{ border: '1px solid #E8E4DE', opacity: isCancelled ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    <div className="flex gap-4">
                      {b.image ? (
                        <img src={b.image} alt={b.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: '#F5F1EB' }}>
                          <Ticket size={24} style={{ color: '#C8A97E' }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <a href={`/events/${b.slug}`} style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111', textDecoration: 'none', lineHeight: 1.3 }} className="hover:opacity-70 transition-opacity">
                            {b.title}
                          </a>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#C8A97E', background: '#FEF9EC', border: '1px solid #E8D9C4', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.05em' }}>EVENT</span>
                            <StatusBadge status={effectiveStatus} />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                          <span style={{ fontSize: 12, color: '#6F675C', display: 'inline-flex', alignItems: 'center', gap: 4 }}><CalendarDays size={11} />{b.date}</span>
                          <span style={{ fontSize: 12, color: '#6F675C', display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{b.location}</span>
                          <span style={{ fontSize: 12, color: '#6F675C', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ticket size={11} />{b.tickets} ticket{b.tickets > 1 ? 's' : ''}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>{b.total === 0 ? 'Free' : `IDR ${b.total.toLocaleString('id-ID')}`}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <a href={`/events/${b.slug}`}
                            style={{ backgroundColor: '#FEF9EC', border: '1px solid #E8D9C4', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#C8A97E', fontWeight: 600, textDecoration: 'none' }}
                            className="hover:opacity-75 transition-opacity">
                            View event
                          </a>
                          {b.cancellable && !isCancelled && (
                            <button onClick={() => setConfirmCancelEvent(b)}
                              style={{ height: 29, padding: '0 12px', border: '1px solid #FECACA', borderRadius: 6, fontSize: 12, color: '#B66A45', backgroundColor: 'white', cursor: 'pointer' }}>
                              Cancel &amp; Refund
                            </button>
                          )}
                        </div>
                        {effectiveStatus === 'Pending' && (
                          <p className="mt-2" style={{ fontSize: 12, color: '#C8A97E' }}>Awaiting payment confirmation</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </>
      )}

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
      {chatBooking?.operatorId && (
        <ChatModal
          operatorId={chatBooking.operatorId}
          hostName={chatBooking.host ?? 'Host'}
          onClose={() => setChatBooking(null)}
        />
      )}
      {confirmCancel && (
        <CancelConfirmModal
          booking={confirmCancel}
          cancelling={cancelling === confirmCancel.id}
          onConfirm={() => cancel(confirmCancel)}
          onClose={() => setConfirmCancel(null)}
        />
      )}
      {confirmCancelEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={e => { if (e.target === e.currentTarget) setConfirmCancelEvent(null) }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
            <div className="px-6 pt-6 pb-2">
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 8 }}>Cancel tickets?</h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.6, marginBottom: 12 }}>
                You're about to cancel <strong style={{ color: '#111111' }}>{confirmCancelEvent.tickets} ticket{confirmCancelEvent.tickets > 1 ? 's' : ''}</strong> for <strong style={{ color: '#111111' }}>{confirmCancelEvent.title}</strong> on <strong style={{ color: '#111111' }}>{confirmCancelEvent.date}</strong>.
              </p>
              {confirmCancelEvent.total > 0 && (
                <div style={{ backgroundColor: '#FEF9EC', border: '1px solid #E8D4B8', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', fontWeight: 600, marginBottom: 4 }}>Refund of IDR {confirmCancelEvent.total.toLocaleString('id-ID')}</p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.6 }}>
                    Your refund will be processed within 3–5 business days.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => cancelEvent(confirmCancelEvent)}
                disabled={cancellingEvent === confirmCancelEvent.id}
                style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', backgroundColor: '#B66A45', color: 'white', fontSize: 14, fontWeight: 600, cursor: cancellingEvent === confirmCancelEvent.id ? 'default' : 'pointer', opacity: cancellingEvent === confirmCancelEvent.id ? 0.7 : 1, fontFamily: 'var(--font-inter)' }}>
                {cancellingEvent === confirmCancelEvent.id ? 'Cancelling…' : 'Yes, cancel tickets'}
              </button>
              <button
                onClick={() => setConfirmCancelEvent(null)}
                disabled={!!cancellingEvent}
                style={{ flex: 1, height: 42, borderRadius: 10, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 14, color: '#6F675C', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                Keep tickets
              </button>
            </div>
          </div>
        </div>
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

// ── Messages tab ───────────────────────────────────────────────────────────────

function MessagesTab({ initialOperatorId }: { initialOperatorId?: string }) {
  const [convs, setConvs]           = useState<ConversationSummary[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeConv, setActiveConv] = useState<ConversationSummary | null>(null)
  const [messages, setMessages]     = useState<ChatMessage[]>([])
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)
  const inputRef                     = useRef<HTMLInputElement>(null)
  const messagesEndRef               = useRef<HTMLDivElement>(null)

  const loadConvs = () =>
    listUserConversationsAction().then(r => { if (r) setConvs(r); setLoading(false) }).catch(() => setLoading(false))

  useEffect(() => { loadConvs() }, [])

  // Auto-open conversation with operator when arriving from host page
  useEffect(() => {
    if (!initialOperatorId) return
    getOrCreateConversationAction(initialOperatorId).then(async r => {
      if (!r.ok || !r.conversationId) return
      const convList = await listUserConversationsAction()
      if (convList) {
        setConvs(convList)
        const found = convList.find(c => c.id === r.conversationId)
        if (found) { setActiveConv(found); setMessages([]) }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOperatorId])

  // Poll conversation list every 30s
  useEffect(() => {
    const t = setInterval(loadConvs, 30_000)
    return () => clearInterval(t)
  }, [])

  // Poll thread every 5s when open
  useEffect(() => {
    if (!activeConv) return
    const poll = () => getMessagesAction(activeConv.id).then(m => { if (m) setMessages(m) }).catch(() => {})
    poll()
    const t = setInterval(poll, 5_000)
    return () => clearInterval(t)
  }, [activeConv])

  useEffect(() => { if (activeConv) setTimeout(() => inputRef.current?.focus(), 100) }, [activeConv])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const openConv = (c: ConversationSummary) => {
    setActiveConv(c)
    setMessages([])
    // optimistically clear unread badge in the list
    setConvs(prev => prev.map(p => p.id === c.id ? { ...p, unreadCount: 0 } : p))
  }

  const send = async () => {
    if (!activeConv || !input.trim() || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    await sendMessageAction(activeConv.id, text)
    const updated = await getMessagesAction(activeConv.id)
    if (updated) setMessages(updated)
    setSending(false)
    loadConvs()
  }

  const fmtTime = (d: Date) => {
    const date = new Date(d)
    const now = new Date()
    if (date.toDateString() === now.toDateString())
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const totalUnread = convs.reduce((s, c) => s + c.unreadCount, 0)

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>
        Messages{totalUnread > 0 && <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 600, color: '#C8A97E' }}>{totalUnread} unread</span>}
      </h2>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E4DE', minHeight: 460 }}>
        <div className="flex h-full" style={{ minHeight: 460 }}>

          {/* Conversation list — hidden on mobile when thread is open */}
          <div
            className={`${activeConv ? 'hidden lg:flex' : 'flex'} flex-col`}
            style={{ width: '100%', maxWidth: 280, borderRight: '1px solid #F0EDE8', flexShrink: 0 }}
          >
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <p style={{ fontSize: 13, color: '#9E9A94' }}>Loading…</p>
              </div>
            ) : convs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle size={28} style={{ color: '#D1CDC7', marginBottom: 10 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111111', marginBottom: 4 }}>No messages yet</p>
                <p style={{ fontSize: 13, color: '#9E9A94', lineHeight: 1.5 }}>
                  Message a host from one of your booking cards.
                </p>
              </div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {convs.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openConv(c)}
                    style={{
                      width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', padding: '14px 16px',
                      backgroundColor: activeConv?.id === c.id ? '#F5F1EB' : 'white',
                      borderBottom: '1px solid #F5F1EB',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#E8E4DE', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {c.otherImage
                        ? <img src={c.otherImage} alt={c.otherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 16, color: '#6F675C' }}>{c.otherName[0]?.toUpperCase()}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: c.unreadCount > 0 ? 700 : 600, color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.otherName}</p>
                        <p style={{ fontSize: 11, color: '#9E9A94', flexShrink: 0 }}>{fmtTime(c.lastMessageAt)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <p style={{ fontSize: 12, color: c.unreadCount > 0 ? '#111111' : '#9E9A94', fontWeight: c.unreadCount > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {c.lastMessage || 'No messages yet'}
                        </p>
                        {c.unreadCount > 0 && (
                          <span style={{ flexShrink: 0, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#C8A97E', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Thread panel */}
          <div className={`${activeConv ? 'flex' : 'hidden lg:flex'} flex-col flex-1 min-w-0`}>
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle size={32} style={{ color: '#D1CDC7', marginBottom: 12 }} />
                <p style={{ fontSize: 14, color: '#9E9A94' }}>Select a conversation</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {/* Back button — mobile only */}
                  <button
                    className="lg:hidden"
                    onClick={() => setActiveConv(null)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#6F675C' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  </button>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#E8E4DE', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeConv.otherImage
                      ? <img src={activeConv.otherImage} alt={activeConv.otherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 14, color: '#6F675C' }}>{activeConv.otherName[0]?.toUpperCase()}</span>}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111111', fontFamily: 'var(--font-inter)' }}>{activeConv.otherName}</p>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                      <p style={{ fontSize: 13, color: '#9E9A94' }}>No messages yet — say hello!</p>
                    </div>
                  )}
                  {messages.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: m.isOwn ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{ backgroundColor: m.isOwn ? '#111111' : '#F5F1EB', color: m.isOwn ? 'white' : '#111111', padding: '9px 14px', borderRadius: m.isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 14, lineHeight: 1.5 }}>
                          {m.content}
                        </div>
                        <p style={{ fontSize: 10, color: '#9E9A94', marginTop: 3, textAlign: m.isOwn ? 'right' : 'left' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', borderTop: '1px solid #F0EDE8', display: 'flex', gap: 8, flexShrink: 0 }}>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                    placeholder="Type a message…"
                    style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 16, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }}
                    onFocus={e => (e.target.style.borderColor = '#C8A97E')}
                    onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || sending}
                    style={{ width: 40, height: 40, borderRadius: 10, border: 'none', backgroundColor: input.trim() ? '#111111' : '#E8E4DE', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
                  >
                    <Send size={16} style={{ color: input.trim() ? 'white' : '#9E9A94' }} />
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

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

type ProfileFields = {
  name: string; phone: string; nationality: string
  bio: string; dateOfBirth: string
  address: string; city: string; country: string
}
const PROFILE_EMPTY: ProfileFields = { name: '', phone: '', nationality: '', bio: '', dateOfBirth: '', address: '', city: '', country: '' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-inter)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCss: React.CSSProperties = {
  width: '100%', height: 42, borderRadius: 10, border: '1px solid #E8E4DE',
  padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111',
  outline: 'none', backgroundColor: 'white', boxSizing: 'border-box',
}

function SettingsTab({ sessionEmail }: { sessionEmail: string }) {
  const [profile, setProfile] = useState<ProfileFields>(PROFILE_EMPTY)
  const [notifs, setNotifs]   = useState(PROFILE_NOTIF_DEFAULTS)
  const [saved, setSaved]     = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [resetSent, setResetSent]     = useState(false)
  const [resetSending, setResetSending] = useState(false)

  useEffect(() => {
    getUserProfileSettingsAction().then(s => {
      if (!s) return
      setProfile({
        name: s.name, phone: s.phone, nationality: s.nationality,
        bio: s.bio, dateOfBirth: s.dateOfBirth,
        address: s.address, city: s.city, country: s.country,
      })
      if (s.notifSettings) setNotifs({ ...PROFILE_NOTIF_DEFAULTS, ...s.notifSettings } as typeof PROFILE_NOTIF_DEFAULTS)
    })
  }, [])

  const set = (key: keyof ProfileFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile(p => ({ ...p, [key]: e.target.value }))

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#C8A97E')
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#E8E4DE')

  const save = async () => {
    setSaving(true)
    setSaveError(false)
    const res = await updateUserProfileSettingsAction({ ...profile, notifSettings: notifs })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    else { setSaveError(true); setTimeout(() => setSaveError(false), 3000) }
  }

  return (
    <div className="space-y-5">
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>Account Settings</h2>

      {/* ── Personal info ── */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 16 }}>Personal Information</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <input value={profile.name} onChange={set('name')} placeholder="Your name"
                style={inputCss} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Email">
              <div style={{ ...inputCss, height: 42, display: 'flex', alignItems: 'center', backgroundColor: '#F9F8F6', color: '#6F675C' }}>
                {sessionEmail || <span style={{ color: '#C8C4BE' }}>—</span>}
              </div>
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone number">
              <input type="tel" value={profile.phone} onChange={set('phone')} placeholder="+62 812 345 6789"
                style={inputCss} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Date of birth">
              <input type="date" value={profile.dateOfBirth} onChange={set('dateOfBirth')}
                style={inputCss} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nationality">
              <input value={profile.nationality} onChange={set('nationality')} placeholder="e.g. Australian"
                style={inputCss} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>
          <Field label="About you">
            <textarea
              value={profile.bio}
              onChange={e => { if (e.target.value.length <= 300) set('bio')(e) }}
              placeholder="Tell hosts a little about yourself..."
              rows={3}
              style={{ ...inputCss, height: 'auto', padding: '10px 14px', resize: 'none', lineHeight: 1.6 }}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#C8C4BE', marginTop: 2, textAlign: 'right' }}>{profile.bio.length}/300</p>
          </Field>
        </div>
      </div>

      {/* ── Address ── */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 16 }}>Address</h3>
        <div className="space-y-4">
          <Field label="Street address">
            <input value={profile.address} onChange={set('address')} placeholder="Street, villa number, etc."
              style={inputCss} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="City / area">
              <input value={profile.city} onChange={set('city')} placeholder="e.g. Canggu, Ubud"
                style={inputCss} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Country">
              <input value={profile.country} onChange={set('country')} placeholder="e.g. Australia"
                style={inputCss} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Notifications ── */}
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
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#111111', fontFamily: 'var(--font-inter)' }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#6F675C', marginTop: 1, fontFamily: 'var(--font-inter)' }}>{desc}</p>
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

      {/* ── Password ── */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 6 }}>Password</h3>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', marginBottom: 14 }}>
          We'll send a reset link to <strong style={{ color: '#111111' }}>{sessionEmail}</strong>. The link expires in 1 hour.
        </p>
        {resetSent ? (
          <div className="flex items-center gap-2" style={{ color: '#4A7C59', fontSize: 13, fontFamily: 'var(--font-inter)' }}>
            <Check size={14} /> Reset link sent — check your inbox
          </div>
        ) : (
          <button
            onClick={async () => {
              setResetSending(true)
              await requestPasswordResetAction(sessionEmail)
              setResetSending(false)
              setResetSent(true)
            }}
            disabled={resetSending}
            style={{ height: 38, paddingInline: 18, borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', color: '#111111', fontSize: 13, fontWeight: 500, cursor: resetSending ? 'default' : 'pointer', opacity: resetSending ? 0.6 : 1, fontFamily: 'var(--font-inter)' }}
          >
            {resetSending ? 'Sending…' : 'Send reset link'}
          </button>
        )}
      </div>

      {/* ── Save ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ height: 44, paddingInline: 24, borderRadius: 10, border: 'none', backgroundColor: saved ? '#4A7C59' : saveError ? '#B66A45' : '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'background 0.2s', minWidth: 140, fontFamily: 'var(--font-inter)' }}
        >
          {saved ? <><Check size={14} /> Saved!</> : saving ? 'Saving…' : saveError ? 'Save failed' : 'Save Changes'}
        </button>
        {saveError && <span style={{ fontSize: 13, color: '#B66A45', fontFamily: 'var(--font-inter)' }}>Could not save. Please try again.</span>}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ProfilePageInner() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in?callbackUrl=/profile'
      }
    },
  })
  const isLoaded = status !== 'loading'
  const isSignedIn = status === 'authenticated'
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') ?? 'bookings')
  const initialOperatorId = searchParams.get('operator') ?? undefined
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
      try { setLocalWishlistCount(JSON.parse(localStorage.getItem('balible_wishlist') ?? '[]').length) } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn])

  const displayName  = session?.user?.name || dbData?.name || 'Traveler'
  const displayEmail = session?.user?.email || dbData?.email || ''
  const displayImage = session?.user?.image || dbData?.image || null
  const memberSince  = dbData?.createdAt || null

  // Stats derived from real data
  const tripsCount    = dbData?.bookings?.length ?? 0
  const reviewsCount  = dbData?.reviews?.length ?? 0
  const wishlistCount = dbData?.wishlistSlugs?.length ?? localWishlistCount

  const renderTab = () => {
    switch (activeTab) {
      case 'bookings':  return <BookingsTab dbBookings={dbData?.bookings} dbEventBookings={dbData?.eventBookings} onRefresh={loadDb} />
      case 'messages':  return <MessagesTab initialOperatorId={initialOperatorId} />
      case 'wishlist':  return <WishlistTab dbSlugs={dbData?.wishlistSlugs} />
      case 'reviews':   return <ReviewsTab dbReviews={dbData?.reviews} />
      case 'settings':  return <SettingsTab sessionEmail={displayEmail} />
      default:          return <BookingsTab dbBookings={dbData?.bookings} dbEventBookings={dbData?.eventBookings} onRefresh={loadDb} />
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F1EB', fontFamily: 'var(--font-inter)' }}>
        <p style={{ color: '#6F675C', fontSize: 14 }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      <div className="max-w-[1100px] mx-auto px-5 lg:px-8 py-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — Profile card */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-4 lg:p-6 lg:text-center" style={{ border: '1px solid #E8E4DE' }}>
              {/* Mobile: horizontal layout · Desktop: centered vertical */}
              <div className="flex items-center gap-4 lg:block">
                {/* Avatar */}
                <div className="relative flex-shrink-0 lg:mx-auto lg:mb-4" style={{ width: 64, height: 64 }}>
                  <img
                    src={displayImage ?? '/avatar-default.png'}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                    style={{ border: '3px solid white', boxShadow: '0 0 0 2px #C8A97E' }}
                  />
                  <button
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#111111', border: '2px solid white', cursor: 'pointer' }}
                  >
                    <Camera size={11} style={{ color: 'white' }} />
                  </button>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</h2>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayEmail}</p>
                  {memberSince && (
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#9E9A94', marginTop: 1 }}>Member since {memberSince}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4" style={{ borderTop: '1px solid #E8E4DE' }}>
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
            {renderTab()}
          </main>
        </div>
      </div>

      <Footer />

      {/* Profile-specific mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white md:hidden z-50"
        style={{ borderTop: '1px solid #E8E4DE', height: 'calc(64px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center" style={{ height: 64 }}>
          {[
            { id: 'bookings', label: 'Bookings', Icon: CalendarDays  },
            { id: 'messages', label: 'Chat',     Icon: MessageCircle },
            { id: 'wishlist', label: 'Wishlist', Icon: Heart         },
            { id: 'reviews',  label: 'Reviews',  Icon: Star          },
            { id: 'settings', label: 'Settings', Icon: Settings      },
          ].map(({ id, label, Icon }) => {
            const active = activeTab === id
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon size={20} color={active ? '#C8A97E' : '#6F675C'} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 10, color: active ? '#C8A97E' : '#6F675C', fontWeight: active ? 600 : 400 }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageInner />
    </Suspense>
  )
}
