'use client'

import { useState, useMemo } from 'react'
import { Heart, Star, Clock, Users, ChevronDown, SlidersHorizontal, X, MapPin, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'

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
    subcategories: ['All', 'Pottery', 'Jewelry', 'Painting', 'Wood Carving', 'Textile', 'Weaving'],
  },
  wellness: {
    label: 'Wellness',
    tagline: 'Restore mind, body and spirit',
    description: 'Restore your mind, body and soul with authentic Balinese healing practices — from sound healing bowls to traditional jamu rituals, guided by healers with decades of experience.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200&auto=format&fit=crop&q=80',
    color: '#4A7C59',
    subcategories: ['All', 'Yoga', 'Meditation', 'Sound Healing', 'Spa & Ritual', 'Breathwork'],
  },
  culture: {
    label: 'Culture',
    tagline: 'Live the living tradition',
    description: 'Immerse yourself in ancient Balinese traditions, ceremonies, and spiritual heritage. Join a real temple ceremony, learn sacred dances, or walk ancient history with a local guide.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
    color: '#6F675C',
    subcategories: ['All', 'Temple & Ceremony', 'Dance & Music', 'History Tour', 'Language'],
  },
  'food-drink': {
    label: 'Food & Drink',
    tagline: 'Eat like a Balinese local',
    description: 'Explore the rich flavours of Balinese cuisine through cooking classes, market tours, and coffee journeys. Go from the farm to your plate with a local who knows every ingredient.',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&auto=format&fit=crop&q=80',
    color: '#C8A97E',
    subcategories: ['All', 'Cooking Class', 'Market Tour', 'Coffee & Tea', 'Mixology', 'Farm Visit'],
  },
  nature: {
    label: 'Nature',
    tagline: 'Bali beyond the beach',
    description: 'Trek through volcanic landscapes, swim beneath hidden waterfalls, and watch the sunrise paint Mount Batur gold. The island\'s natural wonders, experienced with a local guide.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80',
    color: '#4A7C59',
    subcategories: ['All', 'Trekking', 'Waterfall', 'Sunrise', 'Rice Terrace', 'Wildlife'],
  },
  'surf-water': {
    label: 'Surf & Water',
    tagline: 'Ride the island\'s waves',
    description: 'From your first wave at Canggu to snorkelling the technicolour reefs of Amed — Bali\'s water experiences are world-class. Get in the water with instructors who grew up in it.',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&auto=format&fit=crop&q=80',
    color: '#3B82F6',
    subcategories: ['All', 'Surfing', 'Snorkelling', 'Freediving', 'Stand-Up Paddle', 'River Rafting'],
  },
}

