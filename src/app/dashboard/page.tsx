'use client'

import { useState, useRef, useEffect, useMemo, createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Compass, CalendarDays, TrendingUp, Star,
  UserCircle, Settings, LogOut, Bell, Plus, ChevronDown,
  ArrowUpRight, Menu, X, Search, Download,
  MoreHorizontal, Eye, Edit2, Play, Pause, Trash2,
  CheckCircle, XCircle, MapPin, Clock, Users, Camera, Check,
  Ticket, Globe, Lock, ChevronLeft, ChevronRight, CalendarRange, Images,
  MessageCircle, Send,
} from 'lucide-react'
import {
  getHostEvents, createEvent, updateEvent, deleteEvent, updateEventImagesAction,
  type EventRow, type EventInput,
} from '@/lib/event-actions'
import {
  saveExperienceFullAction, type HostListingInput,
  getHostDashboardData, getHostExperiencesAction,
  updateExperienceStatusAction, deleteExperienceAction,
  getOperatorPayoutsAction, type OperatorPayout,
  requestPayoutAction,
  updateBookingStatusAction,
  updateHostProfileAction,
  getOperatorSettingsAction, updateOperatorSettingsAction,
  updateExperienceImagesAction,
  updateExperienceScheduleAction,
  type DashExp, type DashBooking, type DashReview, type EarningsByMonth, type HostProfile,
} from '@/lib/actions'
import { PAYOUT_MIN_NET } from '@/lib/constants'
import {
  listHostConversationsAction, getMessagesAction, sendMessageAction,
  getHostUnreadCountAction, type ConversationSummary, type ChatMessage,
} from '@/lib/chat-actions'

// True when an admin is viewing another host's dashboard read-only — gates all
// mutation controls. Defaults false (a host viewing their own dashboard).
const ReadOnlyContext = createContext(false)

// ── Data ──────────────────────────────────────────────────────────────────────

const EXPERIENCES: DashExp[] = [
  {
    id: 1, slug: 'pottery-making-class',
    title: 'Pottery Making Class', category: 'Art & Craft', area: 'Ubud',
    price: 450000, duration: '2.5 hours', maxGuests: 8,
    rating: 4.9, totalReviews: 128, bookings: 87, status: 'Active',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&auto=format&fit=crop&q=80',
    earnings: 39150000, description: '', meetingPoint: '', includes: [], excludes: [], itinerary: [], images: [], schedule: null, minGuests: 1, subcategory: '',
  },
  {
    id: 2, slug: 'batik-painting-workshop',
    title: 'Batik Painting Workshop', category: 'Art & Craft', area: 'Ubud',
    price: 380000, duration: '3 hours', maxGuests: 6,
    rating: 4.7, totalReviews: 64, bookings: 41, status: 'Active',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&auto=format&fit=crop&q=80',
    earnings: 15580000, description: '', meetingPoint: '', includes: [], excludes: [], itinerary: [], images: [], schedule: null, minGuests: 1, subcategory: '',
  },
  {
    id: 3, slug: 'clay-sculpture-session',
    title: 'Clay Sculpture Session', category: 'Art & Craft', area: 'Ubud',
    price: 520000, duration: '4 hours', maxGuests: 4,
    rating: 4.8, totalReviews: 19, bookings: 12, status: 'Draft',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&auto=format&fit=crop&q=80',
    earnings: 6240000, description: '', meetingPoint: '', includes: [], excludes: [], itinerary: [], images: [], schedule: null, minGuests: 1, subcategory: '',
  },
  {
    id: 4, slug: 'wooden-mask-carving',
    title: 'Wooden Mask Carving Class', category: 'Art & Craft', area: 'Gianyar',
    price: 600000, duration: '5 hours', maxGuests: 4,
    rating: 4.6, totalReviews: 9, bookings: 5, status: 'Paused',
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80',
    earnings: 3000000, description: '', meetingPoint: '', includes: [], excludes: [], itinerary: [], images: [], schedule: null, minGuests: 1, subcategory: '',
  },
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
  { id: 'messages',      label: 'Messages',      Icon: MessageCircle },
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

// ── Withdraw Modal ────────────────────────────────────────────────────────────

function WithdrawModal({ onClose, pendingNet, commissionRate, isRequested, isPaid }: {
  onClose: () => void
  pendingNet: number | null   // null = still loading
  commissionRate: number
  isRequested?: boolean
  isPaid?: boolean
}) {
  const readOnly = useContext(ReadOnlyContext)
  const available = pendingNet ?? 0
  const [amount, setAmount]         = useState(available > 0 ? String(available) : '')
  const [requesting, setRequesting] = useState(false)
  const [result, setResult]         = useState<{ ok: boolean; text: string } | null>(null)

  const parsedAmt = parseInt(amount.replace(/\D/g, ''), 10) || 0
  const canForm   = !isRequested && !isPaid && pendingNet !== null && available >= PAYOUT_MIN_NET
  const isValid   = canForm && parsedAmt >= PAYOUT_MIN_NET && parsedAmt <= available
  const validationMsg = canForm && parsedAmt > 0
    ? parsedAmt < PAYOUT_MIN_NET ? `Minimum withdrawal is ${fmt(PAYOUT_MIN_NET)}`
    : parsedAmt > available     ? `You can withdraw up to ${fmt(available)}`
    : null : null

  const handleConfirm = async () => {
    if (!isValid || readOnly) return
    setRequesting(true)
    const res = await requestPayoutAction(parsedAmt)
    setRequesting(false)
    if (res.ok) {
      setResult({ ok: true, text: `Withdrawal of ${fmt(parsedAmt)} requested! Balible processes within 3 business days.` })
    } else {
      setResult({ ok: false, text: res.error ?? 'Something went wrong.' })
    }
  }

  const closeBtn = (label = 'Close') => (
    <button onClick={onClose} className="w-full mt-5 hover:opacity-90 transition-opacity"
      style={{ height: 44, borderRadius: 10, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
      {label}
    </button>
  )

  // Determine which body to show
  const body = result?.ok ? (
    <div className="p-6 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#F0F7F2' }}>
        <CheckCircle size={28} style={{ color: '#4A7C59' }} />
      </div>
      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111', marginBottom: 8 }}>Request Sent!</p>
      <p style={{ fontSize: 13, color: '#6F675C', lineHeight: 1.55 }}>{result.text}</p>
      {closeBtn('Done')}
    </div>
  ) : isPaid ? (
    <div className="p-6 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#F0F7F2' }}>
        <CheckCircle size={26} style={{ color: '#4A7C59' }} />
      </div>
      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 8 }}>Payout Sent This Month</p>
      <p style={{ fontSize: 13, color: '#6F675C', lineHeight: 1.55 }}>Your earnings for this period have already been paid out. Come back next month to request your next withdrawal.</p>
      {closeBtn()}
    </div>
  ) : isRequested ? (
    <div className="p-6 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#FDF8F4' }}>
        <span style={{ fontSize: 28 }}>⏳</span>
      </div>
      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 8 }}>Withdrawal In Progress</p>
      <p style={{ fontSize: 13, color: '#6F675C', lineHeight: 1.55 }}>Your payout request is being processed. Balible will transfer your earnings within 3 business days.</p>
      {closeBtn()}
    </div>
  ) : pendingNet === null ? (
    <div className="p-10 text-center">
      <p style={{ fontSize: 13, color: '#9E9A94' }}>Loading your balance…</p>
    </div>
  ) : available === 0 ? (
    <div className="p-6 text-center">
      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 8 }}>No Earnings to Withdraw</p>
      <p style={{ fontSize: 13, color: '#6F675C', lineHeight: 1.55 }}>You don't have any confirmed earnings yet. Earnings appear here once guests confirm their bookings.</p>
      {closeBtn()}
    </div>
  ) : available < PAYOUT_MIN_NET ? (
    <div className="p-5">
      <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F5F1EB' }}>
        <p style={{ fontSize: 12, color: '#6F675C' }}>Available balance</p>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#111111', marginTop: 2, lineHeight: 1.1 }}>{fmt(available)}</p>
        <p style={{ fontSize: 11, color: '#9E9A94', marginTop: 3 }}>After {commissionRate}% platform commission</p>
      </div>
      <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#FEF2F2', border: '1px solid #F5D5C5' }}>
        <p style={{ fontSize: 13, color: '#B66A45', lineHeight: 1.55 }}>
          Your balance is below the minimum withdrawal of <strong>{fmt(PAYOUT_MIN_NET)}</strong>.
          Keep earning and come back once you've reached the minimum.
        </p>
      </div>
      {closeBtn()}
    </div>
  ) : (
    /* ── Form (can withdraw) ── */
    <div className="p-5">
      <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#F5F1EB' }}>
        <p style={{ fontSize: 12, color: '#6F675C' }}>Available to withdraw</p>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#111111', marginTop: 2, lineHeight: 1.1 }}>{fmt(available)}</p>
        <p style={{ fontSize: 11, color: '#9E9A94', marginTop: 3 }}>After {commissionRate}% platform commission</p>
      </div>

      <p style={{ fontSize: 12, fontWeight: 600, color: '#6F675C', marginBottom: 6 }}>Amount to withdraw (IDR)</p>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 12, color: '#9E9A94', pointerEvents: 'none' }}>IDR</span>
        <input
          type="text" inputMode="numeric" placeholder="0"
          value={parsedAmt > 0 ? parsedAmt.toLocaleString('id-ID') : amount}
          onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
          style={{ width: '100%', height: 46, borderRadius: 10, border: `1px solid ${validationMsg ? '#B66A45' : '#E8E4DE'}`, paddingLeft: 42, paddingRight: 12, fontSize: 16, fontWeight: 600, color: '#111111', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-inter)' }}
        />
      </div>
      {validationMsg && <p style={{ fontSize: 11, color: '#B66A45', marginTop: 4 }}>{validationMsg}</p>}

      <div className="flex gap-2 mt-3 mb-4">
        <button onClick={() => setAmount(String(available))}
          style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 12, color: '#6F675C', cursor: 'pointer', fontWeight: 500 }}>
          Withdraw all
        </button>
        <button onClick={() => setAmount(String(Math.round(available / 2)))}
          style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 12, color: '#6F675C', cursor: 'pointer', fontWeight: 500 }}>
          Half
        </button>
      </div>

      <p style={{ fontSize: 11, color: '#9E9A94', marginBottom: 14, lineHeight: 1.5 }}>
        Min {fmt(PAYOUT_MIN_NET)} · Processed within 3 business days to your registered bank account.
      </p>

      {result && !result.ok && <p style={{ fontSize: 12, color: '#B66A45', marginBottom: 12, lineHeight: 1.4 }}>{result.text}</p>}

      <div className="flex gap-3">
        <button onClick={onClose} disabled={requesting}
          style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 14, color: '#6F675C', cursor: 'pointer', fontWeight: 500 }}>
          Cancel
        </button>
        <button onClick={handleConfirm} disabled={requesting || !isValid} className="hover:opacity-90 transition-opacity"
          style={{ flex: 2, height: 44, borderRadius: 10, border: 'none', backgroundColor: isValid ? '#111111' : '#E8E4DE', color: isValid ? 'white' : '#9E9A94', fontSize: 14, fontWeight: 600, cursor: isValid && !requesting ? 'pointer' : 'default', transition: 'background 0.2s' }}>
          {requesting ? 'Requesting…' : parsedAmt > 0 && isValid ? `Withdraw ${fmt(parsedAmt)}` : 'Withdraw'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={result?.ok || isPaid || isRequested ? onClose : undefined} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto" style={{ border: '1px solid #E8E4DE' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E8E4DE' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>Withdraw Earnings</span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={18} style={{ color: '#6F675C' }} />
            </button>
          </div>
          {body}
        </div>
      </div>
    </>
  )
}

