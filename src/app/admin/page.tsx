'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Compass, Users, CalendarDays, Star,
  CreditCard, BarChart2, Settings, Menu, X,
  ArrowUpRight, ChevronDown,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',     Icon: LayoutDashboard },
  { id: 'experiences', label: 'Experiences',  Icon: Compass },
  { id: 'hosts',       label: 'Hosts',        Icon: Users },
  { id: 'bookings',    label: 'Bookings',     Icon: CalendarDays },
  { id: 'users',       label: 'Users',        Icon: Users },
  { id: 'reviews',     label: 'Reviews',      Icon: Star },
  { id: 'payments',    label: 'Payments',     Icon: CreditCard },
  { id: 'analytics',   label: 'Analytics',    Icon: BarChart2 },
  { id: 'settings',    label: 'Settings',     Icon: Settings },
]

const STATS = [
  { label: 'Total Bookings',    value: '1,248',             change: '+16.2%' },
  { label: 'Total Revenue',     value: 'IDR 2,450,000,000', change: '+18.3%' },
  { label: 'Total Hosts',       value: '320',               change: '+12.5%' },
  { label: 'Total Experiences', value: '586',               change: '+8.1%'  },
]

const BOOKINGS_DATA = [180, 220, 195, 260, 240, 290, 270, 310, 285, 340, 320, 360]
const CHART_LABELS = ['May 1', 'May 5', 'May 10', 'May 15', 'May 22', 'May 31']

const CATEGORIES = [
  { name: 'Wellness',     pct: 32, color: '#4A7C59' },
  { name: 'Art & Craft',  pct: 28, color: '#C8A97E' },
  { name: 'Culture',      pct: 16, color: '#B66A45' },
  { name: 'Nature',       pct: 11, color: '#6F675C' },
  { name: 'Food & Drink', pct: 7,  color: '#111111' },
  { name: 'Architecture', pct: 6,  color: '#E8E4DE' },
]

const RECENT_BOOKINGS = [
  { date: 'May 15, 2024', title: 'Pottery Making Class',    area: 'Ubud',    guests: 2, amount: 900000,  status: 'Confirmed' },
  { date: 'May 15, 2024', title: 'Silver Jewelry Workshop', area: 'Canggu',  guests: 1, amount: 1740000, status: 'Confirmed' },
  { date: 'May 17, 2024', title: 'Sound Healing Journey',   area: 'Ubud',    guests: 1, amount: 350000,  status: 'Pending'   },
  { date: 'May 17, 2024', title: 'Water Temple Tour',       area: 'Gianyar', guests: 2, amount: 1300000, status: 'Confirmed' },
]

// ── File-scope components ─────────────────────────────────────────────────────

function AdminSidebar({
  activeNav,
  setActiveNav,
  onClose,
}: {
  activeNav: string
  setActiveNav: (id: string) => void
  onClose?: () => void
}) {
  return (
    <>
      <div className="px-5 pt-6 pb-4">
        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: 'white' }}>BALIBLE</span>
        <p style={{ fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: 2 }}>
          ADMIN DASHBOARD
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeNav === id
          return (
            <button
              key={id}
              onClick={() => { setActiveNav(id); onClose?.() }}
              className="w-full flex items-center gap-3 py-2.5 rounded-lg transition-colors hover:bg-white/5"
              style={{
                paddingLeft: active ? 10 : 12,
                borderLeft: active ? '2px solid #C8A97E' : '2px solid transparent',
                backgroundColor: active ? 'rgba(200,169,126,0.15)' : 'transparent',
                color: active ? '#C8A97E' : 'rgba(255,255,255,0.6)',
                fontSize: 13,
                fontFamily: 'var(--font-inter)',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                outline: 'none',
                textAlign: 'left',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="flex items-center gap-3 mx-3 mb-5 px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C8A97E' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>A</span>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>Admin</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Super Admin</p>
        </div>
      </div>
    </>
  )
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 400, h = 100
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 10) - 5
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 100 }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity="0.08" stroke="none" />
    </svg>
  )
}

