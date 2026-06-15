'use client'

import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard, Compass, CalendarDays, TrendingUp, Star,
  UserCircle, Settings, LogOut, Bell, Plus, ChevronDown,
  ArrowUpRight, Menu, X, Search, Download,
  MoreHorizontal, Eye, Edit2, Play, Pause, Trash2,
  CheckCircle, XCircle, MapPin, Clock, Users, Camera, Check,
  Ticket, Globe, Lock, ChevronLeft, ChevronRight, CalendarRange, Images,
} from 'lucide-react'
import {
  getHostEvents, createEvent, updateEvent, deleteEvent,
  type EventRow, type EventInput,
} from '@/lib/event-actions'
import {
  saveHostListingAction, submitHostListingAction, type HostListingInput,
  getHostDashboardData, getHostExperiencesAction,
  updateExperienceStatusAction, deleteExperienceAction,
  getOperatorPayoutsAction, type OperatorPayout,
  requestPayoutAction,
  updateBookingStatusAction,
  type DashExp, type DashBooking, type DashReview, type EarningsByMonth,
} from '@/lib/actions'
import { PAYOUT_MIN_NET } from '@/lib/constants'

// ── Data ──────────────────────────────────────────────────────────────────────

const EXPERIENCES = [
  {
    id: 1, slug: 'pottery-making-class',
    title: 'Pottery Making Class', category: 'Art & Craft', area: 'Ubud',
    price: 450000, duration: '2.5 hours', maxGuests: 8,
    rating: 4.9, totalReviews: 128, bookings: 87, status: 'Active',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&auto=format&fit=crop&q=80',
    earnings: 39150000,
  },
  {
    id: 2, slug: 'batik-painting-workshop',
    title: 'Batik Painting Workshop', category: 'Art & Craft', area: 'Ubud',
    price: 380000, duration: '3 hours', maxGuests: 6,
    rating: 4.7, totalReviews: 64, bookings: 41, status: 'Active',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&auto=format&fit=crop&q=80',
    earnings: 15580000,
  },
  {
    id: 3, slug: 'clay-sculpture-session',
    title: 'Clay Sculpture Session', category: 'Art & Craft', area: 'Ubud',
    price: 520000, duration: '4 hours', maxGuests: 4,
    rating: 4.8, totalReviews: 19, bookings: 12, status: 'Draft',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&auto=format&fit=crop&q=80',
    earnings: 6240000,
  },
  {
    id: 4, slug: 'wooden-mask-carving',
    title: 'Wooden Mask Carving Class', category: 'Art & Craft', area: 'Gianyar',
    price: 600000, duration: '5 hours', maxGuests: 4,
    rating: 4.6, totalReviews: 9, bookings: 5, status: 'Paused',
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80',
    earnings: 3000000,
  },
]

