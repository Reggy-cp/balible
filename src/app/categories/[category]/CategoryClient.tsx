'use client'

import { useState, useMemo, useEffect } from 'react'
import { Heart, Star, Clock, Users, ChevronDown, SlidersHorizontal, X, MapPin, ArrowRight, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import { useSession } from 'next-auth/react'
import { toggleWishlistAction } from '@/lib/actions'

const WISHLIST_KEY = 'balible_wishlist'
function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]') } catch { return [] }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type CategoryExp = {
  slug: string
  title: string
  area: string
  price: number
  rating: number
  reviews: number
  duration: string
  maxGuests: number
  image: string
  badge: string | null
  category: string    // slug: "art-craft"
  subcategory: string | null
}

// ── Category meta ──────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, {
  label: string
  tagline: string
  description: string
  image: string
  color: string
  subcategories: string[]
}> = {
  'art-craft': {
    label: 'Art & Craft',
    tagline: 'Make something with your hands',
    description: "Discover Bali's artistic soul through hands-on workshops led by master craftspeople. From ancient pottery traditions to intricate silver work — every piece you make, you take home.",
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&auto=format&fit=crop&q=80',
    color: '#B66A45',
    subcategories: ['All', 'Pottery', 'Jewelry', 'Painting', 'Wood Carving', 'Textile', 'Weaving', 'Batik', 'Leather Craft', 'Sculpture', 'Mosaic', 'Upcycling', 'Candle Making', 'Soap Making', 'Macramé', 'Floral Arrangement', 'Tie-Dye', 'Resin Art', 'Block Printing', 'Eco Printing', 'Calligraphy', 'Glass Art'],
  },
  'wellness-healing': {
    label: 'Wellness & Healing',
    tagline: 'Restore mind, body and spirit',
    description: 'Restore your mind, body and soul with authentic Balinese healing practices — from sound healing bowls to traditional jamu rituals, guided by healers with decades of experience.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200&auto=format&fit=crop&q=80',
    color: '#4A7C59',
    subcategories: ['All', 'Yoga', 'Meditation', 'Sound Healing', 'Spa & Ritual', 'Breathwork', 'Massage', 'Reiki', 'Balinese Healing', 'Pilates', 'Aerial Yoga', 'Herbal Medicine', 'Nutrition & Detox', 'Acupuncture', 'Reflexology', 'Crystal Healing', 'Aromatherapy', 'Tai Chi', 'Qigong', 'Hot Stone', 'Hypnotherapy', 'Floatation'],
  },
  'culture-spiritual': {
    label: 'Culture & Spiritual',
    tagline: 'Live the living tradition',
    description: 'Immerse yourself in ancient Balinese traditions, ceremonies, and spiritual heritage. Join a real temple ceremony, learn sacred dances, meet healers, or walk ancient history with a local guide.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
    color: '#6F675C',
    subcategories: ['All', 'Temple & Ceremony', 'Dance & Music', 'History Tour', 'Language', 'Healing Ritual', 'Holy Water', 'Blessing', 'Gamelan', 'Offering Making', 'Kecak Dance', 'Photography Tour', 'Wayang Kulit', 'Barong Dance', 'Legong Dance', 'Traditional Costume', 'Subak Tour', 'Astrology', 'Balinese Calligraphy'],
  },
  'nature-outdoors': {
    label: 'Nature & Outdoors',
    tagline: 'Bali beyond the beach',
    description: "Trek through volcanic landscapes, swim beneath hidden waterfalls, and watch the sunrise paint Mount Batur gold. The island's natural wonders, experienced with a local guide.",
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80',
    color: '#4A7C59',
    subcategories: ['All', 'Trekking', 'Waterfall', 'Sunrise', 'Rice Terrace', 'Wildlife', 'Cycling', 'Bird Watching', 'Camping', 'Jungle Walk', 'Volcano', 'Beach Walk', 'Cave Exploration', 'Stargazing', 'Mangrove Tour', 'Organic Farming', 'Eco Tour', 'Night Safari', 'River Walk', 'Waterfall Rappelling', 'Cliff Walk', 'Permaculture'],
  },
  'water-activities': {
    label: 'Water Activities',
    tagline: 'Surf, dive, and explore the sea',
    description: "Bali is surrounded by world-class water — from the surf breaks of Canggu to the technicolour reefs of Amed and the manta rays of Nusa Penida. All water experiences in one place.",
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&auto=format&fit=crop&q=80',
    color: '#3B82F6',
    subcategories: ['All', 'Surfing', 'Snorkelling', 'Freediving', 'Scuba Diving', 'Stand-Up Paddle', 'Kayaking', 'River Rafting', 'Jet Ski', 'Parasailing', 'Island Hopping', 'Wakeboarding', 'Kite Surfing', 'Dolphin Watching', 'Cliff Jumping', 'Windsurfing', 'Boat Charter', 'Whale Watching', 'Open Water Swimming', 'Night Snorkelling'],
  },
  culinary: {
    label: 'Culinary',
    tagline: 'Cook, taste, and discover Balinese flavours',
    description: "Go beyond eating — learn the spices, the techniques, and the stories behind Balinese food. From market foraging to hands-on cooking in a family compound, led by people who grew up in the kitchen.",
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&auto=format&fit=crop&q=80',
    color: '#C8A97E',
    subcategories: ['All', 'Cooking Class', 'Spice & Herb', 'Market Tour', 'Coffee & Tea', 'Fermentation', 'Dessert & Sweets', 'Farm to Table', 'Cocktail & Mixology', 'Vegan & Plant-Based', 'Seafood', 'Bread & Pastry', 'Chocolate Making', 'Juice & Smoothie', 'Wine & Spirits', 'Foraging', 'Street Food Tour', 'Night Market', 'Pizza Making', 'Jamu & Tonics'],
  },
  'local-experts': {
    label: 'Local Experts',
    tagline: 'Trusted locals, at your side',
    description: "Book trusted local professionals for the practical side of your trip — photographers who know the light, guides who know the back roads, childcare and pet care you can rely on, and drivers who make the island easy.",
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=80',
    color: '#34657F',
    subcategories: ['All', 'Photographers', 'Guides', 'Wellness Practitioners', 'Childcare', 'Pet Care', 'Creative Mentors', 'Drivers', 'Translators', 'Wedding Planners', 'Event Planners', 'Personal Shoppers', 'Fitness Trainers', 'Yoga Teachers', 'Surf Coaches', 'Music Teachers', 'Dive Instructors', 'Life Coaches', 'Makeup Artists', 'Hair Stylists', 'Butler Service', 'Nutritionists'],
  },
  rentals: {
    label: 'Rentals',
    tagline: 'Everything you need, ready to go',
    description: "Rent scooters, bikes, surfboards, villas, workspaces, and adventure gear from trusted local owners. Skip the tourist traps — get the right kit for your trip at honest prices.",
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80',
    color: '#D97706',
    subcategories: ['All', 'Scooter', 'Motorbike', 'Bicycle', 'E-Bike', 'Car', 'ATV', 'Golf Cart', 'Surfboard', 'Kayak', 'Jet Ski', 'Drone', 'Camera Gear', 'Villa', 'Workspace', 'Studio', 'Camping Gear', 'Diving Equipment', 'Baby Equipment', 'Boat', 'Sound System', 'Projector', 'BBQ Equipment', 'Beach Equipment', 'Pool Float', 'Cooler Box'],
  },
}

