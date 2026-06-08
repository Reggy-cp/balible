'use client'

import { useState, useRef } from 'react'
import {
  LayoutDashboard, Compass, CalendarDays, TrendingUp, Star,
  UserCircle, Settings, LogOut, Bell, Plus, ChevronDown,
  ArrowUpRight, Menu, X, Search, Download,
  MoreHorizontal, Eye, Edit2, Play, Pause, Trash2,
  CheckCircle, XCircle, MapPin, Clock, Users, Camera, Check,
} from 'lucide-react'

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
    image: 'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=200&auto=format&fit=crop&q=80',
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
  { id: 'B003', ref: 'BAL-2024-003', guest: 'Priya Mehta',   email: 'priya.m@email.com',   experience: 'Batik Painting Workshop', expImage: 'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=60&auto=format&fit=crop&q=80', date: 'Jun 9, 2024',  time: '09:00 AM', guests: 1, total: 380000,  status: 'Confirmed', bookedOn: 'May 30' },
  { id: 'B004', ref: 'BAL-2024-004', guest: 'Marco Bianchi', email: 'marco.b@email.com',   experience: 'Pottery Making Class',    expImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=60&auto=format&fit=crop&q=80', date: 'Jun 10, 2024', time: '11:00 AM', guests: 2, total: 900000,  status: 'Pending',   bookedOn: 'Jun 2'  },
  { id: 'B005', ref: 'BAL-2024-005', guest: 'Yuki Tanaka',   email: 'yuki.t@email.com',    experience: 'Clay Sculpture Session',  expImage: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=60&auto=format&fit=crop&q=80', date: 'Jun 12, 2024', time: '10:00 AM', guests: 2, total: 1040000, status: 'Confirmed', bookedOn: 'Jun 3'  },
  { id: 'B006', ref: 'BAL-2024-006', guest: 'Alex Chen',     email: 'alex.c@email.com',    experience: 'Batik Painting Workshop', expImage: 'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=60&auto=format&fit=crop&q=80', date: 'Jun 6, 2024',  time: '2:00 PM',  guests: 4, total: 1520000, status: 'Completed', bookedOn: 'May 20' },
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

const MONTHLY_EARNINGS = [3200000, 2800000, 4100000, 3600000, 4800000, 5200000, 4400000, 5800000, 5100000, 6200000, 5700000, 7400000]
const MONTHS_SHORT     = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']

const PAYOUTS = [
  { id: 'P1', period: 'May 1–31, 2024', amount: 7400000, status: 'Paid', date: 'Jun 5, 2024'  },
  { id: 'P2', period: 'Apr 1–30, 2024', amount: 5700000, status: 'Paid', date: 'May 5, 2024'  },
  { id: 'P3', period: 'Mar 1–31, 2024', amount: 6200000, status: 'Paid', date: 'Apr 5, 2024'  },
  { id: 'P4', period: 'Feb 1–29, 2024', amount: 5100000, status: 'Paid', date: 'Mar 5, 2024'  },
]

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',    Icon: LayoutDashboard },
  { id: 'experiences', label: 'Experiences', Icon: Compass },
  { id: 'bookings',    label: 'Bookings',    Icon: CalendarDays },
  { id: 'earnings',    label: 'Earnings',    Icon: TrendingUp },
  { id: 'reviews',     label: 'Reviews',     Icon: Star },
  { id: 'profile',     label: 'Profile',     Icon: UserCircle },
  { id: 'settings',    label: 'Settings',    Icon: Settings },
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
    Paused:    { bg: '#FEF9F4', color: '#C8A97E' },
    Cancelled: { bg: '#FEF2F2', color: '#B66A45' },
    Paid:      { bg: '#F0F7F2', color: '#4A7C59' },
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
  { title: 'Batik Painting Workshop', date: 'Jun 9, 2024 · 09:00 AM',  guests: 1, status: 'Pending',   image: 'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=120&auto=format&fit=crop&q=80' },
  { title: 'Clay Sculpture Session',  date: 'Jun 12, 2024 · 10:00 AM', guests: 2, status: 'Confirmed', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=120&auto=format&fit=crop&q=80' },
]

function OverviewPanel({ onNav }: { onNav: (id: string) => void }) {
  const [period, setPeriod] = useState('This Month')
  const slice  = period === 'This Month' ? MONTHLY_EARNINGS.slice(6)    : MONTHLY_EARNINGS.slice(0, 6)
  const labels = period === 'This Month' ? MONTHS_SHORT.slice(6)        : MONTHS_SHORT.slice(0, 6)

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: '#111111' }}>
            Welcome back, Made Sari
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
        {OVERVIEW_STATS.map(s => (
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
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111' }}>IDR 7.4M</span>
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
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{fmt(e.earnings)}</span>
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

function ExperiencesPanel() {
  const [filter, setFilter]   = useState('All')
  const [exps, setExps]       = useState(EXPERIENCES)
  const [showForm, setShowForm] = useState(false)
  const [menuOpen, setMenuOpen] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageDragging, setImageDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const tabs    = ['All', 'Active', 'Draft', 'Paused']
  const visible = filter === 'All' ? exps : exps.filter(e => e.status === filter)

  const setStatus = (id: number, s: string) => { setExps(prev => prev.map(e => e.id === id ? { ...e, status: s } : e)); setMenuOpen(null) }

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
      <div className="inline-flex gap-1 mb-5 bg-white rounded-xl p-1" style={{ border: '1px solid #E8E4DE' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: '6px 16px', borderRadius: 10, fontSize: 13, fontWeight: filter === t ? 600 : 400, backgroundColor: filter === t ? '#111111' : 'transparent', color: filter === t ? 'white' : '#6F675C', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
            {t}
            <span className="ml-1.5" style={{ fontSize: 11, color: filter === t ? 'rgba(255,255,255,0.5)' : '#C8C4BE' }}>
              {t === 'All' ? exps.length : exps.filter(e => e.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Experience rows */}
      <div className="space-y-3">
        {visible.map(exp => (
          <div key={exp.id} className="bg-white rounded-xl p-4 flex items-start gap-4" style={{ border: '1px solid #E8E4DE' }}>
            <img src={exp.image} alt={exp.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111' }}>{exp.title}</h3>
                <StatusBadge status={exp.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><MapPin size={11} />{exp.area}</span>
                <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><Clock size={11} />{exp.duration}</span>
                <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><Users size={11} />Up to {exp.maxGuests}</span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>IDR {exp.price.toLocaleString('id-ID')}<span style={{ fontWeight: 400, color: '#6F675C' }}>/person</span></span>
                <span style={{ fontSize: 13, color: '#6F675C' }}>⭐ {exp.rating} ({exp.totalReviews})</span>
                <span style={{ fontSize: 13, color: '#6F675C' }}>{exp.bookings} bookings</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#4A7C59' }}>{fmt(exp.earnings)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a href={`/experiences/${exp.slug}`} target="_blank" rel="noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-ivory transition-colors"
                style={{ border: '1px solid #E8E4DE', color: '#6F675C' }}>
                <Eye size={14} />
              </a>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-ivory transition-colors"
                style={{ border: '1px solid #E8E4DE', background: 'none', cursor: 'pointer', color: '#6F675C' }}>
                <Edit2 size={14} />
              </button>
              <div className="relative">
                <button onClick={() => setMenuOpen(menuOpen === exp.id ? null : exp.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-ivory transition-colors"
                  style={{ border: '1px solid #E8E4DE', background: 'none', cursor: 'pointer', color: '#6F675C' }}>
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen === exp.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg z-20 py-1 w-36" style={{ border: '1px solid #E8E4DE' }}>
                      {exp.status !== 'Active' && (
                        <button onClick={() => setStatus(exp.id, 'Active')}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-ivory transition-colors"
                          style={{ fontSize: 13, color: '#4A7C59', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <Play size={12} /> {exp.status === 'Draft' ? 'Publish' : 'Activate'}
                        </button>
                      )}
                      {exp.status === 'Active' && (
                        <button onClick={() => setStatus(exp.id, 'Paused')}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-ivory transition-colors"
                          style={{ fontSize: 13, color: '#C8A97E', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <Pause size={12} /> Pause
                        </button>
                      )}
                      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-ivory transition-colors"
                        style={{ fontSize: 13, color: '#B66A45', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
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

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>Create New Experience</h2>
              <button onClick={() => { setShowForm(false); setImagePreview(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} style={{ color: '#6F675C' }} /></button>
            </div>
            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 6 }}>Cover Photo</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }} />
                {imagePreview ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 160 }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} style={{ color: 'white' }} />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{ position: 'absolute', bottom: 8, right: 8, height: 28, padding: '0 10px', borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'white', fontWeight: 500 }}>
                      <Camera size={12} /> Change
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setImageDragging(true) }}
                    onDragLeave={() => setImageDragging(false)}
                    onDrop={e => { e.preventDefault(); setImageDragging(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f) }}
                    style={{
                      height: 140, borderRadius: 12, border: `2px dashed ${imageDragging ? '#C8A97E' : '#E8E4DE'}`,
                      backgroundColor: imageDragging ? '#FFFDF9' : '#F9F9F7',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 8, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={18} style={{ color: '#6F675C' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111111', margin: 0 }}>Upload a cover photo</p>
                      <p style={{ fontSize: 12, color: '#6F675C', margin: '2px 0 0' }}>Click or drag & drop · JPG, PNG, WEBP</p>
                    </div>
                  </div>
                )}
              </div>

              {[
                { label: 'Title',              placeholder: 'e.g. Traditional Batik Dyeing Class', type: 'text' },
                { label: 'Price per person (IDR)', placeholder: '450000',                          type: 'number' },
                { label: 'Duration',           placeholder: 'e.g. 2.5 hours',                     type: 'text' },
                { label: 'Max guests',         placeholder: '8',                                   type: 'number' },
                { label: 'Meeting point',      placeholder: 'Studio address or landmark',          type: 'text' },
              ].map(({ label, placeholder, type }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 6 }}>{label}</label>
                  <input type={type} placeholder={placeholder}
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 6 }}>Description</label>
                <textarea placeholder="Describe what guests will experience..." rows={3}
                  style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', resize: 'none', outline: 'none' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 6 }}>Category</label>
                  <select style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
                    {['Art & Craft','Wellness','Culture','Food & Drink','Nature','Architecture','Surf & Water','Diving','Cooking'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 6 }}>Area</label>
                  <select style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
                    {['Ubud','Canggu','Kuta','Seminyak','Uluwatu','Gianyar','Sanur','Nusa Dua','Amed','Jimbaran'].map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setImagePreview(null) }}
                style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', background: 'none', fontSize: 14, fontWeight: 600, color: '#6F675C', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowForm(false); setImagePreview(null) }}
                style={{ flex: 2, height: 44, borderRadius: 10, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save as Draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bookings Panel ────────────────────────────────────────────────────────────

function BookingsPanel() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch]             = useState('')
  const [bookings, setBookings]         = useState(BOOKINGS_DATA)

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']
  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || b.guest.toLowerCase().includes(q) || b.experience.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const confirm = (id: string) => setBookings(p => p.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b))
  const cancel  = (id: string) => setBookings(p => p.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b))

  return (
    <div>
      <PageHeader title="Bookings" subtitle={`${bookings.length} total bookings`} />

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
          <input placeholder="Search guest, experience, or ref..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 40, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 34, paddingRight: 14, fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none', backgroundColor: 'white' }} />
        </div>
        <button className="flex items-center gap-2 px-4 rounded-xl flex-shrink-0"
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
                  <span style={{ fontSize: 12, color: '#6F675C' }}>📅 {b.date} · {b.time}</span>
                  <span style={{ fontSize: 12, color: '#6F675C' }}>👤 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>IDR {b.total.toLocaleString('id-ID')}</span>
                </div>
                <p style={{ fontSize: 11, color: '#C8C4BE', marginTop: 3 }}>{b.ref} · Booked {b.bookedOn}</p>
              </div>
            </div>
            {b.status === 'Pending' && (
              <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #F5F1EB' }}>
                <button onClick={() => confirm(b.id)} className="flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                  style={{ height: 36, flex: 1, borderRadius: 8, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <CheckCircle size={13} /> Confirm
                </button>
                <button onClick={() => cancel(b.id)} className="flex items-center justify-center gap-1.5 hover:bg-red-50 transition-colors"
                  style={{ height: 36, flex: 1, borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', color: '#B66A45', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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

function EarningsPanel() {
  const total    = MONTHLY_EARNINGS.reduce((a, b) => a + b, 0)
  const lastMo   = MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 1]
  const prevMo   = MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 2]
  const growth   = (((lastMo - prevMo) / prevMo) * 100).toFixed(1)
  const totalExp = EXPERIENCES.reduce((a, e) => a + e.earnings, 0)

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Track your revenue and payout history" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Earned',    value: fmt(total),  sub: 'All time',                   subColor: '#6F675C' },
          { label: 'This Month',      value: fmt(lastMo), sub: `↑ ${growth}% vs last month`, subColor: '#4A7C59' },
          { label: 'Avg per Booking', value: 'IDR 690K',  sub: 'Last 90 days',               subColor: '#6F675C' },
          { label: 'Pending Payout',  value: fmt(lastMo), sub: 'Releases Jun 5',             subColor: '#C8A97E' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: '1px solid #E8E4DE' }}>
            <p style={{ fontSize: 12, color: '#6F675C' }}>{s.label}</p>
            <p className="mt-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14px,1.6vw,20px)', fontWeight: 700, color: '#111111', lineHeight: 1.2 }}>{s.value}</p>
            <p className="mt-1" style={{ fontSize: 11, color: s.subColor }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 mb-5" style={{ border: '1px solid #E8E4DE' }}>
        <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Monthly Revenue</h2>
        <MiniChart data={MONTHLY_EARNINGS} color="#C8A97E" />
        <div className="flex justify-between mt-1 mb-5">
          {MONTHS_SHORT.map(m => <span key={m} style={{ fontSize: 9, color: '#6F675C' }}>{m}</span>)}
        </div>
        <div className="flex items-end gap-1" style={{ height: 56 }}>
          {MONTHLY_EARNINGS.map((v, i) => {
            const max = Math.max(...MONTHLY_EARNINGS)
            const isLast = i === MONTHLY_EARNINGS.length - 1
            return (
              <div key={i} title={`${MONTHS_SHORT[i]}: ${fmt(v)}`}
                style={{ flex: 1, height: `${(v / max) * 100}%`, borderRadius: '3px 3px 0 0', backgroundColor: isLast ? '#C8A97E' : '#E8E4DE', minHeight: 4, cursor: 'default', transition: 'background 0.2s' }} />
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* By experience */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>By Experience</h2>
          <div className="space-y-4">
            {EXPERIENCES.map(e => {
              const pct = (e.earnings / totalExp) * 100
              return (
                <div key={e.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span style={{ fontSize: 13, color: '#111111', fontWeight: 500 }}>{e.title}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{fmt(e.earnings)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, backgroundColor: '#F5F1EB', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#C8A97E', borderRadius: 3 }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#6F675C', marginTop: 2 }}>{e.bookings} bookings · {pct.toFixed(0)}% of total</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payout history */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Payout History</h2>
          <div className="space-y-3">
            {PAYOUTS.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3.5 rounded-xl" style={{ backgroundColor: '#F5F1EB' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{p.period}</p>
                  <p style={{ fontSize: 11, color: '#6F675C', marginTop: 1 }}>Paid {p.date}</p>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#4A7C59' }}>{fmt(p.amount)}</p>
                  <div className="mt-1"><StatusBadge status={p.status} /></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 rounded-xl hover:opacity-80 transition-opacity"
            style={{ border: '1px solid #E8E4DE', background: 'none', color: '#6F675C', cursor: 'pointer', fontSize: 13 }}>
            Download statements
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reviews Panel ─────────────────────────────────────────────────────────────

function ReviewsPanel() {
  const [starFilter, setStarFilter] = useState(0)

  const avg     = (REVIEWS_DATA.reduce((a, r) => a + r.rating, 0) / REVIEWS_DATA.length).toFixed(1)
  const visible = starFilter === 0 ? REVIEWS_DATA : REVIEWS_DATA.filter(r => r.rating === starFilter)
  const dist    = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: REVIEWS_DATA.filter(r => r.rating === s).length,
    pct: (REVIEWS_DATA.filter(r => r.rating === s).length / REVIEWS_DATA.length) * 100,
  }))

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${REVIEWS_DATA.length} reviews across all experiences`} />

      {/* Summary */}
      <div className="bg-white rounded-xl p-5 mb-5 flex flex-col sm:flex-row gap-6 items-start" style={{ border: '1px solid #E8E4DE' }}>
        <div className="text-center flex-shrink-0">
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 52, fontWeight: 700, color: '#111111', lineHeight: 1 }}>{avg}</p>
          <Stars n={Math.round(Number(avg))} />
          <p style={{ fontSize: 12, color: '#6F675C', marginTop: 4 }}>{REVIEWS_DATA.length} reviews</p>
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
                {['Ubud','Canggu','Kuta','Seminyak','Uluwatu','Gianyar','Sanur'].map(a => <option key={a}>{a}</option>)}
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

// ── Sidebar ───────────────────────────────────────────────────────────────────

function SidebarInner({ activeNav, setActiveNav }: { activeNav: string; setActiveNav: (id: string) => void }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <a href="/" className="flex flex-col leading-none" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: 'white' }}>BALIBLE</span>
          <span style={{ fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>HOST DASHBOARD</span>
        </a>
        <button onClick={() => setActiveNav('settings')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          className="relative" title="Notification settings">
          <Bell size={17} style={{ color: 'rgba(255,255,255,0.7)' }} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#B66A45', fontSize: 9, color: 'white', fontWeight: 700 }}>2</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mx-3 px-3 py-3 rounded-xl mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C8A97E' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>M</span>
        </div>
        <div className="min-w-0">
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Made Sari</p>
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

  const renderPanel = () => {
    switch (activeNav) {
      case 'overview':    return <OverviewPanel onNav={setActiveNav} />
      case 'experiences': return <ExperiencesPanel />
      case 'bookings':    return <BookingsPanel />
      case 'earnings':    return <EarningsPanel />
      case 'reviews':     return <ReviewsPanel />
      case 'profile':     return <ProfilePanel />
      case 'settings':    return <SettingsPanel />
      default:            return <OverviewPanel onNav={setActiveNav} />
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
            <SidebarInner activeNav={activeNav} setActiveNav={id => { setActiveNav(id); setSidebarOpen(false) }} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: 240, backgroundColor: '#111111', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' }}>
        <SidebarInner activeNav={activeNav} setActiveNav={setActiveNav} />
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
          <div style={{ width: 22 }} />
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