function DonutChart({ data, total }: { data: typeof CATEGORIES; total: number }) {
  const SIZE = 120, R = 44, STROKE = 20
  const CIRC = 2 * Math.PI * R

  // Pre-compute segments — no mutation inside JSX
  let cumulative = 0
  const segments = data.map(cat => {
    const dashLen = (cat.pct / 100) * CIRC
    // rotate(-90deg) already starts at 12 o'clock; shift each segment clockwise by cumulative length
    const offset = -cumulative
    cumulative += dashLen
    return { ...cat, dashLen, offset }
  })

  return (
    <div className="flex items-center gap-5">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="flex-shrink-0">
        {/* Track */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#F0EDE8" strokeWidth={STROKE} />
        {/* Segments */}
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={STROKE}
            strokeDasharray={`${seg.dashLen} ${CIRC - seg.dashLen}`}
            strokeDashoffset={seg.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        ))}
        {/* Center label */}
        <text
          x={SIZE / 2} y={SIZE / 2 - 5}
          textAnchor="middle"
          style={{ fontSize: 15, fontWeight: 700, fill: '#111111' }}
        >
          {total.toLocaleString('en')}
        </text>
        <text
          x={SIZE / 2} y={SIZE / 2 + 12}
          textAnchor="middle"
          style={{ fontSize: 9, fill: '#6F675C' }}
        >
          Bookings
        </text>
      </svg>

      <div className="space-y-2">
        {data.map(cat => (
          <div key={cat.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span style={{ fontSize: 12, color: '#6F675C', fontFamily: 'var(--font-inter)' }}>{cat.name}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111111', fontFamily: 'var(--font-inter)' }}>{cat.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Confirmed: { bg: '#F0F7F2', color: '#4A7C59' },
    Pending:   { bg: '#FDF8F4', color: '#C8A97E' },
    Cancelled: { bg: '#FEF2F2', color: '#B66A45' },
  }
  const s = map[status] ?? { bg: '#F5F1EB', color: '#6F675C' }
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeNav, setActiveNav] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [period, setPeriod] = useState('This Month')

  return (
    <div className="flex" style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 flex flex-col" style={{ width: 220, backgroundColor: '#111111', height: '100%' }}>
            <button
              className="absolute top-4 right-4"
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={17} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: 220, backgroundColor: '#111111', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' }}
      >
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0 p-5 lg:p-8">

        {/* Mobile header */}
        <div className="flex items-center gap-3 mb-5 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={22} style={{ color: '#111111' }} />
          </button>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Admin</span>
        </div>

        {/* Heading row */}
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, color: '#111111' }}>
            Dashboard Overview
          </h1>
          <button
            onClick={() => setPeriod(p => p === 'This Month' ? 'Last Month' : 'This Month')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            style={{ border: '1px solid #E8E4DE', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#111111', cursor: 'pointer', backgroundColor: 'white' }}
          >
            {period}
            <ChevronDown size={13} style={{ color: '#6F675C' }} />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: '1px solid #E8E4DE' }}>
              <p style={{ fontSize: 12, color: '#6F675C' }}>{s.label}</p>
              <p className="mt-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14px, 1.8vw, 20px)', fontWeight: 700, color: '#111111', lineHeight: 1.2 }}>
                {s.value}
              </p>
              <p className="mt-1.5 flex items-center gap-1" style={{ fontSize: 11, color: '#4A7C59' }}>
                <ArrowUpRight size={11} />
                {s.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5 mb-5">
          {/* Bookings overview chart */}
          <div className="lg:col-span-3 bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Bookings Overview</h2>
              <span style={{ fontSize: 12, color: '#6F675C' }}>{period}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#111111' }}>1,248</span>
              <span style={{ fontSize: 12, color: '#4A7C59' }}>↑ 16.2%</span>
            </div>
            <MiniChart data={BOOKINGS_DATA} color="#4A7C59" />
            <div className="flex justify-between mt-1">
              {CHART_LABELS.map(d => <span key={d} style={{ fontSize: 9, color: '#6F675C' }}>{d}</span>)}
            </div>
          </div>

          {/* Top categories donut */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
            <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>
              Top Categories
            </h2>
            <DonutChart data={CATEGORIES} total={1248} />
          </div>
        </div>

        {/* Recent bookings table */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Recent Bookings</h2>
            <a href="#" className="hover:opacity-70" style={{ fontSize: 13, color: '#C8A97E', textDecoration: 'none' }}>View all →</a>
          </div>

          {/* Desktop table */}
          <div
            className="hidden sm:grid gap-4 pb-2 mb-1"
            style={{ gridTemplateColumns: '110px 1fr 90px 60px 120px 100px', borderBottom: '1px solid #E8E4DE' }}
          >
            {['Date', 'Experience', 'Location', 'Guests', 'Amount', 'Status'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#6F675C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {h}
              </span>
            ))}
          </div>

          <div className="mt-1 divide-y divide-[#F5F1EB]">
            {RECENT_BOOKINGS.map((b, i) => (
              <div key={i}>
                {/* Desktop row */}
                <div
                  className="hidden sm:grid gap-4 py-3 hover:bg-[#F5F1EB] rounded-lg px-1 transition-colors cursor-pointer"
                  style={{ gridTemplateColumns: '110px 1fr 90px 60px 120px 100px', alignItems: 'center' }}
                >
                  <span style={{ fontSize: 13, color: '#6F675C' }}>{b.date}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                  <span style={{ fontSize: 13, color: '#6F675C' }}>{b.area}</span>
                  <span style={{ fontSize: 13, color: '#6F675C' }}>{b.guests}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>
                    IDR {b.amount.toLocaleString('en').replace(/,/g, '.')}
                  </span>
                  <StatusBadge status={b.status} />
                </div>

                {/* Mobile row */}
                <div className="sm:hidden flex items-center justify-between py-3">
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{b.title}</p>
                    <p style={{ fontSize: 12, color: '#6F675C', marginTop: 2 }}>
                      {b.date} · {b.area} · {b.guests} guests
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>
                      IDR {(b.amount / 1000).toFixed(0)}K
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
