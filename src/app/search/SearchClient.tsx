'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Search, CalendarDays, Star, MapPin,
  SlidersHorizontal, X, User, ChevronDown,
} from 'lucide-react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import WishlistHeart from '@/components/WishlistHeart'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'

export type SearchResult = {
  id: number | string
  slug: string
  title: string
  area: string
  rating: number
  reviews: number
  price: number
  durationMins: number
  category: string
  photo: string
}

const CATEGORIES  = ['All Categories', 'Art & Craft', 'Wellness & Healing', 'Culture', 'Culinary', 'Spiritual', 'Nature & Outdoors', 'Water Activities', 'Local Experts']
const LOCATIONS   = ['All Locations', 'Ubud', 'Canggu', 'Seminyak', 'Gianyar', 'Jimbaran', 'Kuta', 'Uluwatu', 'Amed', 'Sidemen']
const DURATIONS   = ['Any duration', 'Under 2 hours', '2–4 hours', '4+ hours']
const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Most Reviews']

// ── Price Range Slider ────────────────────────────────────────────────────────

function PriceRange({ value, onChange }: { value: [number, number]; onChange: (v: [number, number]) => void }) {
  const MIN = 0, MAX = 700000
  const leftPct  = ((value[0] - MIN) / (MAX - MIN)) * 100
  const rightPct = ((value[1] - MIN) / (MAX - MIN)) * 100
  return (
    <div className="mt-3">
      <div className="relative" style={{ height: 4, marginTop: 12, marginBottom: 12 }}>
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#E8E4DE' }} />
        <div className="absolute h-full rounded-full" style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%`, backgroundColor: '#C8A97E' }} />
        <input type="range" min={MIN} max={MAX} step={50000} value={value[0]} onChange={e => { const v = +e.target.value; if (v <= value[1] - 50000) onChange([v, value[1]]) }} className="price-range" style={{ zIndex: 1 }} />
        <input type="range" min={MIN} max={MAX} step={50000} value={value[1]} onChange={e => { const v = +e.target.value; if (v >= value[0] + 50000) onChange([value[0], v]) }} className="price-range" />
      </div>
      <div className="flex justify-between">
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>IDR {value[0].toLocaleString('id-ID')}</span>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>IDR {value[1].toLocaleString('id-ID')}</span>
      </div>
    </div>
  )
}

// ── Filter Panel ──────────────────────────────────────────────────────────────

type Filters = {
  category: string; location: string; duration: string
  priceRange: [number, number]; date: string; guests: number
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#111111', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
      {children}
    </p>
  )
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-md outline-none appearance-none cursor-pointer" style={{ border: '1px solid #E8E4DE', fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', backgroundColor: 'white' }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )
}

function FilterPanel({ filters, onChange, mobile = false, onClose }: { filters: Filters; onChange: (f: Partial<Filters>) => void; mobile?: boolean; onClose?: () => void }) {
  const hasActive = filters.category !== 'All Categories' || filters.location !== 'All Locations' || filters.duration !== 'Any duration' || filters.priceRange[0] > 0 || filters.priceRange[1] < 700000 || filters.guests > 1
  return (
    <div className={mobile ? 'p-5' : 'p-0'}>
      {mobile && (
        <div className="flex items-center justify-between mb-5">
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>Filters</span>
          <button onClick={onClose}><X size={20} style={{ color: '#111111' }} /></button>
        </div>
      )}
      {!mobile && (
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>Filters</h3>
          {hasActive && (
            <button onClick={() => onChange({ category: 'All Categories', location: 'All Locations', duration: 'Any duration', priceRange: [0, 700000], date: '', guests: 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 12, color: '#B66A45' }}>
              Clear all
            </button>
          )}
        </div>
      )}
      <div className="space-y-5">
        <div>
          <FilterLabel>Category</FilterLabel>
          <FilterSelect value={filters.category} onChange={v => onChange({ category: v })} options={CATEGORIES} />
        </div>
        <div>
          <FilterLabel>Location</FilterLabel>
          <FilterSelect value={filters.location} onChange={v => onChange({ location: v })} options={LOCATIONS} />
        </div>
        <div>
          <FilterLabel>Date</FilterLabel>
          <input type="date" value={filters.date} onChange={e => onChange({ date: e.target.value })} className="w-full px-3 py-2 rounded-md outline-none" style={{ border: '1px solid #E8E4DE', fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }} />
        </div>
        <div>
          <FilterLabel>Price range</FilterLabel>
          <PriceRange value={filters.priceRange} onChange={v => onChange({ priceRange: v })} />
        </div>
        <div>
          <FilterLabel>Duration</FilterLabel>
          <FilterSelect value={filters.duration} onChange={v => onChange({ duration: v })} options={DURATIONS} />
        </div>
      </div>
      {mobile && (
        <div className="mt-6 flex gap-3">
          {hasActive && (
            <button className="flex-1 py-3 rounded-lg" style={{ border: '1px solid #E8E4DE', fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 500, color: '#111111', backgroundColor: 'white', cursor: 'pointer' }} onClick={() => onChange({ category: 'All Categories', location: 'All Locations', duration: 'Any duration', priceRange: [0, 700000], date: '', guests: 1 })}>
              Clear
            </button>
          )}
          <button className="flex-1 py-3 rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: '#111111', color: 'white', fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }} onClick={onClose}>
            View results
          </button>
        </div>
      )}
    </div>
  )
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl" style={{ border: '1px solid #E8E4DE' }}>
      <div className="flex-shrink-0 rounded-lg overflow-hidden" style={{ width: 110, height: 110, backgroundColor: '#E8E4DE' }}>
        <div className="w-full h-full" style={{ background: 'linear-gradient(90deg, #E8E4DE 25%, #F0EDE8 50%, #E8E4DE 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      </div>
      <div className="flex flex-col justify-between flex-1 py-0.5">
        <div>
          <div className="rounded mb-2" style={{ height: 16, width: '70%', backgroundColor: '#E8E4DE', background: 'linear-gradient(90deg, #E8E4DE 25%, #F0EDE8 50%, #E8E4DE 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          <div className="rounded" style={{ height: 12, width: '45%', backgroundColor: '#E8E4DE', background: 'linear-gradient(90deg, #E8E4DE 25%, #F0EDE8 50%, #E8E4DE 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s 0.1s infinite' }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="rounded" style={{ height: 14, width: '35%', backgroundColor: '#E8E4DE', background: 'linear-gradient(90deg, #E8E4DE 25%, #F0EDE8 50%, #E8E4DE 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s 0.2s infinite' }} />
          <div className="rounded-full" style={{ height: 26, width: 64, backgroundColor: '#E8E4DE', background: 'linear-gradient(90deg, #E8E4DE 25%, #F0EDE8 50%, #E8E4DE 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s 0.15s infinite' }} />
        </div>
      </div>
      <style>{`@keyframes shimmer { to { background-position: -200% 0 } }`}</style>
    </div>
  )
}

// ── Result Card ───────────────────────────────────────────────────────────────

function ResultCard({ r, date, guests }: { r: SearchResult; date: string; guests: number }) {
  const durationLabel = r.durationMins < 60
    ? `${r.durationMins} min`
    : r.durationMins % 60 === 0
      ? `${r.durationMins / 60} hr`
      : `${Math.floor(r.durationMins / 60)}.${(r.durationMins % 60) / 6} hr`
  const qs = [date && `date=${date}`, guests > 1 && `guests=${guests}`].filter(Boolean).join('&')
  const href = `/experiences/${r.slug}${qs ? `?${qs}` : ''}`

  return (
    <a href={href} className="flex gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-shadow" style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}>
      <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 110, height: 110 }}>
        <Image src={r.photo} alt={r.title} fill sizes="110px" className="object-cover" />
        <div className="absolute top-1.5 right-1.5">
          <WishlistHeart slug={r.slug} size={11} compact />
        </div>
        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 9, fontWeight: 600 }}>
          {r.category}
        </span>
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <h3 className="leading-snug" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111' }}>
            {r.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
            <div className="flex items-center gap-1">
              <MapPin size={10} style={{ color: '#6F675C' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{r.area}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={11} fill="#C8A97E" color="#C8A97E" />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 700, color: '#111111' }}>{r.rating}</span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>({r.reviews})</span>
            </div>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>⏱ {durationLabel}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>
            From <span style={{ color: '#C8A97E', fontWeight: 600 }}>IDR</span> <span style={{ fontWeight: 600 }}>{r.price.toLocaleString('id-ID')}</span>
          </p>
          <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#111111', color: 'white', fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 500 }}>
            Book →
          </span>
        </div>
      </div>
    </a>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: Filters = {
  category: 'All Categories', location: 'All Locations',
  duration: 'Any duration', priceRange: [0, 700000], date: '', guests: 1,
}

export default function SearchClient({ initialResults, initialQuery = '', initialDate = '' }: { initialResults: SearchResult[]; initialQuery?: string; initialDate?: string }) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch]         = useState(initialQuery)
  const [sort, setSort]             = useState('Recommended')
  const [filters, setFilters]       = useState<Filters>({ ...DEFAULT_FILTERS, date: initialDate })
  const [mounted, setMounted]       = useState(false)
  useEffect(() => setMounted(true), [])

  const updateFilters = (patch: Partial<Filters>) => setFilters(f => ({ ...f, ...patch }))

  const results = useMemo(() => {
    let list = initialResults.filter(r => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.area.toLowerCase().includes(search.toLowerCase())) return false
      if (filters.category !== 'All Categories' && r.category !== filters.category) return false
      if (filters.location !== 'All Locations'  && r.area     !== filters.location) return false
      if (r.price < filters.priceRange[0] || r.price > filters.priceRange[1]) return false
      if (filters.duration === 'Under 2 hours' && r.durationMins >= 120) return false
      if (filters.duration === '2–4 hours'     && (r.durationMins < 120 || r.durationMins > 240)) return false
      if (filters.duration === '4+ hours'      && r.durationMins < 240) return false
      return true
    })
    switch (sort) {
      case 'Price: Low to High':  list = [...list].sort((a, b) => a.price   - b.price);   break
      case 'Price: High to Low':  list = [...list].sort((a, b) => b.price   - a.price);   break
      case 'Top Rated':           list = [...list].sort((a, b) => b.rating  - a.rating);  break
      case 'Most Reviews':        list = [...list].sort((a, b) => b.reviews - a.reviews); break
    }
    return list
  }, [search, filters, sort, initialResults])

  const activeFilterCount = [
    filters.category !== 'All Categories',
    filters.location !== 'All Locations',
    filters.duration !== 'Any duration',
    filters.priceRange[0] > 0 || filters.priceRange[1] < 700000,
    !!filters.date,
    filters.guests > 1,
  ].filter(Boolean).length

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      {/* ── SEARCH BAR ── */}
      <div className="bg-white sticky top-16 z-40" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="px-4 py-3 max-w-[1440px] mx-auto">

          {/* Desktop: single pill with 4 sections */}
          <div className="hidden sm:flex items-center bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DE', height: 52 }}>
            {/* What */}
            <div className="flex items-center gap-2 px-4 h-full flex-1 min-w-0">
              <Search size={14} style={{ color: '#6F675C', flexShrink: 0 }} />
              <input
                type="text" placeholder="Search experiences…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 outline-none bg-transparent min-w-0"
                style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111' }}
              />
              {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: '#6F675C' }} /></button>}
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: '#E8E4DE', flexShrink: 0 }} />

            {/* Place */}
            <div className="flex items-center gap-2 px-4 h-full" style={{ minWidth: 148 }}>
              <MapPin size={13} style={{ color: '#6F675C', flexShrink: 0 }} />
              <select
                value={filters.location}
                onChange={e => updateFilters({ location: e.target.value })}
                className="outline-none appearance-none cursor-pointer bg-transparent flex-1"
                style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: filters.location === 'All Locations' ? '#9E9A94' : '#111111' }}
              >
                <option value="All Locations">Anywhere</option>
                {LOCATIONS.filter(l => l !== 'All Locations').map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: '#E8E4DE', flexShrink: 0 }} />

            {/* Date */}
            <div className="flex items-center gap-2 px-4 h-full" style={{ minWidth: 160 }}>
              <CalendarDays size={13} style={{ color: '#6F675C', flexShrink: 0 }} />
              <input
                type="date" value={filters.date}
                onChange={e => updateFilters({ date: e.target.value })}
                className="outline-none bg-transparent flex-1"
                style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: filters.date ? '#111111' : '#9E9A94' }}
              />
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: '#E8E4DE', flexShrink: 0 }} />

            {/* Guests */}
            <div className="flex items-center gap-2 px-4 h-full" style={{ minWidth: 140 }}>
              <User size={13} style={{ color: '#6F675C', flexShrink: 0 }} />
              <select
                value={filters.guests}
                onChange={e => updateFilters({ guests: Number(e.target.value) })}
                className="outline-none appearance-none cursor-pointer bg-transparent"
                style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}
              >
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
              </select>
            </div>

            {/* Search button */}
            <div className="pr-2 pl-2 h-full flex items-center flex-shrink-0">
              <div className="flex items-center gap-1.5 rounded-lg px-4 h-9" style={{ backgroundColor: '#111111', color: 'white', fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 500 }}>
                <Search size={13} />
                Search
              </div>
            </div>
          </div>

          {/* Mobile: stacked rows */}
          <div className="sm:hidden space-y-2">
            <div className="flex items-center bg-white rounded-xl gap-2" style={{ border: '1px solid #E8E4DE', height: 44 }}>
              <Search size={14} className="ml-3 flex-shrink-0" style={{ color: '#6F675C' }} />
              <input
                type="text" placeholder="Search experiences…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 outline-none bg-transparent"
                style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111' }}
              />
              {search && <button onClick={() => setSearch('')} className="mr-2"><X size={13} style={{ color: '#6F675C' }} /></button>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5" style={{ border: '1px solid #E8E4DE', height: 40 }}>
                <MapPin size={12} style={{ color: '#6F675C', flexShrink: 0 }} />
                <select
                  value={filters.location}
                  onChange={e => updateFilters({ location: e.target.value })}
                  className="outline-none appearance-none cursor-pointer bg-transparent flex-1 min-w-0"
                  style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: filters.location === 'All Locations' ? '#9E9A94' : '#111111' }}
                >
                  <option value="All Locations">Place</option>
                  {LOCATIONS.filter(l => l !== 'All Locations').map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5" style={{ border: '1px solid #E8E4DE', height: 40 }}>
                <CalendarDays size={12} style={{ color: '#6F675C', flexShrink: 0 }} />
                <input
                  type="date" value={filters.date}
                  onChange={e => updateFilters({ date: e.target.value })}
                  className="outline-none bg-transparent flex-1 min-w-0"
                  style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: filters.date ? '#111111' : '#9E9A94' }}
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5" style={{ border: '1px solid #E8E4DE', height: 40 }}>
                <User size={12} style={{ color: '#6F675C', flexShrink: 0 }} />
                <select
                  value={filters.guests}
                  onChange={e => updateFilters({ guests: Number(e.target.value) })}
                  className="outline-none appearance-none cursor-pointer bg-transparent flex-1 min-w-0"
                  style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#111111' }}
                >
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n === 1 ? '1 guest' : `${n} guests`}</option>)}
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="max-w-[1440px] mx-auto flex gap-6 px-4 lg:px-16 py-6">

        {/* ── FILTER SIDEBAR (desktop) ── */}
        <aside className="hidden lg:block flex-shrink-0 bg-white rounded-xl p-5" style={{ width: 240, border: '1px solid #E8E4DE', alignSelf: 'flex-start', position: 'sticky', top: 132 }}>
          <FilterPanel filters={filters} onChange={updateFilters} />
        </aside>

        {/* ── RESULTS ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111' }}>
                {search ? `Results for "${search}"` : 'All Experiences'}
              </h1>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', marginTop: 2 }}>
                {search
                  ? `${results.length} experience${results.length !== 1 ? 's' : ''} found`
                  : `${results.length} curated experiences across the island`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative hidden sm:block">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg outline-none cursor-pointer"
                  style={{ border: '1px solid #E8E4DE', fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111', backgroundColor: 'white' }}
                >
                  {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={13} style={{ color: '#6F675C', position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              {/* Mobile filter button */}
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg lg:hidden hover:opacity-80 transition-opacity"
                style={{ border: '1px solid #E8E4DE', fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C8A97E', color: 'white', fontSize: 10, fontWeight: 700 }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category !== 'All Categories' && (
                <button onClick={() => updateFilters({ category: 'All Categories' })} className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: '#111111', color: 'white', fontSize: 12, fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}>
                  {filters.category} <X size={10} />
                </button>
              )}
              {filters.location !== 'All Locations' && (
                <button onClick={() => updateFilters({ location: 'All Locations' })} className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: '#111111', color: 'white', fontSize: 12, fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}>
                  {filters.location} <X size={10} />
                </button>
              )}
              {filters.duration !== 'Any duration' && (
                <button onClick={() => updateFilters({ duration: 'Any duration' })} className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: '#111111', color: 'white', fontSize: 12, fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}>
                  {filters.duration} <X size={10} />
                </button>
              )}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 700000) && (
                <button onClick={() => updateFilters({ priceRange: [0, 700000] })} className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: '#111111', color: 'white', fontSize: 12, fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}>
                  IDR {(filters.priceRange[0]/1000).toFixed(0)}K–{(filters.priceRange[1]/1000).toFixed(0)}K <X size={10} />
                </button>
              )}
            </div>
          )}

          {!mounted ? (
            <div className="space-y-3 pb-24">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', marginBottom: 8 }}>No results found</p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginBottom: 20 }}>Try adjusting your filters or search term.</p>
              <button onClick={() => { setSearch(''); setFilters(DEFAULT_FILTERS) }} style={{ height: 40, padding: '0 20px', backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3 pb-24">
              {results.map(r => <ResultCard key={String(r.id)} r={r} date={filters.date} guests={filters.guests} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FILTER SHEET ── */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto lg:hidden" style={{ boxShadow: '0 -4px 32px rgba(0,0,0,0.12)' }}>
            <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ backgroundColor: '#E8E4DE' }} />
            <FilterPanel filters={filters} onChange={updateFilters} mobile onClose={() => setFilterOpen(false)} />
          </div>
        </>
      )}

      <Footer />
      <MobileNav />
    </div>
  )
}
