'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Compass, Users, CalendarDays, Star,
  CreditCard, BarChart2, Settings, Menu, X,
  ArrowUpRight, ArrowDownRight, ChevronDown, Search, Download,
  Eye, Edit2, Trash2, Play, Pause, CheckCircle, XCircle,
  MoreHorizontal, Bell, LogOut, TrendingUp, Globe, Shield,
  Check, AlertTriangle, Plus, RefreshCw, Flag, Ticket, MapPin, Clock,
  Mail, Megaphone, Send, Sparkles, Activity, FileText, MailOpen, ChevronUp,
} from 'lucide-react'
import {
  getPendingListingsAction, approveListingAction, rejectListingAction, type PendingListing,
  createExperienceAction, getOperatorsAction, type CreateExperienceInput,
  getAdminStatsAction, type AdminStats,
  getAdminExperiencesAction, type AdminExp, adminUpdateExperienceStatusAction,
  getAdminHostsAction, type AdminHost, approveHostAction, suspendHostAction,
  getAdminBookingsAction, type AdminBooking, adminUpdateBookingStatusAction, adminCompleteBookingAction,
  getAdminUsersAction, type AdminUser,
  getAdminReviewsAction, type AdminReview, adminDeleteReviewAction,
  getAdminEventsAction, type AdminEvent, adminUpdateEventStatusAction, adminDeleteEventAction,
  adminDeleteExperienceAction, adminApproveReviewAction, adminFlagReviewAction, adminHideReviewAction,
  getAnalyticsDataAction, type AnalyticsData,
  adminUpdateUserAction, adminUpdateHostAction,
  getNewsletterSubscribersAction, type NewsletterSub, deleteNewsletterSubAction,
  getAdminRealPayoutsAction, type AdminRealPayout,
  adminMarkPayoutPaidAction, getAdminPayoutsAction, type AdminPayout,
  sendBroadcastAction,
  getGADataAction, type GAData,
  getCommissionRateAction, updateCommissionRateAction,
  getAdminSettingsAction, saveAdminSettingsAction,
} from '@/lib/actions'
import { COMMISSION_RATE, PAYOUT_MIN_NET } from '@/lib/constants'

// ── Design tokens ─────────────────────────────────────────────────────────────

const GOLD = '#C8A97E'
const CHARCOAL = '#111111'
const COCONUT = '#6F675C'
const IVORY = '#F5F1EB'
const SAND = '#E8E4DE'
const FOREST = '#4A7C59'
const TERRACOTTA = '#B66A45'

const MONTHS_FALLBACK = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',    Icon: LayoutDashboard },
  { id: 'experiences', label: 'Experiences', Icon: Compass },
  { id: 'events',      label: 'Events',      Icon: Ticket },
  { id: 'hosts',       label: 'Hosts',       Icon: Users },
  { id: 'bookings',    label: 'Bookings',    Icon: CalendarDays },
  { id: 'users',       label: 'Users',       Icon: Globe },
  { id: 'reviews',     label: 'Reviews',     Icon: Star },
  { id: 'payments',    label: 'Payments',    Icon: CreditCard },
  { id: 'analytics',   label: 'Analytics',   Icon: BarChart2 },
  { id: 'featured',    label: 'Featured',    Icon: Sparkles },
  { id: 'activity',    label: 'Activity Log',Icon: Activity },
  { id: 'seo',         label: 'SEO',         Icon: FileText },
  { id: 'emails',      label: 'Emails',      Icon: MailOpen },
  { id: 'newsletter',  label: 'Newsletter',  Icon: Mail },
  { id: 'broadcast',   label: 'Broadcast',   Icon: Megaphone },
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
    Paused:          { bg: '#FEF9F4', color: GOLD },
    'Pending Review': { bg: '#FDF8F4', color: GOLD },
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