// ── All experiences with category tags ────────────────────────────────────────
const ALL_EXPERIENCES = [
  {
    slug: 'pottery-making-class',
    title: 'Pottery Making Class',
    area: 'Ubud',
    price: 450000,
    rating: 4.9,
    reviews: 128,
    duration: '2.5 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80',
    badge: 'Bestseller',
    category: 'art-craft',
    subcategory: 'Pottery',
  },
  {
    slug: 'silver-jewelry-workshop',
    title: 'Silver Jewelry Workshop',
    area: 'Canggu',
    price: 580000,
    rating: 4.8,
    reviews: 94,
    duration: '3 hours',
    maxGuests: 6,
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'art-craft',
    subcategory: 'Jewelry',
  },
  {
    slug: 'batik-painting-workshop',
    title: 'Batik Painting Workshop',
    area: 'Ubud',
    price: 380000,
    rating: 4.7,
    reviews: 64,
    duration: '3 hours',
    maxGuests: 10,
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'art-craft',
    subcategory: 'Painting',
  },
  {
    slug: 'wood-carving-workshop',
    title: 'Wood Carving Workshop',
    area: 'Mas, Ubud',
    price: 500000,
    rating: 4.6,
    reviews: 47,
    duration: '4 hours',
    maxGuests: 6,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'art-craft',
    subcategory: 'Wood Carving',
  },
  {
    slug: 'natural-dye-workshop',
    title: 'Natural Dye Workshop',
    area: 'Sidemen',
    price: 380000,
    rating: 4.7,
    reviews: 31,
    duration: '3 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'art-craft',
    subcategory: 'Textile',
  },
  {
    slug: 'rattan-weaving-class',
    title: 'Rattan Weaving Class',
    area: 'Sidemen',
    price: 350000,
    rating: 4.8,
    reviews: 29,
    duration: '2.5 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1605522469906-3fe226b356bc?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'art-craft',
    subcategory: 'Weaving',
  },
  {
    slug: 'sound-healing-session',
    title: 'Sound Healing Journey',
    area: 'Ubud',
    price: 350000,
    rating: 4.9,
    reviews: 212,
    duration: '90 min',
    maxGuests: 12,
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80',
    badge: 'Top Rated',
    category: 'wellness',
    subcategory: 'Sound Healing',
  },
  {
    slug: 'jamu-wellness-ritual',
    title: 'Traditional Jamu Ritual',
    area: 'Ubud',
    price: 480000,
    rating: 4.8,
    reviews: 73,
    duration: '2 hours',
    maxGuests: 6,
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'wellness',
    subcategory: 'Spa & Ritual',
  },
  {
    slug: 'sunrise-yoga-ubud',
    title: 'Sunrise Yoga in the Rice Fields',
    area: 'Ubud',
    price: 280000,
    rating: 4.9,
    reviews: 156,
    duration: '75 min',
    maxGuests: 10,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    badge: 'Bestseller',
    category: 'wellness',
    subcategory: 'Yoga',
  },
  {
    slug: 'meditation-temple',
    title: 'Guided Meditation at Tirta Empul',
    area: 'Gianyar',
    price: 320000,
    rating: 4.7,
    reviews: 88,
    duration: '2 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'wellness',
    subcategory: 'Meditation',
  },
  {
    slug: 'water-temple-ceremony',
    title: 'Water Temple Purification',
    area: 'Gianyar',
    price: 420000,
    rating: 4.7,
    reviews: 84,
    duration: '3 hours',
    maxGuests: 10,
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'culture',
    subcategory: 'Temple & Ceremony',
  },
  {
    slug: 'traditional-dance-class',
    title: 'Legong Dance Masterclass',
    area: 'Ubud',
    price: 390000,
    rating: 4.8,
    reviews: 61,
    duration: '2 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'culture',
    subcategory: 'Dance & Music',
  },
  {
    slug: 'kecak-fire-dance',
    title: 'Kecak Fire Dance at Uluwatu',
    area: 'Uluwatu',
    price: 250000,
    rating: 4.9,
    reviews: 318,
    duration: '1.5 hours',
    maxGuests: 20,
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&auto=format&fit=crop&q=80',
    badge: 'Iconic',
    category: 'culture',
    subcategory: 'Dance & Music',
  },
  {
    slug: 'balinese-history-tour',
    title: 'Old Bali Heritage Walk',
    area: 'Klungkung',
    price: 350000,
    rating: 4.7,
    reviews: 42,
    duration: '3 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'culture',
    subcategory: 'History Tour',
  },
  {
    slug: 'balinese-cooking-class',
    title: 'Balinese Cooking Class',
    area: 'Ubud',
    price: 420000,
    rating: 4.9,
    reviews: 187,
    duration: '4 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
    badge: 'Bestseller',
    category: 'food-drink',
    subcategory: 'Cooking Class',
  },
  {
    slug: 'coffee-plantation-tour',
    title: 'Coffee Plantation & Tasting Tour',
    area: 'Kintamani',
    price: 320000,
    rating: 4.8,
    reviews: 143,
    duration: '3 hours',
    maxGuests: 12,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'food-drink',
    subcategory: 'Coffee & Tea',
  },
  {
    slug: 'ubud-market-food-tour',
    title: 'Ubud Market Food Tour',
    area: 'Ubud',
    price: 280000,
    rating: 4.8,
    reviews: 97,
    duration: '3 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'food-drink',
    subcategory: 'Market Tour',
  },
  {
    slug: 'mount-batur-sunrise',
    title: 'Mount Batur Sunrise Trek',
    area: 'Kintamani',
    price: 650000,
    rating: 4.8,
    reviews: 241,
    duration: '6 hours',
    maxGuests: 10,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80',
    badge: 'Top Rated',
    category: 'nature',
    subcategory: 'Sunrise',
  },
  {
    slug: 'rice-terrace-trek',
    title: 'Tegallalang Rice Terrace Trek',
    area: 'Ubud',
    price: 320000,
    rating: 4.7,
    reviews: 103,
    duration: '3 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'nature',
    subcategory: 'Rice Terrace',
  },
  {
    slug: 'waterfall-hidden-canyon',
    title: 'Hidden Waterfall Canyon Hike',
    area: 'Aling-Aling',
    price: 450000,
    rating: 4.9,
    reviews: 89,
    duration: '5 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'nature',
    subcategory: 'Waterfall',
  },
  {
    slug: 'surfing-lesson-canggu',
    title: 'Surfing Lesson for Beginners',
    area: 'Canggu',
    price: 400000,
    rating: 4.8,
    reviews: 176,
    duration: '2 hours',
    maxGuests: 6,
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
    badge: 'Bestseller',
    category: 'surf-water',
    subcategory: 'Surfing',
  },
  {
    slug: 'snorkeling-amed',
    title: 'Snorkelling at USAT Liberty Wreck',
    area: 'Amed',
    price: 550000,
    rating: 4.9,
    reviews: 138,
    duration: '4 hours',
    maxGuests: 8,
    image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600&auto=format&fit=crop&q=80',
    badge: 'Top Rated',
    category: 'surf-water',
    subcategory: 'Snorkelling',
  },
  {
    slug: 'sup-seminyak',
    title: 'Stand-Up Paddleboard at Seminyak',
    area: 'Seminyak',
    price: 350000,
    rating: 4.6,
    reviews: 52,
    duration: '1.5 hours',
    maxGuests: 6,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80',
    badge: null,
    category: 'surf-water',
    subcategory: 'Stand-Up Paddle',
  },
]

