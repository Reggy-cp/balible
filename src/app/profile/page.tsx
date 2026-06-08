'use client'

import { useState } from 'react'
import {
  User, Heart, CalendarDays, Settings, Star, MapPin, Clock,
  Edit2, Camera, Check, ArrowRight, Home, Search, Map, X,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'

// ── Types ─────────────────────────────────────────────────────────────────────

type Booking = {
  id: string; title: string; area: string; date: string
  guests: number; total: number; status: string
  rating: number | null; image: string; slug: string
}

type SubmittedReview = {
  bookingId: string
  experience: string
  slug: string
  reviewDate: string
  rating: number
  comment: string
  image: string
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const PROFILE = {
  name: 'Sarah Kim',
  email: 'sarah.kim@email.com',
  joined: 'March 2024',
  avatar: null as string | null,
  tripsCount: 3,
  reviewsCount: 2,
  wishlistCount: 3,
}

const BOOKINGS: Booking[] = [
  {
    id: 'BAL-001',
    title: 'Pottery Making Class',
    area: 'Ubud',
    date: 'May 18, 2024',
    guests: 2,
    total: 900000,
    status: 'Completed',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&auto=format&fit=crop&q=80',
    slug: 'pottery-making-class',
  },
  {
    id: 'BAL-002',
    title: 'Sound Healing Journey',
    area: 'Ubud',
    date: 'Jun 8, 2024',
    guests: 1,
    total: 350000,
    status: 'Upcoming',
    rating: null,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&auto=format&fit=crop&q=80',
    slug: 'sound-healing-journey',
  },
  {
    id: 'BAL-003',
    title: 'Silver Jewelry Workshop',
    area: 'Canggu',
    date: 'Apr 12, 2024',
    guests: 2,
    total: 1100000,
    status: 'Completed',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&auto=format&fit=crop&q=80',
    slug: 'silver-jewelry-workshop',
  },
  {
    id: 'BAL-004',
    title: 'Uluwatu Sunset & Kecak',
    area: 'Uluwatu',
    date: 'May 25, 2024',
    guests: 2,
    total: 900000,
    status: 'Completed',
    rating: null,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&auto=format&fit=crop&q=80',
    slug: 'uluwatu-kecak-sunset',
  },
]

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

function ReviewModal({ booking, onSubmit, onClose }: {
  booking: Booking
  onSubmit: (r: SubmittedReview) => void
  onClose: () => void
}) {
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [done, setDone]       = useState(false)

  const active = hover || rating

  const submit = () => {
    if (!rating || !comment.trim()) return
    onSubmit({
      bookingId:  booking.id,
      experience: booking.title,
      slug:       booking.slug,
      reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating,
      comment:    comment.trim(),
      image:      booking.image,
    })
    setDone(true)
    setTimeout(onClose, 1600)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
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

            <button
              onClick={submit}
              disabled={!rating || !comment.trim()}
              style={{
                width: '100%', height: 44, borderRadius: 10, border: 'none',
                backgroundColor: !rating || !comment.trim() ? '#E8E4DE' : '#111111',
                color: !rating || !comment.trim() ? '#6F675C' : 'white',
                fontSize: 14, fontWeight: 600,
                cursor: !rating || !comment.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}>
              Submit Review
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Bookings tab ───────────────────────────────────────────────────────────────

function BookingsTab({ reviews, onReview }: { reviews: SubmittedReview[]; onReview: (r: SubmittedReview) => void }) {
  const [cancelled, setCancelled] = useState<Set<string>>(new Set())
  const [reviewing, setReviewing] = useState<Booking | null>(null)
  const cancel = (id: string) => setCancelled(s => new Set(s).add(id))

  const savedBookings: Booking[] = lsp('balible_bookings', [])
  const savedIds = new Set(savedBookings.map(b => b.id))
  const allBookings = [...savedBookings, ...BOOKINGS.filter(b => !savedIds.has(b.id))]

  return (
    <div className="space-y-4">
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>My Bookings</h2>
      {allBookings.map(b => {
        const isCancelled = cancelled.has(b.id)
        const effectiveStatus = isCancelled ? 'Cancelled' : b.status
        const submitted = reviews.find(r => r.bookingId === b.id)
        const displayRating = submitted ? submitted.rating : b.rating
        return (
        <div key={b.id} className="bg-white rounded-xl p-4" style={{ border: '1px solid #E8E4DE', opacity: isCancelled ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          <div className="flex gap-4">
            <img src={b.image} alt={b.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <a href={`/experiences/${b.slug}`} style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">
                    {b.title}
                  </a>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={11} style={{ color: '#6F675C' }} />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{b.area}</span>
                  </div>
                </div>
                <StatusBadge status={effectiveStatus} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                <span style={{ fontSize: 12, color: '#6F675C' }}>📅 {b.date}</span>
                <span style={{ fontSize: 12, color: '#6F675C' }}>👤 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>IDR {b.total.toLocaleString('id-ID')}</span>
              </div>
              {effectiveStatus === 'Completed' && (
                displayRating ? (
                  <div className="flex items-center gap-1 mt-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={11} fill={i <= displayRating ? '#C8A97E' : '#E8E4DE'} color={i <= displayRating ? '#C8A97E' : '#E8E4DE'} />)}
                    <span style={{ fontSize: 12, color: '#6F675C', marginLeft: 2 }}>You rated this</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setReviewing(b)}
                    className="mt-2 hover:opacity-80 transition-opacity"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 13, color: '#C8A97E', fontWeight: 600 }}>
                    ★ Leave a review
                  </button>
                )
              )}
              {effectiveStatus === 'Upcoming' && (
                <div className="flex gap-2 mt-3">
                  <a
                    href={`/experiences/${b.slug}`}
                    style={{ height: 32, display: 'inline-flex', alignItems: 'center', padding: '0 14px', backgroundColor: '#111111', color: 'white', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
                    className="hover:opacity-90 transition-opacity"
                  >
                    View experience
                  </a>
                  <button onClick={() => cancel(b.id)} style={{ height: 32, padding: '0 14px', border: '1px solid #FECACA', borderRadius: 6, fontSize: 12, color: '#B66A45', backgroundColor: 'white', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        )
      })}

      {reviewing && (
        <ReviewModal
          booking={reviewing}
          onSubmit={r => { onReview(r); setReviewing(null) }}
          onClose={() => setReviewing(null)}
        />
      )}
    </div>
  )
}

// ── Wishlist tab ───────────────────────────────────────────────────────────────

const WISHLIST_LOOKUP = [
  { slug: 'pottery-making-class',      title: 'Pottery Making Class',         area: 'Ubud',     price: 450000, rating: 4.9, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80' },
  { slug: 'silver-jewelry-workshop',   title: 'Silver Jewelry Workshop',       area: 'Canggu',   price: 550000, rating: 4.8, image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300&auto=format&fit=crop&q=80' },
  { slug: 'batik-painting-workshop',   title: 'Batik Painting Workshop',       area: 'Ubud',     price: 380000, rating: 4.7, image: 'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=300&auto=format&fit=crop&q=80' },
  { slug: 'sound-healing-journey',     title: 'Sound Healing Journey',         area: 'Ubud',     price: 350000, rating: 4.8, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&auto=format&fit=crop&q=80' },
  { slug: 'sunrise-yoga-class',        title: 'Sunrise Yoga & Meditation',     area: 'Canggu',   price: 250000, rating: 4.9, image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=300&auto=format&fit=crop&q=80' },
  { slug: 'water-temple-purification', title: 'Water Temple Purification',     area: 'Gianyar',  price: 600000, rating: 4.8, image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=300&auto=format&fit=crop&q=80' },
  { slug: 'uluwatu-kecak-sunset',      title: 'Uluwatu Sunset & Kecak Dance',  area: 'Uluwatu',  price: 450000, rating: 4.9, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&auto=format&fit=crop&q=80' },
  { slug: 'balinese-cooking-class',    title: 'Balinese Cooking Class',        area: 'Seminyak', price: 480000, rating: 4.8, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop&q=80' },
  { slug: 'jimbaran-seafood-sunset',   title: 'Jimbaran Seafood & Sunset',     area: 'Jimbaran', price: 350000, rating: 4.6, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&auto=format&fit=crop&q=80' },
  { slug: 'beginner-surf-lesson',      title: 'Beginner Surf Lesson',          area: 'Kuta',     price: 320000, rating: 4.7, image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=300&auto=format&fit=crop&q=80' },
  { slug: 'snorkeling-amed',           title: 'Snorkeling at Amed Reef',       area: 'Amed',     price: 420000, rating: 4.8, image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=300&auto=format&fit=crop&q=80' },
  { slug: 'rice-terrace-walk',         title: 'Tegalalang Rice Terrace Walk',  area: 'Ubud',     price: 280000, rating: 4.8, image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=300&auto=format&fit=crop&q=80' },
]

const DEFAULT_WISHLIST_SLUGS = ['pottery-making-class', 'sound-healing-journey', 'uluwatu-kecak-sunset']

function WishlistTab() {
  const slugs = lsp<string[]>('balible_wishlist', DEFAULT_WISHLIST_SLUGS)
  const items = WISHLIST_LOOKUP.filter(e => slugs.includes(e.slug))

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
      {items.length === 0 ? (
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
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#111111' }}>{exp.rating}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#111111' }}>IDR {(exp.price/1000).toFixed(0)}K</span>
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

const STATIC_REVIEWS = [
  {
    experience: 'Pottery Making Class',
    slug: 'pottery-making-class',
    date: 'May 18, 2024',
    rating: 5,
    comment: 'Absolutely magical. Made is an incredible teacher — patient, encouraging, and full of beautiful stories about her family\'s craft. I made a small bowl that I treasure deeply.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&auto=format&fit=crop&q=80',
  },
  {
    experience: 'Silver Jewelry Workshop',
    slug: 'silver-jewelry-workshop',
    date: 'Apr 12, 2024',
    rating: 5,
    comment: 'Ketut is an absolute master. I made a silver ring and could not believe how beautiful it turned out. The studio atmosphere was incredible — real Balinese charm.',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&auto=format&fit=crop&q=80',
  },
]

function ReviewsTab({ reviews }: { reviews: SubmittedReview[] }) {
  const submittedSlugs = new Set(reviews.map(r => r.slug))
  const merged = [
    ...reviews.map(r => ({ experience: r.experience, slug: r.slug, date: r.reviewDate, rating: r.rating, comment: r.comment, image: r.image })),
    ...STATIC_REVIEWS.filter(r => !submittedSlugs.has(r.slug)),
  ]

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>My Reviews</h2>
      {merged.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>No reviews yet. Complete a booking to leave your first review.</p>
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

const PROFILE_INFO_DEFAULTS = { name: PROFILE.name, email: PROFILE.email, phone: '+1 234 567 8900', nationality: 'Australian' }
const PROFILE_NOTIF_DEFAULTS = { bookingConfirm: true, reminders: true, offers: false }

function lsp<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}

function SettingsTab() {
  const [info, setInfo]   = useState(() => lsp('balible_profile_info', PROFILE_INFO_DEFAULTS))
  const [notifs, setNotifs] = useState(() => lsp('balible_profile_notifs', PROFILE_NOTIF_DEFAULTS))
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem('balible_profile_info',   JSON.stringify(info))
    localStorage.setItem('balible_profile_notifs', JSON.stringify(notifs))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const INFO_FIELDS: { label: string; key: keyof typeof PROFILE_INFO_DEFAULTS }[] = [
    { label: 'Full Name',   key: 'name'        },
    { label: 'Email',       key: 'email'       },
    { label: 'Phone',       key: 'phone'       },
    { label: 'Nationality', key: 'nationality' },
  ]

  return (
    <div className="space-y-5">
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>Account Settings</h2>

      {/* Personal info */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 16 }}>Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {INFO_FIELDS.map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <input
                value={info[f.key]}
                onChange={e => setInfo(p => ({ ...p, [f.key]: e.target.value }))}
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
  const [activeTab, setActiveTab] = useState('bookings')
  const [reviews, setReviews] = useState<SubmittedReview[]>(() => lsp('balible_user_reviews', []))

  const addReview = (r: SubmittedReview) => {
    const updated = [r, ...reviews.filter(x => x.bookingId !== r.bookingId)]
    setReviews(updated)
    localStorage.setItem('balible_user_reviews', JSON.stringify(updated))
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'bookings': return <BookingsTab reviews={reviews} onReview={addReview} />
      case 'wishlist': return <WishlistTab />
      case 'reviews':  return <ReviewsTab reviews={reviews} />
      case 'settings': return <SettingsTab />
      default:         return <BookingsTab reviews={reviews} onReview={addReview} />
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
                <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: '#C8A97E', border: '3px solid white', boxShadow: '0 0 0 2px #C8A97E' }}>
                  <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 700, color: 'white' }}>
                    {PROFILE.name[0]}
                  </span>
                </div>
                <button
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#111111', border: '2px solid white', cursor: 'pointer' }}
                >
                  <Camera size={12} style={{ color: 'white' }} />
                </button>
              </div>

              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>{PROFILE.name}</h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', marginTop: 3 }}>{PROFILE.email}</p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginTop: 2 }}>Member since {PROFILE.joined}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5" style={{ borderTop: '1px solid #E8E4DE' }}>
                {[
                  { label: 'Trips',    value: PROFILE.tripsCount },
                  { label: 'Reviews',  value: PROFILE.reviewsCount },
                  { label: 'Saved',    value: PROFILE.wishlistCount },
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

              <div className="mt-5 pt-4" style={{ borderTop: '1px solid #E8E4DE' }}>
                <a
                  href="/for-hosts"
                  className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ height: 40, borderRadius: 8, backgroundColor: '#F5F1EB', color: '#111111', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
                >
                  Become a host <ArrowRight size={13} />
                </a>
              </div>
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

      {/* MOBILE BOTTOM NAV */}
      <MobileNav />
    </div>
  )
}