function DonutChart({ data, total }: { data: { name: string; pct: number; color: string }[]; total: number }) {
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

function OverviewPanel({ onNav }: { onNav: (id: string) => void }) {
  const { data: session }     = useSession()
  const [period, setPeriod]   = useState('This Month')
  const [stats, setStats]     = useState<AdminStats | null>(null)
  const [recent, setRecent]   = useState<AdminBooking[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [pendingPayoutsNet, setPendingPayoutsNet] = useState<number | null>(null)

  useEffect(() => {
    getAdminStatsAction().then(setStats)
    getAdminBookingsAction().then(b => setRecent(b.slice(0, 5)))
    getAnalyticsDataAction(365).then(setAnalytics).catch(() => {})
    getAdminRealPayoutsAction().then(q => setPendingPayoutsNet(q.reduce((a, p) => a + p.net, 0))).catch(() => {})
  }, [])

  const trendData   = analytics?.bookingTrend ?? []
  const half        = Math.floor(trendData.length / 2) || 6
  const trendSlice  = period === 'This Month' ? trendData.slice(half) : trendData.slice(0, half)
  const slice       = trendSlice.length > 0 ? trendSlice.map(t => t.current) : [0, 0, 0, 0, 0, 0]
  const labels      = trendSlice.length > 0 ? trendSlice.map(t => t.label)   : (period === 'This Month' ? MONTHS_FALLBACK.slice(6) : MONTHS_FALLBACK.slice(0, 6))

  const bookingMom = analytics ? (() => {
    const h = Math.floor(analytics.bookingTrend.length / 2)
    const curr = analytics.bookingTrend.slice(h).reduce((a, t) => a + t.current, 0)
    const prev = analytics.bookingTrend.slice(0, h).reduce((a, t) => a + t.current, 0)
    return prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null
  })() : null

  const catData = analytics?.categoryBreakdown ?? []

  const statCards = stats ? [
    { label: 'Total Bookings',    value: stats.totalBookings.toLocaleString(),               change: '', up: true },
    { label: 'Platform Revenue',  value: `IDR ${stats.totalRevenue.toLocaleString('id-ID')}`, change: '', up: true },
    { label: 'Active Hosts',      value: stats.activeHosts.toString(),                        change: '', up: true },
    { label: 'Total Experiences', value: stats.totalExperiences.toString(),                   change: '', up: true },
  ] : [
    { label: 'Total Bookings',    value: '—', change: '', up: true },
    { label: 'Platform Revenue',  value: '—', change: '', up: true },
    { label: 'Active Hosts',      value: '—', change: '', up: true },
    { label: 'Total Experiences', value: '—', change: '', up: true },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: CHARCOAL }}>
            {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' })()}, {session?.user?.name?.split(' ')[0] ?? 'Admin'}
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
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 12, color: COCONUT }}>{s.label}</p>
            <p className="mt-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14px,1.8vw,20px)', fontWeight: 700, color: CHARCOAL, lineHeight: 1.2 }}>{s.value}</p>
            {s.change && (
              <p className="mt-1.5 flex items-center gap-1" style={{ fontSize: 11, color: s.up ? FOREST : TERRACOTTA }}>
                {s.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {s.change} vs last month
              </p>
            )}
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
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: CHARCOAL }}>
              {stats?.totalBookings.toLocaleString() ?? '—'}
            </span>
            {bookingMom !== null && (
              <span style={{ fontSize: 12, color: bookingMom >= 0 ? FOREST : TERRACOTTA }}>
                {bookingMom >= 0 ? '↑' : '↓'} {Math.abs(bookingMom)}%
              </span>
            )}
          </div>
          <MiniChart data={slice} color={FOREST} />
          <div className="flex justify-between mt-1">
            {labels.map(m => <span key={m} style={{ fontSize: 9, color: COCONUT }}>{m}</span>)}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>By Category</h2>
          {catData.length > 0
            ? <DonutChart data={catData} total={stats?.totalBookings ?? 0} />
            : <p style={{ fontSize: 13, color: COCONUT, padding: '16px 0' }}>Loading…</p>
          }
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
              {recent.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < recent.length - 1 ? `1px solid ${IVORY}` : 'none' }}>
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

      {/* Action cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Pending Listings',  value: stats?.pendingListings.toString() ?? '—',  sub: 'Awaiting review', color: GOLD, action: () => onNav('experiences') },
          { label: 'Pending Hosts',     value: stats?.pendingHosts.toString() ?? '—',     sub: 'Host applications', color: TERRACOTTA, action: () => onNav('hosts') },
          { label: 'Pending Payouts',   value: pendingPayoutsNet !== null ? fmt(pendingPayoutsNet) : '—', sub: 'Awaiting payout', color: FOREST, action: () => onNav('payments') },
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

// ── Add Experience Modal ──────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'WELLNESS_HEALING',      label: 'Wellness & Healing' },
  { value: 'ART_CRAFT',     label: 'Art & Craft' },
  { value: 'CULTURE_SPIRITUAL', label: 'Culture & Spiritual' },
  { value: 'CULINARY',       label: 'Culinary' },
  { value: 'NATURE_OUTDOORS',         label: 'Nature & Outdoors' },
  { value: 'WATER_ACTIVITIES', label: 'Water Activities' },
  { value: 'LOCAL_EXPERTS',  label: 'Local Experts' },
  { value: 'RENTALS',       label: 'Rentals' },
]

const AREAS = [
  { value: 'UBUD',      label: 'Ubud' },
  { value: 'CANGGU',    label: 'Canggu' },
  { value: 'SEMINYAK',  label: 'Seminyak' },
  { value: 'KUTA',      label: 'Kuta' },
  { value: 'ULUWATU',   label: 'Uluwatu' },
  { value: 'GIANYAR',   label: 'Gianyar' },
  { value: 'KINTAMANI', label: 'Kintamani' },
  { value: 'AMED',      label: 'Amed' },
  { value: 'SIDEMEN',   label: 'Sidemen' },
  { value: 'SANUR',     label: 'Sanur' },
  { value: 'NUSA_DUA',  label: 'Nusa Dua' },
  { value: 'JIMBARAN',  label: 'Jimbaran' },
  { value: 'MEDEWI',    label: 'Medewi' },
]

const EMPTY_FORM: CreateExperienceInput = {
  title: '', description: '', category: 'CULTURE', area: 'UBUD',
  price: 0, duration: '', level: 'All levels', language: 'English', maxGuests: 10,
  meetingPoint: '', latitude: -8.5069, longitude: 115.2625,
  images: [], highlights: [], includes: [], excludes: [],
  instantConfirm: false, ecoLabel: false, featured: false,
  status: 'ACTIVE', operatorId: '',
}

function AddExperienceModal({ onClose, onSaved }: { onClose: () => void; onSaved: (slug: string) => void }) {
  const [form, setForm]           = useState<CreateExperienceInput>(EMPTY_FORM)
  const [operators, setOperators] = useState<{ id: string; name: string; businessName: string }[]>([])
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState<Record<string, string>>({})

  useEffect(() => {
    getOperatorsAction().then(ops => {
      setOperators(ops)
      if (ops.length > 0) setForm(f => ({ ...f, operatorId: ops[0].id }))
    })
  }, [])

  const set = (key: keyof CreateExperienceInput, value: any) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  const parseLines = (text: string) => text.split('\n').map(s => s.trim()).filter(Boolean)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim())       e.title       = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    if (!form.duration.trim())    e.duration    = 'Required'
    if (form.price <= 0)          e.price       = 'Must be > 0'
    if (form.maxGuests <= 0)      e.maxGuests   = 'Must be > 0'
    if (!form.meetingPoint.trim())e.meetingPoint= 'Required'
    if (form.images.length === 0) e.images      = 'At least one image URL required'
    if (!form.operatorId)         e.operatorId  = 'Select a host'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    const res = await createExperienceAction(form)
    setSaving(false)
    if (res.ok && res.slug) { onSaved(res.slug) }
    else setErrors({ _: res.error ?? 'Save failed' })
  }

  const inputStyle = (field: string) => ({
    width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
    fontFamily: 'var(--font-inter)', outline: 'none', backgroundColor: 'white',
    border: `1px solid ${errors[field] ? '#B66A45' : SAND}`, color: CHARCOAL,
    boxSizing: 'border-box' as const,
  })

  const labelStyle = { fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 4, display: 'block' as const }
  const errStyle   = { fontFamily: 'var(--font-inter)', fontSize: 11, color: TERRACOTTA, marginTop: 3 }

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col"
          style={{ maxWidth: 700, maxHeight: '92vh', pointerEvents: 'auto' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${SAND}`, flexShrink: 0 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: CHARCOAL }}>Add Experience</p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: COCONUT, marginTop: 1 }}>New listing will go live immediately (or saved as draft)</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
              <X size={20} style={{ color: COCONUT }} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 py-5 space-y-5" style={{ flexGrow: 1 }}>

            {/* Basic */}
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: COCONUT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Basic Info</p>
              <div className="space-y-3">
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Traditional Batik Workshop in Ubud" style={inputStyle('title')} />
                  {errors.title && <p style={errStyle}>{errors.title}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe the experience…" style={{ ...inputStyle('description'), resize: 'vertical' as const }} />
                  {errors.description && <p style={errStyle}>{errors.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Category *</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle('category')}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Area *</label>
                    <select value={form.area} onChange={e => set('area', e.target.value)} style={inputStyle('area')}>
                      {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Details */}
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: COCONUT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing & Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Price (IDR) *</label>
                  <input type="number" value={form.price || ''} onChange={e => set('price', Number(e.target.value))} placeholder="450000" style={inputStyle('price')} />
                  {errors.price && <p style={errStyle}>{errors.price}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Duration *</label>
                  <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 3 hours" style={inputStyle('duration')} />
                  {errors.duration && <p style={errStyle}>{errors.duration}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Level</label>
                  <input value={form.level} onChange={e => set('level', e.target.value)} placeholder="All levels" style={inputStyle('level')} />
                </div>
                <div>
                  <label style={labelStyle}>Language</label>
                  <input value={form.language} onChange={e => set('language', e.target.value)} placeholder="English" style={inputStyle('language')} />
                </div>
                <div>
                  <label style={labelStyle}>Max Guests *</label>
                  <input type="number" value={form.maxGuests || ''} onChange={e => set('maxGuests', Number(e.target.value))} placeholder="10" style={inputStyle('maxGuests')} />
                  {errors.maxGuests && <p style={errStyle}>{errors.maxGuests}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle('status')}>
                    <option value="ACTIVE">Active (live)</option>
                    <option value="DRAFT">Draft (hidden)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: COCONUT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Location</p>
              <div className="space-y-3">
                <div>
                  <label style={labelStyle}>Meeting Point *</label>
                  <input value={form.meetingPoint} onChange={e => set('meetingPoint', e.target.value)} placeholder="e.g. Ubud Central Market main entrance" style={inputStyle('meetingPoint')} />
                  {errors.meetingPoint && <p style={errStyle}>{errors.meetingPoint}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Latitude</label>
                    <input type="number" step="0.0001" value={form.latitude} onChange={e => set('latitude', Number(e.target.value))} style={inputStyle('latitude')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Longitude</label>
                    <input type="number" step="0.0001" value={form.longitude} onChange={e => set('longitude', Number(e.target.value))} style={inputStyle('longitude')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: COCONUT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Content</p>
              <div className="space-y-3">
                <div>
                  <label style={labelStyle}>Image URLs * <span style={{ fontWeight: 400 }}>(one per line)</span></label>
                  <textarea
                    value={form.images.join('\n')}
                    onChange={e => set('images', parseLines(e.target.value))}
                    rows={3}
                    placeholder="https://images.unsplash.com/photo-…"
                    style={{ ...inputStyle('images'), resize: 'vertical' as const }}
                  />
                  {errors.images && <p style={errStyle}>{errors.images}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Highlights <span style={{ fontWeight: 400 }}>(one per line)</span></label>
                  <textarea
                    value={form.highlights.join('\n')}
                    onChange={e => set('highlights', parseLines(e.target.value))}
                    rows={3}
                    placeholder="Learn traditional hand-stamping techniques&#10;Visit a working village studio&#10;Take home your creation"
                    style={{ ...inputStyle('highlights'), resize: 'vertical' as const }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Includes <span style={{ fontWeight: 400 }}>(one per line)</span></label>
                    <textarea
                      value={form.includes.join('\n')}
                      onChange={e => set('includes', parseLines(e.target.value))}
                      rows={3}
                      placeholder="All materials&#10;Refreshments&#10;Hotel pickup"
                      style={{ ...inputStyle('includes'), resize: 'vertical' as const }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Excludes <span style={{ fontWeight: 400 }}>(one per line)</span></label>
                    <textarea
                      value={form.excludes.join('\n')}
                      onChange={e => set('excludes', parseLines(e.target.value))}
                      rows={3}
                      placeholder="Transport&#10;Meals&#10;Gratuities"
                      style={{ ...inputStyle('excludes'), resize: 'vertical' as const }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Host */}
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: COCONUT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Host</p>
              <div>
                <label style={labelStyle}>Assign to operator *</label>
                {operators.length === 0 ? (
                  <p style={{ fontSize: 13, color: COCONUT }}>Loading operators…</p>
                ) : (
                  <select value={form.operatorId} onChange={e => set('operatorId', e.target.value)} style={inputStyle('operatorId')}>
                    {operators.map(o => (
                      <option key={o.id} value={o.id}>{o.businessName} ({o.name})</option>
                    ))}
                  </select>
                )}
                {errors.operatorId && <p style={errStyle}>{errors.operatorId}</p>}
              </div>
            </div>

            {/* Flags */}
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: COCONUT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Options</p>
              <div className="flex flex-wrap gap-5">
                {([
                  { key: 'featured',       label: 'Featured (homepage spotlight)' },
                  { key: 'instantConfirm', label: 'Instant confirmation' },
                  { key: 'ecoLabel',       label: 'Eco label' },
                ] as { key: keyof CreateExperienceInput; label: string }[]).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2" style={{ cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 13, color: CHARCOAL }}>
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={e => set(key, e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: GOLD, cursor: 'pointer' }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {errors._ && (
              <div className="rounded-xl p-3" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: TERRACOTTA }}>{errors._}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 gap-3" style={{ borderTop: `1px solid ${SAND}`, flexShrink: 0 }}>
            <button onClick={onClose} style={{ height: 38, padding: '0 20px', borderRadius: 10, border: `1px solid ${SAND}`, background: 'white', fontSize: 13, color: COCONUT, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ height: 38, padding: '0 24px', borderRadius: 10, border: 'none', backgroundColor: saving ? COCONUT : CHARCOAL, color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter)' }}
            >
              {saving ? 'Saving…' : 'Save Experience'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Experiences Panel ─────────────────────────────────────────────────────────

function ExperiencesPanel() {
  const [filter, setFilter]     = useState('All')
  const [search, setSearch]     = useState('')
  const [exps, setExps]         = useState<AdminExp[]>([])
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [pending, setPending]   = useState<PendingListing[]>([])
  const [pendingLoaded, setPendingLoaded] = useState(false)
  const [addOpen, setAddOpen]   = useState(false)

  useEffect(() => {
    getAdminExperiencesAction().then(rows => setExps(rows.filter(e => e.status !== 'Pending Review')))
  }, [])

  useEffect(() => {
    if (filter === 'Pending Review' && !pendingLoaded) {
      getPendingListingsAction().then(rows => { setPending(rows); setPendingLoaded(true) })
    }
  }, [filter, pendingLoaded])

  const handleApprove = async (id: string) => {
    await approveListingAction(id)
    setPending(p => p.filter(x => x.id !== id))
    getAdminExperiencesAction().then(rows => setExps(rows.filter(e => e.status !== 'Pending Review')))
  }

  const handleReject = async (id: string) => {
    await rejectListingAction(id)
    setPending(p => p.filter(x => x.id !== id))
  }

  const setStatus = async (id: string, s: string) => {
    const toEnum: Record<string, string> = { Active: 'ACTIVE', Paused: 'PAUSED', Draft: 'DRAFT' }
    await adminUpdateExperienceStatusAction(id, toEnum[s] ?? 'DRAFT')
    setExps(p => p.map(e => e.id === id ? { ...e, status: s } : e))
    setMenuOpen(null)
  }

  const visible = useMemo(() => {
    if (filter === 'Pending Review') return []
    let list = filter === 'All' ? exps : exps.filter(e => e.status === filter)
    if (search) list = list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.host.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [exps, filter, search])

  const tabs = ['All', 'Pending Review', 'Active', 'Draft', 'Paused']

  return (
    <div>
      <PageHeader title="All Experiences" sub={`${exps.length} curated listings · ${pending.length || '?'} pending review`} />

      <div className="flex gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search title or host…" />
        <button
          onClick={() => {
            const rows = [['ID','Title','Host','Area','Category','Price','Status'], ...exps.map(e => [e.id, e.title, e.host, e.area, e.category, e.price, e.status])]
            const csv = rows.map(r => r.join(',')).join('\n')
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'experiences.csv'; a.click()
          }}
          className="flex items-center gap-2 px-4 rounded-xl flex-shrink-0 hover:opacity-80"
          style={{ height: 38, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 13, color: COCONUT, cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 rounded-xl flex-shrink-0 hover:opacity-90"
          style={{ height: 38, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
          <Plus size={14} /> Add Experience
        </button>
      </div>

      {addOpen && (
        <AddExperienceModal
          onClose={() => setAddOpen(false)}
          onSaved={slug => {
            setAddOpen(false)
            window.open(`/experiences/${slug}`, '_blank')
          }}
        />
      )}

      <div className="overflow-x-auto mb-5 scrollbar-none">
        <div className="inline-flex gap-1 bg-white rounded-xl p-1" style={{ border: `1px solid ${SAND}` }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: filter === t ? 600 : 400, backgroundColor: filter === t ? (t === 'Pending Review' ? GOLD : CHARCOAL) : 'transparent', color: filter === t ? 'white' : COCONUT, border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {t} <span style={{ opacity: 0.6, fontSize: 11 }}>
                {t === 'All' ? exps.length : t === 'Pending Review' ? (pendingLoaded ? pending.length : '•') : exps.filter(e => e.status === t).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pending Review tab — real DB data */}
      {filter === 'Pending Review' && (
        <div className="space-y-3">
          {!pendingLoaded && (
            <p style={{ fontSize: 13, color: COCONUT, padding: '24px 0', textAlign: 'center' }}>Loading pending listings…</p>
          )}
          {pendingLoaded && pending.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center" style={{ border: `1px solid ${SAND}` }}>
              <CheckCircle size={28} style={{ color: FOREST, margin: '0 auto 10px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL, marginBottom: 4 }}>All caught up!</p>
              <p style={{ fontSize: 13, color: COCONUT }}>No listings awaiting approval.</p>
            </div>
          )}
          {pending.map(exp => (
            <div key={exp.id} className="bg-white rounded-xl p-4" style={{ border: `2px solid ${GOLD}` }}>
              <div className="flex items-start gap-3">
                {exp.image ? (
                  <img src={exp.image} alt={exp.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: IVORY }}>
                    <Compass size={18} style={{ color: COCONUT }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{exp.title}</span>
                        <StatusBadge status="Pending Review" />
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <span style={{ fontSize: 11, color: COCONUT }}>🧑 {exp.hostName}</span>
                        <span style={{ fontSize: 11, color: COCONUT }}>📍 {exp.area}</span>
                        <span style={{ fontSize: 11, color: COCONUT }}>{exp.category}</span>
                        <span style={{ fontSize: 11, color: COCONUT }}>{exp.duration}</span>
                        <span style={{ fontSize: 11, color: COCONUT }}>Submitted {exp.submittedAt}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 700, color: CHARCOAL }}>IDR {exp.price.toLocaleString('id-ID')}</p>
                      <p style={{ fontSize: 10, color: COCONUT }}>per person</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${SAND}` }}>
                    <a href={`/experiences/${exp.slug}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 hover:opacity-80"
                      style={{ height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${SAND}`, color: COCONUT, fontSize: 12, textDecoration: 'none' }}>
                      <Eye size={11} /> Preview
                    </a>
                    <button onClick={() => handleReject(exp.id)}
                      className="flex items-center gap-1.5 hover:opacity-80"
                      style={{ height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${SAND}`, background: 'white', color: TERRACOTTA, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <XCircle size={11} /> Reject
                    </button>
                    <button onClick={() => handleApprove(exp.id)}
                      className="flex items-center gap-1.5 hover:opacity-90"
                      style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', backgroundColor: FOREST, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <CheckCircle size={11} /> Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Other tabs — mock data */}
      {filter !== 'Pending Review' && (
        <div className="space-y-3">
          {visible.map(exp => (
            <div key={exp.id} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
              <div className="flex items-start gap-3">
                <img src={exp.image} alt={exp.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{exp.title}</span>
                        <StatusBadge status={exp.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <span style={{ fontSize: 11, color: COCONUT }}>🧑 {exp.host}</span>
                        <span style={{ fontSize: 11, color: COCONUT }}>📍 {exp.area}</span>
                        <span style={{ fontSize: 11, color: COCONUT }}>{exp.category}</span>
                        <span style={{ fontSize: 11, color: COCONUT }}>⭐ {exp.rating} ({exp.reviews})</span>
                        <span style={{ fontSize: 11, color: COCONUT }}>{exp.bookings} bookings</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 700, color: CHARCOAL, whiteSpace: 'nowrap' }}>IDR {exp.price.toLocaleString('id-ID')}</p>
                        <p style={{ fontSize: 10, color: COCONUT }}>per person</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a href={`/experiences/${exp.slug}`} target="_blank" rel="noreferrer"
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-50 transition-colors"
                          style={{ border: `1px solid ${SAND}`, color: COCONUT }}>
                          <Eye size={13} />
                        </a>
                        <div className="relative">
                          <button onClick={() => setMenuOpen(menuOpen === exp.id ? null : exp.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-50"
                            style={{ border: `1px solid ${SAND}`, background: 'none', cursor: 'pointer', color: COCONUT }}>
                            <MoreHorizontal size={13} />
                          </button>
                          {menuOpen === exp.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg z-20 py-1 w-36" style={{ border: `1px solid ${SAND}` }}>
                                {exp.status !== 'Active' && <button onClick={() => setStatus(exp.id, 'Active')} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50" style={{ fontSize: 13, color: FOREST, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><Play size={12} />Activate</button>}
                                {exp.status === 'Active' && <button onClick={() => setStatus(exp.id, 'Paused')} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50" style={{ fontSize: 13, color: GOLD, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><Pause size={12} />Pause</button>}
                                <button onClick={() => setStatus(exp.id, 'Draft')} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50" style={{ fontSize: 13, color: COCONUT, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><Edit2 size={12} />Set Draft</button>
                                <button onClick={async () => { await adminDeleteExperienceAction(exp.id); setExps(p => p.filter(e => e.id !== exp.id)); setMenuOpen(null) }} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50" style={{ fontSize: 13, color: TERRACOTTA, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><Trash2 size={12} />Remove</button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Edit User Modal ───────────────────────────────────────────────────────────

function EditUserModal({ user, onClose, onSaved }: {
  user: AdminUser
  onClose: () => void
  onSaved: (updated: AdminUser) => void
}) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return }
    setSaving(true); setError('')
    const res = await adminUpdateUserAction(user.id, form)
    setSaving(false)
    if (!res.ok) { setError(res.error ?? 'Save failed.'); return }
    onSaved({ ...user, ...form })
  }

  const INPUT = { width: '100%', height: 42, borderRadius: 10, border: `1px solid ${SAND}`, padding: '0 12px', fontSize: 14, fontFamily: 'var(--font-inter)', color: CHARCOAL, outline: 'none', backgroundColor: 'white' } as const
  const LABEL = { fontSize: 12, fontWeight: 600, color: COCONUT, display: 'block', marginBottom: 5 } as const

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: `1px solid ${SAND}` }}>
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: CHARCOAL }}>Edit User</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COCONUT }}><X size={18} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label style={LABEL}>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Email</label>
              <input value={form.email} onChange={e => set('email', e.target.value)} type="email" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Role</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}
                style={{ ...INPUT, cursor: 'pointer' }}>
                <option value="TOURIST">Tourist (Guest)</option>
                <option value="OPERATOR">Operator (Host)</option>
              </select>
            </div>
            {error && <p style={{ fontSize: 13, color: TERRACOTTA }}>{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${SAND}`, background: 'white', color: COCONUT, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving}
                style={{ flex: 2, height: 42, borderRadius: 10, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Edit Host Modal ────────────────────────────────────────────────────────────

function EditHostModal({ host, onClose, onSaved }: {
  host: AdminHost
  onClose: () => void
  onSaved: (updated: AdminHost) => void
}) {
  const [form, setForm] = useState({
    businessName: host.business,
    description:  host.description,
    payoutBank:   host.payoutBank,
    payoutAccountNumber: host.payoutAccountNumber,
    payoutAccountName:   host.payoutAccountName,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.businessName.trim()) { setError('Business name is required.'); return }
    setSaving(true); setError('')
    const res = await adminUpdateHostAction(host.id, form)
    setSaving(false)
    if (!res.ok) { setError(res.error ?? 'Save failed.'); return }
    onSaved({ ...host, business: form.businessName, description: form.description, payoutBank: form.payoutBank, payoutAccountNumber: form.payoutAccountNumber, payoutAccountName: form.payoutAccountName })
  }

  const INPUT = { width: '100%', height: 42, borderRadius: 10, border: `1px solid ${SAND}`, padding: '0 12px', fontSize: 14, fontFamily: 'var(--font-inter)', color: CHARCOAL, outline: 'none', backgroundColor: 'white' } as const
  const TEXTAREA = { width: '100%', borderRadius: 10, border: `1px solid ${SAND}`, padding: '10px 12px', fontSize: 14, fontFamily: 'var(--font-inter)', color: CHARCOAL, outline: 'none', backgroundColor: 'white', resize: 'vertical' as const, minHeight: 80 }
  const LABEL = { fontSize: 12, fontWeight: 600, color: COCONUT, display: 'block', marginBottom: 5 } as const

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4" style={{ border: `1px solid ${SAND}` }}>
          <div className="flex items-center justify-between p-5 pb-0">
            <div>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: CHARCOAL }}>Edit Host</h2>
              <p style={{ fontSize: 12, color: COCONUT, marginTop: 2 }}>{host.name}</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COCONUT }}><X size={18} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label style={LABEL}>Business Name</label>
              <input value={form.businessName} onChange={e => set('businessName', e.target.value)} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Bio / Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} style={TEXTAREA} />
            </div>
            <div style={{ borderTop: `1px solid ${SAND}`, paddingTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: COCONUT, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payout Details</p>
              <div className="space-y-3">
                <div>
                  <label style={LABEL}>Bank Name</label>
                  <input value={form.payoutBank} onChange={e => set('payoutBank', e.target.value)} placeholder="e.g. BCA, Mandiri" style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>Account Number</label>
                  <input value={form.payoutAccountNumber} onChange={e => set('payoutAccountNumber', e.target.value)} style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>Account Name</label>
                  <input value={form.payoutAccountName} onChange={e => set('payoutAccountName', e.target.value)} style={INPUT} />
                </div>
              </div>
            </div>
            {error && <p style={{ fontSize: 13, color: TERRACOTTA }}>{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${SAND}`, background: 'white', color: COCONUT, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving}
                style={{ flex: 2, height: 42, borderRadius: 10, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Hosts Panel ───────────────────────────────────────────────────────────────

function HostsPanel() {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('All')
  const [hosts, setHosts]     = useState<AdminHost[]>([])
  const [editing, setEditing] = useState<AdminHost | null>(null)

  useEffect(() => { getAdminHostsAction().then(setHosts) }, [])

  const approve  = async (id: string) => {
    await approveHostAction(id)
    setHosts(h => h.map(x => x.id === id ? { ...x, status: 'Verified' } : x))
  }
  const suspend  = async (id: string) => {
    await suspendHostAction(id)
    setHosts(h => h.map(x => x.id === id ? { ...x, status: 'Pending' } : x))
  }

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

      <div className="overflow-x-auto mb-5 scrollbar-none">
        <div className="inline-flex gap-1 bg-white rounded-xl p-1" style={{ border: `1px solid ${SAND}` }}>
          {['All', 'Verified', 'Pending', 'Suspended'].map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: filter === t ? 600 : 400, backgroundColor: filter === t ? CHARCOAL : 'transparent', color: filter === t ? 'white' : COCONUT, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              {t} <span style={{ opacity: 0.5, fontSize: 11 }}>{t === 'All' ? hosts.length : hosts.filter(h => h.status === t).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map(host => (
          <div key={host.id} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
            {/* Info row */}
            <div className="flex items-start gap-3">
              {host.avatar ? (
                <img src={host.avatar} alt={host.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GOLD }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{host.name[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{host.name}</span>
                  <StatusBadge status={host.status} />
                </div>
                <p style={{ fontSize: 12, color: COCONUT, marginTop: 1 }}>{host.business} · {host.area}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                  <span style={{ fontSize: 11, color: COCONUT }}>{host.experiences} listings</span>
                  <span style={{ fontSize: 11, color: COCONUT }}>{host.totalBookings} bookings</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: FOREST }}>{fmt(host.totalEarnings)} earned</span>
                  <span style={{ fontSize: 11, color: COCONUT }}>⭐ {host.rating > 0 ? host.rating.toFixed(1) : '—'} ({host.totalReviews} reviews)</span>
                  <span style={{ fontSize: 11, color: COCONUT }}>Joined {host.joined}</span>
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${IVORY}` }}>
                <a href={`/dashboard?operator=${host.id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:opacity-80"
                  style={{ height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: CHARCOAL, fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                  <LayoutDashboard size={12} /> View dashboard
                </a>
                <button onClick={() => setEditing(host)} className="flex items-center gap-1.5 hover:opacity-80"
                  style={{ height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: CHARCOAL, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Edit2 size={12} /> Edit
                </button>
                {host.status === 'Pending' && (
                  <>
                    <button onClick={() => approve(host.id)} className="flex items-center gap-1.5 hover:opacity-90"
                      style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button onClick={() => suspend(host.id)} className="flex items-center gap-1.5 hover:opacity-80"
                      style={{ height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: TERRACOTTA, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <XCircle size={12} /> Decline
                    </button>
                  </>
                )}
                {host.status === 'Verified' && (
                  <button onClick={() => suspend(host.id)} className="flex items-center gap-1.5 hover:opacity-80"
                    style={{ height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: COCONUT, fontSize: 12, cursor: 'pointer' }}>
                    Suspend
                  </button>
                )}
                {host.status === 'Suspended' && (
                  <button onClick={() => approve(host.id)} className="flex items-center gap-1.5 hover:opacity-90"
                    style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', backgroundColor: FOREST, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Reinstate
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditHostModal
          host={editing}
          onClose={() => setEditing(null)}
          onSaved={updated => { setHosts(h => h.map(x => x.id === updated.id ? updated : x)); setEditing(null) }}
        />
      )}
    </div>
  )
}

// ── Bookings Panel ────────────────────────────────────────────────────────────

const DATE_RANGES = ['All time', 'Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This month', 'Last month']

function inDateRange(bookedOn: string, range: string): boolean {
  if (range === 'All time') return true
  const d = new Date(bookedOn)
  if (isNaN(d.getTime())) return true
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (range === 'Today') return d >= startOfToday
  if (range === 'Last 7 days')  { const from = new Date(now); from.setDate(now.getDate() - 7);  return d >= from }
  if (range === 'Last 30 days') { const from = new Date(now); from.setDate(now.getDate() - 30); return d >= from }
  if (range === 'Last 90 days') { const from = new Date(now); from.setDate(now.getDate() - 90); return d >= from }
  if (range === 'This month')   { return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() }
  if (range === 'Last month')   {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lme = new Date(now.getFullYear(), now.getMonth(), 1)
    return d >= lm && d < lme
  }
  return true
}

function BookingsPanel() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateRange, setDateRange]       = useState('All time')
  const [hostFilter, setHostFilter]     = useState('All hosts')
  const [search, setSearch]             = useState('')
  const [bookings, setBookings]         = useState<AdminBooking[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    getAdminBookingsAction().then(b => { setBookings(b); setLoading(false) })
  }, [])

  const hosts = useMemo(() => Array.from(new Set(bookings.map(b => b.host))).sort(), [bookings])

  const updateStatus = (id: string, status: string, enumVal: string) => {
    const b = bookings.find(x => x.id === id)
    if (b) adminUpdateBookingStatusAction(b.ref, enumVal).catch(() => {})
    setBookings(p => p.map(x => x.id === id ? { ...x, status } : x))
  }
  const complete = (id: string) => {
    const b = bookings.find(x => x.id === id)
    if (b) adminCompleteBookingAction(b.ref).catch(() => {})
    setBookings(p => p.map(x => x.id === id ? { ...x, status: 'Completed' } : x))
  }

  const visible = useMemo(() => {
    let list = bookings
    if (statusFilter !== 'All') list = list.filter(b => b.status === statusFilter)
    if (hostFilter !== 'All hosts') list = list.filter(b => b.host === hostFilter)
    list = list.filter(b => inDateRange(b.bookedOn, dateRange))
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.guest.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) ||
        b.experience.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q) ||
        b.host.toLowerCase().includes(q) || b.phone.includes(q)
      )
    }
    return list
  }, [bookings, statusFilter, hostFilter, dateRange, search])

  const totalRevenue    = visible.reduce((a, b) => a + b.total, 0)
  const totalCommission = visible.reduce((a, b) => a + b.commission, 0)
  const totalPayout     = visible.reduce((a, b) => a + b.hostPayout, 0)

  const exportCSV = () => {
    const headers = ['Ref', 'Guest', 'Guest Email', 'Guest Phone', 'Experience', 'Host', 'Host Email', 'Experience Date', 'Booked On', 'Guests', 'Total (IDR)', 'Commission (IDR)', 'Host Payout (IDR)', 'Status', 'Payment ID']
    const rows = visible.map(b => [
      b.ref, b.guest, b.email, b.phone, b.experience, b.host, b.hostEmail,
      b.date, b.bookedOn, b.guests, b.total, b.commission, b.hostPayout, b.status, b.paymentId,
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `bookings-${dateRange.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
  }

  const selectStyle: React.CSSProperties = { height: 38, borderRadius: 10, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 13, color: COCONUT, cursor: 'pointer', paddingInline: 12, outline: 'none' }

  return (
    <div>
      <PageHeader title="All Bookings" sub={`${bookings.length} total · ${visible.length} shown`} />

      {/* Summary cards — scoped to current filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Gross Revenue',       value: fmt(totalRevenue),    color: CHARCOAL },
          { label: 'Platform Commission', value: fmt(totalCommission), color: FOREST },
          { label: 'Host Payouts',        value: fmt(totalPayout),     color: GOLD },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 11, color: COCONUT }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: COCONUT, marginTop: 2 }}>
              {visible.length} booking{visible.length !== 1 ? 's' : ''} · {statusFilter !== 'All' ? statusFilter : dateRange}
            </p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search guest, host, experience, ref…" />
        </div>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={selectStyle}>
          {DATE_RANGES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={hostFilter} onChange={e => setHostFilter(e.target.value)} style={selectStyle}>
          <option>All hosts</option>
          {hosts.map(h => <option key={h}>{h}</option>)}
        </select>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 rounded-xl flex-shrink-0 hover:opacity-80"
          style={{ height: 38, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 13, color: COCONUT, cursor: 'pointer' }}>
          <Download size={13} /> CSV
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: statusFilter === s ? 600 : 400, flexShrink: 0, backgroundColor: statusFilter === s ? CHARCOAL : 'white', color: statusFilter === s ? 'white' : COCONUT, border: '1px solid', borderColor: statusFilter === s ? CHARCOAL : SAND, cursor: 'pointer' }}>
            {s} <span style={{ opacity: 0.5, fontSize: 11 }}>{s === 'All' ? bookings.length : bookings.filter(b => b.status === s).length}</span>
          </button>
        ))}
      </div>

      {loading && <p style={{ fontSize: 13, color: COCONUT }}>Loading bookings…</p>}

      <div className="space-y-3">
        {visible.length === 0 && !loading && (
          <div className="bg-white rounded-xl p-10 text-center" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 14, color: COCONUT }}>No bookings match your filters.</p>
          </div>
        )}
        {visible.map(b => (
          <div key={b.id} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
            <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{b.guest}</span>
                  <StatusBadge status={b.status} />
                </div>
                <p style={{ fontSize: 12, color: COCONUT, marginTop: 1 }}>
                  {b.email}{b.phone ? ` · ${b.phone}` : ''} · <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{b.ref}</span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>{fmt(b.total)}</p>
                <p style={{ fontSize: 11, color: FOREST }}>Commission: {fmt(b.commission)}</p>
                <p style={{ fontSize: 11, color: GOLD }}>Host payout: {fmt(b.hostPayout)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-1">
              <span style={{ fontSize: 12, color: COCONUT }}>📋 {b.experience}</span>
              <span style={{ fontSize: 12, color: COCONUT }}>🧑‍🏫 {b.host}</span>
              <span style={{ fontSize: 12, color: COCONUT }}>📅 {b.date}</span>
              <span style={{ fontSize: 12, color: COCONUT }}>👤 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
            </div>
            <p style={{ fontSize: 11, color: '#C8C4BE' }}>
              Booked {b.bookedOn}{b.paymentId ? ` · Payment: ${b.paymentId}` : ''}
            </p>
            {(b.status === 'Pending' || b.status === 'Confirmed') && (
              <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${IVORY}` }}>
                {b.status === 'Pending' && (
                  <button onClick={() => updateStatus(b.id, 'Confirmed', 'CONFIRMED')}
                    className="flex items-center justify-center gap-1.5 hover:opacity-90"
                    style={{ height: 34, flex: 1, borderRadius: 8, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <CheckCircle size={13} /> Confirm
                  </button>
                )}
                {b.status === 'Confirmed' && (
                  <button onClick={() => complete(b.id)}
                    className="flex items-center justify-center gap-1.5 hover:opacity-90"
                    style={{ height: 34, flex: 1, borderRadius: 8, border: 'none', backgroundColor: FOREST, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <Check size={13} /> Mark Completed
                  </button>
                )}
                <button onClick={() => updateStatus(b.id, 'Cancelled', 'CANCELLED')}
                  className="flex items-center justify-center gap-1.5 hover:bg-red-50"
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
  const [users, setUsers]   = useState<AdminUser[]>([])
  const [editing, setEditing] = useState<AdminUser | null>(null)

  useEffect(() => { getAdminUsersAction().then(setUsers) }, [])

  const visible = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q))
  }, [users, search])

  return (
    <div>
      <PageHeader title="Users" sub={`${users.length} registered users`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Users',      value: users.length.toString() },
          { label: 'Active (booked)',  value: users.filter(u => u.bookings > 0).length.toString() },
          { label: 'Total Guest Spend', value: fmt(users.reduce((a, u) => a + u.totalSpend, 0)) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 11, color: COCONUT }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: CHARCOAL, marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, email or role…" />
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${SAND}` }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: IVORY }}>
              <tr>
                {['Name', 'Email', 'Role', 'Bookings', 'Total Spent', 'Joined', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
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
                  <td style={{ padding: '12px 16px', fontSize: 12, color: COCONUT, textTransform: 'capitalize' }}>{u.role.toLowerCase()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{u.bookings}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: u.totalSpend > 0 ? FOREST : COCONUT }}>{u.totalSpend > 0 ? fmt(u.totalSpend) : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: COCONUT }}>{u.joined}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={u.status} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setEditing(u)}
                      className="flex items-center gap-1 hover:opacity-80"
                      style={{ height: 30, padding: '0 10px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: CHARCOAL, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <Edit2 size={11} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={updated => { setUsers(u => u.map(x => x.id === updated.id ? updated : x)); setEditing(null) }}
        />
      )}
    </div>
  )
}

// ── Reviews Panel ─────────────────────────────────────────────────────────────

function ReviewsPanel() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [starFilter, setStarFilter]     = useState(0)
  const [reviews, setReviews]           = useState<AdminReview[]>([])

  useEffect(() => { getAdminReviewsAction().then(setReviews) }, [])

  const patch = (id: string, updates: Partial<AdminReview>) =>
    setReviews(r => r.map(x => x.id === id ? { ...x, ...updates } : x))

  const flag    = (id: string) => { adminFlagReviewAction(id).catch(() => {}); patch(id, { status: 'Flagged' }) }
  const unflag  = (id: string) => { adminApproveReviewAction(id).catch(() => {}); patch(id, { status: 'Published', hidden: false }) }
  const hide    = (id: string) => { adminHideReviewAction(id).catch(() => {}); patch(id, { status: 'Hidden', hidden: true }) }
  const remove  = (id: string) => { adminDeleteReviewAction(id).catch(() => {}); setReviews(r => r.filter(x => x.id !== id)) }

  const needsAttention = reviews.filter(r => r.status === 'Flagged')

  const visible = reviews.filter(r => {
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    const matchStar   = starFilter === 0 || r.rating === starFilter
    return matchStatus && matchStar
  })

  const published = reviews.filter(r => r.status === 'Published')
  const avg = published.length > 0 ? (published.reduce((a, r) => a + r.rating, 0) / published.length).toFixed(1) : '—'

  const STATUS_TABS = ['All', 'Published', 'Flagged', 'Hidden']

  return (
    <div>
      <PageHeader title="Reviews" sub={`${reviews.length} total · ${published.length} published · avg ${avg} ★`} />

      {needsAttention.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
          <Flag size={16} style={{ color: TERRACOTTA, flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL }}>{needsAttention.length} flagged review{needsAttention.length > 1 ? 's' : ''} need moderation</p>
            <p style={{ fontSize: 13, color: COCONUT, marginTop: 1 }}>Keep (restore to public), Hide (remove from listing), or Delete permanently.</p>
          </div>
        </div>
      )}

      {/* Status tabs + star filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: statusFilter === s ? 600 : 400, backgroundColor: statusFilter === s ? CHARCOAL : 'white', color: statusFilter === s ? 'white' : COCONUT, border: `1px solid ${statusFilter === s ? CHARCOAL : SAND}`, cursor: 'pointer' }}>
            {s} <span style={{ opacity: 0.5, fontSize: 11 }}>{s === 'All' ? reviews.length : reviews.filter(r => r.status === s).length}</span>
          </button>
        ))}
        <div style={{ borderLeft: `1px solid ${SAND}`, margin: '0 4px' }} />
        {[0, 5, 4, 3, 2, 1].map(s => (
          <button key={s} onClick={() => setStarFilter(starFilter === s ? 0 : s)}
            style={{ padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: starFilter === s ? 600 : 400, backgroundColor: starFilter === s ? GOLD : 'white', color: starFilter === s ? 'white' : COCONUT, border: `1px solid ${starFilter === s ? GOLD : SAND}`, cursor: 'pointer' }}>
            {s === 0 ? 'All ★' : `${s}★`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 14, color: COCONUT }}>No reviews in this filter.</p>
          </div>
        )}
        {visible.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-4"
            style={{ border: `1px solid ${r.status === 'Flagged' ? '#FECACA' : r.status === 'Hidden' ? SAND : SAND}`, opacity: r.status === 'Hidden' ? 0.65 : 1 }}>
            <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{r.guest}</span>
                  <span style={{ fontSize: 12, color: GOLD }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p style={{ fontSize: 12, color: COCONUT, marginTop: 1 }}>{r.experience} · {r.host} · {r.date}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {r.status === 'Published' && (
                  <button onClick={() => flag(r.id)} className="flex items-center gap-1 hover:opacity-80"
                    style={{ height: 30, padding: '0 10px', borderRadius: 8, border: `1px solid #FECACA`, backgroundColor: 'white', color: TERRACOTTA, fontSize: 12, cursor: 'pointer' }}>
                    <Flag size={10} /> Flag
                  </button>
                )}
                {(r.status === 'Flagged' || r.status === 'Hidden') && (
                  <button onClick={() => unflag(r.id)} className="flex items-center gap-1 hover:opacity-90"
                    style={{ height: 30, padding: '0 10px', borderRadius: 8, border: 'none', backgroundColor: FOREST, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Check size={11} /> Restore
                  </button>
                )}
                {r.status !== 'Hidden' && (
                  <button onClick={() => hide(r.id)} className="flex items-center gap-1 hover:opacity-80"
                    style={{ height: 30, padding: '0 10px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: COCONUT, fontSize: 12, cursor: 'pointer' }}>
                    <Eye size={10} /> Hide
                  </button>
                )}
                <button onClick={() => remove(r.id)} className="flex items-center gap-1 hover:opacity-80"
                  style={{ height: 30, padding: '0 10px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', color: TERRACOTTA, fontSize: 12, cursor: 'pointer' }}>
                  <Trash2 size={10} /> Delete
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
  const [queue, setQueue]         = useState<AdminRealPayout[]>([])
  const [history, setHistory]     = useState<AdminPayout[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState<string | null>(null)
  const [periodFilter, setPeriodFilter] = useState('')
  const [tab, setTab]             = useState<'queue' | 'history'>('queue')

  const [commPct, setCommPct] = useState<number>(Math.round(COMMISSION_RATE * 100))

  useEffect(() => {
    Promise.all([
      getAdminRealPayoutsAction(),
      getAdminPayoutsAction(),
      getCommissionRateAction(),
    ]).then(([q, h, rate]) => {
      setQueue(q); setHistory(h); setLoading(false)
      setCommPct(Math.round(rate * 100))
    })
  }, [])

  const paidKeys      = new Set(history.filter(h => h.status === 'Paid').map(h => `${h.operatorId}:${h.periodStart.slice(0, 7)}`))
  const requestedKeys = new Set(history.filter(h => h.status === 'Requested').map(h => `${h.operatorId}:${h.periodStart.slice(0, 7)}`))

  const filteredQueue = periodFilter ? queue.filter(p => p.periodLabel === periodFilter) : queue
  const periods = Array.from(new Set(queue.map(p => p.periodLabel)))

  const totalGross   = filteredQueue.reduce((a, p) => a + p.gross, 0)
  const totalComm    = filteredQueue.reduce((a, p) => a + p.commission, 0)
  const pendingAmt   = filteredQueue.filter(p => !paidKeys.has(p.key)).reduce((a, p) => a + p.net, 0)

  const markPaid = async (p: AdminRealPayout) => {
    setSaving(p.key)
    const [yr, mo] = p.period.split('-').map(Number)
    const periodStart = new Date(Date.UTC(yr, mo - 1, 1)).toISOString()
    const periodEnd   = new Date(Date.UTC(yr, mo, 1)).toISOString()
    const res = await adminMarkPayoutPaidAction({
      operatorId: p.operatorId, periodStart, periodEnd,
      gross: p.gross, commission: p.commission, net: p.net, bookings: p.bookings,
    })
    if (res.ok) {
      const newPayout: AdminPayout = {
        id: res.id ?? '', operatorId: p.operatorId, name: p.name, business: p.business,
        periodStart, periodEnd, periodLabel: p.periodLabel,
        gross: p.gross, commission: p.commission, net: p.net, bookings: p.bookings,
        status: 'Paid', paidAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), notes: '',
      }
      setHistory(h => [newPayout, ...h])
    }
    setSaving(null)
  }

  const selectSt: React.CSSProperties = { height: 34, padding: '0 10px', borderRadius: 8, border: `1px solid ${SAND}`, fontSize: 12, color: CHARCOAL, backgroundColor: 'white', cursor: 'pointer' }

  return (
    <div>
      <PageHeader title="Payments & Payouts" sub="Booking revenue and host payout management" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gross Revenue',       value: fmt(totalGross),        color: CHARCOAL },
          { label: 'Platform Commission', value: fmt(totalComm),         color: FOREST   },
          { label: 'Host Payouts',        value: fmt(totalGross - totalComm), color: GOLD },
          { label: 'Pending Payouts',     value: fmt(pendingAmt),        color: TERRACOTTA },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 12, color: COCONUT }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14px,1.6vw,20px)', fontWeight: 700, color: s.color, marginTop: 4, lineHeight: 1.2 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Payout Rules */}
      <div className="flex flex-wrap items-center gap-3 mb-5 px-4 py-3 rounded-xl" style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6F675C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payout Rules</span>

        {[
          { label: 'Commission', value: `${commPct}% of gross` },
          { label: 'Min payout', value: `IDR ${PAYOUT_MIN_NET.toLocaleString()} net` },
          { label: 'Max payout', value: 'Full net earnings (no cap)' },
          { label: 'Frequency',  value: 'Per operator request, monthly' },
        ].map(r => (
          <div key={r.label} className="flex items-center gap-1 px-3 py-1 rounded-lg" style={{ backgroundColor: 'white', border: '1px solid #E8E4DE' }}>
            <span style={{ fontSize: 11, color: '#9B9690' }}>{r.label}:</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#111111' }}>{r.value}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: COCONUT }}>— edit commission in <strong>Platform Settings</strong></span>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        {(['queue', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '6px 18px', borderRadius: 10, fontSize: 13, fontWeight: tab === t ? 600 : 400, backgroundColor: tab === t ? CHARCOAL : 'white', color: tab === t ? 'white' : COCONUT, border: `1px solid ${tab === t ? CHARCOAL : SAND}`, cursor: 'pointer', textTransform: 'capitalize' }}>
            {t === 'queue' ? `Payout Queue (${filteredQueue.filter(p => !paidKeys.has(p.key)).length})` : `History (${history.length})`}
          </button>
        ))}
        {tab === 'queue' && (
          <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} style={selectSt}>
            <option value="">All periods</option>
            {periods.map(p => <option key={p}>{p}</option>)}
          </select>
        )}
      </div>

      <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
        {loading ? (
          <p style={{ fontSize: 13, color: COCONUT, padding: '24px 0', textAlign: 'center' }}>Loading…</p>
        ) : tab === 'queue' ? (
          filteredQueue.length === 0 ? (
            <p style={{ fontSize: 13, color: COCONUT, padding: '24px 0', textAlign: 'center' }}>No confirmed bookings in this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${SAND}` }}>
                    {['Host', 'Business', 'Period', 'Bookings', 'Gross', 'Commission', 'Net Payout', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0 12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((p, i) => {
                    const isPaid      = paidKeys.has(p.key)
                    const isRequested = requestedKeys.has(p.key)
                    return (
                      <tr key={p.key} style={{ borderBottom: i < filteredQueue.length - 1 ? `1px solid ${IVORY}` : 'none', backgroundColor: isRequested && !isPaid ? '#FDFAF5' : 'transparent' }}>
                        <td style={{ padding: '13px 12px', fontSize: 13, fontWeight: 600, color: CHARCOAL, whiteSpace: 'nowrap' }}>{p.name}</td>
                        <td style={{ padding: '13px 12px', fontSize: 12, color: COCONUT }}>{p.business}</td>
                        <td style={{ padding: '13px 12px', fontSize: 12, color: COCONUT, whiteSpace: 'nowrap' }}>{p.periodLabel}</td>
                        <td style={{ padding: '13px 12px', fontSize: 13, color: CHARCOAL, textAlign: 'center' }}>{p.bookings}</td>
                        <td style={{ padding: '13px 12px', fontSize: 13, color: CHARCOAL, whiteSpace: 'nowrap' }}>{fmt(p.gross)}</td>
                        <td style={{ padding: '13px 12px', fontSize: 13, color: FOREST, whiteSpace: 'nowrap' }}>{fmt(p.commission)}</td>
                        <td style={{ padding: '13px 12px', fontSize: 13, fontWeight: 700, color: CHARCOAL, whiteSpace: 'nowrap' }}>{fmt(p.net)}</td>
                        <td style={{ padding: '13px 12px' }}>
                          {isPaid ? (
                            <StatusBadge status="Paid" />
                          ) : (
                            <div className="flex items-center gap-2">
                              {isRequested && (
                                <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, backgroundColor: '#FDF3E3', color: '#C8A97E', border: '1px solid #E8D4B8', whiteSpace: 'nowrap' }}>
                                  ⏳ Requested
                                </span>
                              )}
                              <button onClick={() => markPaid(p)} disabled={saving === p.key}
                                className="flex items-center gap-1 hover:opacity-90"
                                style={{ height: 30, padding: '0 12px', borderRadius: 8, border: 'none', backgroundColor: isRequested ? FOREST : CHARCOAL, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', opacity: saving === p.key ? 0.6 : 1 }}>
                                <Check size={11} /> {saving === p.key ? 'Saving…' : 'Mark Paid'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          history.length === 0 ? (
            <p style={{ fontSize: 13, color: COCONUT, padding: '24px 0', textAlign: 'center' }}>No payouts recorded yet. Use the Payout Queue to mark payments.</p>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${SAND}` }}>
                    {['Host', 'Period', 'Bookings', 'Gross', 'Commission', 'Net Paid', 'Paid On', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0 12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < history.length - 1 ? `1px solid ${IVORY}` : 'none' }}>
                      <td style={{ padding: '13px 12px', fontSize: 13, fontWeight: 600, color: CHARCOAL, whiteSpace: 'nowrap' }}>{p.name}</td>
                      <td style={{ padding: '13px 12px', fontSize: 12, color: COCONUT, whiteSpace: 'nowrap' }}>{p.periodLabel}</td>
                      <td style={{ padding: '13px 12px', fontSize: 13, color: CHARCOAL, textAlign: 'center' }}>{p.bookings}</td>
                      <td style={{ padding: '13px 12px', fontSize: 13, color: CHARCOAL, whiteSpace: 'nowrap' }}>{fmt(p.gross)}</td>
                      <td style={{ padding: '13px 12px', fontSize: 13, color: FOREST, whiteSpace: 'nowrap' }}>{fmt(p.commission)}</td>
                      <td style={{ padding: '13px 12px', fontSize: 13, fontWeight: 700, color: CHARCOAL, whiteSpace: 'nowrap' }}>{fmt(p.net)}</td>
                      <td style={{ padding: '13px 12px', fontSize: 12, color: COCONUT, whiteSpace: 'nowrap' }}>{p.paidAt ?? '—'}</td>
                      <td style={{ padding: '13px 12px' }}><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ── Analytics: shared chart components ────────────────────────────────────────

function DualLineChart({ data, color, fmtY }: {
  data: { label: string; current: number; prev: number }[]
  color: string
  fmtY?: (v: number) => string
}) {
  const W = 600, H = 160, PL = 48, PR = 8, PT = 8, PB = 28
  const IW = W - PL - PR, IH = H - PT - PB
  if (!data.length) return <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontSize: 13, color: COCONUT }}>No data</p></div>

  const allVals = data.flatMap(d => [d.current, d.prev])
  const maxV = Math.max(...allVals, 1)
  const yScale = (v: number) => PT + IH - (v / maxV) * IH
  const xScale = (i: number) => PL + (i / Math.max(data.length - 1, 1)) * IW

  const pathD = (key: 'current' | 'prev') => data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d[key]).toFixed(1)}`).join(' ')

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ val: maxV * t, y: yScale(maxV * t) }))
  const step = Math.max(1, Math.floor(data.length / 6))
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d, _, arr) => ({ label: d.label, x: xScale(data.indexOf(d)) }))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }} preserveAspectRatio="none">
      {yTicks.map(t => (
        <g key={t.val}>
          <line x1={PL} x2={W - PR} y1={t.y} y2={t.y} stroke={SAND} strokeWidth="1" />
          <text x={PL - 4} y={t.y + 4} textAnchor="end" style={{ fontSize: 9, fill: COCONUT }}>
            {fmtY ? fmtY(t.val) : Math.round(t.val)}
          </text>
        </g>
      ))}
      {xLabels.map(l => (
        <text key={l.label} x={l.x} y={H - 4} textAnchor="middle" style={{ fontSize: 9, fill: COCONUT }}>{l.label}</text>
      ))}
      <path d={pathD('prev')} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.35" strokeLinejoin="round" strokeLinecap="round" />
      <path d={pathD('current')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function HBarChart({ data, color, fmtVal }: {
  data: { name: string; value: number }[]
  color: string
  fmtVal?: (v: number) => string
}) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2.5">
      {data.map(d => (
        <div key={d.name}>
          <div className="flex justify-between mb-1">
            <span style={{ fontSize: 12, color: CHARCOAL }}>{d.name}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>{fmtVal ? fmtVal(d.value) : d.value.toLocaleString()}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, backgroundColor: IVORY }}>
            <div style={{ height: '100%', width: `${(d.value / max) * 100}%`, backgroundColor: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      ))}
      {data.length === 0 && <p style={{ fontSize: 13, color: COCONUT }}>No data yet.</p>}
    </div>
  )
}

function BarSparkChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-0.5" style={{ height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, backgroundColor: color, opacity: 0.15 + (v / max) * 0.85, borderRadius: 2, height: `${Math.max((v / max) * 100, 4)}%` }} />
      ))}
    </div>
  )
}

function GAMetricCard({ label, value, change, good = 'up', fmtValue }: {
  label: string; value: number; change: number; good?: 'up' | 'down'; fmtValue: (v: number) => string
}) {
  const isGood = good === 'up' ? change >= 0 : change <= 0
  const changeColor = change === 0 ? COCONUT : isGood ? FOREST : TERRACOTTA
  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→'
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
      <p style={{ fontSize: 11, color: COCONUT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(18px,2vw,26px)', fontWeight: 700, color: CHARCOAL, marginTop: 4, lineHeight: 1.1 }}>{fmtValue(value)}</p>
      <p style={{ fontSize: 12, color: changeColor, marginTop: 5, fontWeight: 500 }}>
        {arrow} {Math.abs(change)}% <span style={{ color: COCONUT, fontWeight: 400 }}>vs prev. period</span>
      </p>
    </div>
  )
}

// ── Analytics Panel ────────────────────────────────────────────────────────────

function GAChangeChip({ curr, prev }: { curr: number; prev: number }) {
  if (!prev) return null
  const pct = Math.round(((curr - prev) / prev) * 100)
  const up = pct >= 0
  return (
    <span className="flex items-center gap-0.5" style={{ fontSize: 11, fontWeight: 600, color: up ? FOREST : TERRACOTTA }}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(pct)}%
    </span>
  )
}

function AnalyticsPanel() {
  const [days, setDays]         = useState(30)
  const [tab, setTab]           = useState<'overview' | 'audience' | 'revenue' | 'content' | 'traffic'>('overview')
  const [data, setData]         = useState<AnalyticsData | null>(null)
  const [gaData, setGaData]     = useState<GAData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [gaLoading, setGaLoading] = useState(false)
  const [useCustom, setUseCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd]     = useState('')

  const today = new Date().toISOString().slice(0, 10)

  const effectiveDays = useCustom && customStart && customEnd
    ? Math.max(1, Math.round((new Date(customEnd).getTime() - new Date(customStart).getTime()) / 86400000))
    : days

  useEffect(() => {
    if (useCustom) return
    setLoading(true); setData(null)
    getAnalyticsDataAction(days).then(d => { setData(d); setLoading(false) })
  }, [days, useCustom])

  useEffect(() => {
    if (useCustom && customStart && customEnd && customEnd >= customStart) {
      setLoading(true); setData(null)
      getAnalyticsDataAction(effectiveDays).then(d => { setData(d); setLoading(false) })
    }
  }, [useCustom, customStart, customEnd])

  useEffect(() => {
    if (tab !== 'traffic') return
    if (useCustom && customStart && customEnd && customEnd >= customStart) {
      setGaLoading(true)
      getGADataAction(effectiveDays, customStart, customEnd).then(d => { setGaData(d); setGaLoading(false) })
    } else if (!useCustom) {
      setGaLoading(true)
      getGADataAction(days).then(d => { setGaData(d); setGaLoading(false) })
    }
  }, [tab, days, useCustom, customStart, customEnd])

  const PERIODS = [{ label: '7D', value: 7 }, { label: '30D', value: 30 }, { label: '3M', value: 90 }, { label: '12M', value: 365 }]
  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'audience', label: 'Audience' },
    { id: 'revenue',  label: 'Revenue' },
    { id: 'content',  label: 'Content' },
    { id: 'traffic',  label: 'Web Traffic' },
  ] as const

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: CHARCOAL }}>Analytics</h1>
          <p style={{ fontSize: 13, color: COCONUT, marginTop: 3 }}>Platform performance — compared to previous period</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset period buttons */}
          {!useCustom && (
            <div className="flex gap-1 bg-white rounded-xl p-1" style={{ border: `1px solid ${SAND}` }}>
              {PERIODS.map(p => (
                <button key={p.value} onClick={() => setDays(p.value)}
                  style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: days === p.value ? 600 : 400, backgroundColor: days === p.value ? CHARCOAL : 'transparent', color: days === p.value ? 'white' : COCONUT, border: 'none', cursor: 'pointer' }}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
          {/* Custom date range */}
          {useCustom && (
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5" style={{ border: `1px solid ${SAND}` }}>
              <input type="date" value={customStart} max={customEnd || today}
                onChange={e => setCustomStart(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: 13, color: CHARCOAL, backgroundColor: 'transparent', cursor: 'pointer' }} />
              <span style={{ fontSize: 13, color: COCONUT }}>→</span>
              <input type="date" value={customEnd} min={customStart} max={today}
                onChange={e => setCustomEnd(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: 13, color: CHARCOAL, backgroundColor: 'transparent', cursor: 'pointer' }} />
            </div>
          )}
          {/* Custom toggle */}
          <button onClick={() => { setUseCustom(v => !v); setCustomStart(''); setCustomEnd('') }}
            style={{ height: 36, padding: '0 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${SAND}`, backgroundColor: useCustom ? CHARCOAL : 'white', color: useCustom ? 'white' : COCONUT }}>
            {useCustom ? '✕ Clear' : 'Custom range'}
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="mb-6 overflow-x-auto" style={{ borderBottom: `2px solid ${SAND}` }}>
        <div className="flex gap-0" style={{ minWidth: 'max-content' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '8px 16px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? CHARCOAL : COCONUT, background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t.id ? `2px solid ${CHARCOAL}` : '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <p style={{ fontSize: 14, color: COCONUT }}>Loading…</p>
        </div>
      )}

      {!loading && data && tab === 'overview' && (
        <div>
          {/* Metric cards */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <GAMetricCard label="Bookings"         value={data.metrics.bookings.value}       change={data.metrics.bookings.change}       good="up"   fmtValue={v => v.toLocaleString()} />
            <GAMetricCard label="Gross Revenue"    value={data.metrics.revenue.value}        change={data.metrics.revenue.change}        good="up"   fmtValue={fmt} />
            <GAMetricCard label="New Users"        value={data.metrics.newUsers.value}       change={data.metrics.newUsers.change}       good="up"   fmtValue={v => v.toLocaleString()} />
            <GAMetricCard label="New Hosts"        value={data.metrics.newHosts.value}       change={data.metrics.newHosts.change}       good="up"   fmtValue={v => v.toLocaleString()} />
            <GAMetricCard label="Avg Booking Value" value={data.metrics.avgBookingValue.value} change={data.metrics.avgBookingValue.change} good="up" fmtValue={fmt} />
            <GAMetricCard label="Cancel Rate"      value={data.metrics.cancelRate.value}     change={data.metrics.cancelRate.change}     good="down" fmtValue={v => `${v}%`} />
          </div>

          {/* Dual-line charts */}
          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Bookings over time</h2>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: COCONUT }}><span style={{ width: 16, height: 2, display: 'inline-block', backgroundColor: FOREST, borderRadius: 1 }} /> Current</span>
                  <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: COCONUT }}><span style={{ width: 16, height: 1, display: 'inline-block', borderTop: `2px dashed ${FOREST}`, opacity: 0.5 }} /> Previous</span>
                </div>
              </div>
              <DualLineChart data={data.bookingTrend} color={FOREST} />
            </div>
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Revenue over time</h2>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: COCONUT }}><span style={{ width: 16, height: 2, display: 'inline-block', backgroundColor: GOLD, borderRadius: 1 }} /> Current</span>
                  <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: COCONUT }}><span style={{ width: 16, height: 1, display: 'inline-block', borderTop: `2px dashed ${GOLD}`, opacity: 0.5 }} /> Previous</span>
                </div>
              </div>
              <DualLineChart data={data.revenueTrend} color={GOLD} fmtY={v => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : String(Math.round(v))} />
            </div>
          </div>

          {/* Booking status + top experiences */}
          <div className="grid lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2 bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Booking Status</h2>
              {data.bookingStatus.length > 0 ? (
                <>
                  <DonutChart
                    data={data.bookingStatus.map(s => ({ name: s.status, pct: Math.round((s.count / data.bookingStatus.reduce((a, x) => a + x.count, 0)) * 100), color: s.color }))}
                    total={data.bookingStatus.reduce((a, s) => a + s.count, 0)}
                  />
                  <div className="mt-4 space-y-2 pt-4" style={{ borderTop: `1px solid ${SAND}` }}>
                    {data.bookingStatus.map(s => (
                      <div key={s.status} className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span style={{ fontSize: 12, color: COCONUT }}>{s.status}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p style={{ fontSize: 13, color: COCONUT }}>No bookings in period.</p>}
            </div>
            <div className="lg:col-span-3 bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Top Experiences</h2>
              <HBarChart data={data.topExperiences.slice(0, 5).map(e => ({ name: e.title, value: e.bookings }))} color={GOLD} />
            </div>
          </div>
        </div>
      )}

      {!loading && data && tab === 'audience' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <GAMetricCard label="New Users"  value={data.metrics.newUsers.value}  change={data.metrics.newUsers.change}  good="up" fmtValue={v => v.toLocaleString()} />
            <GAMetricCard label="New Hosts"  value={data.metrics.newHosts.value}  change={data.metrics.newHosts.change}  good="up" fmtValue={v => v.toLocaleString()} />
            <GAMetricCard label="Bookings"   value={data.metrics.bookings.value}  change={data.metrics.bookings.change}  good="up" fmtValue={v => v.toLocaleString()} />
            <GAMetricCard label="Avg Spend"  value={data.metrics.avgBookingValue.value} change={data.metrics.avgBookingValue.change} good="up" fmtValue={fmt} />
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <h2 className="mb-3" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>New Users over time</h2>
              <BarSparkChart data={data.userGrowth.map(u => u.count)} color={FOREST} />
              <div className="flex justify-between mt-1">
                {data.userGrowth.filter((_, i) => i % Math.max(1, Math.floor(data.userGrowth.length / 6)) === 0).map(u => (
                  <span key={u.label} style={{ fontSize: 9, color: COCONUT }}>{u.label}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Top Hosts by Revenue</h2>
              <HBarChart data={data.topHosts.slice(0, 6).map(h => ({ name: h.business, value: h.revenue }))} color={GOLD} fmtVal={fmt} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
            <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Top Hosts</h2>
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${SAND}` }}>
                    {['Host', 'Business', 'Bookings', 'Revenue', 'Rating'].map(h => (
                      <th key={h} style={{ padding: '0 12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topHosts.map((h, i) => (
                    <tr key={h.business} style={{ borderBottom: i < data.topHosts.length - 1 ? `1px solid ${IVORY}` : 'none' }}>
                      <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{h.name}</td>
                      <td style={{ padding: '11px 12px', fontSize: 12, color: COCONUT }}>{h.business}</td>
                      <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{h.bookings}</td>
                      <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600, color: FOREST }}>{fmt(h.revenue)}</td>
                      <td style={{ padding: '11px 12px', fontSize: 12, color: COCONUT }}>{h.rating > 0 ? `${h.rating.toFixed(1)} ★` : '—'}</td>
                    </tr>
                  ))}
                  {data.topHosts.length === 0 && <tr><td colSpan={5} style={{ padding: '20px 12px', fontSize: 13, color: COCONUT, textAlign: 'center' }}>No data for this period.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && data && tab === 'revenue' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <GAMetricCard label="Gross Revenue"     value={data.metrics.revenue.value}        change={data.metrics.revenue.change}        good="up"   fmtValue={fmt} />
            <GAMetricCard label="Platform Commission" value={Math.round(data.metrics.revenue.value * 0.1)} change={data.metrics.revenue.change} good="up" fmtValue={fmt} />
            <GAMetricCard label="Avg Booking Value" value={data.metrics.avgBookingValue.value} change={data.metrics.avgBookingValue.change} good="up"   fmtValue={fmt} />
            <GAMetricCard label="Bookings"          value={data.metrics.bookings.value}       change={data.metrics.bookings.change}       good="up"   fmtValue={v => v.toLocaleString()} />
          </div>

          <div className="bg-white rounded-xl p-5 mb-5" style={{ border: `1px solid ${SAND}` }}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Revenue over time</h2>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: COCONUT }}><span style={{ width: 16, height: 2, display: 'inline-block', backgroundColor: GOLD, borderRadius: 1 }} /> Current</span>
                <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: COCONUT }}><span style={{ width: 16, height: 1, display: 'inline-block', borderTop: `2px dashed ${GOLD}`, opacity: 0.5 }} /> Previous</span>
              </div>
            </div>
            <DualLineChart data={data.revenueTrend} color={GOLD} fmtY={v => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : String(Math.round(v))} />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Revenue by Category</h2>
              <HBarChart data={data.categoryBreakdown.map(c => ({ name: c.name, value: c.revenue }))} color={GOLD} fmtVal={fmt} />
            </div>
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Revenue by Area</h2>
              <HBarChart data={data.areaBreakdown.map(a => ({ name: a.name, value: a.revenue }))} color={TERRACOTTA} fmtVal={fmt} />
            </div>
          </div>
        </div>
      )}

      {!loading && data && tab === 'content' && (
        <div>
          <div className="bg-white rounded-xl p-5 mb-5" style={{ border: `1px solid ${SAND}` }}>
            <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Top Experiences</h2>
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${SAND}` }}>
                    {['#', 'Experience', 'Category', 'Area', 'Bookings', 'Revenue', 'Rating', 'Bar'].map(h => (
                      <th key={h} style={{ padding: '0 12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topExperiences.map((e, i) => {
                    const pct = data.topExperiences[0]?.bookings ? (e.bookings / data.topExperiences[0].bookings) * 100 : 0
                    return (
                      <tr key={e.title} style={{ borderBottom: i < data.topExperiences.length - 1 ? `1px solid ${IVORY}` : 'none' }}>
                        <td style={{ padding: '11px 12px', fontSize: 12, fontWeight: 700, color: COCONUT }}>{i + 1}</td>
                        <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600, color: CHARCOAL, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</td>
                        <td style={{ padding: '11px 12px', fontSize: 12, color: COCONUT }}>{e.category}</td>
                        <td style={{ padding: '11px 12px', fontSize: 12, color: COCONUT }}>{e.area}</td>
                        <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{e.bookings}</td>
                        <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600, color: FOREST }}>{fmt(e.revenue)}</td>
                        <td style={{ padding: '11px 12px', fontSize: 12, color: COCONUT }}>{e.rating > 0 ? `${e.rating.toFixed(1)} ★` : '—'}</td>
                        <td style={{ padding: '11px 12px', minWidth: 100 }}>
                          <div style={{ height: 6, borderRadius: 3, backgroundColor: IVORY }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: GOLD, borderRadius: 3 }} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {data.topExperiences.length === 0 && <tr><td colSpan={8} style={{ padding: '20px 12px', fontSize: 13, color: COCONUT, textAlign: 'center' }}>No data for this period.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Bookings by Category</h2>
              {data.categoryBreakdown.length > 0 ? (
                <>
                  <DonutChart data={data.categoryBreakdown.map(c => ({ name: c.name, pct: c.pct, color: c.color }))} total={data.metrics.bookings.value} />
                  <div className="mt-4 space-y-1.5 pt-4" style={{ borderTop: `1px solid ${SAND}` }}>
                    {data.categoryBreakdown.map(c => (
                      <div key={c.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                          <span style={{ fontSize: 12, color: COCONUT }}>{c.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>{c.bookings}</span>
                          <span style={{ fontSize: 11, color: COCONUT, width: 30, textAlign: 'right' }}>{c.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p style={{ fontSize: 13, color: COCONUT }}>No data for this period.</p>}
            </div>
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
              <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Bookings by Area</h2>
              <HBarChart data={data.areaBreakdown.map(a => ({ name: a.name, value: a.bookings }))} color={FOREST} />
            </div>
          </div>
        </div>
      )}

      {/* ── Web Traffic (GA4) ── */}
      {tab === 'traffic' && (
        <div>
          {gaLoading && (
            <div className="flex items-center justify-center py-20">
              <p style={{ fontSize: 14, color: COCONUT }}>Loading Google Analytics data…</p>
            </div>
          )}
          {!gaLoading && !gaData && (
            <div className="flex items-center justify-center py-20">
              <p style={{ fontSize: 14, color: COCONUT }}>No GA data available. Check service account permissions.</p>
            </div>
          )}
          {!gaLoading && gaData && (
            <div>
              {/* Summary metrics */}
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Sessions',       curr: gaData.metrics.sessions,   prev: gaData.metrics.sessionsPrev,  fmt: (v: number) => v.toLocaleString() },
                  { label: 'Users',          curr: gaData.metrics.users,      prev: gaData.metrics.usersPrev,     fmt: (v: number) => v.toLocaleString() },
                  { label: 'New Users',      curr: gaData.metrics.newUsers,   prev: 0,                            fmt: (v: number) => v.toLocaleString() },
                  { label: 'Page Views',     curr: gaData.metrics.pageViews,  prev: gaData.metrics.pageViewsPrev, fmt: (v: number) => v.toLocaleString() },
                  { label: 'Engagement Rate', curr: gaData.metrics.engagementRate, prev: 0,                      fmt: (v: number) => `${v}%` },
                  { label: 'Avg Session',    curr: gaData.metrics.avgSessionDuration, prev: 0,                   fmt: (v: number) => `${Math.floor(v / 60)}m ${v % 60}s` },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: `1px solid ${SAND}` }}>
                    <p style={{ fontSize: 12, color: COCONUT }}>{s.label}</p>
                    <div className="flex items-end justify-between mt-1">
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(16px,1.8vw,22px)', fontWeight: 700, color: CHARCOAL, lineHeight: 1.2 }}>{s.fmt(s.curr)}</p>
                      {s.prev > 0 && <GAChangeChip curr={s.curr} prev={s.prev} />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trend chart */}
              <div className="bg-white rounded-xl p-5 mb-5" style={{ border: `1px solid ${SAND}` }}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Sessions & Users over time</h2>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: COCONUT }}><span style={{ width: 16, height: 2, display: 'inline-block', backgroundColor: GOLD, borderRadius: 1 }} /> Sessions</span>
                    <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: COCONUT }}><span style={{ width: 16, height: 2, display: 'inline-block', backgroundColor: FOREST, borderRadius: 1 }} /> Users</span>
                  </div>
                </div>
                {gaData.trend.length > 0 ? (
                  <DualLineChart
                    data={gaData.trend.map(d => ({ label: d.date, current: d.sessions, prev: d.users }))}
                    color={GOLD}
                  />
                ) : <p style={{ fontSize: 13, color: COCONUT }}>No trend data.</p>}
              </div>

              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                {/* Traffic sources */}
                <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
                  <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Traffic Sources</h2>
                  {gaData.sources.length > 0 ? (
                    <div className="space-y-3">
                      {gaData.sources.map((s, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <span style={{ fontSize: 13, color: CHARCOAL }}>{s.source}</span>
                            <span style={{ fontSize: 12, color: COCONUT }}>{s.sessions.toLocaleString()} sessions · {s.pct}%</span>
                          </div>
                          <div className="rounded-full overflow-hidden" style={{ height: 6, backgroundColor: SAND }}>
                            <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: GOLD }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ fontSize: 13, color: COCONUT }}>No source data.</p>}
                </div>

                {/* Devices */}
                <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
                  <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Devices</h2>
                  {gaData.devices.length > 0 ? (
                    <>
                      <DonutChart
                        data={gaData.devices.map((d, i) => ({
                          name: d.device.charAt(0).toUpperCase() + d.device.slice(1),
                          pct: d.pct,
                          color: [GOLD, FOREST, TERRACOTTA, COCONUT][i] ?? COCONUT,
                        }))}
                        total={gaData.metrics.sessions}
                      />
                      <div className="mt-3 space-y-1.5 pt-3" style={{ borderTop: `1px solid ${SAND}` }}>
                        {gaData.devices.map((d, i) => (
                          <div key={i} className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [GOLD, FOREST, TERRACOTTA, COCONUT][i] ?? COCONUT }} />
                              <span style={{ fontSize: 12, color: COCONUT }}>{d.device.charAt(0).toUpperCase() + d.device.slice(1)}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>{d.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <p style={{ fontSize: 13, color: COCONUT }}>No device data.</p>}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Top pages */}
                <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
                  <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Top Pages</h2>
                  {gaData.topPages.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${SAND}` }}>
                            {['Page', 'Sessions', 'Users'].map(h => (
                              <th key={h} style={{ padding: '0 8px 8px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {gaData.topPages.map((p, i) => (
                            <tr key={i} style={{ borderBottom: i < gaData.topPages.length - 1 ? `1px solid ${IVORY}` : 'none' }}>
                              <td style={{ padding: '10px 8px', fontSize: 12, color: CHARCOAL, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.path}</td>
                              <td style={{ padding: '10px 8px', fontSize: 12, color: CHARCOAL }}>{p.sessions.toLocaleString()}</td>
                              <td style={{ padding: '10px 8px', fontSize: 12, color: COCONUT }}>{p.users.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p style={{ fontSize: 13, color: COCONUT }}>No page data.</p>}
                </div>

                {/* Countries */}
                <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
                  <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL }}>Top Countries</h2>
                  {gaData.countries.length > 0 ? (
                    <div className="space-y-3">
                      {gaData.countries.map((c, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <span style={{ fontSize: 13, color: CHARCOAL }}>{c.country}</span>
                            <span style={{ fontSize: 12, color: COCONUT }}>{c.users.toLocaleString()} users · {c.pct}%</span>
                          </div>
                          <div className="rounded-full overflow-hidden" style={{ height: 6, backgroundColor: SAND }}>
                            <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: FOREST }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ fontSize: 13, color: COCONUT }}>No country data.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Events Panel ─────────────────────────────────────────────────────────────

function EventsPanel() {
  const [filter, setFilter]   = useState('All')
  const [search, setSearch]   = useState('')
  const [events, setEvents]   = useState<AdminEvent[]>([])

  useEffect(() => { getAdminEventsAction().then(setEvents) }, [])

  const setStatus = async (id: string, s: string) => {
    const toEnum: Record<string, string> = { Published: 'PUBLISHED', Draft: 'DRAFT', Cancelled: 'CANCELLED' }
    await adminUpdateEventStatusAction(id, toEnum[s] ?? 'DRAFT')
    setEvents(p => p.map(e => e.id === id ? { ...e, status: s } : e))
  }
  const remove    = async (id: string) => {
    await adminDeleteEventAction(id)
    setEvents(p => p.filter(e => e.id !== id))
  }

  const visible = useMemo(() => {
    let list = filter === 'All' ? events : events.filter(e => e.status === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.host.toLowerCase().includes(q))
    }
    return list
  }, [events, filter, search])

  const published = events.filter(e => e.status === 'Published').length
  const upcoming  = events.filter(e => e.status === 'Published' && new Date(e.date) >= new Date()).length

  return (
    <div>
      <PageHeader title="Events" sub={`${events.length} total · ${published} published · ${upcoming} upcoming`} />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Events',      value: events.length.toString(),                                            color: CHARCOAL },
          { label: 'Published',         value: published.toString(),                                                color: FOREST   },
          { label: 'Upcoming',          value: upcoming.toString(),                                                 color: GOLD     },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 11, color: COCONUT }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search title or host…" />
      </div>

      <div className="overflow-x-auto mb-5 scrollbar-none">
        <div className="inline-flex gap-1 bg-white rounded-xl p-1" style={{ border: `1px solid ${SAND}` }}>
          {['All', 'Published', 'Draft', 'Cancelled'].map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: filter === t ? 600 : 400, backgroundColor: filter === t ? CHARCOAL : 'transparent', color: filter === t ? 'white' : COCONUT, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              {t} <span style={{ opacity: 0.5, fontSize: 11 }}>{t === 'All' ? events.length : events.filter(e => e.status === t).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map(ev => {
          const d = new Date(ev.date)
          const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
          const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          const isPast  = d < new Date()
          return (
            <div key={ev.id} className="bg-white rounded-xl p-4" style={{ border: `1px solid ${ev.status === 'Cancelled' ? '#FECACA' : SAND}` }}>
              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL }}>{ev.title}</span>
                    <StatusBadge status={isPast && ev.status === 'Published' ? 'Completed' : ev.status} />
                    {isPast && <span style={{ fontSize: 11, color: COCONUT }}>· Past event</span>}
                  </div>
                  <p style={{ fontSize: 12, color: COCONUT }}>by {ev.host}</p>
                </div>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: CHARCOAL, flexShrink: 0 }}>
                  IDR {ev.price.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                <span className="flex items-center gap-1" style={{ fontSize: 12, color: COCONUT }}>
                  <CalendarDays size={11} /> {dateStr} · {timeStr}
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: 12, color: COCONUT }}>
                  <MapPin size={11} /> {ev.location}
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: 12, color: COCONUT }}>
                  <Users size={11} /> Max {ev.capacity}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3" style={{ borderTop: `1px solid ${IVORY}` }}>
                {ev.status === 'Draft' && (
                  <button onClick={() => setStatus(ev.id, 'Published')}
                    className="flex items-center gap-1 hover:opacity-90"
                    style={{ height: 30, padding: '0 12px', borderRadius: 8, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Globe size={11} /> Publish
                  </button>
                )}
                {ev.status === 'Published' && !isPast && (
                  <button onClick={() => setStatus(ev.id, 'Cancelled')}
                    className="flex items-center gap-1 hover:opacity-80"
                    style={{ height: 30, padding: '0 12px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 12, fontWeight: 600, color: TERRACOTTA, cursor: 'pointer' }}>
                    <XCircle size={11} /> Cancel
                  </button>
                )}
                {ev.status === 'Cancelled' && (
                  <button onClick={() => setStatus(ev.id, 'Draft')}
                    className="flex items-center gap-1 hover:opacity-90"
                    style={{ height: 30, padding: '0 12px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 12, fontWeight: 600, color: COCONUT, cursor: 'pointer' }}>
                    <RefreshCw size={11} /> Restore to Draft
                  </button>
                )}
                <button onClick={() => remove(ev.id)}
                  className="flex items-center gap-1 hover:bg-red-50 transition-colors"
                  style={{ height: 30, padding: '0 12px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 12, fontWeight: 600, color: TERRACOTTA, cursor: 'pointer' }}>
                  <Trash2 size={11} /> Remove
                </button>
                {ev.status === 'Published' && (
                  <a href={`/events/${ev.slug}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity ml-auto"
                    style={{ height: 30, padding: '0 12px', borderRadius: 8, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 12, fontWeight: 600, color: COCONUT, cursor: 'pointer', textDecoration: 'none' }}>
                    <Eye size={11} /> View page
                  </a>
                )}
              </div>
            </div>
          )
        })}

        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl" style={{ border: `1px solid ${SAND}` }}>
            <Ticket size={28} style={{ color: GOLD, marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: CHARCOAL }}>No events found</p>
            <p style={{ fontSize: 13, color: COCONUT, marginTop: 4 }}>Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Settings Panel ────────────────────────────────────────────────────────────

const PLATFORM_DEFAULTS = {
  platformName:     'Balible',
  ownerEmail:       'reggy.caesar@gmail.com',
  supportEmail:     'support@balible.com',
  currency:         'IDR (Indonesian Rupiah)',
}

const NOTIF_DEFAULTS = { newHost: true, newBooking: false, flaggedReview: true, weeklyReport: true }

// ── Newsletter panel ──────────────────────────────────────────────────────────

function NewsletterPanel() {
  const [subs, setSubs] = useState<NewsletterSub[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getNewsletterSubscribersAction().then(d => { setSubs(d); setLoading(false) })
  }, [])

  const filtered = search
    ? subs.filter(s => s.email.toLowerCase().includes(search.toLowerCase()) || s.source.toLowerCase().includes(search.toLowerCase()))
    : subs

  const exportCSV = () => {
    const rows = ['Email,Source,Joined', ...subs.map(s => `${s.email},${s.source},${s.joinedAt}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'newsletter-subscribers.csv'; a.click()
  }

  const remove = async (id: string) => {
    await deleteNewsletterSubAction(id)
    setSubs(p => p.filter(s => s.id !== id))
  }

  return (
    <div>
      <PageHeader title="Newsletter Subscribers" sub="Manage email list and export contacts" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Subscribers', value: subs.length.toString(), color: CHARCOAL },
          { label: 'Homepage Sign-ups',  value: subs.filter(s => s.source === 'homepage').length.toString(),  color: FOREST },
          { label: 'Other Sources',     value: subs.filter(s => s.source !== 'homepage').length.toString(), color: GOLD },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 lg:p-5" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 12, color: COCONUT }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Subscriber List</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COCONUT }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search emails…"
                style={{ height: 34, paddingLeft: 32, paddingRight: 12, borderRadius: 8, border: `1px solid ${SAND}`, fontSize: 13, color: CHARCOAL, outline: 'none', width: 200 }} />
            </div>
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 hover:opacity-90"
              style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', backgroundColor: CHARCOAL, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ fontSize: 13, color: COCONUT, padding: '24px 0', textAlign: 'center' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: COCONUT, padding: '24px 0', textAlign: 'center' }}>No subscribers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${SAND}` }}>
                  {['Email', 'Source', 'Joined', ''].map(h => (
                    <th key={h} style={{ padding: '0 12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${IVORY}` : 'none' }}>
                    <td style={{ padding: '12px 12px', fontSize: 13, color: CHARCOAL }}>{s.email}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: IVORY, color: COCONUT }}>{s.source}</span>
                    </td>
                    <td style={{ padding: '12px 12px', fontSize: 12, color: COCONUT }}>{s.joinedAt}</td>
                    <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                      <button onClick={() => remove(s.id)} title="Remove"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <Trash2 size={14} style={{ color: TERRACOTTA }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Broadcast panel ───────────────────────────────────────────────────────────

function BroadcastPanel() {
  const [target, setTarget] = useState<'all' | 'tourists' | 'operators'>('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [href, setHref] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; count: number; error?: string } | null>(null)

  const send = async () => {
    if (!title.trim() || !body.trim()) return
    setSending(true); setResult(null)
    const r = await sendBroadcastAction(target, title.trim(), body.trim(), href.trim() || undefined)
    setResult(r); setSending(false)
    if (r.ok) { setTitle(''); setBody(''); setHref('') }
  }

  const targetLabels = { all: 'All Users', tourists: 'Travelers Only', operators: 'Hosts Only' }

  return (
    <div>
      <PageHeader title="Broadcast Notifications" sub="Send platform-wide announcements to users" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compose */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-5" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Compose Message</h2>

          {/* Target selector */}
          <div className="mb-4">
            <p style={{ fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Send To</p>
            <div className="flex gap-2">
              {(['all', 'tourists', 'operators'] as const).map(t => (
                <button key={t} onClick={() => setTarget(t)}
                  style={{
                    height: 34, padding: '0 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: target === t ? 'none' : `1px solid ${SAND}`,
                    backgroundColor: target === t ? CHARCOAL : 'white',
                    color: target === t ? 'white' : COCONUT,
                  }}>
                  {targetLabels[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <p style={{ fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Title</p>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title…"
              style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: `1px solid ${SAND}`, fontSize: 14, color: CHARCOAL, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Body */}
          <div className="mb-4">
            <p style={{ fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Message</p>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message…" rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${SAND}`, fontSize: 14, color: CHARCOAL, outline: 'none', resize: 'vertical', fontFamily: 'var(--font-inter)', boxSizing: 'border-box' }} />
          </div>

          {/* Link (optional) */}
          <div className="mb-5">
            <p style={{ fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Link (optional)</p>
            <input value={href} onChange={e => setHref(e.target.value)} placeholder="/experiences  or  /dashboard"
              style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: `1px solid ${SAND}`, fontSize: 13, color: CHARCOAL, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {result && (
            <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: result.ok ? '#F0F7F2' : '#FEF2F2', border: `1px solid ${result.ok ? '#C3E6D0' : '#FECACA'}` }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: result.ok ? FOREST : TERRACOTTA }}>
                {result.ok ? `✓ Sent to ${result.count} user${result.count !== 1 ? 's' : ''}` : `Error: ${result.error ?? 'Failed to send'}`}
              </p>
            </div>
          )}

          <button onClick={send} disabled={sending || !title.trim() || !body.trim()}
            className="flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
            style={{ height: 42, padding: '0 20px', borderRadius: 10, border: 'none', backgroundColor: GOLD, color: 'white', fontSize: 14, fontWeight: 700, cursor: sending ? 'wait' : 'pointer' }}>
            <Send size={15} /> {sending ? 'Sending…' : 'Send Notification'}
          </button>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl p-6" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Preview</h2>
          <div className="rounded-xl p-4" style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, backgroundColor: GOLD }}>
                <Bell size={16} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, lineHeight: 1.3 }}>{title || 'Notification title'}</p>
                <p style={{ fontSize: 11, color: COCONUT, marginTop: 2 }}>Balible · now</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: COCONUT, lineHeight: 1.5 }}>{body || 'Your message will appear here…'}</p>
            {href && (
              <p className="mt-3" style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>→ {href}</p>
            )}
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: IVORY }}>
            <p style={{ fontSize: 12, color: COCONUT }}>Recipients: <strong style={{ color: CHARCOAL }}>{targetLabels[target]}</strong></p>
            <p style={{ fontSize: 11, color: COCONUT, marginTop: 4 }}>Notifications appear in each user's bell menu on their next login.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Featured Content Panel ────────────────────────────────────────────────────

function FeaturedPanel() {
  const [exps, setExps]       = useState<AdminExp[]>([])
  const [featured, setFeatured] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      getAdminExperiencesAction(),
      getAdminSettingsAction(['featured_experience_ids']),
    ]).then(([e, s]) => {
      setExps(e)
      try { setFeatured(s.featured_experience_ids ? JSON.parse(s.featured_experience_ids) : []) } catch { setFeatured([]) }
    })
  }, [])

  const active = exps.filter(e => e.status === 'Active')
  const orderedFeatured = featured.filter(id => active.find(e => e.id === id))
  const isFull = orderedFeatured.length >= 6

  const toggle = (id: string) => setFeatured(prev => prev.includes(id) ? prev.filter(x => x !== id) : isFull ? prev : [...prev, id])
  const moveUp   = (id: string) => setFeatured(prev => { const i = prev.indexOf(id); if (i <= 0) return prev; const n = [...prev]; [n[i-1], n[i]] = [n[i], n[i-1]]; return n })
  const moveDown = (id: string) => setFeatured(prev => { const i = prev.indexOf(id); if (i >= prev.length - 1) return prev; const n = [...prev]; [n[i], n[i+1]] = [n[i+1], n[i]]; return n })

  const save = async () => {
    setSaving(true)
    await saveAdminSettingsAction({ featured_experience_ids: JSON.stringify(featured) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <PageHeader title="Featured Content" sub={`${orderedFeatured.length}/6 slots · shown in the homepage spotlight`}
        action={
          <button onClick={save} disabled={saving} style={{ height: 38, padding: '0 20px', borderRadius: 10, border: 'none', backgroundColor: saved ? FOREST : CHARCOAL, color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'background 0.2s' }}>
            {saved ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Check size={13} /> Saved</span> : saving ? 'Saving…' : 'Save Order'}
          </button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Ordered featured slots */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Featured Slots</h2>
            <span style={{ fontSize: 12, color: COCONUT, backgroundColor: IVORY, padding: '3px 10px', borderRadius: 20 }}>{orderedFeatured.length}/6</span>
          </div>
          {orderedFeatured.length === 0 ? (
            <div className="py-10 text-center">
              <Sparkles size={24} style={{ color: SAND, margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: COCONUT }}>No featured experiences yet. Select from the right.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orderedFeatured.map((id, idx) => {
                const exp = active.find(e => e.id === id)
                if (!exp) return null
                return (
                  <div key={id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, width: 18, flexShrink: 0 }}>#{idx + 1}</span>
                    <img src={exp.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.title}</p>
                      <p style={{ fontSize: 11, color: COCONUT }}>{exp.area}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveUp(id)} disabled={idx === 0}
                        style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${SAND}`, background: 'white', cursor: idx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === 0 ? 0.35 : 1 }}>
                        <ChevronUp size={13} style={{ color: COCONUT }} />
                      </button>
                      <button onClick={() => moveDown(id)} disabled={idx === orderedFeatured.length - 1}
                        style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${SAND}`, background: 'white', cursor: idx === orderedFeatured.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === orderedFeatured.length - 1 ? 0.35 : 1 }}>
                        <ChevronDown size={13} style={{ color: COCONUT }} />
                      </button>
                      <button onClick={() => toggle(id)}
                        style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${SAND}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TERRACOTTA }}>
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* All active experiences to pick from */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>All Active Experiences</h2>
          <div className="space-y-2" style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
            {active.map(exp => {
              const isFeatured = featured.includes(exp.id)
              return (
                <div key={exp.id} onClick={() => toggle(exp.id)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors"
                  style={{ border: `1px solid ${isFeatured ? GOLD : SAND}`, backgroundColor: isFeatured ? '#FFFDF9' : 'white' }}>
                  <img src={exp.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 500, color: CHARCOAL, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.title}</p>
                    <p style={{ fontSize: 11, color: COCONUT }}>{exp.area}</p>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${isFeatured ? GOLD : SAND}`, backgroundColor: isFeatured ? GOLD : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isFeatured && <Check size={11} style={{ color: 'white' }} />}
                  </div>
                </div>
              )
            })}
            {active.length === 0 && <p style={{ fontSize: 13, color: COCONUT, textAlign: 'center', padding: '20px 0' }}>Loading…</p>}
          </div>
          {isFull && <p className="mt-3" style={{ fontSize: 12, color: GOLD }}>6 slots filled. Remove one to add another.</p>}
        </div>
      </div>

      {/* Preview strip */}
      <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
        <h2 className="mb-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Homepage Preview</h2>
        <p className="mb-4" style={{ fontSize: 12, color: COCONUT }}>These appear in the "Featured Experiences" section on the homepage.</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {orderedFeatured.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 rounded-xl flex items-center justify-center"
                  style={{ width: 160, height: 110, border: `2px dashed ${SAND}`, backgroundColor: IVORY }}>
                  <span style={{ fontSize: 11, color: COCONUT }}>Slot {i + 1}</span>
                </div>
              ))
            : orderedFeatured.map((id, i) => {
                const exp = active.find(e => e.id === id)
                if (!exp) return null
                return (
                  <div key={id} className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 160, position: 'relative' }}>
                    <img src={exp.image} alt="" style={{ width: 160, height: 110, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', top: 6, left: 6, backgroundColor: GOLD, borderRadius: 12, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: 'white' }}>#{i + 1}</div>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                    <p style={{ position: 'absolute', bottom: 6, left: 6, right: 6, fontSize: 11, fontWeight: 600, color: 'white', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{exp.title}</p>
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}

// ── Activity Log Panel ────────────────────────────────────────────────────────

const ACTIVITY_ITEMS: { id: number; type: string; icon: string; actor: string; action: string; time: string }[] = []

const ACT_FILTERS = [
  { id: 'all',     label: 'All'      },
  { id: 'booking', label: 'Bookings' },
  { id: 'host',    label: 'Hosts'    },
  { id: 'review',  label: 'Reviews'  },
  { id: 'exp',     label: 'Listings' },
  { id: 'user',    label: 'Users'    },
  { id: 'payout',  label: 'Payouts'  },
  { id: 'cancel',  label: 'Cancels'  },
]

function ActivityLogPanel() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const visible = ACTIVITY_ITEMS.filter(a => {
    if (filter !== 'all' && a.type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!a.actor.toLowerCase().includes(q) && !a.action.toLowerCase().includes(q)) return false
    }
    return true
  })

  const exportCSV = () => {
    const rows = [['Time', 'Actor', 'Action', 'Type'], ...ACTIVITY_ITEMS.map(a => [a.time, a.actor, a.action, a.type])]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'activity-log.csv'; a.click()
  }

  return (
    <div>
      <PageHeader title="Activity Log" sub="Recent platform events — bookings, hosts, reviews, users"
        action={
          <button onClick={exportCSV} className="flex items-center gap-2 hover:opacity-80"
            style={{ height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 13, color: COCONUT, cursor: 'pointer' }}>
            <Download size={13} /> Export CSV
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search actor or action…" />
      </div>

      <div className="overflow-x-auto mb-5 scrollbar-none">
        <div className="inline-flex gap-1 bg-white rounded-xl p-1" style={{ border: `1px solid ${SAND}` }}>
          {ACT_FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: filter === f.id ? 600 : 400, backgroundColor: filter === f.id ? CHARCOAL : 'transparent', color: filter === f.id ? 'white' : COCONUT, border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {f.label}
              {f.id !== 'all' && <span style={{ marginLeft: 4, opacity: 0.5, fontSize: 11 }}>{ACTIVITY_ITEMS.filter(a => a.type === f.id).length}</span>}
              {f.id === 'all' && <span style={{ marginLeft: 4, opacity: 0.5, fontSize: 11 }}>{ACTIVITY_ITEMS.length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${SAND}` }}>
        {visible.length === 0 && (
          <div className="py-12 text-center">
            <p style={{ fontSize: 13, color: COCONUT }}>No activity recorded yet.</p>
            <p style={{ fontSize: 12, color: COCONUT, opacity: 0.6, marginTop: 4 }}>Activity log requires an audit table — bookings, reviews and host actions will appear here.</p>
          </div>
        )}
        {visible.map((item, i) => (
          <div key={item.id} className="flex items-start gap-4 px-5 py-4 hover:bg-stone-50 transition-colors"
            style={{ borderBottom: i < visible.length - 1 ? `1px solid ${IVORY}` : 'none' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: IVORY }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 14, color: CHARCOAL, lineHeight: 1.4 }}>
                <strong style={{ fontWeight: 600 }}>{item.actor}</strong>{' '}
                <span style={{ color: COCONUT }}>{item.action}</span>
              </p>
            </div>
            <span style={{ fontSize: 12, color: COCONUT, flexShrink: 0, whiteSpace: 'nowrap', marginTop: 2 }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SEO Panel ─────────────────────────────────────────────────────────────────

const DEFAULT_SEO = {
  home:         { title: 'Balible — Book Bali Experiences with Local Hosts',            description: 'Discover authentic Bali experiences — pottery, yoga, cooking, surf & more. Book directly with local hosts.', keywords: 'Bali experiences, Bali activities, book Bali tour' },
  search:       { title: 'Search Experiences in Bali — Balible',                        description: 'Browse 100+ curated Bali experiences by area, category and price. Instant booking available.',               keywords: 'Bali tour booking, Bali workshops, Bali classes' },
  experiences:  { title: 'Experience Bali with Expert Local Hosts',                     description: 'Authentic, hands-on Bali experiences led by locals. Art, wellness, culture, food, surf & more.',              keywords: 'Bali local experiences, authentic Bali activities' },
  destinations: { title: 'Explore Bali Destinations — Balible',                         description: 'Discover Ubud, Canggu, Seminyak, Kuta, Uluwatu & more. Find local experiences in every Bali region.',        keywords: 'Bali destinations, Ubud experiences, Canggu activities' },
  for_hosts:    { title: 'Become a Balible Host — Share Your Bali',                     description: 'Join Balible as a host and earn money sharing your skills with travelers from around the world.',             keywords: 'Bali host, share experience Bali, earn money Bali' },
  about:        { title: 'About Balible — Our Story',                                   description: "Balible connects travelers with Bali's most passionate local hosts for authentic cultural experiences.",        keywords: 'about Balible, Bali experience platform' },
}
type SEOKey = keyof typeof DEFAULT_SEO
const SEO_LABELS: Record<SEOKey, string> = { home: 'Homepage', search: 'Search / Listings', experiences: 'Experience Detail', destinations: 'Destinations', for_hosts: 'For Hosts', about: 'About' }

function SEOPanel() {
  const [seo, setSeo]     = useState<typeof DEFAULT_SEO>(DEFAULT_SEO)
  const [active, setActive] = useState<SEOKey>('home')
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAdminSettingsAction(['seo']).then(s => {
      try { if (s.seo) setSeo(JSON.parse(s.seo)) } catch {}
    })
  }, [])

  const update = (key: string, val: string) => setSeo(s => ({ ...s, [active]: { ...s[active], [key]: val } }))
  const save = async () => {
    setSaving(true)
    await saveAdminSettingsAction({ seo: JSON.stringify(seo) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const current = seo[active]

  const inputStyle = { width: '100%', borderRadius: 10, border: `1px solid ${SAND}`, padding: '0 12px', fontSize: 13, fontFamily: 'var(--font-inter)', color: CHARCOAL, outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div>
      <PageHeader title="SEO Settings" sub="Manage page titles, meta descriptions and keywords"
        action={
          <button onClick={save} disabled={saving} style={{ height: 38, padding: '0 20px', borderRadius: 10, border: 'none', backgroundColor: saved ? FOREST : CHARCOAL, color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'background 0.2s' }}>
            {saved ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Check size={13} /> Saved</span> : saving ? 'Saving…' : 'Save All'}
          </button>
        }
      />

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Page list */}
        <div className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Pages</p>
          <div className="space-y-1">
            {(Object.keys(SEO_LABELS) as SEOKey[]).map(k => (
              <button key={k} onClick={() => setActive(k)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{ fontSize: 13, fontWeight: active === k ? 600 : 400, color: active === k ? CHARCOAL : COCONUT, backgroundColor: active === k ? IVORY : 'transparent', border: 'none', cursor: 'pointer' }}>
                <Globe size={13} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{SEO_LABELS[k]}</span>
                {active === k && <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD, display: 'block', flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Editor + preview */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
            <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>{SEO_LABELS[active]}</h2>
            <div className="space-y-4">
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 5 }}>
                  Page Title <span style={{ fontWeight: 400 }}>({current.title.length}/60)</span>
                </label>
                <input value={current.title} onChange={e => update('title', e.target.value)} maxLength={60} style={{ ...inputStyle, height: 40 }} />
                {current.title.length > 55 && <p style={{ fontSize: 11, color: TERRACOTTA, marginTop: 3 }}>Aim for under 60 chars</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 5 }}>
                  Meta Description <span style={{ fontWeight: 400 }}>({current.description.length}/160)</span>
                </label>
                <textarea value={current.description} onChange={e => update('description', e.target.value)} rows={3} maxLength={160}
                  style={{ ...inputStyle, padding: '10px 12px', resize: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 5 }}>Keywords <span style={{ fontWeight: 400 }}>(comma-separated)</span></label>
                <input value={current.keywords} onChange={e => update('keywords', e.target.value)} placeholder="keyword1, keyword2" style={{ ...inputStyle, height: 40 }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Google Preview</p>
            <div className="p-4 rounded-lg" style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}>
              <p style={{ fontSize: 14, color: '#1A0DAB', fontWeight: 600, marginBottom: 2 }}>{current.title || 'Page title'}</p>
              <p style={{ fontSize: 12, color: FOREST, marginBottom: 4 }}>balible.com/</p>
              <p style={{ fontSize: 13, color: '#545454', lineHeight: 1.5 }}>{current.description || 'Meta description will appear here…'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Emails Panel ──────────────────────────────────────────────────────────────

const BASE_TEMPLATES = {
  confirmation: {
    label: 'Booking Confirmation',
    subject: 'Your Balible booking is confirmed! 🌴',
    body: `Hi {{guest_name}},

Your booking for {{experience_title}} has been confirmed!

📅 Date: {{booking_date}}
⏰ Time: {{booking_time}}
👥 Guests: {{guest_count}}
📍 Meeting point: {{meeting_point}}

Your booking reference is {{booking_ref}}.

We'll see you soon,
{{host_name}} & the Balible team`,
  },
  cancellation: {
    label: 'Booking Cancellation',
    subject: 'Your Balible booking has been cancelled',
    body: `Hi {{guest_name}},

We're sorry to let you know that your booking for {{experience_title}} on {{booking_date}} has been cancelled.

Booking ref: {{booking_ref}}

A full refund will be processed within 5–7 business days. We'd love to help you find another experience at balible.com/search.

With apologies,
The Balible team`,
  },
  host_alert: {
    label: 'New Booking Alert (Host)',
    subject: 'New booking — {{experience_title}}',
    body: `Hi {{host_name}},

You have a new booking for {{experience_title}}.

Guest: {{guest_name}}
Date: {{booking_date}} at {{booking_time}}
Guests: {{guest_count}}
Total: IDR {{booking_total}}

Please confirm in your host dashboard within 24 hours → balible.com/dashboard

The Balible team`,
  },
  review_request: {
    label: 'Review Request (Post-Stay)',
    subject: 'How was your experience with {{host_name}}?',
    body: `Hi {{guest_name}},

We hope you had an amazing time at {{experience_title}}!

Would you take 2 minutes to leave a review? Your feedback helps other travelers discover great local experiences in Bali.

✍️ Leave a review → balible.com/profile?tab=reviews

The Balible team`,
  },
}
type EmailKey = keyof typeof BASE_TEMPLATES

function EmailsPanel() {
  const [active, setActive] = useState<EmailKey>('confirmation')
  const [templates, setTemplates] = useState<typeof BASE_TEMPLATES>(BASE_TEMPLATES)
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [saved, setSaved]     = useState(false)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    getAdminSettingsAction(['email_templates']).then(s => {
      try { if (s.email_templates) setTemplates(JSON.parse(s.email_templates)) } catch {}
    })
  }, [])

  const current = templates[active]
  const update  = (key: 'subject' | 'body', val: string) => setTemplates(t => ({ ...t, [active]: { ...t[active], [key]: val } }))
  const save    = async () => {
    setSaving(true)
    await saveAdminSettingsAction({ email_templates: JSON.stringify(templates) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const sendTest = async () => {
    setSending(true); await new Promise(r => setTimeout(r, 1200)); setSending(false)
    setSent(true); setTimeout(() => setSent(false), 3000)
  }

  const inputStyle = { width: '100%', borderRadius: 10, border: `1px solid ${SAND}`, padding: '0 12px', fontSize: 13, fontFamily: 'var(--font-inter)', color: CHARCOAL, outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div>
      <PageHeader title="Email Templates" sub="Manage notification emails sent to guests and hosts"
        action={
          <div className="flex items-center gap-2">
            <button onClick={sendTest} disabled={sending}
              style={{ height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${SAND}`, backgroundColor: 'white', fontSize: 13, fontWeight: 600, color: sent ? FOREST : COCONUT, cursor: 'pointer' }}>
              {sending ? 'Sending…' : sent ? '✓ Test Sent' : 'Send Test'}
            </button>
            <button onClick={save} disabled={saving} style={{ height: 38, padding: '0 20px', borderRadius: 10, border: 'none', backgroundColor: saved ? FOREST : CHARCOAL, color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'background 0.2s' }}>
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Templates'}
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Template list */}
        <div className="bg-white rounded-xl p-4" style={{ border: `1px solid ${SAND}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Templates</p>
          <div className="space-y-1">
            {(Object.keys(BASE_TEMPLATES) as EmailKey[]).map(k => (
              <button key={k} onClick={() => setActive(k)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left"
                style={{ fontSize: 13, fontWeight: active === k ? 600 : 400, color: active === k ? CHARCOAL : COCONUT, backgroundColor: active === k ? IVORY : 'transparent', border: 'none', cursor: 'pointer', lineHeight: 1.4 }}>
                <Mail size={13} style={{ flexShrink: 0 }} />
                {BASE_TEMPLATES[k].label}
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 11, color: COCONUT, lineHeight: 1.5 }}>
              Use <code style={{ backgroundColor: SAND, padding: '1px 4px', borderRadius: 3, fontSize: 10 }}>{`{{variable}}`}</code> placeholders — filled automatically from booking data.
            </p>
          </div>
        </div>

        {/* Editor + preview */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
            <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>{current.label}</h2>
            <div className="space-y-4">
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 5 }}>Subject Line</label>
                <input value={current.subject} onChange={e => update('subject', e.target.value)} style={{ ...inputStyle, height: 40 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COCONUT, marginBottom: 5 }}>Email Body</label>
                <textarea value={current.body} onChange={e => update('body', e.target.value)} rows={10}
                  style={{ ...inputStyle, padding: '10px 12px', resize: 'vertical', lineHeight: 1.6 }} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: COCONUT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Email Preview</p>
            <div style={{ backgroundColor: IVORY, borderRadius: 12, overflow: 'hidden', border: `1px solid ${SAND}` }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${SAND}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>B</span>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL, margin: 0 }}>Balible <span style={{ fontWeight: 400, color: COCONUT }}>noreply@balible.com</span></p>
                  <p style={{ fontSize: 11, color: COCONUT, margin: 0 }}>{current.subject}</p>
                </div>
              </div>
              <div style={{ padding: '16px', whiteSpace: 'pre-wrap', fontSize: 13, color: CHARCOAL, lineHeight: 1.7, fontFamily: 'var(--font-inter)', maxHeight: 260, overflowY: 'auto' }}>
                {current.body}
              </div>
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${SAND}`, display: 'flex', justifyContent: 'center' }}>
                <div style={{ height: 36, padding: '0 24px', borderRadius: 8, backgroundColor: CHARCOAL, color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  View on Balible →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsPanel() {
  const [commission, setCommission] = useState('10')
  const [serviceFee, setServiceFee] = useState('5')
  const [platform, setPlatform]     = useState(PLATFORM_DEFAULTS)
  const [notifs, setNotifs]         = useState(NOTIF_DEFAULTS)
  const [saved, setSaved]           = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saveErr, setSaveErr]       = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getCommissionRateAction(),
      getAdminSettingsAction(['service_fee', 'platform', 'admin_notifs']),
    ]).then(([rate, s]) => {
      setCommission(String(Math.round(rate * 100)))
      try { if (s.service_fee) setServiceFee(JSON.parse(s.service_fee)) } catch {}
      try { if (s.platform) setPlatform(JSON.parse(s.platform)) } catch {}
      try { if (s.admin_notifs) setNotifs(JSON.parse(s.admin_notifs)) } catch {}
    })
  }, [])

  const save = async () => {
    setSaving(true); setSaveErr(null)
    const [res] = await Promise.all([
      updateCommissionRateAction(parseInt(commission || '0', 10)),
      saveAdminSettingsAction({
        service_fee:  JSON.stringify(serviceFee),
        platform:     JSON.stringify(platform),
        admin_notifs: JSON.stringify(notifs),
      }),
    ])
    setSaving(false)
    if (!res.ok) { setSaveErr(res.error ?? 'Failed to save commission'); return }
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const toggle = (k: keyof typeof notifs) => setNotifs(n => ({ ...n, [k]: !n[k] }))

  const PLATFORM_FIELDS: { label: string; key: keyof typeof PLATFORM_DEFAULTS }[] = [
    { label: 'Platform Name',    key: 'platformName'  },
    { label: 'Owner Email',      key: 'ownerEmail'    },
    { label: 'Support Email',    key: 'supportEmail'  },
    { label: 'Default Currency', key: 'currency'      },
  ]

  return (
    <div>
      <PageHeader title="Platform Settings" sub="Configure Balible platform settings" />

      <div className="space-y-5">
        {/* Platform */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Platform</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PLATFORM_FIELDS.map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: COCONUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                <input
                  value={platform[f.key]}
                  onChange={e => setPlatform(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', height: 42, borderRadius: 10, border: `1px solid ${SAND}`, padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: CHARCOAL, outline: 'none' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Fees */}
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${SAND}` }}>
          <h2 className="mb-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: CHARCOAL }}>Fees</h2>
          <p style={{ fontSize: 13, color: COCONUT, marginBottom: 16 }}>Commission is deducted from host payouts. Service fee is added on top of the price for customers at checkout.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Commission */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: COCONUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Host commission (%)</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text" inputMode="numeric" value={commission}
                  onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); if (v === '' || parseInt(v) <= 100) setCommission(v) }}
                  style={{ width: 100, height: 42, borderRadius: 10, border: `1px solid ${SAND}`, padding: '0 14px', fontSize: 18, fontFamily: 'var(--font-playfair)', fontWeight: 700, color: CHARCOAL, outline: 'none', textAlign: 'center' }} />
                <span style={{ fontSize: 18, color: COCONUT, fontWeight: 700 }}>%</span>
              </div>
              <p style={{ fontSize: 12, color: COCONUT }}>
                Hosts receive <strong>{100 - parseInt(commission || '0')}%</strong> of each booking total.
              </p>
            </div>
            {/* Service fee */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: COCONUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Guest service fee (%)</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text" inputMode="numeric" value={serviceFee}
                  onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); if (v === '' || parseInt(v) <= 100) setServiceFee(v) }}
                  style={{ width: 100, height: 42, borderRadius: 10, border: `1px solid ${SAND}`, padding: '0 14px', fontSize: 18, fontFamily: 'var(--font-playfair)', fontWeight: 700, color: CHARCOAL, outline: 'none', textAlign: 'center' }} />
                <span style={{ fontSize: 18, color: COCONUT, fontWeight: 700 }}>%</span>
              </div>
              <p style={{ fontSize: 12, color: COCONUT }}>
                Added to guest's checkout total. Shown as "Service fee ({serviceFee}%)".
              </p>
            </div>
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

        {saveErr && <p style={{ fontSize: 13, color: TERRACOTTA }}>{saveErr}</p>}
        <button onClick={save} disabled={saving} className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ height: 44, paddingInline: 28, borderRadius: 10, border: 'none', backgroundColor: saved ? FOREST : CHARCOAL, color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'background 0.2s', minWidth: 160 }}>
          {saved ? <><Check size={14} /> Saved!</> : saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function AdminNotifBell({ onNavigate, align = 'left', dark = false, pendingHosts = 0, pendingListings = 0 }: { onNavigate: (section: string) => void; align?: 'left' | 'right'; dark?: boolean; pendingHosts?: number; pendingListings?: number }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const unreadCount = pendingHosts + pendingListings

  const adminNotifs = [
    ...(pendingListings > 0 ? [{ id: 'listings', title: `${pendingListings} listing${pendingListings > 1 ? 's' : ''} pending review`, body: 'New listings need your approval', action: 'experiences', dot: GOLD }] : []),
    ...(pendingHosts > 0    ? [{ id: 'hosts',    title: `${pendingHosts} host application${pendingHosts > 1 ? 's' : ''} pending`,     body: 'New hosts are waiting for approval', action: 'hosts', dot: TERRACOTTA }] : []),
    { id: 'sys', title: 'Platform running normally', body: 'No critical issues detected', action: 'overview', dot: '#4A7C59' },
  ]

  const bellColor = dark ? (unreadCount > 0 ? '#111111' : '#6F675C') : (unreadCount > 0 ? 'white' : 'rgba(255,255,255,0.55)')

  return (
    <div className="relative">
      <button onClick={() => setNotifOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <Bell size={17} style={{ color: bellColor }} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: TERRACOTTA, fontSize: 9, color: 'white', fontWeight: 700 }}>{unreadCount}</span>
        )}
      </button>
      {notifOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
          <div className="absolute top-9 z-50 bg-white rounded-xl shadow-2xl overflow-hidden"
            style={{ [align === 'right' ? 'right' : 'left']: 0, width: 'min(300px, calc(100vw - 32px))', border: '1px solid #E8E4DE' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #E8E4DE' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>Admin Notifications</span>
            </div>
            <div>
              {adminNotifs.map(n => (
                <div key={n.id} onClick={() => { onNavigate(n.action); setNotifOpen(false) }}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: '1px solid #F5F1EB' }}>
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: n.dot }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 2 }}>{n.title}</p>
                      <p style={{ fontSize: 12, color: '#6F675C' }}>{n.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { onNavigate('settings'); setNotifOpen(false) }}
              className="w-full py-3 text-center hover:bg-gray-50 transition-colors"
              style={{ fontSize: 12, color: GOLD, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #E8E4DE' }}>
              Notification settings →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function Sidebar({ activeNav, setActiveNav, pendingHosts = 0, pendingListings = 0 }: { activeNav: string; setActiveNav: (id: string) => void; pendingHosts?: number; pendingListings?: number }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <a href="/" className="flex flex-col gap-1 leading-none" style={{ textDecoration: 'none' }}>
          <img src="/logo-light.png" alt="Balible" style={{ height: 28, width: 'auto', objectFit: 'contain', display: 'block' }} />
          <span style={{ fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>OWNER DASHBOARD</span>
        </a>
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
          const badge = id === 'hosts' ? pendingHosts : id === 'experiences' ? pendingListings : 0
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

      <div className="mx-3 mb-6 space-y-1">
        <a href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
          ← Back to site
        </a>
        <a
          href="/auth/signout"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}
        >
          <LogOut size={14} /> Sign out
        </a>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeNav, setActiveNav]     = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingHosts, setPendingHosts]         = useState(0)
  const [pendingListings, setPendingListings]   = useState(0)

  useEffect(() => {
    getAdminStatsAction().then(s => { setPendingHosts(s.pendingHosts); setPendingListings(s.pendingListings) })
  }, [])

  const renderPanel = () => {
    switch (activeNav) {
      case 'overview':    return <OverviewPanel onNav={setActiveNav} />
      case 'experiences': return <ExperiencesPanel />
      case 'events':      return <EventsPanel />
      case 'hosts':       return <HostsPanel />
      case 'bookings':    return <BookingsPanel />
      case 'users':       return <UsersPanel />
      case 'reviews':     return <ReviewsPanel />
      case 'payments':    return <PaymentsPanel />
      case 'analytics':   return <AnalyticsPanel />
      case 'featured':    return <FeaturedPanel />
      case 'activity':    return <ActivityLogPanel />
      case 'seo':         return <SEOPanel />
      case 'emails':      return <EmailsPanel />
      case 'newsletter':  return <NewsletterPanel />
      case 'broadcast':   return <BroadcastPanel />
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
            <Sidebar activeNav={activeNav} setActiveNav={id => { setActiveNav(id); setSidebarOpen(false) }} pendingHosts={pendingHosts} pendingListings={pendingListings} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: 240, backgroundColor: CHARCOAL, minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} pendingHosts={pendingHosts} pendingListings={pendingListings} />
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
          <AdminNotifBell onNavigate={setActiveNav} align="right" dark pendingHosts={pendingHosts} pendingListings={pendingListings} />
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
