'use client'

import { useState, useMemo } from 'react'
import {
  LayoutDashboard, Compass, Users, CalendarDays, Star,
  CreditCard, BarChart2, Settings, Menu, X,
  ArrowUpRight, ArrowDownRight, ChevronDown, Search, Download,
  Eye, Edit2, Trash2, Play, Pause, CheckCircle, XCircle,
  MoreHorizontal, Bell, LogOut, TrendingUp, Globe, Shield,
  Check, AlertTriangle, Plus, RefreshCw, Flag,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────

const GOLD = '#C8A97E'
const CHARCOAL = '#111111'
const COCONUT = '#6F675C'
const IVORY = '#F5F1EB'
const SAND = '#E8E4DE'
const FOREST = '#4A7C59'
const TERRACOTTA = '#B66A45'

// ── Mock data ─────────────────────────────────────────────────────────────────

const PLATFORM_STATS = [
  { label: 'Total Bookings',    value: '1,248', change: '+16.2%', up: true  },
  { label: 'Platform Revenue',  value: 'IDR 2.45B', change: '+18.3%', up: true  },
  { label: 'Active Hosts',      value: '47',    change: '+12.5%', up: true  },
  { label: 'Total Experiences', value: '31',    change: '+8.1%',  up: true  },
]

const BOOKING_CHART = [180, 220, 195, 260, 240, 290, 270, 310, 285, 340, 320, 380]
const REVENUE_CHART = [3200000, 2800000, 4100000, 3600000, 4800000, 5200000, 4400000, 5800000, 5100000, 6200000, 5700000, 7400000]
const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']

const CATEGORY_DIST = [
  { name: 'Wellness',     pct: 32, color: FOREST },
  { name: 'Art & Craft',  pct: 28, color: GOLD   },
  { name: 'Culture',      pct: 16, color: TERRACOTTA },
  { name: 'Nature',       pct: 11, color: COCONUT },
  { name: 'Food & Drink', pct: 7,  color: CHARCOAL },
  { name: 'Surf & Water', pct: 6,  color: '#3B82F6' },
]

const ALL_EXPERIENCES = [
  { id: 1,  slug: 'pottery-making-class',      title: 'Pottery Making Class',         host: 'Made Sari',       area: 'Ubud',     category: 'Art & Craft',  price: 450000, rating: 4.9, reviews: 128, bookings: 87,  status: 'Active',  image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=60&auto=format&fit=crop&q=80' },
  { id: 2,  slug: 'silver-jewelry-workshop',   title: 'Silver Jewelry Workshop',      host: 'Ketut Suardana',  area: 'Canggu',   category: 'Art & Craft',  price: 550000, rating: 4.8, reviews: 94,  bookings: 61,  status: 'Active',  image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=60&auto=format&fit=crop&q=80' },
  { id: 3,  slug: 'sound-healing-journey',     title: 'Sound Healing Journey',        host: 'Nina Putri',      area: 'Ubud',     category: 'Wellness',     price: 350000, rating: 4.8, reviews: 178, bookings: 143, status: 'Active',  image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=60&auto=format&fit=crop&q=80' },
  { id: 4,  slug: 'uluwatu-kecak-sunset',      title: 'Uluwatu Sunset & Kecak Dance', host: 'I Nyoman Arta',   area: 'Uluwatu',  category: 'Culture',      price: 450000, rating: 4.9, reviews: 312, bookings: 198, status: 'Active',  image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=60&auto=format&fit=crop&q=80' },
  { id: 5,  slug: 'balinese-cooking-class',    title: 'Balinese Cooking Class',       host: 'Putu Sari',       area: 'Seminyak', category: 'Food & Drink', price: 480000, rating: 4.8, reviews: 156, bookings: 112, status: 'Active',  image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=60&auto=format&fit=crop&q=80' },
  { id: 6,  slug: 'mount-batur-sunrise',       title: 'Mount Batur Sunrise Trek',     host: 'Wayan Surya',     area: 'Kintamani',category: 'Nature',       price: 650000, rating: 4.8, reviews: 241, bookings: 167, status: 'Active',  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&auto=format&fit=crop&q=80' },
  { id: 7,  slug: 'beginner-surf-lesson',      title: 'Beginner Surf Lesson',         host: 'Komang Surya',    area: 'Kuta',     category: 'Surf & Water', price: 320000, rating: 4.7, reviews: 428, bookings: 312, status: 'Active',  image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=60&auto=format&fit=crop&q=80' },
  { id: 8,  slug: 'rice-terrace-walk',         title: 'Tegalalang Rice Terrace Walk', host: 'Gede Arnawa',     area: 'Ubud',     category: 'Nature',       price: 280000, rating: 4.8, reviews: 192, bookings: 134, status: 'Active',  image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=60&auto=format&fit=crop&q=80' },
  { id: 9,  slug: 'waterfall-hidden-canyon',   title: 'Hidden Waterfall Canyon Hike', host: 'Putu Wirawan',    area: 'Aling-Aling', category: 'Nature',   price: 450000, rating: 4.9, reviews: 89,  bookings: 54,  status: 'Active',  image: 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=60&auto=format&fit=crop&q=80' },
  { id: 10, slug: 'natural-dye-workshop',      title: 'Natural Dye Workshop',         host: 'Ni Made Suari',   area: 'Sidemen',  category: 'Art & Craft',  price: 380000, rating: 4.7, reviews: 48,  bookings: 29,  status: 'Draft',   image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&auto=format&fit=crop&q=80' },
]

const ALL_HOSTS = [
  { id: 1, name: 'Made Sari',       business: 'Made Sari Pottery Studio', area: 'Ubud',     experiences: 3, totalBookings: 228, totalEarnings: 63900000, rating: 4.9, status: 'Verified',   joined: 'Jan 2023', image: null },
  { id: 2, name: 'Ketut Suardana',  business: 'Ketut Silver Artistry',    area: 'Canggu',   experiences: 2, totalBookings: 94,  totalEarnings: 41800000, rating: 4.8, status: 'Verified',   joined: 'Mar 2023', image: null },
  { id: 3, name: 'Nina Putri',      business: 'Sukha Healing Space',      area: 'Ubud',     experiences: 2, totalBookings: 355, totalEarnings: 98700000, rating: 4.9, status: 'Verified',   joined: 'Feb 2023', image: null },
  { id: 4, name: 'I Nyoman Arta',   business: 'Bali Culture Tours',       area: 'Uluwatu',  experiences: 2, totalBookings: 516, totalEarnings: 181800000, rating: 4.9, status: 'Verified',  joined: 'Jan 2023', image: null },
  { id: 5, name: 'Putu Sari',       business: 'Warung Dapur Bali',        area: 'Seminyak', experiences: 1, totalBookings: 112, totalEarnings: 43200000, rating: 4.8, status: 'Verified',   joined: 'Apr 2023', image: null },
  { id: 6, name: 'Wayan Surya',     business: 'Batur Volcano Guides',     area: 'Kintamani',experiences: 1, totalBookings: 167, totalEarnings: 97500000, rating: 4.8, status: 'Verified',   joined: 'May 2023', image: null },
  { id: 7, name: 'Komang Surya',    business: 'Kuta Surf Academy',        area: 'Kuta',     experiences: 2, totalBookings: 488, totalEarnings: 120100000,rating: 4.7, status: 'Verified',   joined: 'Jun 2023', image: null },
  { id: 8, name: 'Wayan Gede',      business: 'Sacred Bali Ceremonies',   area: 'Gianyar',  experiences: 3, totalBookings: 250, totalEarnings: 108000000, rating: 4.8, status: 'Pending',   joined: 'Aug 2023', image: null },
  { id: 9, name: 'Putu Ayu',        business: 'Ubud Food Stories',        area: 'Ubud',     experiences: 1, totalBookings: 97,  totalEarnings: 25400000, rating: 4.8, status: 'Pending',    joined: 'Sep 2023', image: null },
  { id: 10,name: 'Kadek Anom',      business: 'Sawah Yoga Ubud',          area: 'Ubud',     experiences: 1, totalBookings: 156, totalEarnings: 39600000, rating: 4.9, status: 'Suspended',  joined: 'Jul 2023', image: null },
]

const ALL_BOOKINGS = [
  { id: 'B001', ref: 'BAL-2024-001', guest: 'Sarah Kim',      email: 'sarah.k@gmail.com',    experience: 'Pottery Making Class',         host: 'Made Sari',      date: 'Jun 8, 2024',  guests: 2, total: 900000,   commission: 90000,   status: 'Confirmed' },
  { id: 'B002', ref: 'BAL-2024-002', guest: 'Thomas Reeves',  email: 'treeves@gmail.com',     experience: 'Uluwatu Sunset & Kecak Dance',  host: 'I Nyoman Arta',  date: 'Jun 8, 2024',  guests: 3, total: 1350000,  commission: 135000,  status: 'Pending'   },
  { id: 'B003', ref: 'BAL-2024-003', guest: 'Priya Mehta',    email: 'priya.m@gmail.com',     experience: 'Balinese Cooking Class',        host: 'Putu Sari',      date: 'Jun 9, 2024',  guests: 1, total: 480000,   commission: 48000,   status: 'Confirmed' },
  { id: 'B004', ref: 'BAL-2024-004', guest: 'Marco Bianchi',  email: 'marco.b@gmail.com',     experience: 'Mount Batur Sunrise Trek',      host: 'Wayan Surya',    date: 'Jun 10, 2024', guests: 2, total: 1300000,  commission: 130000,  status: 'Pending'   },
  { id: 'B005', ref: 'BAL-2024-005', guest: 'Yuki Tanaka',    email: 'yuki.t@gmail.com',      experience: 'Sound Healing Journey',         host: 'Nina Putri',     date: 'Jun 12, 2024', guests: 2, total: 700000,   commission: 70000,   status: 'Confirmed' },
  { id: 'B006', ref: 'BAL-2024-006', guest: 'Alex Chen',      email: 'alex.c@gmail.com',      experience: 'Silver Jewelry Workshop',       host: 'Ketut Suardana', date: 'Jun 6, 2024',  guests: 4, total: 2200000,  commission: 220000,  status: 'Completed' },
  { id: 'B007', ref: 'BAL-2024-007', guest: 'Lisa Wagner',    email: 'lisa.w@gmail.com',      experience: 'Beginner Surf Lesson',          host: 'Komang Surya',   date: 'Jun 3, 2024',  guests: 1, total: 320000,   commission: 32000,   status: 'Completed' },
  { id: 'B008', ref: 'BAL-2024-008', guest: 'James Park',     email: 'james.p@gmail.com',     experience: 'Rice Terrace Walk',             host: 'Gede Arnawa',    date: 'Jun 1, 2024',  guests: 2, total: 560000,   commission: 56000,   status: 'Cancelled' },
]

const ALL_USERS = [
  { id: 'U1', name: 'Sarah Kim',     email: 'sarah.k@gmail.com',    country: 'South Korea', bookings: 4, totalSpend: 2840000,  joined: 'Jan 2024', status: 'Active'    },
  { id: 'U2', name: 'Thomas Reeves', email: 'treeves@gmail.com',     country: 'UK',          bookings: 2, totalSpend: 1800000,  joined: 'Mar 2024', status: 'Active'    },
  { id: 'U3', name: 'Priya Mehta',   email: 'priya.m@gmail.com',     country: 'India',       bookings: 7, totalSpend: 5120000,  joined: 'Nov 2023', status: 'Active'    },
  { id: 'U4', name: 'Marco Bianchi', email: 'marco.b@gmail.com',     country: 'Italy',       bookings: 1, totalSpend: 1300000,  joined: 'May 2024', status: 'Active'    },
  { id: 'U5', name: 'Yuki Tanaka',   email: 'yuki.t@gmail.com',      country: 'Japan',       bookings: 3, totalSpend: 2100000,  joined: 'Feb 2024', status: 'Active'    },
  { id: 'U6', name: 'Alex Chen',     email: 'alex.c@gmail.com',      country: 'Australia',   bookings: 9, totalSpend: 8400000,  joined: 'Oct 2023', status: 'Active'    },
  { id: 'U7', name: 'Lisa Wagner',   email: 'lisa.w@gmail.com',      country: 'Germany',     bookings: 2, totalSpend: 970000,   joined: 'Apr 2024', status: 'Active'    },
  { id: 'U8', name: 'James Park',    email: 'james.p@gmail.com',     country: 'USA',         bookings: 0, totalSpend: 0,        joined: 'Jun 2024', status: 'Inactive'  },
]

const ALL_REVIEWS = [
  { id: 'R1', guest: 'Sarah K.',     experience: 'Pottery Making Class',         host: 'Made Sari',    rating: 5, comment: "Absolutely magical. Made is an incredible teacher — patient, encouraging, and full of beautiful stories about her family's craft.", date: 'May 12, 2024', status: 'Published' },
  { id: 'R2', guest: 'Thomas R.',    experience: 'Uluwatu Sunset & Kecak Dance', host: 'I Nyoman Arta',rating: 5, comment: "The Kecak dance at sunset is genuinely one of the most spectacular things I have ever witnessed. Extraordinary.", date: 'May 17, 2024', status: 'Published' },
  { id: 'R3', guest: 'Priya M.',     experience: 'Sound Healing Journey',        host: 'Nina Putri',   rating: 5, comment: 'One of the most profound experiences of my life. Nina holds the space with such grace and wisdom.', date: 'May 8, 2024',  status: 'Published' },
  { id: 'R4', guest: 'Alex C.',      experience: 'Balinese Cooking Class',       host: 'Putu Sari',    rating: 4, comment: 'Really enjoyed every moment. The market visit was a highlight and the food we cooked was genuinely delicious.', date: 'Jun 6, 2024',  status: 'Published' },
  { id: 'R5', guest: 'Yuki T.',      experience: 'Silver Jewelry Workshop',      host: 'Ketut Suardana',rating: 2, comment: 'Disappointing. The studio was not what was described and the instructor was distracted by his phone the whole time.', date: 'Jun 3, 2024',  status: 'Flagged'   },
  { id: 'R6', guest: 'Lisa W.',      experience: 'Beginner Surf Lesson',         host: 'Komang Surya', rating: 5, comment: 'Best 2 hours of my trip. Komang is encouraging, patient and makes the whole thing feel safe.', date: 'Jun 3, 2024',  status: 'Published' },
]

const PAYOUTS = [
  { id: 'P1', host: 'I Nyoman Arta',  period: 'May 1–31, 2024', gross: 89100000, commission: 8910000, net: 80190000, status: 'Paid',    date: 'Jun 5, 2024'  },
  { id: 'P2', host: 'Nina Putri',     period: 'May 1–31, 2024', gross: 42000000, commission: 4200000, net: 37800000, status: 'Paid',    date: 'Jun 5, 2024'  },
  { id: 'P3', host: 'Made Sari',      period: 'May 1–31, 2024', gross: 29250000, commission: 2925000, net: 26325000, status: 'Pending', date: 'Jun 10, 2024' },
  { id: 'P4', host: 'Komang Surya',   period: 'May 1–31, 2024', gross: 54400000, commission: 5440000, net: 48960000, status: 'Pending', date: 'Jun 10, 2024' },
  { id: 'P5', host: 'Wayan Surya',    period: 'Apr 1–30, 2024', gross: 68250000, commission: 6825000, net: 61425000, status: 'Paid',    date: 'May 5, 2024'  },
]

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',    Icon: LayoutDashboard },
  { id: 'experiences', label: 'Experiences', Icon: Compass },
  { id: 'hosts',       label: 'Hosts',       Icon: Users },
  { id: 'bookings',    label: 'Bookings',    Icon: CalendarDays },
  { id: 'users',       label: 'Users',       Icon: Globe },
  { id: 'reviews',     label: 'Reviews',     Icon: Star },
  { id: 'payments',    label: 'Payments',    Icon: CreditCard },
  { id: 'analytics',   label: 'Analytics',   Icon: BarChart2 },
  { id: 'settings',    label: 'Settings',    Icon: Settings },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000_000) return `IDR ${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `IDR ${(n / 1_000_000).toFixed(1)}M`
  return `IDR ${n.toLocaleString('id-ID')}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active:    { bg: '#F0F7F2', color: FOREST },
    Verified:  { bg: '#F0F7F2', color: FOREST },
    Confirmed: { bg: '#F0F7F2', color: FOREST },
    Completed: { bg: '#EEF2FF', color: '#4B6CB7' },
    Paid:      { bg: '#F0F7F2', color: FOREST },
    Published: { bg: '#F0F7F2', color: FOREST },
    Pending:   { bg: '#FDF8F4', color: GOLD },
    Draft:     { bg: IVORY,     color: COCONUT },
    Paused:    { bg: '#FEF9F4', color: GOLD },
    Inactive:  { bg: IVORY,     color: COCONUT },
    Suspended: { bg: '#FEF2F2', color: TERRACOTTA },
    Cancelled: { bg: '#FEF2F2', color: TERRACOTTA },
    Flagged:   { bg: '#FEF2F2', color: TERRACOTTA },
  }
  const s = map[status] ?? { bg: IVORY, color: COCONUT }
  return (
    <span style={{ ...s, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const W = 360, H = 80
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 10) - 5}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#g${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function DonutChart({ data, total }: { data: typeof CATEGORY_DIST; total: number }) {
  const SIZE = 120, R = 44, STROKE = 20, CIRC = 2 * Math.PI * R
  let cumulative = 0
  const segments = data.map(cat => {
    const dashLen = (cat.pct / 100) * CIRC
    const offset = -cumulative
    cumulative += dashLen
    return { ...cat, dashLen, offset }
  })
  return (
    <div className="flex items-center gap-5">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="flex-shrink-0">
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="#F0EDE8" strokeWidth={STROKE} />
        {segments.map((seg, i) => (
          <circle key={i} cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={seg.color} strokeWidth={STROKE}
            strokeDasharray={`${seg.dashLen} ${CIRC - seg.dashLen}`} strokeDashoffset={seg.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
        ))}
        <text x={SIZE/2} y={SIZE/2-5} textAnchor="middle" style={{ fontSize: 15, fontWeight: 700, fill: CHARCOAL }}>{total.toLocaleString()}</text>
        <text x={SIZE/2} y={SIZE/2+12} textAnchor="middle" style={{ fontSize: 9, fill: COCONUT }}>Bookings</text>
      </svg>
      <div className="space-y-1.5">
        {data.map(cat => (
          <div key={cat.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span style={{ fontSize: 11, color: COCONUT, fontFamily: 'var(--font-inter)' }}>{cat.name}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: CHARCOAL, fontFamily: 'var(--font-inter)' }}>{cat.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: CHARCOAL }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: COCONUT, marginTop: 3 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex-1">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COCONUT }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? 'Search…'}
        style={{ width: '100%', height: 38, borderRadius: 10, border: `1px solid ${SAND}`, paddingLeft: 32, paddingRight: 12, fontSize: 13, fontFamily: 'var(--font-inter)', color: CHARCOAL, outline: 'none', backgroundColor: 'white' }} />
    </div>
  )
}

// ── Overview Panel ────────────────────────────────────────────────────────────

const RECENT_BOOKINGS = ALL_BOOKINGS.slice(0, 5)

function OverviewPanel({ onNav }: { onNav: (id: string) => void }) {
  const [period, setPeriod] = useState('This Month')
  const slice  = period === 'This Month' ? BOOKING_CHART.slice(6)  : BOOKING_CHART.slice(0, 6)
  const labels = period === 'This Month' ? MONTHS.slice(6)         : MONTHS.slice(0, 6)

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: CHARCOAL }}>
            Good morning, Reggy
          </h1>
          <p style={{ fontSize: 14, color: COCONUT, marginTop: 3 }}>Here&apos;s what&apos;s happening on Balible today.</p>
        </div>
        <button onClick={() => onNav('bookings')}
          className="hidden sm:flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ height: 40, backgroundColor: CHARCOAL, color: 'white', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <CalendarDays size={14} /> All Bookings
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {PLATFORM_STATS.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 12, color: COCONUT }}>{s.label}</p>
            <p className="mt-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14px,1.8vw,20px)', fontWeight: 700, color: CHARCOAL, lineHeight: 1.2 }}>{s.value}</p>
            <p className="mt-1.5 flex items-center gap-1" style={{ fontSize: 11, color: s.up ? FOREST : TERRACOTTA }}>
              {s.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {s.change} vs last month
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mb-5">
        {/* Bookings chart */}
        <div className="lg:col-span-3 bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <div className="flex items-center justify-between mb-1">
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Bookings</h2>
            <button onClick={() => setPeriod(p => p === 'This Month' ? 'Last 6 Months' : 'This Month')}
              className="flex items-center gap-1" style={{ background: 'none', border: `1px solid ${SAND}`, borderRadius: 6, padding: '3px 9px', fontSize: 11, color: COCONUT, cursor: 'pointer' }}>
              {period} <ChevronDown size={10} />
            </button>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: CHARCOAL }}>1,248</span>
            <span style={{ fontSize: 12, color: FOREST }}>↑ 16.2%</span>
          </div>
          <MiniChart data={slice} color={FOREST} />
          <div className="flex justify-between mt-1">
            {labels.map(m => <span key={m} style={{ fontSize: 9, color: COCONUT }}>{m}</span>)}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>By Category</h2>
          <DonutChart data={CATEGORY_DIST} total={1248} />
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl p-5 mb-5" style={{ border: `1px solid ${SAND}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Recent Bookings</h2>
          <button onClick={() => onNav('bookings')} style={{ fontSize: 13, color: GOLD, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${SAND}` }}>
                {['Ref', 'Guest', 'Experience', 'Host', 'Date', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0 8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_BOOKINGS.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < RECENT_BOOKINGS.length - 1 ? `1px solid ${IVORY}` : 'none' }}>
                  <td style={{ padding: '12px 8px', fontSize: 12, color: COCONUT, fontFamily: 'var(--font-inter)' }}>{b.ref}</td>
                  <td style={{ padding: '12px 8px', fontSize: 13, fontWeight: 500, color: CHARCOAL }}>{b.guest}</td>
                  <td style={{ padding: '12px 8px', fontSize: 12, color: COCONUT, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.experience}</td>
                  <td style={{ padding: '12px 8px', fontSize: 12, color: COCONUT }}>{b.host}</td>
                  <td style={{ padding: '12px 8px', fontSize: 12, color: COCONUT, whiteSpace: 'nowrap' }}>{b.date}</td>
                  <td style={{ padding: '12px 8px', fontSize: 13, fontWeight: 600, color: CHARCOAL, whiteSpace: 'nowrap' }}>{fmt(b.total)}</td>
                  <td style={{ padding: '12px 8px' }}><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top experiences */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Pending Approvals', value: '2', sub: 'Host applications', color: GOLD, action: () => onNav('hosts') },
          { label: 'Flagged Reviews',   value: '1', sub: 'Needs moderation',   color: TERRACOTTA, action: () => onNav('reviews') },
          { label: 'Pending Payouts',   value: fmt(PAYOUTS.filter(p => p.status === 'Pending').reduce((a, p) => a + p.net, 0)), sub: '2 hosts awaiting payout', color: FOREST, action: () => onNav('payments') },
        ].map(card => (
          <button key={card.label} onClick={card.action}
            className="text-left bg-white rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer w-full"
            style={{ border: `1px solid ${SAND}`, outline: 'none' }}>
            <p style={{ fontSize: 12, color: COCONUT }}>{card.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: card.color, marginTop: 4 }}>{card.value}</p>
            <p style={{ fontSize: 12, color: COCONUT, marginTop: 2 }}>{card.sub} →</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Experiences Panel ─────────────────────────────────────────────────────────

function ExperiencesPanel() {
  const [filter, setFilter]   = useState('All')
  const [search, setSearch]   = useState('')
  const [exps, setExps]       = useState(ALL_EXPERIENCES)
  const [menuOpen, setMenuOpen] = useState<number | null>(null)

  const setStatus = (id: number, s: string) => { setExps(p => p.map(e => e.id === id ? { ...e, status: s } : e)); setMenuOpen(null) }

  const visible = useMemo(() => {
    let list = filter === 'All' ? exps : exps.filter(e => e.status === filter)
    if (search) list = list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.host.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [exps, filter, search])

  return (
    <div>
      <PageHeader title="All Experiences" sub={`${exps.length} total listings across all hosts`} />

      <div className="flex gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search title or host…" />
        <button className="flex items-center gap-2 px-4 rounded-xl flex-shrink-0 hover:opacity-80"
          style={{ height: 38, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 13, color: COCONUT, cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
      </div>

      <div className="inline-flex gap-1 mb-5 bg-white rounded-xl p-1" style={{ border: `1px solid ${SAND}` }}>
        {['All', 'Active', 'Draft', 'Paused'].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: filter === t ? 600 : 400, backgroundColor: filter === t ? CHARCOAL : 'transparent', color: filter === t ? 'white' : COCONUT, border: 'none', cursor: 'pointer' }}>
            {t} <span style={{ opacity: 0.5, fontSize: 11 }}>{t === 'All' ? exps.length : exps.filter(e => e.status === t).length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map(exp => (
          <div key={exp.id} className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ border: `1px solid ${SAND}` }}>
            <img src={exp.image} alt={exp.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: CHARCOAL }}>{exp.title}</span>
                <StatusBadge status={exp.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                <span style={{ fontSize: 12, color: COCONUT }}>🧑 {exp.host}</span>
                <span style={{ fontSize: 12, color: COCONUT }}>📍 {exp.area}</span>
                <span style={{ fontSize: 12, color: COCONUT }}>{exp.category}</span>
                <span style={{ fontSize: 12, color: COCONUT }}>⭐ {exp.rating} ({exp.reviews})</span>
                <span style={{ fontSize: 12, color: COCONUT }}>{exp.bookings} bookings</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right mr-4">
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>IDR {exp.price.toLocaleString('id-ID')}</p>
              <p style={{ fontSize: 11, color: COCONUT }}>per person</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a href={`/experiences/${exp.slug}`} target="_blank" rel="noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-50 transition-colors"
                style={{ border: `1px solid ${SAND}`, color: COCONUT }}>
                <Eye size={14} />
              </a>
              <div className="relative">
                <button onClick={() => setMenuOpen(menuOpen === exp.id ? null : exp.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-50"
                  style={{ border: `1px solid ${SAND}`, background: 'none', cursor: 'pointer', color: COCONUT }}>
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen === exp.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg z-20 py-1 w-36" style={{ border: `1px solid ${SAND}` }}>
                      {exp.status !== 'Active' && <button onClick={() => setStatus(exp.id, 'Active')} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50" style={{ fontSize: 13, color: FOREST, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><Play size={12} />Activate</button>}
                      {exp.status === 'Active' && <button onClick={() => setStatus(exp.id, 'Paused')} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50" style={{ fontSize: 13, color: GOLD, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><Pause size={12} />Pause</button>}
                      <button onClick={() => setStatus(exp.id, 'Draft')} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50" style={{ fontSize: 13, color: COCONUT, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><Edit2 size={12} />Set Draft</button>
                      <button className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50" style={{ fontSize: 13, color: TERRACOTTA, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><Trash2 size={12} />Remove</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Hosts Panel ───────────────────────────────────────────────────────────────

function HostsPanel() {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('All')
  const [hosts, setHosts]     = useState(ALL_HOSTS)

  const approve  = (id: number) => setHosts(h => h.map(x => x.id === id ? { ...x, status: 'Verified' } : x))
  const suspend  = (id: number) => setHosts(h => h.map(x => x.id === id ? { ...x, status: 'Suspended' } : x))

  const visible = useMemo(() => {
    let list = filter === 'All' ? hosts : hosts.filter(h => h.status === filter)
    if (search) list = list.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.business.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [hosts, filter, search])

  const pending = hosts.filter(h => h.status === 'Pending').length

  return (
    <div>
      <PageHeader title="Host Management" sub={`${hosts.length} hosts · ${pending} pending approval`} />

      {pending > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ backgroundColor: '#FDF8F4', border: `1px solid #F0DCC0` }}>
          <AlertTriangle size={16} style={{ color: GOLD, flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL }}>{pending} host{pending > 1 ? 's' : ''} awaiting approval</p>
            <p style={{ fontSize: 13, color: COCONUT, marginTop: 2 }}>Review their applications and verify or decline below.</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search host or business name…" />
      </div>

      <div className="inline-flex gap-1 mb-5 bg-white rounded-xl p-1" style={{ border: `1px solid ${SAND}` }}>
        {['All', 'Verified', 'Pending', 'Suspended'].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: filter === t ? 600 : 400, backgroundColor: filter === t ? CHARCOAL : 'transparent', color: filter === t ? 'white' : COCONUT, border: 'none', cursor: 'pointer' }}>
            {t} <span style={{ opacity: 0.5, fontSize: 11 }}>{t === 'All' ? hosts.length : hosts.filter(h => h.status === t).length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map(host => (
          <div key={host.id} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GOLD }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{host.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{host.name}</span>
                  <StatusBadge status={host.status} />
                </div>
                <p style={{ fontSize: 13, color: COCONUT, marginTop: 1 }}>{host.business} · {host.area}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-0.5 mt-2">
                  <span style={{ fontSize: 12, color: COCONUT }}>{host.experiences} listings</span>
                  <span style={{ fontSize: 12, color: COCONUT }}>{host.totalBookings} bookings</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: FOREST }}>{fmt(host.totalEarnings)} earned</span>
                  <span style={{ fontSize: 12, color: COCONUT }}>⭐ {host.rating}</span>
                  <span style={{ fontSize: 12, color: COCONUT }}>Joined {host.joined}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {host.status === 'Pending' && (
                  <>
                    <button onClick={() => approve(host.id)} className="flex items-center gap-1 hover:opacity-90"
                      style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button onClick={() => suspend(host.id)} className="flex items-center gap-1 hover:opacity-80"
                      style={{ height: 34, padding: '0 14px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: TERRACOTTA, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <XCircle size={12} /> Decline
                    </button>
                  </>
                )}
                {host.status === 'Verified' && (
                  <button onClick={() => suspend(host.id)} className="hover:opacity-80"
                    style={{ height: 34, padding: '0 14px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: COCONUT, fontSize: 12, cursor: 'pointer' }}>
                    Suspend
                  </button>
                )}
                {host.status === 'Suspended' && (
                  <button onClick={() => approve(host.id)} className="hover:opacity-90"
                    style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', backgroundColor: FOREST, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Reinstate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Bookings Panel ────────────────────────────────────────────────────────────

function BookingsPanel() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch]             = useState('')
  const [bookings, setBookings]         = useState(ALL_BOOKINGS)

  const confirm = (id: string) => setBookings(p => p.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b))
  const cancel  = (id: string) => setBookings(p => p.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b))

  const visible = useMemo(() => {
    let list = statusFilter === 'All' ? bookings : bookings.filter(b => b.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(b => b.guest.toLowerCase().includes(q) || b.experience.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q) || b.host.toLowerCase().includes(q))
    }
    return list
  }, [bookings, statusFilter, search])

  const totalRevenue = visible.reduce((a, b) => a + b.total, 0)
  const totalCommission = visible.reduce((a, b) => a + b.commission, 0)

  return (
    <div>
      <PageHeader title="All Bookings" sub={`${bookings.length} total bookings on the platform`} />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Gross Revenue', value: fmt(totalRevenue), color: CHARCOAL },
          { label: 'Platform Commission (10%)', value: fmt(totalCommission), color: FOREST },
          { label: 'Host Payouts', value: fmt(totalRevenue - totalCommission), color: GOLD },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 11, color: COCONUT }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search guest, experience, host or ref…" />
        <button className="flex items-center gap-2 px-4 rounded-xl flex-shrink-0 hover:opacity-80"
          style={{ height: 38, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 13, color: COCONUT, cursor: 'pointer' }}>
          <Download size={13} /> CSV
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto">
        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: statusFilter === s ? 600 : 400, flexShrink: 0, backgroundColor: statusFilter === s ? CHARCOAL : 'white', color: statusFilter === s ? 'white' : COCONUT, border: `1px solid`, borderColor: statusFilter === s ? CHARCOAL : SAND, cursor: 'pointer' }}>
            {s} <span style={{ opacity: 0.5, fontSize: 11 }}>{s === 'All' ? bookings.length : bookings.filter(b => b.status === s).length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map(b => (
          <div key={b.id} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
            <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{b.guest}</span>
                  <StatusBadge status={b.status} />
                </div>
                <p style={{ fontSize: 12, color: COCONUT, marginTop: 1 }}>{b.email} · {b.ref}</p>
              </div>
              <div className="text-right">
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>{fmt(b.total)}</p>
                <p style={{ fontSize: 11, color: FOREST }}>Commission: {fmt(b.commission)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              <span style={{ fontSize: 12, color: COCONUT }}>📋 {b.experience}</span>
              <span style={{ fontSize: 12, color: COCONUT }}>🧑‍🏫 {b.host}</span>
              <span style={{ fontSize: 12, color: COCONUT }}>📅 {b.date}</span>
              <span style={{ fontSize: 12, color: COCONUT }}>👤 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
            </div>
            {b.status === 'Pending' && (
              <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${IVORY}` }}>
                <button onClick={() => confirm(b.id)} className="flex items-center justify-center gap-1.5 hover:opacity-90"
                  style={{ height: 34, flex: 1, borderRadius: 8, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <CheckCircle size={13} /> Confirm
                </button>
                <button onClick={() => cancel(b.id)} className="flex items-center justify-center gap-1.5 hover:bg-red-50"
                  style={{ height: 34, flex: 1, borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: TERRACOTTA, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <XCircle size={13} /> Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Users Panel ───────────────────────────────────────────────────────────────

function UsersPanel() {
  const [search, setSearch] = useState('')

  const visible = useMemo(() => {
    if (!search) return ALL_USERS
    const q = search.toLowerCase()
    return ALL_USERS.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.country.toLowerCase().includes(q))
  }, [search])

  return (
    <div>
      <PageHeader title="Guests" sub={`${ALL_USERS.length} registered users`} />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Users', value: ALL_USERS.length.toString() },
          { label: 'Active (booked)', value: ALL_USERS.filter(u => u.bookings > 0).length.toString() },
          { label: 'Total Guest Spend', value: fmt(ALL_USERS.reduce((a, u) => a + u.totalSpend, 0)) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 11, color: COCONUT }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: CHARCOAL, marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, email or country…" />
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${SAND}` }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: IVORY }}>
              <tr>
                {['Name', 'Email', 'Country', 'Bookings', 'Total Spent', 'Joined', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((u, i) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${IVORY}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GOLD }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{u.name[0]}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: CHARCOAL }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: COCONUT }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: CHARCOAL }}>{u.country}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{u.bookings}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: u.totalSpend > 0 ? FOREST : COCONUT }}>{u.totalSpend > 0 ? fmt(u.totalSpend) : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: COCONUT }}>{u.joined}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Reviews Panel ─────────────────────────────────────────────────────────────

function ReviewsPanel() {
  const [starFilter, setStarFilter] = useState(0)
  const [reviews, setReviews]       = useState(ALL_REVIEWS)

  const remove = (id: string) => setReviews(r => r.filter(x => x.id !== id))
  const approve = (id: string) => setReviews(r => r.map(x => x.id === id ? { ...x, status: 'Published' } : x))

  const flagged = reviews.filter(r => r.status === 'Flagged')
  const visible = starFilter === 0 ? reviews : reviews.filter(r => r.rating === starFilter)
  const avg     = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <div>
      <PageHeader title="Reviews" sub={`${reviews.length} reviews · avg ${avg} ★`} />

      {flagged.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ backgroundColor: '#FEF2F2', border: `1px solid #FECACA` }}>
          <Flag size={16} style={{ color: TERRACOTTA, flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL }}>{flagged.length} flagged review{flagged.length > 1 ? 's' : ''} need moderation</p>
            <p style={{ fontSize: 13, color: COCONUT, marginTop: 1 }}>Review and decide whether to keep or remove.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {[0, 5, 4, 3, 2, 1].map(s => (
          <button key={s} onClick={() => setStarFilter(starFilter === s ? 0 : s)}
            style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: starFilter === s ? 600 : 400, backgroundColor: starFilter === s ? CHARCOAL : 'white', color: starFilter === s ? 'white' : COCONUT, border: `1px solid ${starFilter === s ? CHARCOAL : SAND}`, cursor: 'pointer' }}>
            {s === 0 ? 'All' : `${s} ★`} <span style={{ opacity: 0.5, fontSize: 11 }}>{s === 0 ? reviews.length : reviews.filter(r => r.rating === s).length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${r.status === 'Flagged' ? '#FECACA' : SAND}` }}>
            <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{r.guest}</span>
                  <span style={{ fontSize: 12, color: GOLD }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p style={{ fontSize: 12, color: COCONUT, marginTop: 1 }}>{r.experience} · {r.host} · {r.date}</p>
              </div>
              <div className="flex gap-2">
                {r.status === 'Flagged' && (
                  <button onClick={() => approve(r.id)} className="flex items-center gap-1 hover:opacity-90"
                    style={{ height: 30, padding: '0 12px', borderRadius: 8, border: 'none', backgroundColor: FOREST, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Check size={11} /> Keep
                  </button>
                )}
                <button onClick={() => remove(r.id)} className="flex items-center gap-1 hover:opacity-80"
                  style={{ height: 30, padding: '0 12px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: TERRACOTTA, fontSize: 12, cursor: 'pointer' }}>
                  <Trash2 size={11} /> Remove
                </button>
              </div>
            </div>
            <p style={{ fontSize: 13, color: COCONUT, lineHeight: 1.65, fontStyle: 'italic' }}>&ldquo;{r.comment}&rdquo;</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Payments Panel ────────────────────────────────────────────────────────────

function PaymentsPanel() {
  const [payouts, setPayouts] = useState(PAYOUTS)
  const pay = (id: string) => setPayouts(p => p.map(x => x.id === id ? { ...x, status: 'Paid', date: 'Jun 8, 2024' } : x))

  const totalGross      = REVENUE_CHART.reduce((a, b) => a + b, 0)
  const totalCommission = Math.round(totalGross * 0.1)
  const pendingPayouts  = payouts.filter(p => p.status === 'Pending').reduce((a, p) => a + p.net, 0)

  return (
    <div>
      <PageHeader title="Payments & Payouts" sub="Platform revenue and host payout management" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gross Revenue',       value: fmt(totalGross),      color: CHARCOAL },
          { label: 'Platform Commission', value: fmt(totalCommission), color: FOREST   },
          { label: 'Host Payouts',        value: fmt(totalGross - totalCommission), color: GOLD },
          { label: 'Pending Payouts',     value: fmt(pendingPayouts),  color: TERRACOTTA },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 12, color: COCONUT }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14px,1.6vw,20px)', fontWeight: 700, color: s.color, marginTop: 4, lineHeight: 1.2 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl p-5 mb-5" style={{ border: `1px solid ${SAND}` }}>
        <h2 className="mb-3" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Monthly Revenue</h2>
        <MiniChart data={REVENUE_CHART} color={GOLD} />
        <div className="flex justify-between mt-1">
          {MONTHS.map(m => <span key={m} style={{ fontSize: 9, color: COCONUT }}>{m}</span>)}
        </div>
      </div>

      {/* Payout queue */}
      <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
        <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Host Payout Queue</h2>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${SAND}` }}>
                {['Host', 'Period', 'Gross', 'Commission (10%)', 'Net Payout', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0 12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < payouts.length - 1 ? `1px solid ${IVORY}` : 'none' }}>
                  <td style={{ padding: '13px 12px', fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{p.host}</td>
                  <td style={{ padding: '13px 12px', fontSize: 12, color: COCONUT, whiteSpace: 'nowrap' }}>{p.period}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: CHARCOAL }}>{fmt(p.gross)}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: FOREST }}>{fmt(p.commission)}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, fontWeight: 700, color: CHARCOAL }}>{fmt(p.net)}</td>
                  <td style={{ padding: '13px 12px' }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding: '13px 12px' }}>
                    {p.status === 'Pending' ? (
                      <button onClick={() => pay(p.id)} className="flex items-center gap-1 hover:opacity-90"
                        style={{ height: 30, padding: '0 12px', borderRadius: 8, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <RefreshCw size={11} /> Pay Now
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: COCONUT }}>{p.date}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Analytics Panel ───────────────────────────────────────────────────────────

function AnalyticsPanel() {
  const topExps = [...ALL_EXPERIENCES].sort((a, b) => b.bookings - a.bookings).slice(0, 5)
  const totalBookings = ALL_EXPERIENCES.reduce((a, e) => a + e.bookings, 0)

  return (
    <div>
      <PageHeader title="Analytics" sub="Platform performance overview" />

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Bookings trend */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Booking Trend</h2>
          <div className="flex items-baseline gap-2 mb-3">
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: CHARCOAL }}>1,248</span>
            <span style={{ fontSize: 12, color: FOREST }}>↑ 16.2% YoY</span>
          </div>
          <MiniChart data={BOOKING_CHART} color={FOREST} />
          <div className="flex justify-between mt-1">
            {MONTHS.map(m => <span key={m} style={{ fontSize: 9, color: COCONUT }}>{m}</span>)}
          </div>
        </div>

        {/* Revenue trend */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Revenue Trend</h2>
          <div className="flex items-baseline gap-2 mb-3">
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: CHARCOAL }}>IDR 2.45B</span>
            <span style={{ fontSize: 12, color: FOREST }}>↑ 18.3% YoY</span>
          </div>
          <MiniChart data={REVENUE_CHART} color={GOLD} />
          <div className="flex justify-between mt-1">
            {MONTHS.map(m => <span key={m} style={{ fontSize: 9, color: COCONUT }}>{m}</span>)}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top experiences by bookings */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Top Experiences</h2>
          <div className="space-y-4">
            {topExps.map((e, i) => {
              const pct = (e.bookings / topExps[0].bookings) * 100
              return (
                <div key={e.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 12, fontWeight: 700, color: COCONUT, width: 16 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: CHARCOAL, fontWeight: 500 }}>{e.title}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{e.bookings}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, backgroundColor: IVORY, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: GOLD, borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category distribution */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Bookings by Category</h2>
          <DonutChart data={CATEGORY_DIST} total={totalBookings} />

          <div className="mt-5 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: `1px solid ${SAND}` }}>
            {[
              { label: 'Avg booking value', value: 'IDR 480K' },
              { label: 'Repeat guest rate', value: '38%' },
              { label: 'Avg rating',         value: '4.82 ★' },
              { label: 'Host satisfaction',  value: '96%' },
            ].map(m => (
              <div key={m.label}>
                <p style={{ fontSize: 11, color: COCONUT }}>{m.label}</p>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL, marginTop: 2 }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Settings Panel ────────────────────────────────────────────────────────────

function SettingsPanel() {
  const [commission, setCommission] = useState('10')
  const [saved, setSaved]           = useState(false)
  const [notifs, setNotifs]         = useState({ newHost: true, newBooking: false, flaggedReview: true, weeklyReport: true })
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  const toggle = (k: keyof typeof notifs) => setNotifs(n => ({ ...n, [k]: !n[k] }))

  return (
    <div>
      <PageHeader title="Platform Settings" sub="Configure Balible platform settings" />

      <div className="space-y-5">
        {/* Platform */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Platform</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Platform Name',     defaultValue: 'Balible' },
              { label: 'Owner Email',       defaultValue: 'reggy.caesar@gmail.com' },
              { label: 'Support Email',     defaultValue: 'support@balible.com' },
              { label: 'Default Currency',  defaultValue: 'IDR (Indonesian Rupiah)' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: COCONUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                <input defaultValue={f.defaultValue}
                  style={{ width: '100%', height: 42, borderRadius: 10, border: `1px solid ${SAND}`, padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: CHARCOAL, outline: 'none' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Commission */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Commission Rate</h2>
          <div className="flex items-end gap-4">
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: COCONUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Platform commission (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={commission}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9]/g, '')
                    if (v === '' || parseInt(v) <= 100) setCommission(v)
                  }}
                  style={{ width: 100, height: 42, borderRadius: 10, border: `1px solid ${SAND}`, padding: '0 14px', fontSize: 18, fontFamily: 'var(--font-playfair)', fontWeight: 700, color: CHARCOAL, outline: 'none', textAlign: 'center' }} />
                <span style={{ fontSize: 18, color: COCONUT, fontWeight: 700 }}>%</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: COCONUT, paddingBottom: 10, maxWidth: 320 }}>
              Balible takes {commission}% of each booking. Hosts receive {100 - parseInt(commission || '0')}%.
              Applied to all new bookings from the moment you save.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Owner Notifications</h2>
          <div className="space-y-4">
            {[
              { key: 'newHost',       label: 'New host application',   desc: 'Notify when a new host applies to join' },
              { key: 'newBooking',    label: 'Every new booking',      desc: 'Email for each booking made on the platform' },
              { key: 'flaggedReview', label: 'Flagged reviews',        desc: 'Alert when a review is flagged by a host' },
              { key: 'weeklyReport',  label: 'Weekly summary report',  desc: 'Revenue, bookings and top experiences summary every Monday' },
            ].map(({ key, label, desc }) => {
              const on = notifs[key as keyof typeof notifs]
              return (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: CHARCOAL }}>{label}</p>
                    <p style={{ fontSize: 12, color: COCONUT, marginTop: 1 }}>{desc}</p>
                  </div>
                  <button onClick={() => toggle(key as keyof typeof notifs)}
                    style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, backgroundColor: on ? CHARCOAL : SAND, transition: 'background 0.2s', position: 'relative' }}>
                    <span style={{ display: 'block', width: 18, height: 18, borderRadius: 9, backgroundColor: 'white', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.2s' }} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={save} className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ height: 44, paddingInline: 28, borderRadius: 10, border: 'none', backgroundColor: saved ? FOREST : CHARCOAL, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', minWidth: 160 }}>
          {saved ? <><Check size={14} /> Saved!</> : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ activeNav, setActiveNav }: { activeNav: string; setActiveNav: (id: string) => void }) {
  const pendingHosts   = ALL_HOSTS.filter(h => h.status === 'Pending').length
  const flaggedReviews = ALL_REVIEWS.filter(r => r.status === 'Flagged').length

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <a href="/" className="flex flex-col leading-none" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: 'white' }}>BALIBLE</span>
          <span style={{ fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>OWNER DASHBOARD</span>
        </a>
        <div className="relative cursor-pointer">
          <Bell size={17} style={{ color: 'rgba(255,255,255,0.7)' }} />
          {(pendingHosts + flaggedReviews) > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: TERRACOTTA, fontSize: 9, color: 'white', fontWeight: 700 }}>
              {pendingHosts + flaggedReviews}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mx-3 px-3 py-3 rounded-xl mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GOLD }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>R</span>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Reggy Caesar</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Shield size={10} style={{ color: GOLD }} />
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Platform Owner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeNav === id
          const badge = id === 'hosts' ? pendingHosts : id === 'reviews' ? flaggedReviews : 0
          return (
            <button key={id} onClick={() => setActiveNav(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-white/5"
              style={{ color: active ? GOLD : 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'var(--font-inter)', fontWeight: active ? 600 : 400, cursor: 'pointer', background: active ? 'rgba(200,169,126,0.12)' : 'none', border: 'none', textAlign: 'left' }}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && (
                <span style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: TERRACOTTA, fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge}
                </span>
              )}
              {active && badge === 0 && <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD, display: 'block' }} />}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeNav, setActiveNav]     = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderPanel = () => {
    switch (activeNav) {
      case 'overview':    return <OverviewPanel onNav={setActiveNav} />
      case 'experiences': return <ExperiencesPanel />
      case 'hosts':       return <HostsPanel />
      case 'bookings':    return <BookingsPanel />
      case 'users':       return <UsersPanel />
      case 'reviews':     return <ReviewsPanel />
      case 'payments':    return <PaymentsPanel />
      case 'analytics':   return <AnalyticsPanel />
      case 'settings':    return <SettingsPanel />
      default:            return <OverviewPanel onNav={setActiveNav} />
    }
  }

  return (
    <div className="flex" style={{ fontFamily: 'var(--font-inter)', backgroundColor: IVORY, minHeight: '100vh' }}>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 flex flex-col" style={{ width: 240, backgroundColor: CHARCOAL, height: '100%' }}>
            <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            <Sidebar activeNav={activeNav} setActiveNav={id => { setActiveNav(id); setSidebarOpen(false) }} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: 240, backgroundColor: CHARCOAL, minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-5 lg:p-8 pb-24 lg:pb-8">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={22} style={{ color: CHARCOAL }} />
          </button>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>
            {NAV_ITEMS.find(n => n.id === activeNav)?.label ?? 'Dashboard'}
          </span>
          <div style={{ width: 22 }} />
        </div>

        {renderPanel()}
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-40 flex items-center"
        style={{ height: 60, borderTop: `1px solid ${SAND}` }}>
        {NAV_ITEMS.slice(0, 5).map(({ id, Icon, label }) => {
          const active = activeNav === id
          return (
            <button key={id} onClick={() => setActiveNav(id)}
              className="flex flex-col items-center justify-center gap-0.5"
              style={{ background: 'none', border: 'none', cursor: 'pointer', flex: 1, height: '100%' }}>
              <Icon size={18} style={{ color: active ? GOLD : COCONUT }} />
              <span style={{ fontSize: 9, color: active ? GOLD : COCONUT, fontWeight: active ? 600 : 400 }}>{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