const ALL_CATEGORY_SLUGS = ['art-craft', 'wellness-healing', 'culture-spiritual', 'nature-outdoors', 'water-activities', 'culinary', 'local-experts', 'rentals'] as const
const SUB_CATEGORY_SLUGS = new Set<string>([])
const SORT_OPTIONS = ['Most popular', 'Highest rated', 'Price: Low to High', 'Price: High to Low']

// ── Experience card ────────────────────────────────────────────────────────────

function ExperienceCard({
  exp,
  wishlisted,
  onWishlist,
}: {
  exp: CategoryExp
  wishlisted: boolean
  onWishlist: () => void
}) {
  const wishlistBtn = (
    <button
      onClick={e => { e.preventDefault(); onWishlist() }}
      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
      aria-label="Add to wishlist"
    >
      <Heart size={14} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#111111'} />
    </button>
  )

  return (
    <a
      href={`${exp.category === 'rentals' ? '/rentals' : '/experiences'}/${exp.slug}`}
      className="group block bg-white overflow-hidden hover:shadow-lg transition-all duration-200"
      style={{ border: '1px solid #E8E4DE', textDecoration: 'none', borderRadius: 16 }}
    >
      {/* ── Mobile layout (search-style horizontal row) ── */}
      <div className="md:hidden flex gap-3 p-3">
        <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 100, height: 100 }}>
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
          <button
            onClick={e => { e.preventDefault(); onWishlist() }}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
            aria-label="Add to wishlist"
          >
            <Heart size={11} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#111111'} />
          </button>
          {exp.subcategory && (
            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
              {exp.subcategory}
            </span>
          )}
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
          <div>
            <h3 className="leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111' }}>
              {exp.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
              <div className="flex items-center gap-1">
                <MapPin size={10} style={{ color: '#6F675C' }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{exp.area}</span>
              </div>
              <div className="flex items-center gap-1">
                {exp.reviews > 0 ? (
                  <>
                    <Star size={10} fill="#C8A97E" color="#C8A97E" />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#111111' }}>{exp.rating.toFixed(1)}</span>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>({exp.reviews})</span>
                  </>
                ) : (
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#9E9A94' }}>New</span>
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>⏱ {exp.duration}</span>
            </div>
          </div>
          <div className="mt-2">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>
              From <span style={{ color: '#C8A97E', fontWeight: 600 }}>IDR</span> <span style={{ fontWeight: 600 }}>{exp.price.toLocaleString('id-ID')}</span>
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#4A7C59', marginTop: 1 }}>✓ Free cancellation</p>
          </div>
        </div>
      </div>

      {/* ── Desktop layout (detailed) ── */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden" style={{ height: 210 }}>
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {exp.badge && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#C8A97E', color: 'white', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-inter)', letterSpacing: '0.02em' }}>
              {exp.badge}
            </span>
          )}
          {wishlistBtn}
          <div className="absolute bottom-3 left-3 flex items-center gap-1">
            <MapPin size={11} style={{ color: 'white' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{exp.area}</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="leading-snug mb-2" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 600, color: '#111111' }}>
            {exp.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {exp.reviews > 0 ? (
                <>
                  <Star size={11} fill="#C8A97E" color="#C8A97E" />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 700, color: '#111111' }}>{exp.rating.toFixed(1)}</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>({exp.reviews})</span>
                </>
              ) : (
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#9E9A94' }}>New</span>
              )}
            </div>
            <span style={{ color: '#E8E4DE' }}>·</span>
            <div className="flex items-center gap-1">
              <Clock size={11} style={{ color: '#6F675C' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{exp.duration}</span>
            </div>
            <span style={{ color: '#E8E4DE' }}>·</span>
            <div className="flex items-center gap-1">
              <Users size={11} style={{ color: '#6F675C' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>Max {exp.maxGuests}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111' }}>
              <span style={{ color: '#6F675C', fontSize: 11 }}>From </span>
              <span style={{ color: '#C8A97E', fontWeight: 600, fontSize: 13 }}>IDR</span>{' '}
              <span style={{ fontWeight: 700 }}>{exp.price.toLocaleString('id-ID')}</span>
            </p>
            {exp.subcategory && (
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F5F1EB', color: '#6F675C', fontFamily: 'var(--font-inter)', fontSize: 11 }}>
                {exp.subcategory}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CategoryClient({
  categorySlug,
  initialExperiences,
}: {
  categorySlug: string
  initialExperiences: CategoryExp[]
}) {
  const slug = ALL_CATEGORY_SLUGS.includes(categorySlug as typeof ALL_CATEGORY_SLUGS[number])
    ? categorySlug
    : 'art-craft'

  const meta = CATEGORY_META[slug]
  const [activeSub, setActiveSub] = useState('All')
  const [search, setSearch]       = useState('')
  const [sort, setSort] = useState('Most popular')
  const [sortOpen, setSortOpen] = useState(false)
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({})
  const { status } = useSession()

  useEffect(() => {
    const list = getWishlist()
    const map: Record<string, boolean> = {}
    list.forEach(s => { map[s] = true })
    setWishlist(map)
  }, [])

  const toggleWishlist = (slug: string) => {
    const next = !wishlist[slug]
    setWishlist(w => ({ ...w, [slug]: next }))
    const list = getWishlist()
    const updated = next ? [...list, slug] : list.filter(s => s !== slug)
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('balible:wishlist', { detail: { slug, saved: next } }))
    if (status === 'authenticated') toggleWishlistAction(slug).catch(() => {})
  }

  const results = useMemo(() => {
    let list = initialExperiences
    if (activeSub !== 'All') list = list.filter(e => e.subcategory === activeSub)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.area.toLowerCase().includes(q) ||
        (e.subcategory?.toLowerCase().includes(q) ?? false)
      )
    }
    switch (sort) {
      case 'Highest rated':       return [...list].sort((a, b) => b.rating - a.rating)
      case 'Price: Low to High':  return [...list].sort((a, b) => a.price - b.price)
      case 'Price: High to Low':  return [...list].sort((a, b) => b.price - a.price)
      default:                    return [...list].sort((a, b) => b.reviews - a.reviews)
    }
  }, [activeSub, search, sort, initialExperiences])

  const otherCategories = ALL_CATEGORY_SLUGS.filter(s => s !== slug && !SUB_CATEGORY_SLUGS.has(s))

  const totalRating = initialExperiences.reduce((s, e) => s + e.rating, 0)
  const avgRating = (totalRating / Math.max(1, initialExperiences.length)).toFixed(1)
  const totalReviews = initialExperiences.reduce((s, e) => s + e.reviews, 0)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: 'white', minHeight: '100vh' }}>

      <Navbar />

      {/* ── HERO ── */}
      <div className="relative" style={{ minHeight: 'clamp(420px, 50vw, 500px)' }}>
        <img src={meta.image} alt={meta.label} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.1) 100%)' }} />

        <div className="absolute inset-0 flex flex-col justify-end px-6 lg:px-16 pb-10 max-w-[1440px] mx-auto" style={{ left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
          <nav className="flex items-center gap-1.5 mb-4" aria-label="Breadcrumb">
            <a href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>Home</a>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/</span>
            <span style={{ fontSize: 12, color: 'white' }}>{meta.label}</span>
          </nav>

          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: meta.color === '#3B82F6' ? '#93C5FD' : '#C8A97E', textTransform: 'uppercase', marginBottom: 8 }}>
            {meta.tagline}
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 12, maxWidth: 600 }}>
            {meta.label} <br className="hidden sm:block" />Experiences in Bali
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, maxWidth: 520 }}>
            {meta.description}
          </p>

          <div className="flex items-center gap-6 mt-6">
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {initialExperiences.length}
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>experiences</p>
            </div>
            <div style={{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {avgRating}
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>avg. rating</p>
            </div>
            <div style={{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {totalReviews.toLocaleString()}
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>total reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY FILTER BAR ── */}
      <div className="sticky top-16 z-30 bg-white" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          {/* Subcategory pills */}
          <div className="flex items-center gap-2 pt-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {meta.subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className="flex-shrink-0 transition-all"
                style={{
                  height: 34,
                  padding: '0 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: activeSub === sub ? 600 : 400,
                  backgroundColor: activeSub === sub ? '#111111' : 'transparent',
                  color: activeSub === sub ? 'white' : '#6F675C',
                  border: `1px solid ${activeSub === sub ? '#111111' : '#E8E4DE'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {sub}
              </button>
            ))}
          </div>
          {/* Search bar */}
          <div className="relative mb-3" style={{ height: 42 }}>
            <Search size={15} className="absolute pointer-events-none" style={{ color: '#6F675C', left: 14, top: 13 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${meta.label} experiences…`}
              style={{
                width: '100%', height: 42, paddingLeft: 40, paddingRight: search ? 40 : 16,
                borderRadius: 10, border: '1px solid #E8E4DE', backgroundColor: 'white',
                fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute w-6 h-6 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                style={{ border: 'none', background: 'none', cursor: 'pointer', right: 10, top: 8 }}
              >
                <X size={14} style={{ color: '#6F675C' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8">

        <div className="flex items-center justify-between mb-6">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
            <span style={{ fontWeight: 700, color: '#111111' }}>{results.length}</span> experience{results.length !== 1 ? 's' : ''} found
            {activeSub !== 'All' && (
              <button
                onClick={() => setActiveSub('All')}
                className="inline-flex items-center gap-1 ml-3 px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE', fontSize: 12, color: '#6F675C', cursor: 'pointer' }}
              >
                {activeSub} <X size={11} />
              </button>
            )}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-1 ml-2 px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE', fontSize: 12, color: '#6F675C', cursor: 'pointer' }}
              >
                "{search}" <X size={11} />
              </button>
            )}
          </p>

          <div className="relative">
            <button
              onClick={() => setSortOpen(o => !o)}
              className="flex items-center gap-2"
              style={{
                height: 38, border: '1px solid #E8E4DE', borderRadius: 8,
                padding: '0 14px', fontSize: 13, color: '#111111',
                backgroundColor: 'white', cursor: 'pointer', fontFamily: 'var(--font-inter)',
              }}
            >
              Sort: <span style={{ fontWeight: 600 }}>{sort}</span>
              <ChevronDown size={13} style={{ color: '#6F675C', transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {sortOpen && (
              <div
                className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg z-20 overflow-hidden"
                style={{ minWidth: 200, border: '1px solid #E8E4DE' }}
              >
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setSort(opt); setSortOpen(false) }}
                    className="w-full text-left px-4 py-3 transition-colors hover:bg-stone-50"
                    style={{
                      fontSize: 13, fontFamily: 'var(--font-inter)',
                      color: sort === opt ? '#111111' : '#6F675C',
                      fontWeight: sort === opt ? 600 : 400,
                      backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {results.map(exp => (
              <ExperienceCard
                key={exp.slug}
                exp={exp}
                wishlisted={!!wishlist[exp.slug]}
                onWishlist={() => toggleWishlist(exp.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl" style={{ border: '1px solid #E8E4DE' }}>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, color: '#111111', marginBottom: 8 }}>No experiences found</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginBottom: 20 }}>
              {search ? `No ${meta.label} experiences match "${search}".` : 'Try selecting a different subcategory.'}
            </p>
            <button
              onClick={() => { setSearch(''); setActiveSub('All') }}
              style={{ height: 40, padding: '0 24px', backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: 'var(--font-inter)' }}
            >
              Show all {meta.label}
            </button>
          </div>
        )}
      </div>

      {/* ── OTHER CATEGORIES ── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-16">
        <div style={{ borderTop: '1px solid #E8E4DE', paddingTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111', marginBottom: 20 }}>
            Explore other categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {otherCategories.map(catSlug => {
              const cat = CATEGORY_META[catSlug]
              return (
                <a
                  key={catSlug}
                  href={`/categories/${catSlug}`}
                  className="group relative rounded-xl overflow-hidden"
                  style={{ height: 110, textDecoration: 'none' }}
                >
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: 'white' }}>{cat.label}</span>
                    <ArrowRight size={13} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
