'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard, List, CalendarDays, TrendingUp,
  Settings, Menu, X, Search, Download, Plus, Trash2, ExternalLink, Check,
} from 'lucide-react'
import {
  getProviderDashboardData, createServiceListingAction, updateServiceBookingStatusAction,
  type ProviderDashboardData, type ProviderListing, type ProviderBooking,
} from '@/lib/service-actions'

const PRICE_LABEL: Record<string, string> = { HOURLY: '/ hr', DAILY: '/ day', FIXED: '' }

function fmt(n: number) {
  if (n >= 1_000_000) return `IDR ${(n / 1_000_000).toFixed(1)}M`
  return `IDR ${n.toLocaleString('id-ID')}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active:    { bg: '#F0F7F2', color: '#2E4A35' },
    Confirmed: { bg: '#F0F7F2', color: '#2E4A35' },
    Completed: { bg: '#EEF2FF', color: '#4B6CB7' },
    Pending:   { bg: '#FDF8F4', color: '#B58A4B' },
    Draft:     { bg: '#F3EEE5', color: '#6F675C' },
    Paused:    { bg: '#FEF9F4', color: '#B58A4B' },
    Cancelled: { bg: '#FEF2F2', color: '#B66A45' },
  }
  const s = map[status] ?? { bg: '#F3EEE5', color: '#6F675C' }
  return (
    <span style={{ ...s, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

const NAV = [
  { id: 'overview',  label: 'Overview',  Icon: LayoutDashboard },
  { id: 'listings',  label: 'Listings',  Icon: List },
  { id: 'bookings',  label: 'Bookings',  Icon: CalendarDays },
  { id: 'earnings',  label: 'Earnings',  Icon: TrendingUp },
  { id: 'settings',  label: 'Settings',  Icon: Settings },
]

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewPanel({ data }: { data: ProviderDashboardData }) {
  const totalEarnings  = data.listings.reduce((a, l) => a + l.earnings, 0)
  const totalBookings  = data.bookings.length
  const upcoming       = data.bookings.filter(b => b.status === 'Confirmed').length
  const avgRating      = data.listings.length > 0
    ? (data.listings.reduce((a, l) => a + l.rating, 0) / data.listings.length).toFixed(1)
    : '—'

  const stats = [
    { label: 'Total Earnings',    value: fmt(totalEarnings) },
    { label: 'Total Bookings',    value: String(totalBookings) },
    { label: 'Upcoming',          value: String(upcoming) },
    { label: 'Average Rating',    value: avgRating },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#1D1D1D', marginBottom: 4 }}>
        Welcome back, {data.providerName}
      </h1>
      <p style={{ fontSize: 14, color: '#6F675C', marginBottom: 24 }}>Here's how your services are performing.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
            <p style={{ fontSize: 12, color: '#6F675C', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#1D1D1D' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1D1D1D', marginBottom: 14 }}>Recent Bookings</h2>
        {data.bookings.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6F675C' }}>No bookings yet. Share your listings to get started.</p>
        ) : (
          <div className="space-y-3">
            {data.bookings.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid #F3EEE5' }}>
                {b.serviceImage && (
                  <img src={b.serviceImage} alt="" className="rounded-lg object-cover flex-shrink-0" style={{ width: 44, height: 44 }} />
                )}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1D' }} className="truncate">{b.service}</p>
                  <p style={{ fontSize: 12, color: '#6F675C' }}>{b.guest} · {b.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={b.status} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1D' }}>{fmt(b.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Subcategory map ───────────────────────────────────────────────────────────

const SUBCATEGORIES: Record<string, string[]> = {
  WELLNESS_BEAUTY:     ['Balinese Massage','Deep Tissue Massage','Aromatherapy Massage','Facial & Skincare','Body Scrub & Wrap','Hair Cut & Styling','Hair Coloring','Braiding & Extensions','Manicure & Pedicure','Nail Art','Makeup (Daily / Event)','Bridal Makeup','Waxing & Threading','Eyelash & Eyebrow'],
  PHOTOGRAPHY_CONTENT: ['Portrait Photography','Couples & Pre-Wedding Shoot','Family Photography','Content Creator (Lifestyle / Travel)','Instagram / Reel Shoot','Drone & Aerial Photography','Underwater Photography','Video Production','Event Photography'],
  TRANSPORTATION:      ['Airport Transfer','Private Driver (Half Day)','Private Driver (Full Day)','Driver + Tour Guide','Scooter Rental','Motorbike Rental','Car Rental','Van / MPV Rental','Boat Charter'],
  FOOD_DINING:         ['Private Chef (Single Meal)','Private Chef (Weekly)','BBQ & Grill Setup','Private Dinner Setup','Catering (Small Group)','Meal Prep & Delivery','Bartender & Mixologist','Barista (In-Villa Coffee)'],
  EVENT_WEDDING:       ['Wedding Coordination','Wedding Decoration','Florist & Floral Design','Wedding MC / Officiant','Sound System & DJ','Birthday Party Setup','Baby Shower Setup','Corporate Event Setup','Catering for Events'],
  FITNESS_COACHING:    ['Private Yoga (In-Villa)','Meditation & Breathwork','Personal Training','Pilates (Private)','Surf Coaching','Muay Thai & Boxing','Life Coaching','Nutrition Coaching'],
  VILLA_SERVICE:       ['Daily Villa Cleaning','Deep Cleaning','Laundry & Ironing','Pool Cleaning & Maintenance','Garden Maintenance','Butler Service','Handyman & Repair','Grocery & Errand Run','Villa Management'],
  PET_SERVICE:         ['Dog Walking','Dog Sitting (At Your Villa)','Dog Boarding (At Sitter\'s Place)','Cat Sitting','Pet Grooming','Pet Transportation','Vet Visit Assistance'],
}

const AREAS = ['UBUD','CANGGU','SEMINYAK','KUTA','ULUWATU','GIANYAR','SANUR','NUSA_DUA','AMED','MEDEWI','JIMBARAN','KINTAMANI','SIDEMEN']
const AREA_LABEL: Record<string,string> = { UBUD:'Ubud',CANGGU:'Canggu',SEMINYAK:'Seminyak',KUTA:'Kuta',ULUWATU:'Uluwatu',GIANYAR:'Gianyar',SANUR:'Sanur',NUSA_DUA:'Nusa Dua',AMED:'Amed',MEDEWI:'Medewi',JIMBARAN:'Jimbaran',KINTAMANI:'Kintamani',SIDEMEN:'Sidemen' }
const CATEGORY_LABEL: Record<string,string> = { WELLNESS_BEAUTY:'Wellness & Beauty',PHOTOGRAPHY_CONTENT:'Photography & Content',TRANSPORTATION:'Transportation',FOOD_DINING:'Food & Dining',EVENT_WEDDING:'Event & Wedding',FITNESS_COACHING:'Fitness & Coaching',VILLA_SERVICE:'Villa Service',PET_SERVICE:'Pet Service' }

// ── New Listing Form ──────────────────────────────────────────────────────────

function NewListingPanel({ onSuccess }: { onSuccess: (slug: string) => void }) {
  const [title, setTitle]               = useState('')
  const [description, setDescription]   = useState('')
  const [category, setCategory]         = useState('WELLNESS_BEAUTY')
  const [subcategory, setSubcategory]   = useState('')
  const [area, setArea]                 = useState('CANGGU')
  const [priceType, setPriceType]       = useState('FIXED')
  const [price, setPrice]               = useState('')
  const [highlights, setHighlights]     = useState(['', '', ''])
  const [includes, setIncludes]         = useState(['', ''])
  const [excludes, setExcludes]         = useState([''])
  const [images, setImages]             = useState([''])
  const [instantConfirm, setInstantConfirm] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')

  const addItem  = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(p => [...p, ''])
  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, i: number) =>
    setter(p => p.filter((_, idx) => idx !== i))
  const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, i: number, v: string) =>
    setter(p => p.map((x, idx) => idx === i ? v : x))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !subcategory || !price) { setError('Please fill in all required fields.'); return }
    setSubmitting(true); setError('')
    const res = await createServiceListingAction({
      title, description, category, subcategory, area,
      priceType, price: Number(price),
      highlights, includes, excludes, images,
      instantConfirm,
    })
    setSubmitting(false)
    if (res.ok && res.slug) onSuccess(res.slug)
    else setError(res.error ?? 'Something went wrong.')
  }

  const input = (value: string, onChange: (v: string) => void, placeholder = '', type = 'text') => (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={false}
      style={{ width:'100%', height:42, borderRadius:10, border:'1px solid #E8E4DE', padding:'0 12px', fontSize:13, color:'#1D1D1D', outline:'none', backgroundColor:'#FAFAF8', fontFamily:'var(--font-inter)' }} />
  )

  const select = (value: string, onChange: (v: string) => void, options: {value:string;label:string}[]) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width:'100%', height:42, borderRadius:10, border:'1px solid #E8E4DE', padding:'0 12px', fontSize:13, color:'#1D1D1D', outline:'none', backgroundColor:'#FAFAF8', appearance:'none', fontFamily:'var(--font-inter)' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:26, fontWeight:700, color:'#1D1D1D', flex:1 }}>New Service Listing</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-[720px]">

        {/* Basic info */}
        <div className="bg-white rounded-xl p-6 space-y-4" style={{ border:'1px solid #E8E4DE' }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'#1D1D1D', marginBottom:4 }}>Basic Info</h2>

          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#1D1D1D', display:'block', marginBottom:6 }}>Title *</label>
            {input(title, setTitle, 'e.g. Balinese Massage at Your Villa')}
          </div>

          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#1D1D1D', display:'block', marginBottom:6 }}>Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your service in detail — what guests can expect, your experience, your approach..." rows={4}
              style={{ width:'100%', borderRadius:10, border:'1px solid #E8E4DE', padding:'10px 12px', fontSize:13, color:'#1D1D1D', outline:'none', backgroundColor:'#FAFAF8', resize:'vertical', fontFamily:'var(--font-inter)' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#1D1D1D', display:'block', marginBottom:6 }}>Category *</label>
              {select(category, v => { setCategory(v); setSubcategory('') },
                Object.entries(CATEGORY_LABEL).map(([k,v]) => ({ value:k, label:v })))}
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#1D1D1D', display:'block', marginBottom:6 }}>Subcategory *</label>
              <input list="subcats" value={subcategory} onChange={e => setSubcategory(e.target.value)}
                placeholder="Select or type..." required
                style={{ width:'100%', height:42, borderRadius:10, border:'1px solid #E8E4DE', padding:'0 12px', fontSize:13, color:'#1D1D1D', outline:'none', backgroundColor:'#FAFAF8', fontFamily:'var(--font-inter)' }} />
              <datalist id="subcats">
                {(SUBCATEGORIES[category] ?? []).map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#1D1D1D', display:'block', marginBottom:6 }}>Area *</label>
            {select(area, setArea, AREAS.map(a => ({ value:a, label:AREA_LABEL[a] })))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl p-6 space-y-4" style={{ border:'1px solid #E8E4DE' }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'#1D1D1D', marginBottom:4 }}>Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#1D1D1D', display:'block', marginBottom:6 }}>Price Type *</label>
              {select(priceType, setPriceType, [
                { value:'FIXED', label:'Fixed (per booking)' },
                { value:'HOURLY', label:'Hourly (per hour)' },
                { value:'DAILY', label:'Daily (per day)' },
              ])}
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#1D1D1D', display:'block', marginBottom:6 }}>Price (IDR) *</label>
              {input(price, setPrice, 'e.g. 350000', 'number')}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={instantConfirm} onChange={e => setInstantConfirm(e.target.checked)}
              style={{ width:16, height:16, accentColor:'#1D1D1D' }} />
            <span style={{ fontSize:13, color:'#1D1D1D' }}>Instant confirmation (no approval needed)</span>
          </label>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-xl p-6" style={{ border:'1px solid #E8E4DE' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize:15, fontWeight:700, color:'#1D1D1D' }}>Highlights</h2>
            <button type="button" onClick={() => addItem(setHighlights)}
              className="flex items-center gap-1 hover:opacity-70" style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#B58A4B' }}>
              <Plus size={13} /> Add
            </button>
          </div>
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                {input(h, v => updateItem(setHighlights, i, v), `Highlight ${i+1}`)}
                {highlights.length > 1 && (
                  <button type="button" onClick={() => removeItem(setHighlights, i)} style={{ background:'none', border:'none', cursor:'pointer', flexShrink:0, color:'#B66A45' }}><Trash2 size={14} /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Includes / Excludes */}
        <div className="bg-white rounded-xl p-6" style={{ border:'1px solid #E8E4DE' }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'#1D1D1D', marginBottom:14 }}>What's Included / Excluded</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize:12, fontWeight:600, color:'#2E4A35' }}>Included</p>
                <button type="button" onClick={() => addItem(setIncludes)} className="flex items-center gap-1 hover:opacity-70" style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#2E4A35' }}><Plus size={12} /> Add</button>
              </div>
              <div className="space-y-2">
                {includes.map((inc, i) => (
                  <div key={i} className="flex gap-2">
                    {input(inc, v => updateItem(setIncludes, i, v), `e.g. Towels & oils`)}
                    {includes.length > 1 && <button type="button" onClick={() => removeItem(setIncludes, i)} style={{ background:'none', border:'none', cursor:'pointer', flexShrink:0, color:'#B66A45' }}><Trash2 size={13} /></button>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize:12, fontWeight:600, color:'#B66A45' }}>Not Included</p>
                <button type="button" onClick={() => addItem(setExcludes)} className="flex items-center gap-1 hover:opacity-70" style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#B66A45' }}><Plus size={12} /> Add</button>
              </div>
              <div className="space-y-2">
                {excludes.map((exc, i) => (
                  <div key={i} className="flex gap-2">
                    {input(exc, v => updateItem(setExcludes, i, v), `e.g. Tips`)}
                    {excludes.length > 1 && <button type="button" onClick={() => removeItem(setExcludes, i)} style={{ background:'none', border:'none', cursor:'pointer', flexShrink:0, color:'#B66A45' }}><Trash2 size={13} /></button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl p-6" style={{ border:'1px solid #E8E4DE' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize:15, fontWeight:700, color:'#1D1D1D' }}>Images (URL)</h2>
            <button type="button" onClick={() => addItem(setImages)} className="flex items-center gap-1 hover:opacity-70" style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#B58A4B' }}><Plus size={13} /> Add</button>
          </div>
          <div className="space-y-2">
            {images.map((img, i) => (
              <div key={i} className="flex gap-2">
                {input(img, v => updateItem(setImages, i, v), 'https://images.unsplash.com/...')}
                {images.length > 1 && <button type="button" onClick={() => removeItem(setImages, i)} style={{ background:'none', border:'none', cursor:'pointer', flexShrink:0, color:'#B66A45' }}><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
          <p style={{ fontSize:11, color:'#9E9A94', marginTop:8 }}>Paste image URLs (Unsplash, your CDN, etc.). First image is the cover.</p>
        </div>

        {error && <p style={{ fontSize:13, color:'#B66A45', backgroundColor:'#FEF2F2', padding:'10px 14px', borderRadius:8 }}>{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ height:50, borderRadius:12, backgroundColor:'#1D1D1D', color:'white', fontSize:15, fontWeight:600, border:'none', cursor:submitting?'not-allowed':'pointer', fontFamily:'var(--font-inter)' }}>
          {submitting ? 'Creating listing…' : 'Publish Listing'}
        </button>
      </form>
    </div>
  )
}

// ── Listings ──────────────────────────────────────────────────────────────────

function ListingsPanel({ listings, onAdd }: { listings: ProviderListing[]; onAdd: () => void }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#1D1D1D' }}>My Listings</h1>
          <p style={{ fontSize: 14, color: '#6F675C', marginTop: 2 }}>{listings.length} service{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={onAdd}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ height:40, padding:'0 16px', backgroundColor:'#1D1D1D', color:'white', borderRadius:10, fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>
          <Plus size={14} /> Add listing
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
          <p style={{ fontSize: 15, color: '#6F675C', marginBottom:16 }}>No listings yet.</p>
          <button onClick={onAdd} style={{ height:40, padding:'0 20px', backgroundColor:'#1D1D1D', color:'white', borderRadius:10, fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>
            + Create your first listing
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(l => (
            <div key={l.id} className="bg-white rounded-xl p-5 flex gap-4" style={{ border: '1px solid #E8E4DE' }}>
              {l.image && (
                <div className="rounded-lg overflow-hidden flex-shrink-0" style={{ width: 80, height: 80 }}>
                  <img src={l.image} alt={l.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1D' }}>{l.title}</h3>
                    <p style={{ fontSize: 12, color: '#6F675C', marginTop: 2 }}>{l.subcategory} · {l.area}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={l.status} />
                    <a href={`/services/${l.slug}`} target="_blank" rel="noreferrer"
                      style={{ color:'#6F675C', display:'flex', alignItems:'center' }}>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  <span style={{ fontSize: 13, color: '#1D1D1D', fontWeight: 600 }}>
                    IDR {l.price.toLocaleString('id-ID')}{PRICE_LABEL[l.priceTypeKey]}
                  </span>
                  <span style={{ fontSize: 13, color: '#6F675C' }}>⭐ {l.rating.toFixed(1)} ({l.totalReviews})</span>
                  <span style={{ fontSize: 13, color: '#6F675C' }}>{l.bookings} bookings</span>
                  <span style={{ fontSize: 13, color: '#2E4A35', fontWeight: 600 }}>Earned: {fmt(l.earnings)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Bookings ──────────────────────────────────────────────────────────────────

function BookingsPanel({ bookings, onUpdate }: {
  bookings: ProviderBooking[]
  onUpdate: (id: string, action: 'accept' | 'decline') => Promise<boolean>
}) {
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch]             = useState('')
  const [updating, setUpdating]         = useState<string | null>(null)

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    setUpdating(id)
    const ok = await onUpdate(id, action)
    setUpdating(null)
    if (!ok) alert('Could not update this booking. Please refresh and try again.')
  }

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']
  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || b.guest.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#1D1D1D' }}>Bookings</h1>
          <p style={{ fontSize: 14, color: '#6F675C', marginTop: 2 }}>{bookings.length} total</p>
        </div>
        <button
          onClick={() => {
            const rows = [['Ref','Guest','Service','Date','Guests','Total','Status'], ...bookings.map(b => [b.ref, b.guest, b.service, b.date, b.guests, b.total, b.status])]
            const csv = rows.map(r => r.join(',')).join('\n')
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'bookings.csv'; a.click()
          }}
          className="flex items-center gap-2 px-4 rounded-xl hover:opacity-80"
          style={{ height: 40, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 13, color: '#6F675C', cursor: 'pointer' }}
        >
          <Download size={14} /> Export
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
          <input placeholder="Search guest, service, ref..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 40, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 34, paddingRight: 14, fontSize: 13, color: '#1D1D1D', outline: 'none', backgroundColor: 'white' }} />
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: statusFilter === s ? 600 : 400, flexShrink: 0, backgroundColor: statusFilter === s ? '#1D1D1D' : 'white', color: statusFilter === s ? 'white' : '#6F675C', border: '1px solid', borderColor: statusFilter === s ? '#1D1D1D' : '#E8E4DE', cursor: 'pointer' }}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
          <p style={{ fontSize: 14, color: '#6F675C' }}>No bookings found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E4DE' }}>
                  {['Ref', 'Guest', 'Service', 'Date', 'Guests', 'Total', 'Status', ''].map((h, hi) => (
                    <th key={hi} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6F675C', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3EEE5' : 'none' }}>
                    <td style={{ padding: '12px 16px', color: '#6F675C', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{b.ref.slice(0, 14)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 600, color: '#1D1D1D' }}>{b.guest}</p>
                      <p style={{ fontSize: 11, color: '#9E9A94' }}>{b.email}</p>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1D1D1D', maxWidth: 180 }}>
                      <p className="truncate">{b.service}</p>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6F675C', whiteSpace: 'nowrap' }}>{b.date}</td>
                    <td style={{ padding: '12px 16px', color: '#6F675C', textAlign: 'center' }}>{b.guests}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1D1D1D', whiteSpace: 'nowrap' }}>{fmt(b.total)}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={b.status} /></td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {b.status === 'Pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(b.id, 'accept')}
                            disabled={updating === b.id}
                            className="flex items-center gap-1 hover:opacity-80 disabled:opacity-40"
                            style={{ height: 30, padding: '0 12px', borderRadius: 8, backgroundColor: '#2E4A35', color: 'white', fontSize: 12, fontWeight: 600, border: 'none', cursor: updating === b.id ? 'wait' : 'pointer' }}
                          >
                            <Check size={12} /> Accept
                          </button>
                          <button
                            onClick={() => handleAction(b.id, 'decline')}
                            disabled={updating === b.id}
                            className="flex items-center gap-1 hover:opacity-80 disabled:opacity-40"
                            style={{ height: 30, padding: '0 12px', borderRadius: 8, backgroundColor: 'white', color: '#B66A45', fontSize: 12, fontWeight: 600, border: '1px solid #E8C9B8', cursor: updating === b.id ? 'wait' : 'pointer' }}
                          >
                            <X size={12} /> Decline
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Earnings ──────────────────────────────────────────────────────────────────

function EarningsPanel({ data }: { data: ProviderDashboardData }) {
  const gross = data.listings.reduce((a, l) => a + l.earnings, 0)
  const commission = Math.round(gross * 0.1)
  const net = gross - commission

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#1D1D1D', marginBottom: 24 }}>Earnings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Gross Revenue',  value: fmt(gross),      note: 'Total from all bookings' },
          { label: 'Platform Fee',   value: fmt(commission), note: '10% Balible commission' },
          { label: 'Your Earnings',  value: fmt(net),        note: 'After commission' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
            <p style={{ fontSize: 12, color: '#6F675C', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#1D1D1D' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#9E9A94', marginTop: 4 }}>{s.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1D', marginBottom: 14 }}>Earnings by Listing</h2>
        {data.listings.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6F675C' }}>No earnings yet.</p>
        ) : (
          <div className="space-y-3">
            {data.listings.map(l => (
              <div key={l.id} className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: '1px solid #F3EEE5' }}>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1D' }} className="truncate">{l.title}</p>
                  <p style={{ fontSize: 11, color: '#6F675C' }}>{l.bookings} bookings</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1D', flexShrink: 0 }}>{fmt(l.earnings)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  return (
    <div className="flex flex-col h-full p-5">
      <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'white', textDecoration: 'none', marginBottom: 32 }}>
        BALIBLE
      </a>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10 }}>PROVIDER</p>
      <nav className="space-y-1 flex-1">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors"
            style={{ backgroundColor: active === id ? 'rgba(255,255,255,0.12)' : 'transparent', color: active === id ? 'white' : 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: active === id ? 600 : 400, border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
        <a href="/dashboard" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', display: 'block', marginBottom: 8 }}>
          ← Host Dashboard
        </a>
        <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
          Back to site
        </a>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const EMPTY: ProviderDashboardData = { providerName: 'Provider', listings: [], bookings: [] }

export default function ProviderDashboard() {
  const [activeNav, setActiveNav]     = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData]               = useState<ProviderDashboardData>(EMPTY)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    getProviderDashboardData().then(d => {
      if (d) setData(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleBookingUpdate = async (id: string, action: 'accept' | 'decline') => {
    const res = await updateServiceBookingStatusAction(id, action)
    if (!res.ok || !res.status) return false
    const display = res.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'
    setData(d => ({ ...d, bookings: d.bookings.map(b => b.id === id ? { ...b, status: display } : b) }))
    return true
  }

  const renderPanel = () => {
    if (loading) return <p style={{ fontSize: 14, color: '#6F675C' }}>Loading…</p>
    switch (activeNav) {
      case 'overview':  return <OverviewPanel data={data} />
      case 'listings':  return <ListingsPanel listings={data.listings} onAdd={() => setActiveNav('new-listing')} />
      case 'new-listing': return <NewListingPanel onSuccess={slug => { window.location.href = `/services/${slug}` }} />
      case 'bookings':  return <BookingsPanel bookings={data.bookings} onUpdate={handleBookingUpdate} />
      case 'earnings':  return <EarningsPanel data={data} />
      case 'settings':  return (
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#1D1D1D', marginBottom: 8 }}>Settings</h1>
          <p style={{ fontSize: 14, color: '#6F675C' }}>Profile and account settings coming soon.</p>
        </div>
      )
      default: return <OverviewPanel data={data} />
    }
  }

  return (
    <div className="flex" style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F3EEE5', minHeight: '100vh' }}>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 flex flex-col" style={{ width: 240, backgroundColor: '#1E2F23', height: '100%' }}>
            <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            <Sidebar active={activeNav} setActive={id => { setActiveNav(id); setSidebarOpen(false) }} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0" style={{ width: 240, backgroundColor: '#1E2F23', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar active={activeNav} setActive={setActiveNav} />
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-5 lg:p-8 pb-24 lg:pb-8">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={22} style={{ color: '#1D1D1D' }} />
          </button>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#1D1D1D' }}>
            {NAV.find(n => n.id === activeNav)?.label ?? 'Dashboard'}
          </span>
          <div style={{ width: 22 }} />
        </div>

        {renderPanel()}
      </main>
    </div>
  )
}
