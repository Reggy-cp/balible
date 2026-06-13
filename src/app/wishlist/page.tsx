'use client'

import { useState, useEffect, useMemo } from 'react'
import { Heart, Star, MapPin, Clock, Trash2, Search, Home, Map, User, SlidersHorizontal } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import WishlistHeart from '@/components/WishlistHeart'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import { getUserWishlist, getExperiencesForWishlist, type ExpWishlistMeta } from '@/lib/actions'

const STORAGE_KEY = 'balible_wishlist'

function WishlistCard({ exp }: { exp: ExpWishlistMeta }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow" style={{ border: '1px solid #E8E4DE' }}>

      {/* Mobile: horizontal search-style */}
      <div className="md:hidden flex gap-3 p-3">
        <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 100, height: 100 }}>
          <a href={`/experiences/${exp.slug}`}>
            <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
          </a>
          <div className="absolute top-1.5 right-1.5">
            <WishlistHeart slug={exp.slug} size={11} compact />
          </div>
          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
            {exp.category}
          </span>
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
          <div>
            <a href={`/experiences/${exp.slug}`} style={{ textDecoration: 'none' }}>
              <h3 className="line-clamp-2 leading-snug" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111' }}>
                {exp.title}
              </h3>
            </a>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
              <div className="flex items-center gap-1">
                <MapPin size={10} style={{ color: '#6F675C' }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{exp.area}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={10} fill="#C8A97E" color="#C8A97E" />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#111111' }}>{exp.rating.toFixed(1)}</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>({exp.totalReviews})</span>
              </div>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>⏱ {exp.duration}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>
                From <span style={{ color: '#C8A97E', fontWeight: 600 }}>IDR</span> <span style={{ fontWeight: 600 }}>{exp.price.toLocaleString('id-ID')}</span>
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#4A7C59', marginTop: 1 }}>✓ Free cancellation</p>
            </div>
            <a href={`/experiences/${exp.slug}`} className="px-3 py-1 rounded-full" style={{ backgroundColor: '#111111', color: 'white', fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 500, textDecoration: 'none' }}>
              Book →
            </a>
          </div>
        </div>
      </div>

      {/* Desktop: vertical card */}
      <div className="hidden md:block">
        <div className="relative" style={{ height: 180 }}>
          <a href={`/experiences/${exp.slug}`}>
            <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
          </a>
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
            {exp.category}
          </span>
          <div className="absolute top-3 right-3">
            <WishlistHeart slug={exp.slug} size={14} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1">
            <MapPin size={11} style={{ color: '#6F675C' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{exp.area}</span>
          </div>
          <a href={`/experiences/${exp.slug}`} style={{ textDecoration: 'none' }}>
            <h3 className="mt-1 leading-snug hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 600, color: '#111111' }}>
              {exp.title}
            </h3>
          </a>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star size={11} fill="#C8A97E" color="#C8A97E" />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 700, color: '#111111' }}>{exp.rating.toFixed(1)}</span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>({exp.totalReviews})</span>
            <span style={{ color: '#E8E4DE' }}>·</span>
            <Clock size={11} style={{ color: '#6F675C' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{exp.duration}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>
              <span style={{ color: '#C8A97E', fontWeight: 600 }}>IDR</span>{' '}
              <span style={{ fontWeight: 600 }}>{exp.price.toLocaleString('id-ID')}</span>
            </p>
            <a href={`/experiences/${exp.slug}`} className="hover:opacity-90 transition-opacity" style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 14px', backgroundColor: '#111111', color: 'white', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
              Book now
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}

const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated']

export default function WishlistPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [slugs, setSlugs]           = useState<string[]>([])
  const [expDetails, setExpDetails] = useState<ExpWishlistMeta[]>([])
  const [mounted, setMounted]       = useState(false)
  const [sort, setSort]             = useState('Recommended')
  const [area, setArea]             = useState('All areas')
  const [category, setCategory]     = useState('All categories')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    try { setSlugs(stored ? JSON.parse(stored) : []) } catch { setSlugs([]) }
    setMounted(true)
  }, [])

  // Sync DB wishlist when signed in
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    getUserWishlist().then(dbSlugs => {
      if (dbSlugs.length > 0) {
        const merged = Array.from(new Set([...dbSlugs]))
        setSlugs(merged)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      }
    }).catch(() => {})
  }, [isLoaded, isSignedIn])

  // Fetch experience details whenever slug list changes
  useEffect(() => {
    if (slugs.length === 0) { setExpDetails([]); return }
    getExperiencesForWishlist(slugs).then(setExpDetails).catch(() => {})
  }, [slugs])

  useEffect(() => {
    const sync = () => {
      try { setSlugs(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')) } catch {}
    }
    window.addEventListener('storage', sync)
    window.addEventListener('balible:wishlist', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('balible:wishlist', sync)
    }
  }, [])

  const clearAll = () => {
    setSlugs([])
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  }

  const allAreas      = ['All areas',      ...Array.from(new Set(expDetails.map(e => e.area))).sort()]
  const allCategories = ['All categories', ...Array.from(new Set(expDetails.map(e => e.category))).sort()]

  const items = useMemo(() => {
    let result = expDetails
    if (area !== 'All areas')             result = result.filter(e => e.area === area)
    if (category !== 'All categories')    result = result.filter(e => e.category === category)
    if (sort === 'Price: Low to High')    result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'Price: High to Low')    result = [...result].sort((a, b) => b.price - a.price)
    if (sort === 'Top Rated')             result = [...result].sort((a, b) => b.rating - a.rating)
    return result
  }, [expDetails, sort, area, category])

  const hasFilters = area !== 'All areas' || category !== 'All categories' || sort !== 'Recommended'

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      {/* PAGE HEADER */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: '#111111' }}>
              My Wishlist
            </h1>
            <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
              {mounted ? (expDetails.length > 0 ? `${expDetails.length} saved experience${expDetails.length !== 1 ? 's' : ''}` : 'No saved experiences yet') : ''}
            </p>
          </div>
          {mounted && expDetails.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 13, color: '#B66A45' }}
            >
              <Trash2 size={13} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* FILTERS + SORT */}
      {mounted && expDetails.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5" style={{ color: '#6F675C' }}>
              <SlidersHorizontal size={13} />
              <span style={{ fontSize: 13 }}>Filter:</span>
            </div>
            {/* Area */}
            <select value={area} onChange={e => setArea(e.target.value)}
              style={{ height: 36, borderRadius: 8, border: '1px solid #E8E4DE', padding: '0 10px', fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', backgroundColor: 'white', cursor: 'pointer', outline: 'none' }}>
              {allAreas.map(a => <option key={a}>{a}</option>)}
            </select>
            {/* Category */}
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ height: 36, borderRadius: 8, border: '1px solid #E8E4DE', padding: '0 10px', fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', backgroundColor: 'white', cursor: 'pointer', outline: 'none' }}>
              {allCategories.map(c => <option key={c}>{c}</option>)}
            </select>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ height: 36, borderRadius: 8, border: '1px solid #E8E4DE', padding: '0 10px', fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', backgroundColor: 'white', cursor: 'pointer', outline: 'none', marginLeft: 'auto' }}>
              {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            {hasFilters && (
              <button onClick={() => { setArea('All areas'); setCategory('All categories'); setSort('Recommended') }}
                style={{ height: 36, paddingInline: 12, borderRadius: 8, border: 'none', backgroundColor: '#F5F1EB', color: '#B66A45', fontSize: 13, cursor: 'pointer' }}>
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-24">
        {!mounted ? null : expDetails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#F5F1EB' }}>
              <Heart size={32} style={{ color: '#C8A97E' }} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', marginBottom: 8 }}>
              Your wishlist is empty
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', maxWidth: 360, lineHeight: 1.6, marginBottom: 28 }}>
              Tap the heart on any experience to save it here and come back to it later.
            </p>
            <a
              href="/search"
              style={{ height: 44, display: 'inline-flex', alignItems: 'center', padding: '0 28px', backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
              className="hover:opacity-90 transition-opacity"
            >
              Browse experiences →
            </a>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginBottom: 12 }}>No saved experiences match your filters.</p>
            <button onClick={() => { setArea('All areas'); setCategory('All categories') }}
              style={{ fontSize: 13, color: '#C8A97E', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-4">
            {items.map(exp => (
              <WishlistCard key={exp.slug} exp={exp} />
            ))}
          </div>
        )}
      </div>

      <Footer />
      {/* MOBILE BOTTOM NAV */}
      <MobileNav />
    </div>
  )
}