// ── Overview Panel ────────────────────────────────────────────────────────────

const OVERVIEW_STATS = [
  { label: 'Total Bookings',    value: '—', change: 'Loading…', up: null },
  { label: 'Total Earnings',    value: '—', change: 'Loading…', up: null },
  { label: 'Upcoming Bookings', value: '—', change: 'Next 7 days', up: null },
  { label: 'Average Rating',    value: '—', change: 'Loading…', up: null },
]


function OverviewPanel({ onNav, commissionRate, experiences: liveExperiences, bookings: liveBookings, reviews: liveReviews, hostName, earningsByMonth: liveEarningsByMonth, pendingPayout: livePendingPayout, payouts: livePayouts }: {
  onNav: (id: string) => void; commissionRate: number
  experiences?: DashExp[]; bookings?: DashBooking[]; reviews?: DashReview[]; hostName?: string
  earningsByMonth?: EarningsByMonth[]; pendingPayout?: number; payouts?: OperatorPayout[]
}) {
  const readOnly = useContext(ReadOnlyContext)
  const [period, setPeriod]       = useState('This Month')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const netMult = (100 - commissionRate) / 100
  const expSource = liveExperiences ?? []
  const totalNetEarnings = expSource.reduce((a, e) => a + e.earnings, 0) * netMult

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

  const hasLiveChart = liveEarningsByMonth !== undefined && liveEarningsByMonth.length > 0
  const allChartData   = hasLiveChart ? liveEarningsByMonth.map(m => m.gross) : MONTHLY_EARNINGS
  const allChartLabels = hasLiveChart ? liveEarningsByMonth.map(m => m.month) : MONTHS_SHORT
  const half = Math.floor(allChartData.length / 2)
  const slice  = period === 'This Month' ? allChartData.slice(half)   : allChartData.slice(0, half)
  const labels = period === 'This Month' ? allChartLabels.slice(half) : allChartLabels.slice(0, half)
  const lastMonthGross = allChartData[allChartData.length - 1] ?? 0
  const prevMonthGross = allChartData[allChartData.length - 2] ?? 0
  const momPct = prevMonthGross > 0 ? Math.round(((lastMonthGross - prevMonthGross) / prevMonthGross) * 100) : null

  // Payout / withdraw state
  const pendingNet = livePendingPayout !== undefined ? Math.round(livePendingPayout * netMult) : null
  const nowMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const thisMonthPayout = livePayouts?.find(p => p.periodLabel === nowMonthLabel)
  const isPayoutRequested = thisMonthPayout?.status === 'Requested'
  const isPayoutPaid      = thisMonthPayout?.status === 'Paid'
  const belowMin = pendingNet !== null && pendingNet > 0 && pendingNet < PAYOUT_MIN_NET
  const canWithdraw = pendingNet !== null && pendingNet >= PAYOUT_MIN_NET && !isPayoutRequested && !isPayoutPaid

  return (
    <>
    {withdrawOpen && (
      <WithdrawModal
        pendingNet={pendingNet}
        commissionRate={commissionRate}
        isRequested={isPayoutRequested}
        isPaid={isPayoutPaid}
        onClose={() => setWithdrawOpen(false)}
      />
    )}
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: '#111111' }}>
            Welcome back, {hostName ?? 'Host'}
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
            {liveBookings === undefined ? (
              <p style={{ fontSize: 13, color: '#9E9A94', textAlign: 'center', padding: '20px 0' }}>Loading…</p>
            ) : (() => {
              const upcoming = liveBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').slice(0, 4)
              return upcoming.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9E9A94', textAlign: 'center', padding: '20px 0' }}>No upcoming bookings</p>
              ) : upcoming.map((b, i) => (
                <div key={b.id ?? i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F1EB' }}>
                  <img src={b.expImage} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.experience}</p>
                    <p style={{ fontSize: 12, color: '#6F675C', marginTop: 2 }}>{b.date} · {b.time}</p>
                    <p style={{ fontSize: 12, color: '#6F675C' }}>{b.guests} guest{b.guests > 1 ? 's' : ''}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            })()}
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
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111' }}>{fmt(Math.round(lastMonthGross * netMult))}</span>
              {momPct !== null && (
                <span style={{ fontSize: 12, color: momPct >= 0 ? '#4A7C59' : '#B66A45' }}>
                  {momPct >= 0 ? '↑' : '↓'} {Math.abs(momPct)}%
                </span>
              )}
            </div>
            <MiniChart data={slice} color="#C8A97E" />
            <div className="flex justify-between mt-1 mb-3">
              {labels.map(m => <span key={m} style={{ fontSize: 9, color: '#6F675C' }}>{m}</span>)}
            </div>

            {/* Withdraw button — hidden in admin read-only view */}
            {!readOnly && (
            <button onClick={() => setWithdrawOpen(true)}
              className="w-full flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{ height: 36, borderRadius: 9, border: isPayoutRequested || isPayoutPaid ? '1px solid #E8E4DE' : 'none', backgroundColor: isPayoutRequested || isPayoutPaid ? 'white' : '#111111', color: isPayoutRequested || isPayoutPaid ? '#6F675C' : 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {isPayoutPaid ? 'Payout Sent ✓' : isPayoutRequested ? 'Withdrawal Pending ⏳' : pendingNet !== null && pendingNet > 0 ? `Withdraw ${fmt(pendingNet)}` : 'Withdraw Earnings'}
            </button>
            )}
          </div>

          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
            <h2 className="mb-3" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Top Experiences</h2>
            <div className="space-y-3">
              {expSource.filter(e => e.status === 'Active').map((e, i) => (
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
    </>
  )
}

// ── Experiences Panel ─────────────────────────────────────────────────────────

function ExperiencesPanel({ commissionRate, initialExperiences }: { commissionRate: number; initialExperiences?: DashExp[] }) {
  const readOnly = useContext(ReadOnlyContext)
  const [filter, setFilter]   = useState('All')
  const [exps, setExps]       = useState<DashExp[]>(initialExperiences ?? [])
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
    'Art & Craft':        ['Pottery', 'Jewelry', 'Painting', 'Wood Carving', 'Textile', 'Weaving', 'Batik', 'Leather Craft', 'Sculpture', 'Mosaic', 'Upcycling', 'Candle Making', 'Soap Making', 'Macramé', 'Floral Arrangement', 'Tie-Dye', 'Resin Art', 'Block Printing', 'Eco Printing', 'Calligraphy', 'Glass Art'],
    'Wellness & Healing': ['Yoga', 'Meditation', 'Sound Healing', 'Spa & Ritual', 'Breathwork', 'Massage', 'Reiki', 'Balinese Healing', 'Pilates', 'Aerial Yoga', 'Herbal Medicine', 'Nutrition & Detox', 'Acupuncture', 'Reflexology', 'Crystal Healing', 'Aromatherapy', 'Tai Chi', 'Qigong', 'Hot Stone', 'Hypnotherapy', 'Floatation'],
    'Culture & Spiritual': ['Temple & Ceremony', 'Dance & Music', 'History Tour', 'Language', 'Healing Ritual', 'Holy Water', 'Blessing', 'Gamelan', 'Offering Making', 'Kecak Dance', 'Photography Tour', 'Wayang Kulit', 'Barong Dance', 'Legong Dance', 'Traditional Costume', 'Subak Tour', 'Astrology', 'Balinese Calligraphy'],
    'Culinary':           ['Cooking Class', 'Spice & Herb', 'Market Tour', 'Coffee & Tea', 'Fermentation', 'Dessert & Sweets', 'Farm to Table', 'Cocktail & Mixology', 'Vegan & Plant-Based', 'Seafood', 'Bread & Pastry', 'Chocolate Making', 'Juice & Smoothie', 'Wine & Spirits', 'Foraging', 'Street Food Tour', 'Night Market', 'Pizza Making', 'Jamu & Tonics'],
    'Nature & Outdoors':  ['Trekking', 'Waterfall', 'Sunrise', 'Rice Terrace', 'Wildlife', 'Cycling', 'Bird Watching', 'Camping', 'Jungle Walk', 'Volcano', 'Beach Walk', 'Cave Exploration', 'Stargazing', 'Mangrove Tour', 'Organic Farming', 'Eco Tour', 'Night Safari', 'River Walk', 'Waterfall Rappelling', 'Cliff Walk', 'Permaculture'],
    'Water Activities':   ['Surfing', 'Snorkelling', 'Freediving', 'Scuba Diving', 'Stand-Up Paddle', 'Kayaking', 'River Rafting', 'Jet Ski', 'Parasailing', 'Island Hopping', 'Wakeboarding', 'Kite Surfing', 'Dolphin Watching', 'Cliff Jumping', 'Windsurfing', 'Boat Charter', 'Whale Watching', 'Open Water Swimming', 'Night Snorkelling'],
    'Local Experts':      ['Photographers', 'Guides', 'Wellness Practitioners', 'Childcare', 'Pet Care', 'Creative Mentors', 'Drivers', 'Translators', 'Wedding Planners', 'Event Planners', 'Personal Shoppers', 'Fitness Trainers', 'Yoga Teachers', 'Surf Coaches', 'Music Teachers', 'Dive Instructors', 'Life Coaches', 'Makeup Artists', 'Hair Stylists', 'Butler Service', 'Nutritionists'],
    'Rentals':            ['Scooter', 'Motorbike', 'Bicycle', 'E-Bike', 'Car', 'ATV', 'Golf Cart', 'Surfboard', 'Kayak', 'Jet Ski', 'Drone', 'Camera Gear', 'Villa', 'Workspace', 'Studio', 'Camping Gear', 'Diving Equipment', 'Baby Equipment', 'Boat', 'Sound System', 'Projector', 'BBQ Equipment', 'Beach Equipment', 'Pool Float', 'Cooler Box'],
  }

  const BLANK_FORM = { title: '', category: 'Art & Craft', subcategory: 'Pottery', area: 'Ubud', price: '', duration: '', maxGuests: '', minGuests: '', meetingPoint: '', description: '', includes: '', excludes: '', rentalPeriod: 'per day', deposit: '' }
  const [formData, setFormData] = useState(BLANK_FORM)
  const setField = (k: keyof typeof BLANK_FORM, v: string) => setFormData(p => ({ ...p, [k]: v }))
  const setCategory = (cat: string) => setFormData(p => ({ ...p, category: cat, subcategory: SUBCATEGORY_MAP[cat]?.[0] ?? '' }))

  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
    if (!res.ok) return null
    const { url } = await res.json()
    return url as string
  }

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = await uploadImage(file)
    if (url) setImagePreview(url)
  }

  const handleGalleryFiles = async (files: FileList | null) => {
    if (!files) return
    const slots = 8 - galleryPreviews.length
    const toUpload = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, slots)
    const urls = await Promise.all(toUpload.map(uploadImage))
    setGalleryPreviews(prev => [...prev, ...(urls.filter(Boolean) as string[])])
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

  const openEdit = (exp: DashExp) => {
    if (readOnly) return
    setEditingExp(exp)
    setImagePreview(exp.image || null)
    setGalleryPreviews(exp.images.slice(1))
    setFormStep(1)
    const isRental = exp.category === 'Rentals'
    const depositLine = (exp.includes ?? []).find((l: string) => l.startsWith('Deposit:'))
    const depositAmt = depositLine ? depositLine.replace(/[^0-9]/g, '') : ''
    const nonDepositIncludes = (exp.includes ?? []).filter((l: string) => !l.startsWith('Deposit:'))
    setFormData({ title: exp.title, category: exp.category, subcategory: exp.subcategory || SUBCATEGORY_MAP[exp.category]?.[0] || '', area: exp.area, price: String(exp.price), duration: isRental ? '' : (exp.duration.match(/([\d.]+)/)?.[1] ?? ''), maxGuests: String(exp.maxGuests), minGuests: String(exp.minGuests ?? 1), meetingPoint: exp.meetingPoint || '', description: exp.description || '', includes: nonDepositIncludes.join('\n'), excludes: (exp.excludes ?? []).join('\n'), rentalPeriod: isRental ? (exp.duration || 'per day') : 'per day', deposit: depositAmt })
    setItinerary(exp.itinerary?.length ? exp.itinerary : [{ time: '', activity: '' }])
    if (exp.schedule) setSchedule(exp.schedule as any)
    else setSchedule(WEEK.map(day => ({ day, enabled: false, open: '09:00', close: '17:00' })))
    setShowForm(true)
  }

  const saveAndClose = async (action: 'draft' | 'submit' = 'draft') => {
    if (submitting || readOnly) return
    setSaveError('')
    setSubmitting(true)
    const slug = editingExp?.slug ?? (
      (formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'experience') +
      '-' + Math.random().toString(36).slice(2, 6)
    )
    const toLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean)
    const allImages = [imagePreview, ...galleryPreviews].filter(Boolean) as string[]
    const listingInput: HostListingInput = {
      slug,
      title: formData.title || editingExp?.title || '',
      description: formData.description || '',
      category: formData.category,
      subcategory: formData.subcategory || '',
      area: formData.area,
      price: Number(formData.price) || editingExp?.price || 0,
      duration: formData.category === 'Rentals'
        ? (formData.rentalPeriod || 'per day')
        : (formData.duration ? `${formData.duration} hours` : editingExp?.duration || ''),
      maxGuests: formData.category === 'Rentals' ? 1 : (Number(formData.maxGuests) || editingExp?.maxGuests || 8),
      minGuests: formData.category === 'Rentals' ? 1 : (Number(formData.minGuests) || 1),
      meetingPoint: formData.meetingPoint || '',
      includes: [
        ...(formData.category === 'Rentals' && formData.deposit
          ? [`Deposit: IDR ${Number(formData.deposit).toLocaleString('id-ID')} (refundable)`]
          : []),
        ...toLines(formData.includes),
      ],
      excludes: toLines(formData.excludes),
      itinerary: itinerary.filter(s => s.time || s.activity),
      imageUrl: imagePreview ?? undefined,
    }
    try {
      const res = await saveExperienceFullAction({ ...listingInput, schedule, images: allImages }, action)
      if (!res.ok) {
        setSaveError('Could not save. Check your connection and try again.')
        return
      }
      closeForm()
      getHostExperiencesAction().then(rows => { if (rows) setExps(rows) }).catch(() => {})
    } catch {
      setSaveError('Could not save. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
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
    if (readOnly) return
    setExps(prev => prev.map(e => e.id === exp.id ? { ...e, status: s } : e))
    setMenuOpen(null)
    updateExperienceStatusAction(exp.slug, STATUS_TO_ENUM[s] ?? 'DRAFT').catch(() => {})
  }

  return (
    <div>
      <PageHeader
        title="My Experiences"
        subtitle={`${exps.length} total listings`}
        action={readOnly ? undefined : (
          <button onClick={() => setShowForm(true)}
            className="hidden sm:flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ height: 42, backgroundColor: '#111111', color: 'white', border: 'none', borderRadius: 8, padding: '0 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={15} /> New Experience
          </button>
        )}
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
                  {exp.subcategory && (
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#C8A97E', backgroundColor: '#FEF9EC', border: '1px solid #F0DFC0', borderRadius: 5, padding: '1px 7px' }}>
                      {exp.subcategory}
                    </span>
                  )}
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
              <a href={exp.category === 'Rentals' ? `/rentals/${exp.slug}` : `/experiences/${exp.slug}`} target="_blank" rel="noreferrer"
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
                  if (readOnly) return
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

      <div className="sm:hidden mt-4" style={{ display: readOnly ? 'none' : undefined }}>
        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
          style={{ backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          <Plus size={15} /> New Experience
        </button>
      </div>

      {/* Create modal — step-by-step wizard */}
      {showForm && (() => {
        const STEPS = ['Basics', 'Details', 'Photos', 'Schedule']
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
                        {['Art & Craft','Wellness & Healing','Culture & Spiritual','Culinary','Nature & Outdoors','Water Activities','Local Experts','Rentals'].map(c => <option key={c} value={c}>{c}</option>)}
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
              {formStep === 2 && formData.category !== 'Rentals' && (
                <div key={`details-${editingExp?.id ?? 'new'}`} className="space-y-4 px-5 sm:px-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Price per person (IDR)</label>
                      <input type="number" value={formData.price} onChange={e => setField('price', e.target.value)} placeholder="450000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Duration (hours)</label>
                      <div style={{ position: 'relative' }}>
                        <input type="number" value={formData.duration} onChange={e => setField('duration', e.target.value)} placeholder="2" min="0.5" step="0.5" style={{ ...inputStyle, paddingRight: 48 }} />
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9E9A94', pointerEvents: 'none', fontFamily: 'var(--font-inter)' }}>hrs</span>
                      </div>
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
                    <textarea value={formData.includes} onChange={e => setField('includes', e.target.value)} placeholder={"One item per line\ne.g. All materials\nWelcome drink\nTake-home piece"} rows={4} style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>What&apos;s not included</label>
                    <textarea value={formData.excludes} onChange={e => setField('excludes', e.target.value)} placeholder={"One item per line\ne.g. Transport to venue\nGratuities"} rows={4} style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                </div>
              )}

              {/* Step 2 — Rental Details */}
              {formStep === 2 && formData.category === 'Rentals' && (
                <div key={`rental-${editingExp?.id ?? 'new'}`} className="space-y-4 px-5 sm:px-6">
                  {/* Price + Period */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Price (IDR)</label>
                      <input type="number" value={formData.price} onChange={e => setField('price', e.target.value)} placeholder="80000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Rental period</label>
                      <select value={formData.rentalPeriod} onChange={e => setField('rentalPeriod', e.target.value)} style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}>
                        {['per hour', 'per day', 'per night', 'per week'].map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Deposit */}
                  <div>
                    <label style={labelStyle}>Deposit (IDR) <span style={{ fontWeight: 400, color: '#9E9A94' }}>— optional, refundable</span></label>
                    <input type="number" value={formData.deposit} onChange={e => setField('deposit', e.target.value)} placeholder="500000" style={inputStyle} />
                  </div>
                  {/* Pickup location */}
                  <div>
                    <label style={labelStyle}>Pickup location</label>
                    <input type="text" value={formData.meetingPoint} onChange={e => setField('meetingPoint', e.target.value)} placeholder="e.g. Jl. Batu Bolong No. 5, Canggu" style={inputStyle} />
                  </div>
                  {/* Included */}
                  <div>
                    <label style={labelStyle}>What&apos;s included</label>
                    <textarea value={formData.includes} onChange={e => setField('includes', e.target.value)} placeholder={"One item per line\ne.g. Helmet\nLock & key\nPhone holder\nRain poncho"} rows={4} style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                  {/* Not included */}
                  <div>
                    <label style={labelStyle}>What&apos;s not included</label>
                    <textarea value={formData.excludes} onChange={e => setField('excludes', e.target.value)} placeholder={"One item per line\ne.g. Fuel\nInsurance\nDelivery"} rows={3} style={{ ...inputStyle, resize: 'none' }} />
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

              {/* Step 4 — Schedule */}
              {formStep === 4 && (
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
              {saveError && (
                <p style={{ fontSize: 12, color: '#B66A45', textAlign: 'center', margin: '0 20px 8px' }}>{saveError}</p>
              )}
              <div className="flex gap-2 mt-0 px-5 sm:px-6 pb-8 sm:pb-6">
                {formStep > 1 ? (
                  <button onClick={() => { setSaveError(''); setFormStep(s => s - 1) }}
                    style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', background: 'none', fontSize: 13, fontWeight: 600, color: '#6F675C', cursor: 'pointer' }}>Back</button>
                ) : (
                  <button onClick={closeForm}
                    style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', background: 'none', fontSize: 13, fontWeight: 600, color: '#6F675C', cursor: 'pointer' }}>Cancel</button>
                )}
                {formStep < STEPS.length ? (
                  <button onClick={() => {
                    if (formStep === 1 && !formData.title.trim()) { setSaveError('Please enter a title for your experience.'); return }
                    if (formStep === 2 && !formData.price) { setSaveError('Please enter a price.'); return }
                    if (formStep === 2 && formData.category !== 'Rentals' && !formData.duration) { setSaveError('Please enter a duration.'); return }
                    setSaveError('')
                    setFormStep(s => s + 1)
                  }}
                    style={{ flex: 2, height: 44, borderRadius: 10, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Next →</button>
                ) : (
                  <>
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
  const readOnly = useContext(ReadOnlyContext)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch]             = useState('')
  const [bookings, setBookings]         = useState<DashBooking[]>(initialBookings ?? [])
  const [updating, setUpdating]         = useState<string | null>(null)

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']
  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || b.guest.toLowerCase().includes(q) || b.experience.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const updateStatus = async (b: DashBooking, status: 'CONFIRMED' | 'CANCELLED') => {
    if (readOnly) return
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
            {b.status === 'Pending' && !readOnly && (
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
  const readOnly = useContext(ReadOnlyContext)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

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
  const expSource = liveExps ?? []
  const totalExpEarnings = expSource.reduce((a, e) => a + e.earnings, 0)

  // Current-month payout status from DB records
  const nowMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const thisMonthPayout = livePayouts?.find(p => p.periodLabel === nowMonthLabel)
  const isRequested = thisMonthPayout?.status === 'Requested'
  const isPaid      = thisMonthPayout?.status === 'Paid'

  const pendingNet = Math.round(pendingPayout * netMult)

  return (
    <>
    {withdrawOpen && (
      <WithdrawModal
        pendingNet={hasLive ? pendingNet : null}
        commissionRate={commissionRate}
        isRequested={isRequested}
        isPaid={isPaid}
        onClose={() => setWithdrawOpen(false)}
      />
    )}
    <div>
      <PageHeader title="Earnings" subtitle="Track your revenue and payout history"
        action={readOnly ? undefined : (
          <button onClick={() => setWithdrawOpen(true)}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ height: 38, backgroundColor: isRequested || isPaid ? 'white' : '#111111', color: isRequested || isPaid ? '#6F675C' : 'white', border: isRequested || isPaid ? '1px solid #E8E4DE' : 'none', borderRadius: 9, padding: '0 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {isPaid ? 'Paid ✓' : isRequested ? 'Pending ⏳' : 'Withdraw'}
          </button>
        )}
      />

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

        {/* Pending Payout card */}
        <div className="bg-white rounded-xl p-4 lg:p-5" style={{ border: `1px solid ${isPaid ? '#C8E6D6' : isRequested ? '#E8D4B8' : '#E8E4DE'}`, backgroundColor: isPaid ? '#F8FDF9' : isRequested ? '#FDFAF5' : 'white' }}>
          <p style={{ fontSize: 12, color: '#6F675C' }}>Pending Payout</p>
          <p className="mt-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14px,1.6vw,20px)', fontWeight: 700, color: '#111111', lineHeight: 1.2 }}>{fmt(pendingNet)}</p>
          <p className="mt-1.5" style={{ fontSize: 11, color: isPaid ? '#4A7C59' : isRequested ? '#C8A97E' : '#6F675C', fontWeight: isPaid || isRequested ? 600 : 400 }}>
            {isPaid ? '✓ Paid this month' : isRequested ? '⏳ Pending review' : 'Confirmed earnings, not yet paid out'}
          </p>
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
    </>
  )
}

// ── Reviews Panel ─────────────────────────────────────────────────────────────

function ReviewsPanel({ initialReviews }: { initialReviews?: DashReview[] }) {
  const [starFilter, setStarFilter] = useState(0)
  const reviews = initialReviews ?? []

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

// ── Profile Panel ─────────────────────────────────────────────────────────────

const HOST_PROFILE_DEFAULTS = {
  name: '', businessName: '', email: '', phone: '',
  bio: '', area: 'Ubud', languages: 'English, Bahasa Indonesia',
  website: '', address: '', city: '', country: '',
  nationality: '', dateOfBirth: '',
}

function ProfilePanel({ profile: liveProfile }: { profile?: HostProfile }) {
  const readOnly = useContext(ReadOnlyContext)
  const { data: session } = useSession()
  const sessionDefaults = { ...HOST_PROFILE_DEFAULTS, name: session?.user?.name ?? '', email: session?.user?.email ?? '' }
  const [profile, setProfile] = useState(() => readOnly ? HOST_PROFILE_DEFAULTS : sessionDefaults)
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  useEffect(() => {
    if (!liveProfile) return
    setProfile(p => ({
      ...p,
      name: liveProfile.name, email: liveProfile.email,
      businessName: liveProfile.businessName, bio: liveProfile.bio,
      phone: liveProfile.phone, area: liveProfile.area || p.area,
      languages: liveProfile.languages, website: liveProfile.website,
      address: liveProfile.address, city: liveProfile.city,
      country: liveProfile.country, nationality: liveProfile.nationality,
      dateOfBirth: liveProfile.dateOfBirth,
    }))
  }, [liveProfile])

  const avatarSrc = (liveProfile?.image ?? session?.user?.image) ?? null

  const save = async () => {
    if (readOnly || saving) return
    setSaving(true); setSaveError(false)
    const res = await updateHostProfileAction({
      name: profile.name, businessName: profile.businessName, bio: profile.bio,
      phone: profile.phone, area: profile.area, languages: profile.languages,
      website: profile.website, address: profile.address, city: profile.city,
      country: profile.country, nationality: profile.nationality, dateOfBirth: profile.dateOfBirth,
    }).catch(() => ({ ok: false }))
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    else { setSaveError(true); setTimeout(() => setSaveError(false), 3000) }
  }
  const discard = () => liveProfile && setProfile(p => ({ ...p, ...liveProfile }))

  const set = (key: keyof typeof HOST_PROFILE_DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setProfile(p => ({ ...p, [key]: e.target.value }))

  const inputStyle = (disabled?: boolean): React.CSSProperties => ({
    width: '100%', height: 42, borderRadius: 10, border: '1px solid #E8E4DE',
    padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111',
    outline: 'none', backgroundColor: disabled ? '#F8F6F2' : 'white', boxSizing: 'border-box',
  })

  const label = (text: string) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6F675C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-inter)' }}>
      {text}
    </label>
  )

  return (
    <div>
      <PageHeader title="Host Profile" subtitle="How guests see you on Balible" />

      <div className="space-y-5">

        {/* ── Avatar card ── */}
        <div className="bg-white rounded-xl p-6 flex items-center gap-5" style={{ border: '1px solid #E8E4DE' }}>
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden" style={{ border: '3px solid #C8A97E' }}>
              {avatarSrc
                ? <img src={avatarSrc} alt={profile.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#C8A97E' }}>
                    <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 700, color: 'white' }}>
                      {(profile.name || liveProfile?.name || session?.user?.name || 'H').charAt(0).toUpperCase()}
                    </span>
                  </div>
              }
            </div>
            {!readOnly && (
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#111111', border: 'none', cursor: 'pointer' }}>
                <Camera size={12} style={{ color: 'white' }} />
              </button>
            )}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>
              {profile.name || liveProfile?.name || session?.user?.name}
            </p>
            <p style={{ fontSize: 13, color: '#6F675C', marginTop: 2 }}>
              {profile.businessName || 'Operator'}{profile.area ? ` · ${profile.area}` : ''}
            </p>
          </div>
        </div>

        {/* ── Personal information ── */}
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="mb-5" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Personal Information</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>{label('Full name')}<input value={profile.name} onChange={set('name')} disabled={readOnly} style={inputStyle(readOnly)} /></div>
              <div>{label('Email')}<div style={{ ...inputStyle(true), display: 'flex', alignItems: 'center', color: '#6F675C' }}>{profile.email || '—'}</div></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>{label('Phone number')}<input type="tel" value={profile.phone} onChange={set('phone')} disabled={readOnly} placeholder="+62 812 345 6789" style={inputStyle(readOnly)} /></div>
              <div>{label('Date of birth')}<input type="date" value={profile.dateOfBirth} onChange={set('dateOfBirth')} disabled={readOnly} style={inputStyle(readOnly)} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>{label('Nationality')}<input value={profile.nationality} onChange={set('nationality')} disabled={readOnly} placeholder="e.g. Indonesian" style={inputStyle(readOnly)} /></div>
            </div>
          </div>
        </div>

        {/* ── Business information ── */}
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="mb-5" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Business Information</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>{label('Business name')}<input value={profile.businessName} onChange={set('businessName')} disabled={readOnly} style={inputStyle(readOnly)} /></div>
              <div>{label('Website')}<input type="url" value={profile.website} onChange={set('website')} disabled={readOnly} placeholder="https://yoursite.com" style={inputStyle(readOnly)} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                {label('Primary area')}
                <select value={profile.area} onChange={set('area')} disabled={readOnly}
                  style={{ ...inputStyle(readOnly), cursor: readOnly ? 'default' : 'pointer' }}>
                  {['Ubud','Canggu','Kuta','Seminyak','Uluwatu','Gianyar','Sanur','Nusa Dua','Amed','Jimbaran','Kintamani','Sidemen','Medewi'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>{label('Languages')}<input value={profile.languages} onChange={set('languages')} disabled={readOnly} placeholder="e.g. English, Bahasa Indonesia" style={inputStyle(readOnly)} /></div>
            </div>
            <div>
              {label('About / bio')}
              <textarea rows={4} value={profile.bio} onChange={set('bio')} disabled={readOnly}
                style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', resize: 'none', outline: 'none', lineHeight: 1.6, backgroundColor: readOnly ? '#F8F6F2' : 'white', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {/* ── Address ── */}
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="mb-5" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111' }}>Address</h2>
          <div className="space-y-4">
            <div>{label('Street address')}<input value={profile.address} onChange={set('address')} disabled={readOnly} placeholder="Jl. Raya, Gang, No." style={inputStyle(readOnly)} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>{label('City / village')}<input value={profile.city} onChange={set('city')} disabled={readOnly} placeholder="e.g. Ubud" style={inputStyle(readOnly)} /></div>
              <div>{label('Country')}<input value={profile.country} onChange={set('country')} disabled={readOnly} placeholder="e.g. Indonesia" style={inputStyle(readOnly)} /></div>
            </div>
          </div>
        </div>

        {/* ── Save ── */}
        {!readOnly && (
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ height: 44, paddingInline: 24, borderRadius: 10, border: 'none', backgroundColor: saved ? '#4A7C59' : saveError ? '#B66A45' : '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', transition: 'background 0.2s', minWidth: 140, opacity: saving ? 0.7 : 1, fontFamily: 'var(--font-inter)' }}>
              {saved ? <><Check size={14} /> Saved!</> : saving ? 'Saving…' : saveError ? 'Save failed' : 'Save Changes'}
            </button>
            <button onClick={discard} style={{ height: 44, paddingInline: 24, borderRadius: 10, border: '1px solid #E8E4DE', background: 'none', fontSize: 14, color: '#6F675C', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
              Discard
            </button>
            {saveError && <span style={{ fontSize: 13, color: '#B66A45', fontFamily: 'var(--font-inter)' }}>Could not save. Please try again.</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Settings Panel ────────────────────────────────────────────────────────────

const HOST_NOTIF_DEFAULTS  = { newBooking: true, cancellation: true, review: false, reminders: true }

function SettingsPanel() {
  const readOnly = useContext(ReadOnlyContext)
  const [notifs, setNotifs]   = useState(HOST_NOTIF_DEFAULTS)
  const [payout, setPayout]   = useState({ bankName: '', accountNumber: '', accountHolder: '' })
  const [saved, setSaved]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)

  useEffect(() => {
    getOperatorSettingsAction().then(s => {
      if (!s) return
      if (s.notifSettings) setNotifs({ ...HOST_NOTIF_DEFAULTS, ...s.notifSettings } as typeof HOST_NOTIF_DEFAULTS)
      setPayout({ bankName: s.payoutBank, accountNumber: s.payoutAccountNumber, accountHolder: s.payoutAccountName })
    })
  }, [])

  const save = async () => {
    if (readOnly) return
    setSaving(true)
    await updateOperatorSettingsAction({
      payoutBank: payout.bankName,
      payoutAccountNumber: payout.accountNumber,
      payoutAccountName: payout.accountHolder,
    })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const toggle = async (key: keyof typeof notifs) => {
    if (readOnly) return
    const next = { ...notifs, [key]: !notifs[key] }
    setNotifs(next)
    await updateOperatorSettingsAction({ notifSettings: next })
    setNotifSaved(true); setTimeout(() => setNotifSaved(false), 1500)
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

        <button onClick={save} disabled={saving || readOnly} className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ height: 44, paddingInline: 24, borderRadius: 10, border: 'none', backgroundColor: saved ? '#4A7C59' : '#111111', color: 'white', fontSize: 14, fontWeight: 600, cursor: (saving || readOnly) ? 'default' : 'pointer', opacity: (saving || readOnly) ? 0.6 : 1, transition: 'background 0.2s', minWidth: 140 }}>
          {saved ? <><Check size={14} /> Saved!</> : saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

// ── Events Panel ─────────────────────────────────────────────────────────────

const EMPTY_EVENT: EventInput = {
  title: '', description: '', date: '', location: '', price: 0, capacity: 10, coverImage: '', status: 'DRAFT',
}


function EventsPanel() {
  const readOnly = useContext(ReadOnlyContext)
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

  useEffect(() => {
    getHostEvents().then(rows => {
      setEvents(rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      setLoading(false)
    })
  }, [])

  const setAndSave = (next: EventRow[]) => setEvents(next)

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
    const savedGallery = ev.images ?? []
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
      coverImage: input.coverImage ?? null, images: [], status: input.status ?? 'DRAFT',
      createdAt: new Date().toISOString(),
    }
  }

  async function handleSave() {
    if (readOnly) return
    setSaveError('')
    if (!form.title.trim()) { setSaveError('Event title is required.'); return }
    if (!form.date) { setSaveError('Date & time is required.'); return }
    if (!form.location.trim()) { setSaveError('Location is required.'); return }

    setSaving(true)
    const validGallery = galleryUrls.filter(u => u.trim())

    if (editing) {
      const res = await updateEvent(editing.id, form)
      const updated = { ...editing, ...form, date: new Date(form.date).toISOString(), images: validGallery }
      if (res.ok && validGallery.length > 0) {
        await updateEventImagesAction(editing.id, validGallery)
      }
      setAndSave(events.map(e => e.id === editing.id ? updated : e))
    } else {
      const res = await createEvent(form)
      if (res.ok && res.event) {
        if (validGallery.length > 0) await updateEventImagesAction(res.event.id, validGallery)
        setAndSave([...events, { ...res.event, images: validGallery }])
      }
    }
    setSaving(false)
    setShowForm(false)
  }

  function handleDelete(id: string) {
    if (readOnly) return
    if (!confirm('Delete this event?')) return
    deleteEvent(id).catch(() => {})
    setAndSave(events.filter(e => e.id !== id))
  }

  function toggleStatus(ev: EventRow) {
    if (readOnly) return
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

function AvailabilityPanel({ bookings }: { bookings?: DashBooking[] }) {
  const bookedDates = useMemo<Set<string>>(() => {
    if (!bookings) return new Set()
    const s = new Set<string>()
    bookings.forEach(b => {
      if (b.status === 'Confirmed' || b.status === 'Pending') {
        try { s.add(new Date(b.date).toISOString().split('T')[0]) } catch { /* skip */ }
      }
    })
    return s
  }, [bookings])

  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [blocked, setBlocked] = useState<Set<string>>(new Set())

  useEffect(() => {
    getOperatorSettingsAction().then(s => {
      if (s?.blockedDates) setBlocked(new Set(s.blockedDates))
    })
  }, [])

  const monthStr  = String(month + 1).padStart(2, '0')
  const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const firstDay  = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dayKey = (d: number) => `${year}-${monthStr}-${String(d).padStart(2, '0')}`

  const toggle = (d: number) => {
    const k = dayKey(d)
    if (bookedDates.has(k)) return
    setBlocked(prev => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      updateOperatorSettingsAction({ blockedDates: Array.from(next) })
      return next
    })
  }
  const unblock = (k: string) => setBlocked(prev => {
    const n = new Set(prev); n.delete(k)
    updateOperatorSettingsAction({ blockedDates: Array.from(n) })
    return n
  })

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const thisMonthPrefix = `${year}-${monthStr}-`
  const blockedThisMonth = Array.from(blocked).filter(k => k.startsWith(thisMonthPrefix))
  const bookedThisMonth  = Array.from(bookedDates).filter(k => k.startsWith(thisMonthPrefix))

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
            const isBooked  = bookedDates.has(k)
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

function PhotosPanel({ experiences }: { experiences?: DashExp[] }) {
  const readOnly = useContext(ReadOnlyContext)
  const exps = experiences ?? []
  const [galleries, setGalleries] = useState<Record<number, string[]>>(
    Object.fromEntries(exps.map(e => [e.id, e.images.length > 0 ? e.images : [e.image].filter(Boolean)]))
  )
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const persist = (expId: number, arr: string[]) => {
    const exp = exps.find(e => e.id === expId)
    if (exp) updateExperienceImagesAction(exp.slug, arr)
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
    if (readOnly) return
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
        {exps.map(exp => {
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

const HOST_NOTIFICATIONS: { id: number; title: string; body: string; time: string; unread: boolean }[] = []

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

function SidebarInner({ activeNav, setActiveNav, hostName, unreadMessages }: { activeNav: string; setActiveNav: (id: string) => void; hostName?: string; unreadMessages?: number }) {
  const { data: session } = useSession()
  const displayName = hostName ?? session?.user?.name ?? 'Host'
  const initial = displayName.charAt(0).toUpperCase()
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <a href="/" className="flex flex-col gap-1 leading-none" style={{ textDecoration: 'none' }}>
          <img src="/logo-light.png" alt="Balible" style={{ height: 28, width: 'auto', objectFit: 'contain', display: 'block' }} />
          <span style={{ fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>HOST DASHBOARD</span>
        </a>
      </div>

      <div className="flex items-center gap-3 mx-3 px-3 py-3 rounded-xl mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid rgba(200,169,126,0.5)' }}>
          {session?.user?.image
            ? <img src={session.user.image} alt={displayName} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#C8A97E' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{initial}</span>
              </div>
          }
        </div>
        <div className="min-w-0">
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Operator · Verified</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeNav === id
          const badge = id === 'messages' && (unreadMessages ?? 0) > 0
          return (
            <button key={id} onClick={() => setActiveNav(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-white/5"
              style={{ color: active ? '#C8A97E' : 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'var(--font-inter)', fontWeight: active ? 600 : 400, cursor: 'pointer', background: active ? 'rgba(200,169,126,0.1)' : 'none', border: 'none', textAlign: 'left' }}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                {badge && <span style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#C8A97E', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadMessages}</span>}
                {active && !badge && <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#C8A97E', display: 'block' }} />}
              </span>
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
          href="/api/auth/logout"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}
        >
          <LogOut size={14} /> Sign out
        </a>
      </div>
    </>
  )
}

// ── Messages Panel ────────────────────────────────────────────────────────────

function MessagesPanel() {
  const [convs, setConvs]           = useState<ConversationSummary[]>([])
  const [selected, setSelected]     = useState<string | null>(null)
  const [messages, setMessages]     = useState<ChatMessage[]>([])
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)
  const inputRef                     = useRef<HTMLInputElement>(null)

  // Load conversations
  useEffect(() => {
    listHostConversationsAction().then(r => { if (r) setConvs(r) })
  }, [])

  // Poll messages every 5 s when a conversation is open
  useEffect(() => {
    if (!selected) return
    const load = () => getMessagesAction(selected).then(r => { if (r) setMessages(r) })
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [selected])

  // Mark conversation unread badge as zero when selected
  useEffect(() => {
    if (!selected) return
    setConvs(prev => prev.map(c => c.id === selected ? { ...c, unreadCount: 0 } : c))
  }, [selected, messages.length])

  const openConv = (id: string) => {
    setSelected(id)
    setMessages([])
    setTimeout(() => { inputRef.current?.focus() }, 100)
  }

  const closeThread = () => setSelected(null)

  const send = async () => {
    if (!selected || !input.trim() || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    await sendMessageAction(selected, text)
    const updated = await getMessagesAction(selected)
    if (updated) setMessages(updated)
    setSending(false)
  }

  const selectedConv = convs.find(c => c.id === selected)

  const fmtTime = (d: Date) => {
    const now = new Date()
    const date = new Date(d)
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      <PageHeader title="Messages" subtitle="Direct messages with your guests" />
      <div className="flex gap-4" style={{ height: 'calc(100vh - 200px)', minHeight: 400 }}>

        {/* Conversation list — hidden on mobile when thread is open */}
        <div className={`${selected ? 'hidden lg:flex' : 'flex'} bg-white rounded-xl overflow-hidden flex-shrink-0`} style={{ width: '100%', maxWidth: 280, border: '1px solid #E8E4DE', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EDE8' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>Conversations</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {convs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <MessageCircle size={28} style={{ color: '#D1CDC7', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: '#9E9A94' }}>No messages yet</p>
                <p style={{ fontSize: 12, color: '#C8C4BE', marginTop: 4 }}>Guests can message you from their booking page</p>
              </div>
            ) : convs.map(c => (
              <button key={c.id} onClick={() => openConv(c.id)}
                style={{ width: '100%', padding: '12px 16px', textAlign: 'left', border: 'none', cursor: 'pointer', backgroundColor: selected === c.id ? '#F5F1EB' : 'white', borderBottom: '1px solid #F5F1EB', transition: 'background 0.15s' }}>
                <div className="flex items-center gap-3">
                  {c.otherImage ? (
                    <img src={c.otherImage} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#E8E4DE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#6F675C' }}>{c.otherName.charAt(0)}</span>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 13, fontWeight: c.unreadCount > 0 ? 700 : 600, color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.otherName}</span>
                      <span style={{ fontSize: 11, color: '#9E9A94', flexShrink: 0, marginLeft: 4 }}>{fmtTime(c.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span style={{ fontSize: 12, color: '#6F675C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.lastMessage || 'No messages yet'}</span>
                      {c.unreadCount > 0 && (
                        <span style={{ flexShrink: 0, marginLeft: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: '#C8A97E', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread — hidden on mobile when no conversation selected */}
        <div className={`${selected ? 'flex' : 'hidden lg:flex'} bg-white rounded-xl flex-col flex-1 overflow-hidden`} style={{ border: '1px solid #E8E4DE' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9E9A94' }}>
              <MessageCircle size={36} style={{ marginBottom: 10, color: '#D1CDC7' }} />
              <p style={{ fontSize: 14 }}>Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Back button — mobile only */}
                <button className="lg:hidden" onClick={closeThread} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#6F675C', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>
                {selectedConv?.otherImage ? (
                  <img src={selectedConv.otherImage} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#E8E4DE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#6F675C' }}>{selectedConv?.otherName.charAt(0)}</span>
                  </div>
                )}
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111111' }}>{selectedConv?.otherName}</span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.isOwn ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{ backgroundColor: m.isOwn ? '#111111' : '#F5F1EB', color: m.isOwn ? 'white' : '#111111', padding: '9px 14px', borderRadius: m.isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 14, lineHeight: 1.5 }}>
                        {m.content}
                      </div>
                      <p style={{ fontSize: 10, color: '#9E9A94', marginTop: 3, textAlign: m.isOwn ? 'right' : 'left' }}>{fmtTime(m.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', borderTop: '1px solid #F0EDE8', display: 'flex', gap: 8 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Type a message…"
                  style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 16, fontFamily: 'var(--font-inter)', color: '#111111', outline: 'none' }}
                />
                <button onClick={send} disabled={!input.trim() || sending}
                  style={{ width: 40, height: 40, borderRadius: 10, border: 'none', backgroundColor: input.trim() ? '#111111' : '#E8E4DE', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 }}>
                  <Send size={16} style={{ color: input.trim() ? 'white' : '#9E9A94' }} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in?callbackUrl=/dashboard'
      }
    },
  })

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
  const [liveProfile, setLiveProfile] = useState<HostProfile | undefined>(undefined)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const commissionRate = liveCommissionRate ?? 10

  // Admin read-only view: /dashboard?operator=<id> loads that host's data.
  // Non-admins are ignored server-side, so this is safe to read from the URL.
  const [adminViewId, setAdminViewId] = useState<string | undefined>(undefined)
  const readOnly = !!adminViewId

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F1EB', fontFamily: 'var(--font-inter)' }}>
        <p style={{ color: '#6F675C', fontSize: 14 }}>Loading…</p>
      </div>
    )
  }

  useEffect(() => {
    const opId = new URLSearchParams(window.location.search).get('operator') ?? undefined
    setAdminViewId(opId)
    getHostDashboardData(opId).then(data => {
      if (!data) return
      setLiveExperiences(data.experiences)
      setLiveBookings(data.bookings)
      setLiveReviews(data.reviews)
      setLiveHostName(data.hostName)
      setLiveEarningsByMonth(data.earningsByMonth)
      setLiveTotalGross(data.totalGross)
      setLivePendingPayout(data.pendingPayout)
      setLiveCommissionRate(data.commissionRate)
      setLiveProfile(data.profile)
    }).catch(() => {})
    getOperatorPayoutsAction(opId).then(setLivePayouts).catch(() => {})
    // Poll unread message count every 30 s
    const pollUnread = () => getHostUnreadCountAction().then(setUnreadMessages).catch(() => {})
    pollUnread()
    const unreadTimer = setInterval(pollUnread, 30_000)
    return () => clearInterval(unreadTimer)
  }, [])

  const renderPanel = () => {
    switch (activeNav) {
      case 'overview':      return <OverviewPanel onNav={setActiveNav} commissionRate={commissionRate} experiences={liveExperiences} bookings={liveBookings} reviews={liveReviews} hostName={liveHostName} earningsByMonth={liveEarningsByMonth} pendingPayout={livePendingPayout} payouts={livePayouts} />
      case 'experiences':   return <ExperiencesPanel commissionRate={commissionRate} initialExperiences={liveExperiences} />
      case 'events':        return <EventsPanel />
      case 'bookings':      return <BookingsPanel initialBookings={liveBookings} />
      case 'availability':  return <AvailabilityPanel bookings={liveBookings} />
      case 'earnings':      return <EarningsPanel commissionRate={commissionRate} experiences={liveExperiences} bookings={liveBookings} earningsByMonth={liveEarningsByMonth} totalGross={liveTotalGross} pendingPayout={livePendingPayout} payouts={livePayouts} />
      case 'photos':        return <PhotosPanel experiences={liveExperiences} />
      case 'reviews':       return <ReviewsPanel initialReviews={liveReviews} />
      case 'messages':      return <MessagesPanel />
      case 'profile':       return <ProfilePanel profile={liveProfile} />
      case 'settings':      return <SettingsPanel />
      default:              return <OverviewPanel onNav={setActiveNav} commissionRate={commissionRate} experiences={liveExperiences} bookings={liveBookings} reviews={liveReviews} hostName={liveHostName} earningsByMonth={liveEarningsByMonth} />
    }
  }

  return (
    <ReadOnlyContext.Provider value={readOnly}>
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
            <SidebarInner activeNav={activeNav} setActiveNav={id => { setActiveNav(id); setSidebarOpen(false) }} hostName={liveHostName} unreadMessages={unreadMessages} />
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

        {/* Admin read-only view banner */}
        {readOnly && (
          <div className="flex items-center justify-between gap-3 mb-5 px-4 py-3 rounded-xl flex-wrap"
            style={{ backgroundColor: '#FDF8F4', border: '1px solid #E8D4B8' }}>
            <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
              <Eye size={16} style={{ color: '#B98948', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#6F675C' }}>
                Viewing <strong style={{ color: '#111111' }}>{liveHostName ?? 'this host'}</strong>&apos;s dashboard as admin — <strong style={{ color: '#B98948' }}>read-only</strong>
              </span>
            </div>
            <a href="/admin" style={{ fontSize: 12, fontWeight: 600, color: '#B98948', textDecoration: 'none', flexShrink: 0 }}>← Back to admin</a>
          </div>
        )}

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
    </ReadOnlyContext.Provider>
  )
}
