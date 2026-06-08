'use client'

import { useState, useEffect, useMemo } from 'react'
import { Heart, Star, MapPin, Clock, Trash2, Search, Home, Map, User, SlidersHorizontal } from 'lucide-react'
import Navbar from '@/components/Navbar'
import WishlistHeart from '@/components/WishlistHeart'
import MobileNav from '@/components/MobileNav'

// All known experiences — this mirrors the static data in the app
const ALL_EXPERIENCES = [
  { slug: 'pottery-making-class',      title: 'Pottery Making Class',           area: 'Ubud',     price: 450000, rating: 4.9, reviews: 128, duration: '2.5 hours', category: 'Art & Craft',  image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80' },
  { slug: 'silver-jewelry-workshop',   title: 'Silver Jewelry Workshop',        area: 'Canggu',   price: 550000, rating: 4.8, reviews: 94,  duration: '3 hours',   category: 'Art & Craft',  image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&auto=format&fit=crop&q=80' },
  { slug: 'batik-painting-workshop',   title: 'Batik Painting Workshop',        area: 'Ubud',     price: 380000, rating: 4.7, reviews: 64,  duration: '3 hours',   category: 'Art & Craft',  image: 'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=400&auto=format&fit=crop&q=80' },
  { slug: 'sound-healing-journey',     title: 'Sound Healing Journey',          area: 'Ubud',     price: 350000, rating: 4.8, reviews: 178, duration: '90 minutes', category: 'Wellness',     image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80' },
  { slug: 'sunrise-yoga-class',        title: 'Sunrise Yoga & Meditation',      area: 'Canggu',   price: 250000, rating: 4.9, reviews: 203, duration: '75 minutes', category: 'Wellness',     image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&auto=format&fit=crop&q=80' },
  { slug: 'water-temple-purification', title: 'Water Temple Purification',      area: 'Gianyar',  price: 600000, rating: 4.8, reviews: 78,  duration: '4 hours',   category: 'Culture',      image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&auto=format&fit=crop&q=80' },
  { slug: 'uluwatu-kecak-sunset',      title: 'Uluwatu Sunset & Kecak Dance',   area: 'Uluwatu',  price: 450000, rating: 4.9, reviews: 312, duration: '3 hours',   category: 'Culture',      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80' },
  { slug: 'balinese-cooking-class',    title: 'Balinese Cooking Class',         area: 'Seminyak', price: 480000, rating: 4.8, reviews: 156, duration: '3.5 hours', category: 'Food & Drink', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80' },
  { slug: 'jimbaran-seafood-sunset',   title: 'Jimbaran Seafood & Sunset',      area: 'Jimbaran', price: 350000, rating: 4.6, reviews: 89,  duration: '2 hours',   category: 'Food & Drink', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop&q=80' },
  { slug: 'beginner-surf-lesson',      title: 'Beginner Surf Lesson',           area: 'Kuta',     price: 320000, rating: 4.7, reviews: 428, duration: '2 hours',   category: 'Surf & Water', image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&auto=format&fit=crop&q=80' },
  { slug: 'snorkeling-amed',           title: 'Snorkeling at Amed Reef',        area: 'Amed',     price: 420000, rating: 4.8, reviews: 67,  duration: '3 hours',   category: 'Diving',       image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&auto=format&fit=crop&q=80' },
  { slug: 'rice-terrace-walk',         title: 'Tegalalang Rice Terrace Walk',   area: 'Ubud',     price: 280000, rating: 4.8, reviews: 192, duration: '2.5 hours', category: 'Nature',       image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&auto=format&fit=crop&q=80' },
]

// Default wishlist slugs to populate for first-time visitors
const DEFAULT_WISHLIST = ['pottery-making-class', 'sound-healing-journey', 'uluwatu-kecak-sunset']

const STORAGE_KEY = 'balible_wishlist'

function WishlistCard({ exp }: { exp: typeof ALL_EXPERIENCES[0] }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow" style={{ border: '1px solid #E8E4DE' }}>
      <div className="relative" style={{ height: 180 }}>
        <a href={`/experiences/${exp.slug}`}>
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
        </a>
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-inter)' }}
        >
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
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>({exp.reviews})</span>
          <span style={{ color: '#E8E4DE' }}>·</span>
          <Clock size={11} style={{ color: '#6F675C' }} />
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{exp.duration}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>
            <span style={{ color: '#C8A97E', fontWeight: 600 }}>IDR</span>{' '}
            <span style={{ fontWeight: 600 }}>{exp.price.toLocaleString('id-ID')}</span>
          </p>
          <a
            href={`/experiences/${exp.slug}`}
            className="hover:opacity-90 transition-opacity"
            style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 14px', backgroundColor: '#111111', color: 'white', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
          >
            Book now
          </a>
        </div>
      </div>
    </div>
  )
}

const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated']
const ALL_AREAS = ['All areas', ...Array.from(new Set(ALL_EXPERIENCES.map(e => e.area))).sort()]
const ALL_CATEGORIES = ['All categories', ...Array.from(new Set(ALL_EXPERIENCES.map(e => e.category))).sort()]

export default function WishlistPage() {
  const [slugs, setSlugs]       = useState<string[]>([])
  const [mounted, setMounted]   = useState(false)
  const [sort, setSort]         = useState('Recommended')
  const [area, setArea]         = useState('All areas')
  const [category, setCategory] = useState('All categories')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setSlugs(JSON.parse(stored)) } catch { setSlugs(DEFAULT_WISHLIST) }
    } else {
      setSlugs(DEFAULT_WISHLIST)
    }
    setMounted(true)
  }, [])

  // Re-sync when WishlistHeart toggles (storage event from same tab isn't fired,
  // so we listen to the custom storage key update)
  useEffect(() => {
    const sync = () => {
      try { setSlugs(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')) } catch {}
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const clearAll = () => {
    setSlugs([])
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  }

  const baseItems = ALL_EXPERIENCES.filter(e => slugs.includes(e.slug))

  const items = useMemo(() => {
    let result = baseItems
    if (area !== 'All areas') result = result.filter(e => e.area === area)
    if (category !== 'All categories') result = result.filter(e => e.category === category)
    if (sort === 'Price: Low to High')  result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'Price: High to Low')  result = [...result].sort((a, b) => b.price - a.price)
    if (sort === 'Top Rated')           result = [...result].sort((a, b) => b.rating - a.rating)
    return result
  }, [baseItems, sort, area, category])

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
              {mounted ? (baseItems.length > 0 ? `${baseItems.length} saved experience${baseItems.length !== 1 ? 's' : ''}` : 'No saved experiences yet') : ''}
            </p>
          </div>
          {mounted && baseItems.length > 0 && (
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
      {mounted && baseItems.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5" style={{ color: '#6F675C' }}>
              <SlidersHorizontal size={13} />
              <span style={{ fontSize: 13 }}>Filter:</span>
            </div>
            {/* Area */}
            <select value={area} onChange={e => setArea(e.target.value)}
              style={{ height: 36, borderRadius: 8, border: '1px solid #E8E4DE', padding: '0 10px', fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', backgroundColor: 'white', cursor: 'pointer', outline: 'none' }}>
              {ALL_AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
            {/* Category */}
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ height: 36, borderRadius: 8, border: '1px solid #E8E4DE', padding: '0 10px', fontSize: 13, fontFamily: 'var(--font-inter)', color: '#111111', backgroundColor: 'white', cursor: 'pointer', outline: 'none' }}>
              {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
        {!mounted ? null : baseItems.length === 0 ? (
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

      {/* MOBILE BOTTOM NAV */}
      <MobileNav />
    </div>
  )
}