const BOOKINGS_DATA = [
  { id: 'B001', ref: 'BAL-2024-001', guest: 'Sarah Kim',     email: 'sarah.k@email.com',  experience: 'Pottery Making Class',    expImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=60&auto=format&fit=crop&q=80', date: 'Jun 8, 2024',  time: '10:00 AM', guests: 2, total: 900000,  status: 'Confirmed', bookedOn: 'May 28' },
  { id: 'B002', ref: 'BAL-2024-002', guest: 'Thomas Reeves', email: 'treeves@email.com',   experience: 'Pottery Making Class',    expImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=60&auto=format&fit=crop&q=80', date: 'Jun 8, 2024',  time: '2:00 PM',  guests: 3, total: 1350000, status: 'Pending',   bookedOn: 'Jun 1'  },
  { id: 'B003', ref: 'BAL-2024-003', guest: 'Priya Mehta',   email: 'priya.m@email.com',   experience: 'Batik Painting Workshop', expImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=60&auto=format&fit=crop&q=80', date: 'Jun 9, 2024',  time: '09:00 AM', guests: 1, total: 380000,  status: 'Confirmed', bookedOn: 'May 30' },
  { id: 'B004', ref: 'BAL-2024-004', guest: 'Marco Bianchi', email: 'marco.b@email.com',   experience: 'Pottery Making Class',    expImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=60&auto=format&fit=crop&q=80', date: 'Jun 10, 2024', time: '11:00 AM', guests: 2, total: 900000,  status: 'Pending',   bookedOn: 'Jun 2'  },
  { id: 'B005', ref: 'BAL-2024-005', guest: 'Yuki Tanaka',   email: 'yuki.t@email.com',    experience: 'Clay Sculpture Session',  expImage: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=60&auto=format&fit=crop&q=80', date: 'Jun 12, 2024', time: '10:00 AM', guests: 2, total: 1040000, status: 'Confirmed', bookedOn: 'Jun 3'  },
  { id: 'B006', ref: 'BAL-2024-006', guest: 'Alex Chen',     email: 'alex.c@email.com',    experience: 'Batik Painting Workshop', expImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=60&auto=format&fit=crop&q=80', date: 'Jun 6, 2024',  time: '2:00 PM',  guests: 4, total: 1520000, status: 'Completed', bookedOn: 'May 20' },
  { id: 'B007', ref: 'BAL-2024-007', guest: 'Lisa Wagner',   email: 'lisa.w@email.com',    experience: 'Pottery Making Class',    expImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=60&auto=format&fit=crop&q=80', date: 'Jun 3, 2024',  time: '09:00 AM', guests: 1, total: 450000,  status: 'Completed', bookedOn: 'May 18' },
  { id: 'B008', ref: 'BAL-2024-008', guest: 'James Park',    email: 'james.p@email.com',   experience: 'Pottery Making Class',    expImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=60&auto=format&fit=crop&q=80', date: 'Jun 1, 2024',  time: '11:00 AM', guests: 2, total: 900000,  status: 'Cancelled', bookedOn: 'May 15' },
]

const REVIEWS_DATA = [
  { id: 'R1', guest: 'Sarah K.',  experience: 'Pottery Making Class',    rating: 5, comment: "Absolutely magical. Made is an incredible teacher — patient, encouraging, and full of beautiful stories about her family's craft. I made a small bowl that I treasure deeply.", date: 'May 12, 2024' },
  { id: 'R2', guest: 'Thomas R.', experience: 'Pottery Making Class',    rating: 5, comment: "One of the best experiences I've had in Bali. The studio setting is serene, and you genuinely leave with something you shaped with your own hands.", date: 'Apr 18, 2024' },
  { id: 'R3', guest: 'Priya M.',  experience: 'Pottery Making Class',    rating: 5, comment: 'The location alone is worth it — surrounded by rice paddies. Wonderful for couples or solo travellers. Made makes everyone feel at ease.', date: 'Mar 25, 2024' },
  { id: 'R4', guest: 'Alex C.',   experience: 'Batik Painting Workshop', rating: 4, comment: 'Really enjoyed the batik experience. The patterns we made were beautiful and the instructor was knowledgeable. Would have loved a little more time on the design phase.', date: 'Jun 6, 2024' },
  { id: 'R5', guest: 'Yuki T.',   experience: 'Clay Sculpture Session',  rating: 5, comment: "Incredible! The 4-hour session flew by. I created a miniature Ganesh that I'm so proud of. The space is peaceful and the instruction is world-class.", date: 'May 28, 2024' },
  { id: 'R6', guest: 'Lisa W.',   experience: 'Pottery Making Class',    rating: 4, comment: 'Great experience overall. The pottery wheel is harder than it looks but Made was very patient with me. Left with a beautiful if slightly lopsided bowl!', date: 'Jun 3, 2024' },
]

// Area → approximate map coordinates (used when syncing new experiences to the map)
const AREA_COORDS: Record<string, [number, number]> = {
  'Ubud':      [-8.5069, 115.2625],
  'Canggu':    [-8.6478, 115.1383],
  'Gianyar':   [-8.5374, 115.3247],
  'Uluwatu':   [-8.8293, 115.0849],
  'Seminyak':  [-8.6906, 115.1589],
  'Jimbaran':  [-8.7898, 115.1687],
  'Kuta':      [-8.7183, 115.1685],
  'Amed':      [-8.3428, 115.6478],
  'Sanur':     [-8.7059, 115.2619],
  'Nusa Dua':  [-8.7900, 115.2300],
  'Kintamani': [-8.2385, 115.3757],
  'Sidemen':   [-8.4791, 115.4549],
  'Medewi':    [-8.4724, 114.8493],
}

const MONTHLY_EARNINGS = [3200000, 2800000, 4100000, 3600000, 4800000, 5200000, 4400000, 5800000, 5100000, 6200000, 5700000, 7400000]
const MONTHS_SHORT     = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']

const PAYOUTS = [
  { id: 'P1', period: 'May 1–31, 2024', gross: 7400000, status: 'Paid',    date: 'Jun 5, 2024'  },
  { id: 'P2', period: 'Apr 1–30, 2024', gross: 5700000, status: 'Paid',    date: 'May 5, 2024'  },
  { id: 'P3', period: 'Mar 1–31, 2024', gross: 6200000, status: 'Paid',    date: 'Apr 5, 2024'  },
  { id: 'P4', period: 'Feb 1–29, 2024', gross: 5100000, status: 'Pending', date: 'Mar 5, 2024'  },
]

const NAV_ITEMS = [
  { id: 'overview',      label: 'Overview',      Icon: LayoutDashboard },
  { id: 'experiences',   label: 'Experiences',   Icon: Compass },
  { id: 'events',        label: 'Events',        Icon: Ticket },
  { id: 'bookings',      label: 'Bookings',      Icon: CalendarDays },
  { id: 'availability',  label: 'Availability',  Icon: CalendarRange },
  { id: 'earnings',      label: 'Earnings',      Icon: TrendingUp },
  { id: 'photos',        label: 'Photos',        Icon: Images },
  { id: 'reviews',       label: 'Reviews',       Icon: Star },
  { id: 'profile',       label: 'Profile',       Icon: UserCircle },
  { id: 'settings',      label: 'Settings',      Icon: Settings },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `IDR ${(n / 1_000_000).toFixed(1)}M`
  return `IDR ${n.toLocaleString('id-ID')}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active:    { bg: '#F0F7F2', color: '#4A7C59' },
    Confirmed: { bg: '#F0F7F2', color: '#4A7C59' },
    Completed: { bg: '#EEF2FF', color: '#4B6CB7' },
    Pending:   { bg: '#FDF8F4', color: '#C8A97E' },
    Draft:     { bg: '#F5F1EB', color: '#6F675C' },
    Paused:          { bg: '#FEF9F4', color: '#C8A97E' },
    'Pending Review': { bg: '#FDF8F4', color: '#C8A97E' },
    Cancelled:       { bg: '#FEF2F2', color: '#B66A45' },
    Paid:            { bg: '#F0F7F2', color: '#4A7C59' },
  }
  const s = map[status] ?? { bg: '#F5F1EB', color: '#6F675C' }
  return (
    <span style={{ ...s, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const W = 320, H = 96
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 12) - 6
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#cg)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= n ? '#C8A97E' : '#E8E4DE'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: '#111111' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: '#6F675C', marginTop: 3 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Overview Panel ────────────────────────────────────────────────────────────

const OVERVIEW_STATS = [
  { label: 'Total Bookings',    value: '145',       change: '+12% from last month', up: true },
  { label: 'Total Earnings',    value: 'IDR 63.9M', change: '+18% from last month', up: true },
  { label: 'Upcoming Bookings', value: '18',        change: 'Next 7 days',          up: null },
  { label: 'Average Rating',    value: '4.8',       change: 'From 220 reviews',     up: null },
]

const UPCOMING = [
  { title: 'Pottery Making Class',    date: 'Jun 8, 2024 · 10:00 AM',  guests: 2, status: 'Confirmed', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=120&auto=format&fit=crop&q=80' },
  { title: 'Pottery Making Class',    date: 'Jun 8, 2024 · 02:00 PM',  guests: 3, status: 'Confirmed', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=120&auto=format&fit=crop&q=80' },
  { title: 'Batik Painting Workshop', date: 'Jun 9, 2024 · 09:00 AM',  guests: 1, status: 'Pending',   image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=120&auto=format&fit=crop&q=80' },
  { title: 'Clay Sculpture Session',  date: 'Jun 12, 2024 · 10:00 AM', guests: 2, status: 'Confirmed', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=120&auto=format&fit=crop&q=80' },
]

function OverviewPanel({ onNav, commissionRate, experiences: liveExperiences, bookings: liveBookings, reviews: liveReviews, hostName }: {
  onNav: (id: string) => void; commissionRate: number
  experiences?: DashExp[]; bookings?: DashBooking[]; reviews?: DashReview[]; hostName?: string
}) {
  const [period, setPeriod] = useState('This Month')
  const netMult = (100 - commissionRate) / 100
  const expSource = liveExperiences ?? EXPERIENCES
  const totalNetEarnings = expSource.reduce((a, e) => a + e.earnings, 0) * netMult
  const lastMonthNet = MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 1] * netMult

  const totalBookings  = liveBookings !== undefined ? liveBookings.length : null
  const activeBookings = liveBookings !== undefined ? liveBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length : null
  const avgRating      = liveReviews !== undefined && liveReviews.length > 0
    ? (liveReviews.reduce((a, r) => a + r.rating, 0) / liveReviews.length).toFixed(1) : null
  const reviewCount    = liveReviews !== undefined ? liveReviews.length : null

  const stats = OVERVIEW_STATS.map(s => {
    if (s.label === 'Total Earnings')    return { ...s, value: fmt(totalNetEarnings), change: `After ${commissionRate}% commission` }
    if (s.label === 'Total Bookings'    && totalBookings  !== null) return { ...s, value: String(totalBookings),  change: totalBookings  === 0 ? 'No bookings yet'  : s.change }
    if (s.label === 'Upcoming Bookings' && activeBookings !== null) return { ...s, value: String(activeBookings), change: 'Confirmed & pending' }
    if (s.label === 'Average Rating'    && avgRating      !== null) return { ...s, value: avgRating, change: reviewCount === 0 ? 'No reviews yet' : `From ${reviewCount} review${reviewCount !== 1 ? 's' : ''}` }
    return s
  })

  const slice  = period === 'This Month' ? MONTHLY_EARNINGS.slice(6)    : MONTHLY_EARNINGS.slice(0, 6)
  const labels = period === 'This Month' ? MONTHS_SHORT.slice(6)        : MONTHS_SHORT.slice(0, 6)

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: '#111111' }}>
            Welcome back, {hostName ?? 'Made Sari'}
          </h1>
          <p style={{ fontSize: 14, color: '#6F675C', marginTop: 3 }}>Here's what's happening with your experiences.</p>
        </div>
        <button onClick={() => onNav('experiences')}
          className="hidden sm:flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0 ml-4"
          style={{ height: 42, backgroundColor: '#111111', color: 'white', border: 'none', borderRadius: 8, padding: '0 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> New Experience
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: '1px solid #E8E4DE' }}>
            <p style={{ fontSize: 12, color: '#6F675C' }}>{s.label}</p>
            <p className="mt-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(16px,1.8vw,22px)', fontWeight: 700, color: '#111111', lineHeight: 1.2 }}>{s.value}</p>
            <p className="mt-1.5 flex items-center gap-1" style={{ fontSize: 11, color: s.up ? '#4A7C59' : '#6F675C' }}>
              {s.up && <ArrowUpRight size={11} />}
              {s.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Upcoming bookings */}
        <div className="lg:col-span-3 bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Upcoming Bookings</h2>
            <button onClick={() => onNav('bookings')}
              style={{ fontSize: 13, color: '#C8A97E', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {UPCOMING.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F1EB' }}>
                <img src={b.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
                  <p style={{ fontSize: 12, color: '#6F675C', marginTop: 2 }}>{b.date}</p>
                  <p style={{ fontSize: 12, color: '#6F675C' }}>{b.guests} guest{b.guests > 1 ? 's' : ''}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
            <div className="flex items-center justify-between mb-1">
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Earnings</h2>
              <button onClick={() => setPeriod(p => p === 'This Month' ? 'Last 6 Months' : 'This Month')}
                className="flex items-center gap-1"
                style={{ background: 'none', border: '1px solid #E8E4DE', borderRadius: 6, padding: '3px 9px', fontSize: 11, color: '#6F675C', cursor: 'pointer' }}>
                {period} <ChevronDown size={10} />
              </button>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111' }}>{fmt(lastMonthNet)}</span>
              <span style={{ fontSize: 12, color: '#4A7C59' }}>↑ 30%</span>
            </div>
            <MiniChart data={slice} color="#C8A97E" />
            <div className="flex justify-between mt-1">
              {labels.map(m => <span key={m} style={{ fontSize: 9, color: '#6F675C' }}>{m}</span>)}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
            <h2 className="mb-3" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Top Experiences</h2>
            <div className="space-y-3">
              {EXPERIENCES.filter(e => e.status === 'Active').map((e, i) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6F675C', width: 16 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: '#111111', fontWeight: 500 }}>{e.title}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#4A7C59' }}>{fmt(Math.round(e.earnings * netMult))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Experiences Panel ─────────────────────────────────────────────────────────

function ExperiencesPanel({ commissionRate, initialExperiences }: { commissionRate: number; initialExperiences?: DashExp[] }) {
  const [filter, setFilter]   = useState('All')
  const [exps, setExps]       = useState<DashExp[]>(initialExperiences ?? EXPERIENCES)
  const [showForm, setShowForm] = useState(false)
  const [editingExp, setEditingExp] = useState<DashExp | null>(null)
  const [menuOpen, setMenuOpen] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageDragging, setImageDragging] = useState(false)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [galleryDragging, setGalleryDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError]   = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const SUBCATEGORY_MAP: Record<string, string[]> = {
    'Art & Craft':        ['Pottery', 'Jewelry', 'Painting', 'Wood Carving', 'Textile', 'Weaving'],
    'Wellness & Healing': ['Yoga', 'Meditation', 'Sound Healing', 'Spa & Ritual', 'Breathwork'],
    'Culture':            ['Temple & Ceremony', 'Dance & Music', 'History Tour', 'Language'],
    'Culinary':           ['Cooking Class', 'Spice & Herb', 'Market Tour', 'Coffee & Tea', 'Fermentation', 'Dessert & Sweets', 'Farm to Table'],
    'Spiritual':          ['Temple & Ceremony', 'Healing Ritual', 'Holy Water', 'Blessing', 'Energy Work'],
    'Nature & Outdoors':  ['Trekking', 'Waterfall', 'Sunrise', 'Rice Terrace', 'Wildlife'],
    'Water Activities':   ['Surfing', 'Snorkelling', 'Freediving', 'Scuba Diving', 'Stand-Up Paddle'],
    'Local Experts':      ['Photographers', 'Guides', 'Wellness Practitioners', 'Childcare', 'Pet Care', 'Creative Mentors', 'Drivers'],
    'Rentals':            ['Scooter', 'Motorbike', 'Bicycle', 'E-Bike', 'Villa', 'Workspace', 'Studio', 'Surfboard', 'Camping Gear', 'Diving Equipment'],
  }

  const BLANK_FORM = { title: '', category: 'Art & Craft', subcategory: 'Pottery', area: 'Ubud', price: '', duration: '', maxGuests: '', minGuests: '', meetingPoint: '', description: '', includes: '', excludes: '' }
  const [formData, setFormData] = useState(BLANK_FORM)
  const setField = (k: keyof typeof BLANK_FORM, v: string) => setFormData(p => ({ ...p, [k]: v }))
  const setCategory = (cat: string) => setFormData(p => ({ ...p, category: cat, subcategory: SUBCATEGORY_MAP[cat]?.[0] ?? '' }))

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleGalleryFiles = (files: FileList | null) => {
    if (!files) return
    const slots = 8 - galleryPreviews.length
    Array.from(files).slice(0, slots).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => setGalleryPreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (idx: number) =>
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx))

  const [itinerary, setItinerary] = useState([{ time: '', activity: '' }])

  const addStep = () => setItinerary(prev => [...prev, { time: '', activity: '' }])
  const removeStep = (idx: number) =>
    setItinerary(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx))
  const updateStep = (idx: number, field: 'time' | 'activity', value: string) =>
    setItinerary(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))

  const [formStep, setFormStep] = useState(1)

  const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const [schedule, setSchedule] = useState(
    WEEK.map(day => ({ day, enabled: false, open: '09:00', close: '17:00' }))
  )
  const toggleDay = (i: number) =>
    setSchedule(prev => prev.map((d, j) => j === i ? { ...d, enabled: !d.enabled } : d))
  const updateSchedule = (i: number, field: 'open' | 'close', val: string) =>
    setSchedule(prev => prev.map((d, j) => j === i ? { ...d, [field]: val } : d))

  const openEdit = (exp: typeof EXPERIENCES[0]) => {
    setEditingExp(exp)
    setImagePreview(exp.image)
    setFormStep(1)
    const savedData = (() => { try { const v = localStorage.getItem(`balible_exp_data_${exp.slug}`); return v ? JSON.parse(v) : {} } catch { return {} } })()
    setFormData({ title: exp.title, category: exp.category, subcategory: savedData.subcategory || SUBCATEGORY_MAP[exp.category]?.[0] || '', area: exp.area, price: String(exp.price), duration: exp.duration, maxGuests: String(exp.maxGuests), minGuests: String(savedData.minGuests || 1), meetingPoint: savedData.meetingPoint || '', description: savedData.description || '', includes: (savedData.includes ?? []).join('\n'), excludes: (savedData.excludes ?? []).join('\n') })
    const saved = localStorage.getItem(`balible_schedule_${exp.slug}`)
    if (saved) setSchedule(JSON.parse(saved))
    else setSchedule(WEEK.map(day => ({ day, enabled: false, open: '09:00', close: '17:00' })))
    setShowForm(true)
  }

  const saveAndClose = async (action: 'draft' | 'submit' = 'draft') => {
    if (submitting) return
    setSaveError('')
    setSubmitting(true)
    const slug = editingExp?.slug ?? (formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-experience')
    const toLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean)
    const listingInput: HostListingInput = {
      slug,
      title: formData.title || editingExp?.title || '',
      description: formData.description || '',
      category: formData.category,
      area: formData.area,
      price: Number(formData.price) || editingExp?.price || 0,
      duration: formData.duration || editingExp?.duration || '',
      maxGuests: Number(formData.maxGuests) || editingExp?.maxGuests || 8,
      meetingPoint: formData.meetingPoint || '',
      includes: toLines(formData.includes),
      excludes: toLines(formData.excludes),
      imageUrl: imagePreview ?? undefined,
    }
    const res = action === 'submit'
      ? await submitHostListingAction(listingInput)
      : await saveHostListingAction(listingInput)
    setSubmitting(false)
    if (!res.ok) {
      setSaveError('Could not save. Check your connection and try again.')
      return
    }
    // Refresh list from DB so UI reflects actual saved state
    getHostExperiencesAction().then(rows => { if (rows) setExps(rows) })
    closeForm()
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingExp(null)
    setFormStep(1)
    setImagePreview(null)
    setGalleryPreviews([])
    setItinerary([{ time: '', activity: '' }])
    setSchedule(WEEK.map(day => ({ day, enabled: false, open: '09:00', close: '17:00' })))
    setFormData(BLANK_FORM)
  }

  const tabs    = ['All', 'Active', 'Pending Review', 'Draft', 'Paused']
  const visible = filter === 'All' ? exps : exps.filter(e => e.status === filter)

  const STATUS_TO_ENUM: Record<string, 'ACTIVE' | 'PAUSED' | 'DRAFT'> = { Active: 'ACTIVE', Paused: 'PAUSED', Draft: 'DRAFT' }
  const setStatus = (exp: DashExp, s: string) => {
    setExps(prev => prev.map(e => e.id === exp.id ? { ...e, status: s } : e))
    setMenuOpen(null)
    updateExperienceStatusAction(exp.slug, STATUS_TO_ENUM[s] ?? 'DRAFT').catch(() => {})
  }

  return (
    <div>
      <PageHeader
        title="My Experiences"
        subtitle={`${exps.length} total listings`}
        action={
          <button onClick={() => setShowForm(true)}
            className="hidden sm:flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ height: 42, backgroundColor: '#111111', color: 'white', border: 'none', borderRadius: 8, padding: '0 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={15} /> New Experience
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="overflow-x-auto mb-5 scrollbar-none">
        <div className="inline-flex gap-1 bg-white rounded-xl p-1" style={{ border: '1px solid #E8E4DE' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ padding: '6px 16px', borderRadius: 10, fontSize: 13, fontWeight: filter === t ? 600 : 400, flexShrink: 0, backgroundColor: filter === t ? '#111111' : 'transparent', color: filter === t ? 'white' : '#6F675C', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
              {t}
              <span className="ml-1.5" style={{ fontSize: 11, color: filter === t ? 'rgba(255,255,255,0.5)' : '#C8C4BE' }}>
                {t === 'All' ? exps.length : exps.filter(e => e.status === t).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Experience rows */}
      <div className="space-y-3">
        {visible.map(exp => (
          <div key={exp.id} className="bg-white rounded-xl p-4" style={{ border: '1px solid #E8E4DE' }}>
            {/* Info */}
            <div className="flex items-start gap-3">
              <img src={exp.image} alt={exp.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111' }}>{exp.title}</h3>
                  <StatusBadge status={exp.status} />
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#6F675C' }}><MapPin size={10} />{exp.area}</span>
                  <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#6F675C' }}><Clock size={10} />{exp.duration}</span>
                  <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#6F675C' }}><Users size={10} />Up to {exp.maxGuests}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>IDR {exp.price.toLocaleString('id-ID')}<span style={{ fontWeight: 400, color: '#6F675C' }}>/person</span></span>
                  <span style={{ fontSize: 12, color: '#6F675C' }}>⭐ {exp.rating} ({exp.totalReviews})</span>
                  <span style={{ fontSize: 12, color: '#6F675C' }}>{exp.bookings} bookings</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#4A7C59' }}>{fmt(Math.round(exp.earnings * (100 - commissionRate) / 100))} <span style={{ fontSize: 10, fontWeight: 400, color: '#9E9A94' }}>net</span></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #F5F1EB' }}>
              <a href={`/experiences/${exp.slug}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                style={{ height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid #E8E4DE', color: '#6F675C', fontSize: 12, textDecoration: 'none' }}>
                <Eye size={11} /> View
              </a>
              <button onClick={() => openEdit(exp)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                style={{ height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid #E8E4DE', background: 'none', cursor: 'pointer', color: '#6F675C', fontSize: 12 }}>
                <Edit2 size={11} /> Edit
              </button>
              {exp.status !== 'Active' && (
                <button onClick={() => setStatus(exp, 'Active')}
                  className="flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                  style={{ height: 30, padding: '0 10px', borderRadius: 8, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Play size={11} /> {exp.status === 'Draft' ? 'Publish' : 'Activate'}
                </button>
              )}
              {exp.status === 'Active' && (
                <button onClick={() => setStatus(exp, 'Paused')}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  style={{ height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid #E8E4DE', background: 'white', color: '#C8A97E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Pause size={11} /> Pause
                </button>
              )}
              <button onClick={() => {
                  setExps(prev => prev.filter(e => e.id !== exp.id))
                  deleteExperienceAction(exp.slug).catch(() => {})
                }}
                className="flex items-center gap-1.5 hover:bg-red-50 transition-colors"
                style={{ height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid #E8E4DE', background: 'white', color: '#B66A45', fontSize: 12, cursor: 'pointer' }}>
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sm:hidden mt-4">
        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
          style={{ backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          <Plus size={15} /> New Experience
        </button>
      </div>

      {/* Create modal — step-by-step wizard */}
      {showForm && (() => {
        const STEPS = ['Basics', 'Details', 'Photos', 'Itinerary', 'Schedule']
        const inputStyle: React.CSSProperties = { width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }
        const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 6 }

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">

              {/* Drag handle — mobile only */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1CDC7' }} />
              </div>

              {/* Header */}
              <div className="flex items-start justify-between px-5 sm:px-6 pt-3 sm:pt-6 mb-5">
                <div>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', margin: 0 }}>{editingExp ? 'Edit Experience' : 'New Experience'}</h2>
                  <p style={{ fontSize: 12, color: '#9E9A94', margin: '3px 0 0' }}>Step {formStep} of {STEPS.length} · {STEPS[formStep - 1]}</p>
                </div>
                <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 2 }}><X size={20} style={{ color: '#6F675C' }} /></button>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 99, backgroundColor: '#F0EDE8', marginBottom: 24, marginInline: 20 }}>
                <div style={{ height: '100%', borderRadius: 99, backgroundColor: '#111111', width: `${(formStep / STEPS.length) * 100}%`, transition: 'width 0.3s ease' }} />
              </div>

              {/* Step 1 — Basics */}
              {formStep === 1 && (
                <div key={`basics-${editingExp?.id ?? 'new'}`} className="space-y-4 px-5 sm:px-6">
                  <div>
                    <label style={labelStyle}>Experience title</label>
                    <input type="text" value={formData.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Traditional Batik Dyeing Class" style={inputStyle} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Category</label>
                      <select value={formData.category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}>
                        {['Art & Craft','Wellness & Healing','Culture','Culinary','Spiritual','Nature & Outdoors','Water Activities','Local Experts','Rentals'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Subcategory</label>
                      <select value={formData.subcategory} onChange={e => setField('subcategory', e.target.value)} style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}>
                        {(SUBCATEGORY_MAP[formData.category] ?? []).map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Area</label>
                      <select value={formData.area} onChange={e => setField('area', e.target.value)} style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}>
                        {['Ubud','Canggu','Kuta','Seminyak','Uluwatu','Gianyar','Sanur','Nusa Dua','Amed','Jimbaran','Kintamani','Sidemen','Medewi'].map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea value={formData.description} onChange={e => setField('description', e.target.value)} placeholder="Describe what guests will experience..." rows={4}
                      style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                </div>
              )}

              {/* Step 2 — Details */}
              {formStep === 2 && (
                <div key={`details-${editingExp?.id ?? 'new'}`} className="space-y-4 px-5 sm:px-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Price per person (IDR)</label>
                      <input type="number" value={formData.price} onChange={e => setField('price', e.target.value)} placeholder="450000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Duration</label>
                      <input type="text" value={formData.duration} onChange={e => setField('duration', e.target.value)} placeholder="e.g. 2.5 hours" style={inputStyle} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Max guests</label>
                      <input type="number" value={formData.maxGuests} onChange={e => setField('maxGuests', e.target.value)} placeholder="8" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Min guests</label>
                      <input type="number" value={formData.minGuests} onChange={e => setField('minGuests', e.target.value)} placeholder="1" style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Meeting point</label>
                    <input type="text" value={formData.meetingPoint} onChange={e => setField('meetingPoint', e.target.value)} placeholder="e.g. Jl. Raya Ubud No. 12, Ubud, Bali" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>What&apos;s included</label>
                    <textarea
                      value={formData.includes}
                      onChange={e => setField('includes', e.target.value)}
                      placeholder="One item per line&#10;e.g. All materials&#10;Welcome drink&#10;Take-home piece"
                      rows={4}
                      style={{ ...inputStyle, resize: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>What&apos;s not included</label>
                    <textarea
                      value={formData.excludes}
                      onChange={e => setField('excludes', e.target.value)}
                      placeholder="One item per line&#10;e.g. Transport to venue&#10;Gratuities&#10;Personal expenses"
                      rows={4}
                      style={{ ...inputStyle, resize: 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 3 — Photos */}
              {formStep === 3 && (
                <div className="space-y-4 px-5 sm:px-6">
                  {/* Cover photo */}
                  <div>
                    <label style={labelStyle}>Cover Photo</label>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }} />
                    {imagePreview ? (
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 180 }}>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                          style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={14} style={{ color: 'white' }} />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()}
                          style={{ position: 'absolute', bottom: 8, right: 8, height: 28, padding: '0 10px', borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'white', fontWeight: 500 }}>
                          <Camera size={12} /> Change
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setImageDragging(true) }}
                        onDragLeave={() => setImageDragging(false)}
                        onDrop={e => { e.preventDefault(); setImageDragging(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f) }}
                        style={{ height: 150, borderRadius: 12, border: `2px dashed ${imageDragging ? '#C8A97E' : '#E8E4DE'}`, backgroundColor: imageDragging ? '#FFFDF9' : '#F9F9F7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Camera size={18} style={{ color: '#6F675C' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111111', margin: 0 }}>Upload cover photo</p>
                          <p style={{ fontSize: 12, color: '#6F675C', margin: '2px 0 0' }}>Click or drag & drop · JPG, PNG, WEBP</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gallery */}
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>Gallery Photos</label>
                      <span style={{ fontSize: 12, color: '#9E9A94' }}>{galleryPreviews.length}/8</span>
                    </div>
                    <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={e => { handleGalleryFiles(e.target.files); if (galleryInputRef.current) galleryInputRef.current.value = '' }} />
                    {galleryPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {galleryPreviews.map((src, i) => (
                          <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                            <img src={src} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={() => removeGalleryImage(i)}
                              style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={11} style={{ color: 'white' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {galleryPreviews.length < 8 && (
                      <div onClick={() => galleryInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setGalleryDragging(true) }}
                        onDragLeave={() => setGalleryDragging(false)}
                        onDrop={e => { e.preventDefault(); setGalleryDragging(false); handleGalleryFiles(e.dataTransfer.files) }}
                        style={{ height: 68, borderRadius: 10, border: `2px dashed ${galleryDragging ? '#C8A97E' : '#E8E4DE'}`, backgroundColor: galleryDragging ? '#FFFDF9' : '#F9F9F7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Camera size={15} style={{ color: '#6F675C' }} />
                        <span style={{ fontSize: 13, color: '#6F675C' }}>{galleryPreviews.length === 0 ? 'Add gallery photos' : 'Add more photos'}</span>
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: '#9E9A94', marginTop: 4 }}>Up to 8 photos · shown in your experience listing</p>
                  </div>
                </div>
              )}

              {/* Step 4 — Itinerary */}
              {formStep === 4 && (
                <div className="px-5 sm:px-6">
                  <p style={{ fontSize: 13, color: '#6F675C', marginBottom: 12, marginTop: 0 }}>Walk guests through the schedule, step by step.</p>
                  <div className="space-y-2">
                    {itinerary.map((step, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="time" value={step.time} onChange={e => updateStep(i, 'time', e.target.value)}
                          style={{ width: 110, flexShrink: 0, borderRadius: 10, border: '1px solid #E8E4DE', padding: '9px 10px', fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
                        <input type="text" value={step.activity} onChange={e => updateStep(i, 'activity', e.target.value)}
                          placeholder="Activity or description"
                          style={{ flex: 1, borderRadius: 10, border: '1px solid #E8E4DE', padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
                        <button onClick={() => removeStep(i)} disabled={itinerary.length === 1}
                          style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, border: '1px solid #E8E4DE', background: 'none', cursor: itinerary.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: itinerary.length === 1 ? 0.35 : 1 }}>
                          <X size={13} style={{ color: '#6F675C' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addStep}
                    style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#C8A97E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Plus size={14} /> Add step
                  </button>
                </div>
              )}

              {/* Step 5 — Schedule */}
              {formStep === 5 && (
                <div className="px-5 sm:px-6">
                  <p style={{ fontSize: 13, color: '#6F675C', marginBottom: 14, marginTop: 0 }}>
                    Set which days your experience is available and the operating hours.
                  </p>
                  <div className="space-y-2">
                    {schedule.map((row, i) => (
                      <div key={row.day} className="flex items-center gap-3"
                        style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #E8E4DE', backgroundColor: row.enabled ? '#FAFAF8' : 'white', transition: 'background 0.15s' }}>
                        {/* Toggle */}
                        <button
                          onClick={() => toggleDay(i)}
                          style={{
                            flexShrink: 0, width: 36, height: 20, borderRadius: 99,
                            backgroundColor: row.enabled ? '#111111' : '#E8E4DE',
                            border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                          }}>
                          <span style={{
                            position: 'absolute', top: 2, left: row.enabled ? 18 : 2,
                            width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white',
                            transition: 'left 0.2s', display: 'block',
                          }} />
                        </button>
                        {/* Day label */}
                        <span style={{ width: 32, fontSize: 13, fontWeight: 600, color: row.enabled ? '#111111' : '#9E9A94', flexShrink: 0 }}>{row.day}</span>
                        {/* Time inputs */}
                        {row.enabled ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input type="time" value={row.open}
                              onChange={e => updateSchedule(i, 'open', e.target.value)}
                              style={{ flex: 1, borderRadius: 8, border: '1px solid #E8E4DE', padding: '6px 8px', fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
                            <span style={{ fontSize: 12, color: '#9E9A94', flexShrink: 0 }}>to</span>
                            <input type="time" value={row.close}
                              onChange={e => updateSchedule(i, 'close', e.target.value)}
                              style={{ flex: 1, borderRadius: 8, border: '1px solid #E8E4DE', padding: '6px 8px', fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, color: '#C8C4BE', flex: 1 }}>Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer nav */}
              <div className="flex gap-2 mt-6 px-5 sm:px-6 pb-8 sm:pb-6">
                {formStep > 1 ? (
                  <button onClick={() => setFormStep(s => s - 1)}
                    style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', background: 'none', fontSize: 13, fontWeight: 600, color: '#6F675C', cursor: 'pointer' }}>Back</button>
                ) : (
                  <button onClick={closeForm}
                    style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', background: 'none', fontSize: 13, fontWeight: 600, color: '#6F675C', cursor: 'pointer' }}>Cancel</button>
                )}
                {formStep < STEPS.length ? (
                  <button onClick={() => setFormStep(s => s + 1)}
                    style={{ flex: 2, height: 44, borderRadius: 10, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Next →</button>
                ) : (
                  <>
                    {saveError && (
                      <p style={{ width: '100%', fontSize: 12, color: '#B66A45', textAlign: 'center', marginBottom: 4 }}>{saveError}</p>
                    )}
                    <button onClick={() => saveAndClose('draft')} disabled={submitting}
                      style={{ flex: 1.4, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', background: 'white', fontSize: 13, fontWeight: 600, color: '#6F675C', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? 'Saving…' : 'Save Draft'}
                    </button>
                    <button onClick={() => saveAndClose('submit')} disabled={submitting}
                      style={{ flex: 2, height: 44, borderRadius: 10, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? 'Submitting…' : 'Submit for Review'}
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ── Bookings Panel ────────────────────────────────────────────────────────────

function BookingsPanel({ initialBookings }: { initialBookings?: DashBooking[] }) {
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch]             = useState('')
  const [bookings, setBookings]         = useState<DashBooking[]>(initialBookings ?? BOOKINGS_DATA)
  const [updating, setUpdating]         = useState<string | null>(null)

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']
  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || b.guest.toLowerCase().includes(q) || b.experience.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const updateStatus = async (b: DashBooking, status: 'CONFIRMED' | 'CANCELLED') => {
    setUpdating(b.id)
    const res = await updateBookingStatusAction(b.ref, status)
    setUpdating(null)
    if (res.ok) {
      setBookings(p => p.map(x => x.id === b.id ? { ...x, status: status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled' } : x))
    } else {
      alert(res.error ?? 'Failed to update booking.')
    }
  }

  return (
    <div>
      <PageHeader title="Bookings" subtitle={`${bookings.length} total bookings`} />

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
          <input placeholder="Search guest, experience, or ref..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 40, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 34, paddingRight: 14, fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none', backgroundColor: 'white' }} />
        </div>
        <button
          onClick={() => {
            const rows = [['Ref','Guest','Experience','Date','Guests','Total','Status'], ...bookings.map(b => [b.ref, b.guest, b.experience, b.date, b.guests, b.total, b.status])]
            const csv = rows.map(r => r.join(',')).join('\n')
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'bookings.csv'; a.click()
          }}
          className="flex items-center gap-2 px-4 rounded-xl flex-shrink-0 hover:opacity-80"
          style={{ height: 40, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 13, color: '#6F675C', cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: statusFilter === s ? 600 : 400, flexShrink: 0, backgroundColor: statusFilter === s ? '#111111' : 'white', color: statusFilter === s ? 'white' : '#6F675C', border: '1px solid', borderColor: statusFilter === s ? '#111111' : '#E8E4DE', cursor: 'pointer', transition: 'all 0.15s' }}>
            {s}
            <span className="ml-1.5" style={{ fontSize: 11, opacity: 0.6 }}>
              {s === 'All' ? bookings.length : bookings.filter(b => b.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
            <p style={{ fontSize: 14, color: '#6F675C' }}>No bookings match your filter.</p>
          </div>
        )}
        {filtered.map(b => (
          <div key={b.id} className="bg-white rounded-xl p-4" style={{ border: '1px solid #E8E4DE' }}>
            <div className="flex items-start gap-3">
              <img src={b.expImage} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111111' }}>{b.guest}</p>
                    <p style={{ fontSize: 12, color: '#6F675C' }}>{b.email}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1.5" style={{ fontSize: 13, color: '#111111', fontWeight: 500 }}>{b.experience}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  <span style={{ fontSize: 12, color: '#6F675C' }}>📅 {b.date}{b.time ? ` · ${b.time}` : ''}</span>
                  <span style={{ fontSize: 12, color: '#6F675C' }}>👤 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>IDR {b.total.toLocaleString('id-ID')}</span>
                </div>
                <p style={{ fontSize: 11, color: '#C8C4BE', marginTop: 3 }}>{b.ref} · Booked {b.bookedOn}</p>
              </div>
            </div>
            {b.status === 'Pending' && (
              <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #F5F1EB' }}>
                <button onClick={() => updateStatus(b, 'CONFIRMED')} disabled={updating === b.id}
                  className="flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                  style={{ height: 36, flex: 1, borderRadius: 8, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 13, fontWeight: 600, cursor: updating === b.id ? 'default' : 'pointer', opacity: updating === b.id ? 0.6 : 1 }}>
                  <CheckCircle size={13} /> {updating === b.id ? 'Saving…' : 'Confirm'}
                </button>
                <button onClick={() => updateStatus(b, 'CANCELLED')} disabled={updating === b.id}
                  className="flex items-center justify-center gap-1.5 hover:bg-red-50 transition-colors"
                  style={{ height: 36, flex: 1, borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', color: '#B66A45', fontSize: 13, fontWeight: 600, cursor: updating === b.id ? 'default' : 'pointer', opacity: updating === b.id ? 0.6 : 1 }}>
                  <XCircle size={13} /> Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Earnings Panel ────────────────────────────────────────────────────────────

function EarningsPanel({ commissionRate, experiences: liveExps, bookings: liveBookings, earningsByMonth: liveEarningsByMonth, totalGross: liveTotalGross, pendingPayout: livePendingPayout, payouts: livePayouts }: {
  commissionRate: number
  experiences?: DashExp[]
  bookings?: DashBooking[]
  earningsByMonth?: EarningsByMonth[]
  totalGross?: number
  pendingPayout?: number
  payouts?: OperatorPayout[]
}) {
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [payoutInput, setPayoutInput]       = useState('')
  const [requesting, setRequesting]         = useState(false)
  const [requestMsg, setRequestMsg]         = useState<{ ok: boolean; text: string } | null>(null)

  const netMult = (100 - commissionRate) / 100
  const hasLive = liveEarningsByMonth !== undefined

  // Chart data: live 12-month breakdown or static fallback
  const chartData   = hasLive ? liveEarningsByMonth.map(m => m.gross) : MONTHLY_EARNINGS
  const chartLabels = hasLive ? liveEarningsByMonth.map(m => m.month)  : MONTHS_SHORT

  // Stats
  const totalGross  = hasLive ? (liveTotalGross ?? 0) : MONTHLY_EARNINGS.reduce((a, b) => a + b, 0)
  const thisMonthGross = hasLive
    ? (liveEarningsByMonth[liveEarningsByMonth.length - 1]?.gross ?? 0)
    : MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 1]
  const prevMonthGross = hasLive
    ? (liveEarningsByMonth[liveEarningsByMonth.length - 2]?.gross ?? 0)
    : MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 2]
  const growth = prevMonthGross > 0
    ? `${thisMonthGross > prevMonthGross ? '↑' : '↓'} ${Math.abs(((thisMonthGross - prevMonthGross) / prevMonthGross) * 100).toFixed(0)}% vs last month`
    : thisMonthGross > 0 ? 'First bookings this month' : 'No bookings this month'
  const pendingPayout = hasLive ? (livePendingPayout ?? 0) : MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 1]

  // Avg per booking from live confirmed bookings
  const confirmedBookings = liveBookings?.filter(b => b.status === 'Confirmed' || b.status === 'Completed') ?? []
  const avgPerBooking = hasLive && confirmedBookings.length > 0
    ? Math.round(totalGross / confirmedBookings.length)
    : 690000

  // By experience
  const expSource = liveExps ?? EXPERIENCES
  const totalExpEarnings = expSource.reduce((a, e) => a + e.earnings, 0)

  // Current-month payout status from DB records
  const nowMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const thisMonthPayout = livePayouts?.find(p => p.periodLabel === nowMonthLabel)
  const isRequested = thisMonthPayout?.status === 'Requested' || requestMsg?.ok
  const isPaid      = thisMonthPayout?.status === 'Paid'

  // Payout limits
  const pendingNet  = Math.round(pendingPayout * netMult)
  const belowMin    = hasLive && pendingNet > 0 && pendingNet < PAYOUT_MIN_NET

  const handleRequestPayout = async () => {
    const amt = parseInt(payoutInput.replace(/\D/g, ''), 10)
    if (!amt || amt < PAYOUT_MIN_NET) {
      setRequestMsg({ ok: false, text: `Enter at least IDR ${PAYOUT_MIN_NET.toLocaleString()}` })
      return
    }
    setRequesting(true)
    setRequestMsg(null)
    const res = await requestPayoutAction(amt)
    setRequesting(false)
    if (res.ok) {
      setShowPayoutForm(false)
      setRequestMsg({ ok: true, text: `IDR ${amt.toLocaleString()} requested! Balible will process within 3 business days.` })
    } else {
      setRequestMsg({ ok: false, text: res.error ?? 'Something went wrong.' })
    }
  }

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Track your revenue and payout history" />

      {/* Commission info banner */}
      <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#FDF8F4', border: '1px solid #E8D4B8' }}>
        <TrendingUp size={15} style={{ color: '#C8A97E', flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: '#6F675C', margin: 0 }}>
          Balible charges a <strong style={{ color: '#111111' }}>{commissionRate}%</strong> platform commission per booking.
          You receive <strong style={{ color: '#4A7C59' }}>{100 - commissionRate}%</strong> of each booking total as your net payout.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Earned',    value: fmt(Math.round(totalGross * netMult)),      sub: `After ${commissionRate}% commission`, subColor: '#6F675C' },
          { label: 'This Month',      value: fmt(Math.round(thisMonthGross * netMult)),  sub: growth,                               subColor: thisMonthGross >= prevMonthGross ? '#4A7C59' : '#B66A45' },
          { label: 'Avg per Booking', value: fmt(Math.round(avgPerBooking * netMult)),   sub: `${confirmedBookings.length > 0 ? confirmedBookings.length + ' confirmed' : 'All time'}`, subColor: '#6F675C' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: '1px solid #E8E4DE' }}>
            <p style={{ fontSize: 12, color: '#6F675C' }}>{s.label}</p>
            <p className="mt-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14px,1.6vw,20px)', fontWeight: 700, color: '#111111', lineHeight: 1.2 }}>{s.value}</p>
            <p className="mt-1" style={{ fontSize: 11, color: s.subColor }}>{s.sub}</p>
          </div>
        ))}

        {/* Pending Payout card — with Request Payout button */}
        <div className="bg-white rounded-xl p-4 lg:p-5" style={{ border: `1px solid ${isPaid ? '#C8E6D6' : isRequested ? '#E8D4B8' : belowMin ? '#F5D5C5' : '#E8E4DE'}`, backgroundColor: isPaid ? '#F8FDF9' : isRequested ? '#FDFAF5' : 'white' }}>
          <p style={{ fontSize: 12, color: '#6F675C' }}>Pending Payout</p>
          <p className="mt-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14px,1.6vw,20px)', fontWeight: 700, color: '#111111', lineHeight: 1.2 }}>{fmt(pendingNet)}</p>
          {isPaid ? (
            <p className="mt-2" style={{ fontSize: 11, color: '#4A7C59', fontWeight: 600 }}>✓ Paid this month</p>
          ) : isRequested ? (
            <p className="mt-2" style={{ fontSize: 11, color: '#C8A97E', fontWeight: 600 }}>⏳ Requested — pending review</p>
          ) : belowMin ? (
            <p className="mt-2" style={{ fontSize: 11, color: '#B66A45' }}>
              Below minimum ({fmt(PAYOUT_MIN_NET)} net required)
            </p>
          ) : hasLive && pendingNet > 0 ? (
            <>
              {!showPayoutForm ? (
                <button onClick={() => { setShowPayoutForm(true); setRequestMsg(null) }}
                  className="mt-2 w-full flex items-center justify-center gap-1"
                  style={{ height: 28, borderRadius: 8, border: 'none', backgroundColor: '#C8A97E', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  Request Payout
                </button>
              ) : (
                <div className="mt-2 space-y-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={`Amount (min ${fmt(PAYOUT_MIN_NET)})`}
                    value={payoutInput}
                    onChange={e => setPayoutInput(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', height: 28, borderRadius: 6, border: '1px solid #D4CFC9', padding: '0 8px', fontSize: 11, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <div className="flex gap-1">
                    <button onClick={handleRequestPayout} disabled={requesting}
                      style={{ flex: 1, height: 26, borderRadius: 6, border: 'none', backgroundColor: '#C8A97E', color: 'white', fontSize: 11, fontWeight: 600, cursor: requesting ? 'default' : 'pointer', opacity: requesting ? 0.7 : 1 }}>
                      {requesting ? 'Requesting…' : 'Confirm'}
                    </button>
                    <button onClick={() => { setShowPayoutForm(false); setPayoutInput(''); setRequestMsg(null) }} disabled={requesting}
                      style={{ flex: 1, height: 26, borderRadius: 6, border: '1px solid #D4CFC9', backgroundColor: 'white', fontSize: 11, color: '#6F675C', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <p className="mt-1" style={{ fontSize: 10, color: '#9B9690', textAlign: 'center' }}>
                Min {fmt(PAYOUT_MIN_NET)} · Max {fmt(pendingNet)}
              </p>
            </>
          ) : (
            <p className="mt-2" style={{ fontSize: 11, color: '#C8A97E' }}>Confirmed earnings, not yet paid out</p>
          )}
          {requestMsg && (
            <p className="mt-1" style={{ fontSize: 10, color: requestMsg.ok ? '#4A7C59' : '#B66A45', lineHeight: 1.4 }}>{requestMsg.text}</p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 mb-5" style={{ border: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Monthly Revenue</h2>
          {hasLive && <span style={{ fontSize: 11, color: '#4A7C59', fontWeight: 600 }}>● Live data</span>}
        </div>
        <MiniChart data={chartData} color="#C8A97E" />
        <div className="flex justify-between mt-1 mb-5">
          {chartLabels.map((m, i) => <span key={i} style={{ fontSize: 9, color: '#6F675C' }}>{m}</span>)}
        </div>
        <div className="flex items-end gap-1" style={{ height: 56 }}>
          {chartData.map((v, i) => {
            const max = Math.max(...chartData, 1)
            const isLast = i === chartData.length - 1
            return (
              <div key={i} title={`${chartLabels[i]}: ${fmt(v)}`}
                style={{ flex: 1, height: `${(v / max) * 100}%`, borderRadius: '3px 3px 0 0', backgroundColor: isLast ? '#C8A97E' : '#E8E4DE', minHeight: 4, cursor: 'default', transition: 'background 0.2s' }} />
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* By experience */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>By Experience</h2>
          {expSource.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9E9A94' }}>No active experiences yet.</p>
          ) : (
          <div className="space-y-4">
            {expSource.map((e, idx) => {
              const pct = totalExpEarnings > 0 ? (e.earnings / totalExpEarnings) * 100 : 0
              const netEarnings = Math.round(e.earnings * netMult)
              return (
                <div key={e.id ?? idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span style={{ fontSize: 13, color: '#111111', fontWeight: 500 }}>{e.title}</span>
                    <div className="text-right">
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#4A7C59' }}>{fmt(netEarnings)}</span>
                      <span style={{ fontSize: 10, color: '#9E9A94', marginLeft: 3 }}>net</span>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, backgroundColor: '#F5F1EB', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#C8A97E', borderRadius: 3 }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#6F675C', marginTop: 2 }}>{e.bookings} bookings · {pct.toFixed(0)}% of total</p>
                </div>
              )
            })}
          </div>
          )}
        </div>

        {/* Payout history */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Payout History</h2>
          {livePayouts === undefined ? (
            <p style={{ fontSize: 13, color: '#6F675C' }}>Loading…</p>
          ) : livePayouts.length === 0 ? (
            <div className="p-6 text-center rounded-xl" style={{ backgroundColor: '#F5F1EB' }}>
              <p style={{ fontSize: 13, color: '#6F675C' }}>No payouts recorded yet.</p>
              <p style={{ fontSize: 12, color: '#9E9A94', marginTop: 4 }}>Balible processes payouts monthly. Your first payout will appear here once processed.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {livePayouts.map(p => (
                  <div key={p.id} className="p-3.5 rounded-xl" style={{ backgroundColor: '#F5F1EB' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{p.periodLabel}</p>
                        <p style={{ fontSize: 11, color: '#6F675C', marginTop: 1 }}>
                          {p.status === 'Paid' ? `Paid ${p.paidAt}` : 'Pending payment'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#4A7C59' }}>{fmt(p.net)}</p>
                        <div className="mt-1"><StatusBadge status={p.status} /></div>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-2" style={{ borderTop: '1px solid #E0DDD8' }}>
                      <span style={{ fontSize: 11, color: '#6F675C' }}>{p.bookings} bookings · Gross: {fmt(p.gross)}</span>
                      <span style={{ fontSize: 11, color: '#B66A45' }}>Commission: {fmt(p.commission)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const rows = [['Period','Bookings','Gross','Commission','Net','Status','Paid On'], ...livePayouts.map(p => [p.periodLabel, p.bookings, p.gross, p.commission, p.net, p.status, p.paidAt ?? ''])]
                  const csv = rows.map(r => r.join(',')).join('\n')
                  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'payout-statements.csv'; a.click()
                }}
                className="w-full mt-4 py-2.5 rounded-xl hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                style={{ border: '1px solid #E8E4DE', background: 'none', color: '#6F675C', cursor: 'pointer', fontSize: 13 }}>
                <Download size={13} /> Download statements
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Reviews Panel ─────────────────────────────────────────────────────────────

function ReviewsPanel({ initialReviews }: { initialReviews?: DashReview[] }) {
  const [starFilter, setStarFilter] = useState(0)
  const reviews = initialReviews ?? REVIEWS_DATA

  const avg     = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '0.0'
  const visible = starFilter === 0 ? reviews : reviews.filter(r => r.rating === starFilter)
  const dist    = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    pct: reviews.length > 0 ? (reviews.filter(r => r.rating === s).length / reviews.length) * 100 : 0,
  }))

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${reviews.length} reviews across all experiences`} />

      {/* Summary */}
      <div className="bg-white rounded-xl p-5 mb-5 flex flex-col sm:flex-row gap-6 items-start" style={{ border: '1px solid #E8E4DE' }}>
        <div className="text-center flex-shrink-0">
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 52, fontWeight: 700, color: '#111111', lineHeight: 1 }}>{avg}</p>
          <Stars n={Math.round(Number(avg))} />
          <p style={{ fontSize: 12, color: '#6F675C', marginTop: 4 }}>{reviews.length} reviews</p>
        </div>
        <div className="flex-1 w-full space-y-2">
          {dist.map(d => (
            <button key={d.star}
              onClick={() => setStarFilter(starFilter === d.star ? 0 : d.star)}
              className="w-full flex items-center gap-3 hover:opacity-80 transition-opacity"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span style={{ fontSize: 12, color: '#111111', width: 10, flexShrink: 0 }}>{d.star}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#C8A97E">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: '#F5F1EB', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.pct}%`, backgroundColor: starFilter === d.star ? '#111111' : '#C8A97E', borderRadius: 4, transition: 'background 0.2s' }} />
              </div>
              <span style={{ fontSize: 12, color: '#6F675C', width: 18, textAlign: 'right', flexShrink: 0 }}>{d.count}</span>
            </button>
          ))}
        </div>
      </div>

      {starFilter > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span style={{ fontSize: 13, color: '#6F675C' }}>Showing {starFilter}-star reviews</span>
          <button onClick={() => setStarFilter(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8A97E', fontSize: 13, textDecoration: 'underline' }}>Clear</button>
        </div>
      )}

      <div className="space-y-3">
        {visible.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C8A97E' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{r.guest[0]}</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111111' }}>{r.guest}</p>
                  <p style={{ fontSize: 12, color: '#6F675C' }}>{r.experience}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <Stars n={r.rating} />
                <p style={{ fontSize: 11, color: '#6F675C', marginTop: 2 }}>{r.date}</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#6F675C', lineHeight: 1.7, fontStyle: 'italic' }}>"{r.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── localStorage helper ───────────────────────────────────────────────────────

function lsh<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}

// ── Profile Panel ─────────────────────────────────────────────────────────────

const HOST_PROFILE_DEFAULTS = {
  name: 'Made Sari', businessName: 'Made Sari Pottery Studio',
  email: 'made.sari@balible.com', phone: '+62 812 3456 7890',
  bio: "Third-generation Balinese potter offering authentic clay experiences in the heart of Ubud. I believe every piece of clay carries a story — and I love helping visitors find their own.",
  area: 'Ubud', languages: 'English, Bahasa Indonesia',
}

function ProfilePanel() {
  const [profile, setProfile] = useState(() => lsh('balible_host_profile', HOST_PROFILE_DEFAULTS))
  const [saved, setSaved]     = useState(false)

  const save = () => {
    localStorage.setItem('balible_host_profile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  const discard = () => setProfile(lsh('balible_host_profile', HOST_PROFILE_DEFAULTS))

  const set = (key: keyof typeof HOST_PROFILE_DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setProfile(p => ({ ...p, [key]: e.target.value }))

  return (
    <div>
      <PageHeader title="Host Profile" subtitle="How guests see you on Balible" />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center" style={{ border: '1px solid #E8E4DE' }}>
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden" style={{ border: '3px solid #C8A97E' }}>
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#C8A97E' }}>
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 36, fontWeight: 700, color: 'white' }}>M</span>
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#111111', border: 'none', cursor: 'pointer' }}>
              <Camera size={12} style={{ color: 'white' }} />
            </button>
          </div>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>{profile.name}</h3>
          <p style={{ fontSize: 13, color: '#6F675C', marginTop: 2 }}>Operator · {profile.area}</p>
          <div className="flex items-center gap-1 mt-2">
            <Star size={13} fill="#C8A97E" color="#C8A97E" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>4.9</span>
            <span style={{ fontSize: 13, color: '#6F675C' }}>(128 reviews)</span>
          </div>
          <div className="mt-3 px-3 py-1 rounded-full flex items-center gap-1.5" style={{ backgroundColor: '#F0F7F2' }}>
            <Check size={11} style={{ color: '#4A7C59' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4A7C59' }}>Verified Host</span>
          </div>
          <div className="mt-5 w-full pt-5" style={{ borderTop: '1px solid #E8E4DE' }}>
            <div className="grid grid-cols-3 gap-2">
              {[{ label: 'Bookings', value: '145' }, { label: 'Reviews', value: '220' }, { label: 'Listings', value: '4' }].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: '#6F675C' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="mb-5" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Edit Profile</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {([
              { label: 'Full Name',     key: 'name' as const },
              { label: 'Business Name', key: 'businessName' as const },
              { label: 'Email',         key: 'email' as const },
              { label: 'Phone',         key: 'phone' as const },
            ]).map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                <input value={profile[f.key]} onChange={set(f.key)}
                  style={{ width: '100%', height: 42, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bio</label>
              <textarea rows={4} value={profile.bio} onChange={set('bio')}
                style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', resize: 'none', outline: 'none', lineHeight: 1.6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Primary Area</label>
              <select value={profile.area} onChange={set('area')}
                style={{ width: '100%', height: 42, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
                {['Ubud','Canggu','Kuta','Seminyak','Uluwatu','Gianyar','Sanur','Nusa Dua','Amed','Jimbaran','Kintamani','Sidemen','Medewi'].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Languages</label>
              <input value={profile.languages} onChange={set('languages')}
                style={{ width: '100%', height: 42, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button onClick={save} className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ height: 44, paddingInline: 24, borderRadius: 10, border: 'none', backgroundColor: saved ? '#4A7C59' : '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', minWidth: 140 }}>
              {saved ? <><Check size={14} /> Saved!</> : 'Save Changes'}
            </button>
            <button onClick={discard} style={{ height: 44, paddingInline: 24, borderRadius: 10, border: '1px solid #E8E4DE', background: 'none', fontSize: 14, color: '#6F675C', cursor: 'pointer' }}>Discard</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Settings Panel ────────────────────────────────────────────────────────────

const HOST_NOTIF_DEFAULTS  = { newBooking: true, cancellation: true, review: false, reminders: true }
const HOST_PAYOUT_DEFAULTS = { bankName: 'Bank Central Asia (BCA)', accountNumber: '•••• •••• 4521', accountHolder: 'Made Sari' }

function SettingsPanel() {
  const [notifs, setNotifs]       = useState(() => lsh('balible_host_notifs',  HOST_NOTIF_DEFAULTS))
  const [payout, setPayout]       = useState(() => lsh('balible_host_payout',  HOST_PAYOUT_DEFAULTS))
  const [saved, setSaved]         = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)

  const save = () => {
    localStorage.setItem('balible_host_notifs',  JSON.stringify(notifs))
    localStorage.setItem('balible_host_payout',  JSON.stringify(payout))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  const toggle = (key: keyof typeof notifs) => {
    const next = { ...notifs, [key]: !notifs[key] }
    setNotifs(next)
    localStorage.setItem('balible_host_notifs', JSON.stringify(next))
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 1500)
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="space-y-5">
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Notifications</h2>
            {notifSaved && (
              <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#4A7C59', fontWeight: 600, transition: 'opacity 0.3s' }}>
                <Check size={12} /> Saved
              </span>
            )}
          </div>
          <div className="space-y-5">
            {[
              { key: 'newBooking',    label: 'New booking received',  desc: 'Get notified when a guest books your experience' },
              { key: 'cancellation', label: 'Booking cancellations',  desc: 'Alerts when a guest cancels a confirmed booking' },
              { key: 'review',       label: 'New reviews',            desc: 'Notify when guests leave a review' },
              { key: 'reminders',    label: 'Booking reminders',      desc: '24-hour reminder before each experience' },
            ].map(({ key, label, desc }) => {
              const on = notifs[key as keyof typeof notifs]
              return (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#111111' }}>{label}</p>
                    <p style={{ fontSize: 12, color: '#6F675C', marginTop: 1 }}>{desc}</p>
                  </div>
                  <button onClick={() => toggle(key as keyof typeof notifs)}
                    style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, backgroundColor: on ? '#111111' : '#E8E4DE', transition: 'background 0.2s', position: 'relative' }}>
                    <span style={{ display: 'block', width: 18, height: 18, borderRadius: 9, backgroundColor: 'white', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.2s' }} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Payout Settings</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bank Name</label>
              <input value={payout.bankName} onChange={e => setPayout(p => ({ ...p, bankName: e.target.value }))}
                style={{ width: '100%', height: 42, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Account Number</label>
              <input value={payout.accountNumber} onChange={e => setPayout(p => ({ ...p, accountNumber: e.target.value }))}
                style={{ width: '100%', height: 42, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Account Holder</label>
              <input value={payout.accountHolder} onChange={e => setPayout(p => ({ ...p, accountHolder: e.target.value }))}
                style={{ width: '100%', height: 42, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #FECACA' }}>
          <h2 className="mb-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#B66A45' }}>Danger Zone</h2>
          <p className="mb-4" style={{ fontSize: 13, color: '#6F675C' }}>Irreversible actions for your account.</p>
          <div className="flex flex-wrap gap-3">
            <button style={{ height: 40, paddingInline: 18, borderRadius: 10, border: '1px solid #FECACA', backgroundColor: 'white', color: '#B66A45', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Pause all experiences
            </button>
            <button style={{ height: 40, paddingInline: 18, borderRadius: 10, border: 'none', backgroundColor: '#FEF2F2', color: '#B66A45', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Deactivate account
            </button>
          </div>
        </div>

        <button onClick={save} className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ height: 44, paddingInline: 24, borderRadius: 10, border: 'none', backgroundColor: saved ? '#4A7C59' : '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', minWidth: 140 }}>
          {saved ? <><Check size={14} /> Saved!</> : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

// ── Events Panel ─────────────────────────────────────────────────────────────

const EMPTY_EVENT: EventInput = {
  title: '', description: '', date: '', location: '', price: 0, capacity: 10, coverImage: '', status: 'DRAFT',
}

const LS_EVENTS_KEY = 'balible_host_events'

function lsEvents(): EventRow[] {
  try { const v = localStorage.getItem(LS_EVENTS_KEY); return v ? JSON.parse(v) : [] } catch { return [] }
}
function saveEvents(evs: EventRow[]) {
  try { localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(evs)) } catch {}
}

function EventsPanel() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EventRow | null>(null)
  const [form, setForm] = useState<EventInput>(EMPTY_EVENT)
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['', '', '', '', ''])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load from DB, fall back to localStorage
  useEffect(() => {
    getHostEvents().then(dbEvents => {
      const local = lsEvents()
      const merged = [...dbEvents]
      local.forEach(lev => { if (!merged.find(e => e.id === lev.id)) merged.push(lev) })
      merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setEvents(merged)
      setLoading(false)
    })
  }, [])

  const setAndSave = (next: EventRow[]) => { setEvents(next); saveEvents(next) }

  function openCreate() {
    setEditing(null); setForm(EMPTY_EVENT); setGalleryUrls(['', '', '', '', ''])
    setImagePreview(null); setImageMode('url'); setSaveError(''); setShowForm(true)
  }

  function openEdit(ev: EventRow) {
    setEditing(ev)
    setForm({
      title: ev.title, description: ev.description, date: ev.date.slice(0, 16),
      location: ev.location, price: ev.price, capacity: ev.capacity,
      coverImage: ev.coverImage ?? '', status: ev.status as EventInput['status'],
    })
    const savedGallery: string[] = (() => { try { const v = localStorage.getItem(`balible_event_gallery_${ev.slug}`); return v ? JSON.parse(v) : [] } catch { return [] } })()
    setGalleryUrls([...savedGallery, '', '', '', '', ''].slice(0, 5))
    setImagePreview(ev.coverImage ?? null)
    setImageMode(ev.coverImage?.startsWith('http') ? 'url' : 'upload')
    setSaveError(''); setShowForm(true)
  }

  function handleImageFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const url = e.target?.result as string
      setImagePreview(url); setForm(f => ({ ...f, coverImage: url }))
    }
    reader.readAsDataURL(file)
  }

  function makeLocalRow(input: EventInput, slug: string): EventRow {
    return {
      id: `local_${Date.now()}`, slug,
      title: input.title, description: input.description,
      date: new Date(input.date).toISOString(),
      location: input.location, price: input.price, capacity: input.capacity,
      coverImage: input.coverImage ?? null, status: input.status ?? 'DRAFT',
      createdAt: new Date().toISOString(),
    }
  }

  async function handleSave() {
    setSaveError('')
    if (!form.title.trim()) { setSaveError('Event title is required.'); return }
    if (!form.date) { setSaveError('Date & time is required.'); return }
    if (!form.location.trim()) { setSaveError('Location is required.'); return }

    setSaving(true)
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 5)
    const finalSlug = editing?.slug ?? slug
    const validGallery = galleryUrls.filter(u => u.trim())
    if (validGallery.length > 0) {
      try { localStorage.setItem(`balible_event_gallery_${finalSlug}`, JSON.stringify(validGallery)) } catch {}
    }

    if (editing) {
      const res = await updateEvent(editing.id, form)
      const updated = { ...editing, ...form, date: new Date(form.date).toISOString() }
      if (res.ok) {
        setAndSave(events.map(e => e.id === editing.id ? updated : e))
      } else {
        // DB failed — update locally
        setAndSave(events.map(e => e.id === editing.id ? updated : e))
      }
    } else {
      const res = await createEvent(form)
      if (res.ok && res.event) {
        setAndSave([...events, res.event])
      } else {
        // DB failed — persist locally
        const local = makeLocalRow(form, slug)
        setAndSave([...events, local])
      }
    }
    setSaving(false)
    setShowForm(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return
    deleteEvent(id).catch(() => {})
    setAndSave(events.filter(e => e.id !== id))
  }

  function toggleStatus(ev: EventRow) {
    const next = ev.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    updateEvent(ev.id, { status: next as EventInput['status'] }).catch(() => {})
    setAndSave(events.map(e => e.id === ev.id ? { ...e, status: next } : e))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 10, border: '1px solid #E8E4DE',
    padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 6 }

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="One-time events hosted by you"
        action={
          <button onClick={openCreate}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ height: 38, padding: '0 16px', borderRadius: 10, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> New Event
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E8E4DE', borderTopColor: '#111111', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl" style={{ border: '1px solid #E8E4DE' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#F5F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ticket size={24} style={{ color: '#C8A97E' }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 6 }}>No events yet</p>
          <p style={{ fontSize: 14, color: '#6F675C', marginBottom: 20 }}>Create your first one-time event for guests to discover</p>
          <button onClick={openCreate}
            style={{ height: 38, padding: '0 20px', borderRadius: 10, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Create event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => {
            const d = new Date(ev.date)
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            const isPast = d < new Date()
            return (
              <div key={ev.id} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
                <div className="flex">
                  {ev.coverImage && (
                    <img src={ev.coverImage} alt="" className="w-20 sm:w-28 object-cover flex-shrink-0 self-stretch" />
                  )}
                  <div className="flex-1 min-w-0 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111111', marginBottom: 2 }}>{ev.title}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          <span style={{ fontSize: 11, color: '#6F675C' }}>📅 {dateStr} · {timeStr}</span>
                          <span style={{ fontSize: 11, color: '#6F675C' }}>📍 {ev.location}</span>
                          <span style={{ fontSize: 11, color: '#6F675C' }}>👥 Max {ev.capacity}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#111111' }}>
                            {ev.price === 0 ? 'Free' : `IDR ${ev.price.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={ev.status === 'PUBLISHED' ? 'Active' : ev.status === 'CANCELLED' ? 'Cancelled' : 'Draft'} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid #F5F1EB' }}>
                      {!isPast && ev.status !== 'CANCELLED' && (
                        <button onClick={() => toggleStatus(ev)}
                          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                          style={{ height: 28, padding: '0 10px', borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 11, fontWeight: 600, color: '#111111', cursor: 'pointer' }}>
                          {ev.status === 'PUBLISHED' ? <><Lock size={10} /> Unpublish</> : <><Globe size={10} /> Publish</>}
                        </button>
                      )}
                      <button onClick={() => openEdit(ev)}
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                        style={{ height: 28, padding: '0 10px', borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 11, fontWeight: 600, color: '#111111', cursor: 'pointer' }}>
                        <Edit2 size={10} /> Edit
                      </button>
                      <button onClick={() => handleDelete(ev.id)}
                        className="flex items-center gap-1 hover:bg-red-50 transition-colors"
                        style={{ height: 28, padding: '0 10px', borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 11, fontWeight: 600, color: '#B66A45', cursor: 'pointer' }}>
                        <Trash2 size={10} /> Delete
                      </button>
                      <a href={`/events/${ev.slug}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                        style={{ height: 28, padding: '0 10px', borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 11, fontWeight: 600, color: '#6F675C', cursor: 'pointer', textDecoration: 'none' }}>
                        <Eye size={10} /> View
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            {/* drag handle – mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1CDC7' }} />
            </div>
            <div className="px-5 pt-4 sm:pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #F5F1EB' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', margin: 0 }}>
                {editing ? 'Edit Event' : 'New Event'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} style={{ color: '#6F675C' }} />
              </button>
            </div>

            <div className="px-5 pt-4 pb-2 space-y-4">

              {/* Title */}
              <div>
                <label style={labelStyle}>Event title <span style={{ color: '#B66A45' }}>*</span></label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Full Moon Yoga & Sound Bath" style={inputStyle} />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What will guests experience at this event?" rows={4}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
              </div>

              {/* Date & time */}
              <div>
                <label style={labelStyle}>Date & time <span style={{ color: '#B66A45' }}>*</span></label>
                <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={inputStyle} />
              </div>

              {/* Location */}
              <div>
                <label style={labelStyle}>Location / venue <span style={{ color: '#B66A45' }}>*</span></label>
                <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Rice Terrace Stage, Jl. Raya Ubud" style={inputStyle} />
              </div>

              {/* Capacity + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Capacity</label>
                  <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                    min={1} placeholder="10" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Ticket price (IDR)</label>
                  <input type="number" value={form.price === 0 ? '' : form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) || 0 }))}
                    min={0} placeholder="0 = Free" style={inputStyle} />
                </div>
              </div>

              {/* Cover image */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Cover image</label>
                  <div className="flex gap-1 p-0.5 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
                    {(['url', 'upload'] as const).map(m => (
                      <button key={m} onClick={() => setImageMode(m)}
                        style={{ height: 26, padding: '0 10px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', backgroundColor: imageMode === m ? 'white' : 'transparent', color: imageMode === m ? '#111111' : '#6F675C', transition: 'all 0.15s' }}>
                        {m === 'url' ? 'URL' : 'Upload'}
                      </button>
                    ))}
                  </div>
                </div>

                {imageMode === 'url' ? (
                  <div>
                    <input type="url" value={form.coverImage ?? ''} onChange={e => { setForm(f => ({ ...f, coverImage: e.target.value })); setImagePreview(e.target.value || null) }}
                      placeholder="https://images.unsplash.com/…" style={inputStyle} />
                    {imagePreview && (
                      <div className="relative mt-2 overflow-hidden" style={{ height: 140, borderRadius: 10 }}>
                        <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImagePreview(null)} />
                        <button onClick={() => { setImagePreview(null); setForm(f => ({ ...f, coverImage: '' })) }}
                          style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={13} style={{ color: 'white' }} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }} />
                    {imagePreview ? (
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 140 }}>
                        <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => { setImagePreview(null); setForm(f => ({ ...f, coverImage: '' })); if (fileRef.current) fileRef.current.value = '' }}
                          style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={13} style={{ color: 'white' }} />
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => fileRef.current?.click()}
                        style={{ height: 110, borderRadius: 12, border: '2px dashed #E8E4DE', backgroundColor: '#F9F9F7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer' }}>
                        <Camera size={18} style={{ color: '#6F675C' }} />
                        <p style={{ fontSize: 13, color: '#6F675C', margin: 0 }}>Click to upload</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Gallery images */}
              <div>
                <label style={labelStyle}>Gallery photos <span style={{ fontSize: 11, fontWeight: 400, color: '#9E9A94' }}>(up to 5 image URLs)</span></label>
                <div className="space-y-2">
                  {galleryUrls.map((url, i) => (
                    <input key={i} type="url" value={url}
                      onChange={e => setGalleryUrls(prev => prev.map((u, j) => j === i ? e.target.value : u))}
                      placeholder={`Photo ${i + 1} URL`}
                      style={{ ...inputStyle, fontSize: 12 }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#9E9A94', marginTop: 5 }}>These appear in the gallery on your event page.</p>
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EventInput['status'] }))}
                  style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}>
                  <option value="DRAFT">Draft – not visible to guests</option>
                  <option value="PUBLISHED">Published – visible on /events</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Error */}
              {saveError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: '#FEF3ED', border: '1px solid #F5C9AE' }}>
                  <span style={{ fontSize: 13, color: '#B66A45' }}>{saveError}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-5 pt-3 pb-8 sm:pb-6">
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 14, fontWeight: 600, color: '#6F675C', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 2, height: 44, borderRadius: 10, border: 'none', backgroundColor: saving ? '#9E9A94' : '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', transition: 'background 0.15s' }}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Availability Panel ────────────────────────────────────────────────────────

const MOCK_BOOKED = new Set(['2026-06-08','2026-06-09','2026-06-12','2026-06-15','2026-06-20','2026-06-22','2026-07-04','2026-07-11','2026-07-18'])

function AvailabilityPanel() {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [blocked, setBlocked] = useState<Set<string>>(() => {
    try { const v = localStorage.getItem('balible_blocked'); return new Set(v ? JSON.parse(v) : []) } catch { return new Set() }
  })

  const monthStr  = String(month + 1).padStart(2, '0')
  const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const firstDay  = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dayKey = (d: number) => `${year}-${monthStr}-${String(d).padStart(2, '0')}`

  const toggle = (d: number) => {
    const k = dayKey(d)
    if (MOCK_BOOKED.has(k)) return
    setBlocked(prev => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      localStorage.setItem('balible_blocked', JSON.stringify(Array.from(next)))
      return next
    })
  }
  const unblock = (k: string) => setBlocked(prev => { const n = new Set(prev); n.delete(k); localStorage.setItem('balible_blocked', JSON.stringify(Array.from(n))); return n })

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const thisMonthPrefix = `${year}-${monthStr}-`
  const blockedThisMonth = Array.from(blocked).filter(k => k.startsWith(thisMonthPrefix))
  const bookedThisMonth  = Array.from(MOCK_BOOKED).filter(k => k.startsWith(thisMonthPrefix))

  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  return (
    <div>
      <PageHeader title="Availability Calendar" subtitle="Block dates when you're unavailable — booked dates auto-populate" />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mb-5">
        {[
          { bg: 'white',    border: '#E8E4DE', label: 'Available'                           },
          { bg: '#FDF8F4',  border: '#C8A97E', label: `Booked (${bookedThisMonth.length})`  },
          { bg: '#FEF2F2',  border: '#B66A45', label: `Blocked (${blockedThisMonth.length})` },
        ].map(({ bg, border, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: bg, border: `2px solid ${border}` }} />
            <span style={{ fontSize: 12, color: '#6F675C' }}>{label}</span>
          </div>
        ))}
        <p style={{ fontSize: 12, color: '#9E9A94', marginLeft: 'auto' }}>Click any date to block / unblock</p>
      </div>

      <div className="bg-white rounded-xl p-5 mb-5" style={{ border: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>{monthName}</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E8E4DE', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={14} style={{ color: '#6F675C' }} />
            </button>
            <button onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()) }}
              style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid #E8E4DE', background: 'white', fontSize: 12, color: '#6F675C', cursor: 'pointer' }}>
              Today
            </button>
            <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E8E4DE', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={14} style={{ color: '#6F675C' }} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ padding: '4px 0', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#9E9A94', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d    = i + 1
            const k    = dayKey(d)
            const isBooked  = MOCK_BOOKED.has(k)
            const isBlocked = blocked.has(k)
            const isToday   = k === todayKey
            const isPast    = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

            let bg = 'white', borderColor = '#E8E4DE', color = '#111111', cursor = 'pointer'
            if (isBooked)  { bg = '#FDF8F4'; borderColor = '#C8A97E'; color = '#C8A97E'; cursor = 'default' }
            if (isBlocked) { bg = '#FEF2F2'; borderColor = '#B66A45'; color = '#B66A45' }
            if (isPast)    { bg = '#FAFAF8'; color = '#C8C4BE'; cursor = 'default' }

            return (
              <div key={d} onClick={() => !isPast && toggle(d)}
                className="flex flex-col items-center justify-center rounded-lg transition-colors select-none"
                style={{ aspectRatio: '1', backgroundColor: bg, border: isToday ? `2px solid #111111` : `1px solid ${borderColor}`, cursor }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color }}>{d}</span>
                {isBooked  && <span style={{ fontSize: 8, color: '#C8A97E', fontWeight: 700, lineHeight: 1 }}>BOOK</span>}
                {isBlocked && !isBooked && <span style={{ fontSize: 8, color: '#B66A45', fontWeight: 700, lineHeight: 1 }}>OFF</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Blocked list */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h2 className="mb-3" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Blocked Dates — {monthName}</h2>
        {blockedThisMonth.length === 0 ? (
          <p style={{ fontSize: 13, color: '#6F675C' }}>No blocked dates for {monthName}. Click calendar dates to mark your unavailable days.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {[...blockedThisMonth].sort().map(k => (
              <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #F5C9C5' }}>
                <span style={{ fontSize: 13, color: '#B66A45', fontWeight: 500 }}>
                  {new Date(k + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <button onClick={() => unblock(k)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, color: '#B66A45', display: 'flex' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Photos Panel ──────────────────────────────────────────────────────────────

function PhotosPanel() {
  const [galleries, setGalleries] = useState<Record<number, string[]>>(() => {
    try {
      return Object.fromEntries(EXPERIENCES.map(e => {
        const v = localStorage.getItem(`balible_gallery_${e.slug}`)
        return [e.id, v ? JSON.parse(v) : [e.image]]
      }))
    } catch { return Object.fromEntries(EXPERIENCES.map(e => [e.id, [e.image]])) }
  })
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const persist = (expId: number, arr: string[]) => {
    const exp = EXPERIENCES.find(e => e.id === expId)
    if (exp) localStorage.setItem(`balible_gallery_${exp.slug}`, JSON.stringify(arr))
  }

  const addPhoto = (expId: number, src: string) =>
    setGalleries(prev => { const arr = [...(prev[expId] ?? []), src]; persist(expId, arr); return { ...prev, [expId]: arr } })

  const removePhoto = (expId: number, idx: number) =>
    setGalleries(prev => { const arr = [...(prev[expId] ?? [])]; arr.splice(idx, 1); persist(expId, arr); return { ...prev, [expId]: arr } })

  const setCover = (expId: number, idx: number) =>
    setGalleries(prev => {
      const arr = [...(prev[expId] ?? [])]
      const [photo] = arr.splice(idx, 1); arr.unshift(photo)
      persist(expId, arr); return { ...prev, [expId]: arr }
    })

  const handleFile = (expId: number, file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(u => ({ ...u, [expId]: true }))
    const reader = new FileReader()
    reader.onload = e => { addPhoto(expId, e.target?.result as string); setUploading(u => ({ ...u, [expId]: false })) }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <PageHeader title="Photo Management" subtitle="Manage gallery photos for each of your experiences" />
      <div className="space-y-5">
        {EXPERIENCES.map(exp => {
          const photos = galleries[exp.id] ?? [exp.image]
          return (
            <div key={exp.id} className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
              <div className="flex items-center gap-3 mb-4">
                <img src={exp.image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111' }}>{exp.title}</h3>
                  <p style={{ fontSize: 12, color: '#6F675C' }}>{photos.length} photo{photos.length !== 1 ? 's' : ''} · first is cover</p>
                </div>
                <input
                  ref={el => { fileRefs.current[exp.id] = el }}
                  type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(exp.id, f); if (fileRefs.current[exp.id]) fileRefs.current[exp.id]!.value = '' }}
                />
                <button onClick={() => fileRefs.current[exp.id]?.click()} disabled={uploading[exp.id]}
                  className="flex items-center gap-2 hover:opacity-80"
                  style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 12, fontWeight: 600, color: '#6F675C', cursor: 'pointer' }}>
                  <Camera size={13} /> {uploading[exp.id] ? 'Uploading…' : 'Add Photo'}
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {photos.map((src, idx) => (
                  <div key={idx} className="relative group" style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden' }}>
                    <img src={src} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {idx === 0 && (
                      <div style={{ position: 'absolute', top: 4, left: 4, backgroundColor: '#C8A97E', borderRadius: 6, padding: '2px 5px', fontSize: 8, fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>COVER</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'rgba(0,0,0,0.38)' }}>
                      {idx !== 0 && (
                        <button onClick={() => setCover(exp.id, idx)} title="Set as cover"
                          style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Star size={12} style={{ color: '#C8A97E' }} />
                        </button>
                      )}
                      <button onClick={() => removePhoto(exp.id, idx)} title="Remove photo"
                        style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={12} style={{ color: '#B66A45' }} />
                      </button>
                    </div>
                  </div>
                ))}
                {photos.length < 10 && (
                  <div onClick={() => fileRefs.current[exp.id]?.click()}
                    className="flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors"
                    style={{ aspectRatio: '1', borderRadius: 10, border: '2px dashed #E8E4DE', backgroundColor: '#FAFAF8', gap: 4 }}>
                    <Camera size={15} style={{ color: '#9E9A94' }} />
                    <span style={{ fontSize: 10, color: '#9E9A94' }}>Add</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const HOST_NOTIFICATIONS = [
  { id: 1, title: 'New booking received', body: 'Sarah Kim booked Pottery Making Class for Jun 15', time: '2 min ago', unread: true },
  { id: 2, title: 'New 5★ review', body: 'Thomas R. left a review on Pottery Making Class', time: '1 hr ago', unread: true },
  { id: 3, title: 'Booking confirmed', body: 'Priya M. confirmed her Batik Painting Workshop slot', time: 'Yesterday', unread: false },
]

function HostNotifBell({ onSettings, align = 'left', dark = false }: { onSettings: () => void; align?: 'left' | 'right'; dark?: boolean }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState(HOST_NOTIFICATIONS)
  const unreadCount = notifs.filter(n => n.unread).length
  const bellColor = dark ? (unreadCount > 0 ? '#111111' : '#6F675C') : (unreadCount > 0 ? 'white' : 'rgba(255,255,255,0.55)')

  return (
    <div className="relative">
      <button onClick={() => setNotifOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <Bell size={17} style={{ color: bellColor }} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#B66A45', fontSize: 9, color: 'white', fontWeight: 700 }}>{unreadCount}</span>
        )}
      </button>
      {notifOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
          <div className="absolute top-9 z-50 bg-white rounded-xl shadow-2xl overflow-hidden"
            style={{ [align === 'right' ? 'right' : 'left']: 0, width: 'min(300px, calc(100vw - 32px))', border: '1px solid #E8E4DE' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #E8E4DE' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={() => setNotifs(n => n.map(x => ({ ...x, unread: false })))}
                  style={{ fontSize: 11, color: '#C8A97E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </button>
              )}
            </div>
            <div>
              {notifs.map(n => (
                <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: '1px solid #F5F1EB', backgroundColor: n.unread ? '#FFFDF9' : 'white' }}>
                  <div className="flex items-start gap-2">
                    {n.unread && <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: '#C8A97E' }} />}
                    <div className={n.unread ? '' : 'pl-4'}>
                      <p style={{ fontSize: 13, fontWeight: n.unread ? 600 : 400, color: '#111111', marginBottom: 2 }}>{n.title}</p>
                      <p style={{ fontSize: 12, color: '#6F675C', lineHeight: 1.4 }}>{n.body}</p>
                      <p style={{ fontSize: 11, color: '#9E9A94', marginTop: 3 }}>{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { onSettings(); setNotifOpen(false) }}
              className="w-full py-3 text-center hover:bg-gray-50 transition-colors"
              style={{ fontSize: 12, color: '#C8A97E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #E8E4DE' }}>
              Notification settings →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SidebarInner({ activeNav, setActiveNav, hostName }: { activeNav: string; setActiveNav: (id: string) => void; hostName?: string }) {
  const displayName = hostName ?? 'Made Sari'
  const initial = displayName.charAt(0).toUpperCase()
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <a href="/" className="flex flex-col leading-none" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: 'white' }}>BALIBLE</span>
          <span style={{ fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>HOST DASHBOARD</span>
        </a>
      </div>

      <div className="flex items-center gap-3 mx-3 px-3 py-3 rounded-xl mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C8A97E' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{initial}</span>
        </div>
        <div className="min-w-0">
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Operator · Verified</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeNav === id
          return (
            <button key={id} onClick={() => setActiveNav(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-white/5"
              style={{ color: active ? '#C8A97E' : 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'var(--font-inter)', fontWeight: active ? 600 : 400, cursor: 'pointer', background: active ? 'rgba(200,169,126,0.1)' : 'none', border: 'none', textAlign: 'left' }}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
              {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: 3, backgroundColor: '#C8A97E', display: 'block' }} />}
            </button>
          )
        })}
      </nav>

      <a href="/" className="flex items-center gap-2.5 mx-3 mb-6 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
        style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
        <LogOut size={14} /> Back to site
      </a>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeNav, setActiveNav]   = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [liveExperiences, setLiveExperiences]     = useState<DashExp[] | undefined>(undefined)
  const [liveBookings, setLiveBookings]           = useState<DashBooking[] | undefined>(undefined)
  const [liveReviews, setLiveReviews]             = useState<DashReview[] | undefined>(undefined)
  const [liveHostName, setLiveHostName]           = useState<string | undefined>(undefined)
  const [liveEarningsByMonth, setLiveEarningsByMonth] = useState<EarningsByMonth[] | undefined>(undefined)
  const [liveTotalGross, setLiveTotalGross]       = useState<number | undefined>(undefined)
  const [livePendingPayout, setLivePendingPayout] = useState<number | undefined>(undefined)
  const [livePayouts, setLivePayouts]             = useState<OperatorPayout[] | undefined>(undefined)
  const [liveCommissionRate, setLiveCommissionRate] = useState<number | undefined>(undefined)
  const commissionRate = liveCommissionRate ?? Math.max(0, Math.min(100, parseInt(String(lsh('balible_commission', '10')), 10) || 10))

  useEffect(() => {
    getHostDashboardData().then(data => {
      if (!data) return
      setLiveExperiences(data.experiences)
      setLiveBookings(data.bookings)
      setLiveReviews(data.reviews)
      setLiveHostName(data.hostName)
      setLiveEarningsByMonth(data.earningsByMonth)
      setLiveTotalGross(data.totalGross)
      setLivePendingPayout(data.pendingPayout)
      setLiveCommissionRate(data.commissionRate)
    }).catch(() => {})
    getOperatorPayoutsAction().then(setLivePayouts).catch(() => {})
  }, [])

  const renderPanel = () => {
    switch (activeNav) {
      case 'overview':      return <OverviewPanel onNav={setActiveNav} commissionRate={commissionRate} experiences={liveExperiences} bookings={liveBookings} reviews={liveReviews} hostName={liveHostName} />
      case 'experiences':   return <ExperiencesPanel commissionRate={commissionRate} initialExperiences={liveExperiences} />
      case 'events':        return <EventsPanel />
      case 'bookings':      return <BookingsPanel initialBookings={liveBookings} />
      case 'availability':  return <AvailabilityPanel />
      case 'earnings':      return <EarningsPanel commissionRate={commissionRate} experiences={liveExperiences} bookings={liveBookings} earningsByMonth={liveEarningsByMonth} totalGross={liveTotalGross} pendingPayout={livePendingPayout} payouts={livePayouts} />
      case 'photos':        return <PhotosPanel />
      case 'reviews':       return <ReviewsPanel initialReviews={liveReviews} />
      case 'profile':       return <ProfilePanel />
      case 'settings':      return <SettingsPanel />
      default:              return <OverviewPanel onNav={setActiveNav} commissionRate={commissionRate} experiences={liveExperiences} bookings={liveBookings} reviews={liveReviews} hostName={liveHostName} />
    }
  }

  return (
    <div className="flex" style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 flex flex-col" style={{ width: 240, backgroundColor: '#111111', height: '100%' }}>
            <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            <SidebarInner activeNav={activeNav} setActiveNav={id => { setActiveNav(id); setSidebarOpen(false) }} hostName={liveHostName} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: 240, backgroundColor: '#111111', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' }}>
        <SidebarInner activeNav={activeNav} setActiveNav={setActiveNav} hostName={liveHostName} />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-5 lg:p-8 pb-20 lg:pb-8">

        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={22} style={{ color: '#111111' }} />
          </button>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>
            {NAV_ITEMS.find(n => n.id === activeNav)?.label ?? 'Dashboard'}
          </span>
          <HostNotifBell onSettings={() => setActiveNav('settings')} align="right" dark />
        </div>

        {renderPanel()}
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-40 flex items-center"
        style={{ height: 60, borderTop: '1px solid #E8E4DE' }}>
        {NAV_ITEMS.slice(0, 5).map(({ id, Icon, label }) => {
          const active = activeNav === id
          return (
            <button key={id} onClick={() => setActiveNav(id)}
              className="flex flex-col items-center justify-center gap-0.5"
              style={{ background: 'none', border: 'none', cursor: 'pointer', flex: 1, height: '100%' }}>
              <Icon size={18} style={{ color: active ? '#C8A97E' : '#6F675C' }} />
              <span style={{ fontSize: 9, color: active ? '#C8A97E' : '#6F675C', fontWeight: active ? 600 : 400 }}>{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