// ── Other categories for the switcher ─────────────────────────────────────────
const ALL_CATEGORY_SLUGS = ['art-craft', 'wellness', 'culture', 'food-drink', 'nature', 'surf-water'] as const

const SORT_OPTIONS = ['Most popular', 'Highest rated', 'Price: Low to High', 'Price: High to Low']

// ── Experience card ────────────────────────────────────────────────────────────
function ExperienceCard({
  exp,
  wishlisted,
  onWishlist,
}: {
  exp: typeof ALL_EXPERIENCES[number]
  wishlisted: boolean
  onWishlist: () => void
}) {
  return (
    <a
      href={`/experiences/${exp.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200"
      style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
    >
      <div className="relative overflow-hidden" style={{ height: 210 }}>
        <img
          src={exp.image}
          alt={exp.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {exp.badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#C8A97E', color: 'white', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-inter)', letterSpacing: '0.02em' }}
          >
            {exp.badge}
          </span>
        )}
        <button
          onClick={e => { e.preventDefault(); onWishlist() }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          aria-label="Add to wishlist"
        >
          <Heart size={14} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#111111'} />
        </button>
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
            <Star size={11} fill="#C8A97E" color="#C8A97E" />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 700, color: '#111111' }}>{exp.rating.toFixed(1)}</span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>({exp.reviews})</span>
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
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#F5F1EB', color: '#6F675C', fontFamily: 'var(--font-inter)', fontSize: 11 }}
          >
            {exp.subcategory}
          </span>
        </div>
      </div>
    </a>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CategoryPage({ params }: { params: { category: string } }) {
  const slug = ALL_CATEGORY_SLUGS.includes(params.category as typeof ALL_CATEGORY_SLUGS[number])
    ? params.category
    : 'art-craft'

  const meta = CATEGORY_META[slug]
  const [activeSub, setActiveSub] = useState('All')
  const [sort, setSort] = useState('Most popular')
  const [sortOpen, setSortOpen] = useState(false)
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({})

  const toggleWishlist = (s: string) => setWishlist(w => ({ ...w, [s]: !w[s] }))

  const results = useMemo(() => {
    let list = ALL_EXPERIENCES.filter(e => e.category === slug)
    if (activeSub !== 'All') list = list.filter(e => e.subcategory === activeSub)
    switch (sort) {
      case 'Highest rated':       return [...list].sort((a, b) => b.rating - a.rating)
      case 'Price: Low to High':  return [...list].sort((a, b) => a.price - b.price)
      case 'Price: High to Low':  return [...list].sort((a, b) => b.price - a.price)
      default:                    return [...list].sort((a, b) => b.reviews - a.reviews)
    }
  }, [slug, activeSub, sort])

  const otherCategories = ALL_CATEGORY_SLUGS.filter(s => s !== slug)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      {/* ── HERO ── */}
      <div className="relative" style={{ height: 'clamp(260px, 35vw, 400px)' }}>
        <img src={meta.image} alt={meta.label} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.1) 100%)' }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 lg:px-16 pb-10 max-w-[1440px] mx-auto" style={{ left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
          {/* Breadcrumb */}
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

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6">
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {ALL_EXPERIENCES.filter(e => e.category === slug).length}
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>experiences</p>
            </div>
            <div style={{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {(ALL_EXPERIENCES.filter(e => e.category === slug).reduce((s, e) => s + e.rating, 0) / Math.max(1, ALL_EXPERIENCES.filter(e => e.category === slug).length)).toFixed(1)}
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>avg. rating</p>
            </div>
            <div style={{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {ALL_EXPERIENCES.filter(e => e.category === slug).reduce((s, e) => s + e.reviews, 0).toLocaleString()}
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>total reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SUBCATEGORY PILLS ── */}
      <div className="bg-white" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex items-center gap-2 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
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
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8">

        {/* Toolbar */}
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
          </p>

          {/* Sort */}
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

        {/* Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
              Try selecting a different subcategory.
            </p>
            <button
              onClick={() => setActiveSub('All')}
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

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#111111', padding: '40px 24px 28px' }}>
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: 'white', textDecoration: 'none' }}>BALIBLE</a>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>© 2024 Balible. All rights reserved.</p>
          <div className="flex gap-6">
            {[{ label: 'Help Centre', href: '/help' }, { label: 'About', href: '/about' }, { label: 'For Hosts', href: '/for-hosts' }].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
