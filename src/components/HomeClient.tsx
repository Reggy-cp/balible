'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Heart, Search, CalendarDays, MapPin, X,
  Leaf, Scissors, Landmark, ChefHat, Sun,
  Mountain, Waves, Grid3x3, Star, ShieldCheck, Users, Sparkles,
  Instagram, Facebook, Twitter,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import WishlistHeart from '@/components/WishlistHeart'
import type { ExperienceCard } from '@/lib/experiences'
import type { EventRow } from '@/lib/event-actions'
import type { ServiceCard } from '@/lib/service-actions'

// ── Static data ───────────────────────────────────────────────────────────────


const CAT_GRID = [
  { label: 'Wellness',     Icon: Leaf,       href: '/categories/wellness',   photo: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&auto=format&fit=crop&q=80' },
  { label: 'Art & Craft',  Icon: Scissors,   href: '/categories/art-craft',  photo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80' },
  { label: 'Culture',      Icon: Landmark,   href: '/categories/culture',    photo: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&auto=format&fit=crop&q=80' },
  { label: 'Culinary',     Icon: ChefHat,    href: '/categories/culinary',   photo: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&auto=format&fit=crop&q=80' },
  { label: 'Nature & Outdoors', Icon: Mountain, href: '/categories/nature',   photo: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&auto=format&fit=crop&q=80' },
  { label: 'Spiritual',    Icon: Sun,        href: '/categories/spiritual',  photo: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&auto=format&fit=crop&q=80' },
]

const WHY_ITEMS = [
  { Icon: ShieldCheck, title: 'Curated with Care',     body: 'Every experience is personally reviewed for quality and authenticity.' },
  { Icon: Users,       title: 'Local Connections',     body: 'We work directly with passionate local hosts and artisans.' },
  { Icon: Heart,       title: 'Meaningful Impact',     body: 'Your booking supports local communities in Bali.' },
  { Icon: Sparkles,    title: 'Beautiful Experiences', body: 'From hidden studios to sacred rituals, made unforgettable.' },
]

const HOSTS = [
  { slug: 'made-sari',       name: 'Made Sari',       role: 'Potter',          location: 'Ubud',    pronoun: 'her', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80', quote: 'Every piece I create is a prayer. I love sharing the magic of clay with visitors from around the world.' },
  { slug: 'ketut-suardana',  name: 'Ketut Suardana',  role: 'Silversmith',     location: 'Celuk',   pronoun: 'his', photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80', quote: "Silver is alive in my hands. I want every student to feel what it's like to make something beautiful." },
  { slug: 'wayan-gede',      name: 'Wayan Gede',      role: 'Temple Guide',    location: 'Gianyar', pronoun: 'his', photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&auto=format&fit=crop&q=80', quote: 'The water temple is a living, sacred space. I want every guest to leave feeling truly connected to Bali.' },
  { slug: 'nina-putri',      name: 'Nina Putri',      role: 'Wellness Teacher', location: 'Ubud',   pronoun: 'her', photo: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&auto=format&fit=crop&q=80', quote: 'Healing begins when we truly listen. My sessions are a space for presence, stillness, and transformation.' },
]

const FOOTER_COLS = [
  { title: 'Explore',   links: [{ label: 'All Experiences', href: '/search' }, { label: 'Events', href: '/events' }, { label: 'By Destination', href: '/destinations' }, { label: 'Meet Our Hosts', href: '/hosts' }, { label: 'How It Works', href: '/how-it-works' }] },
  { title: 'For Hosts', links: [{ label: 'Become A Host', href: '/for-hosts' }, { label: 'Host Dashboard', href: '/dashboard' }, { label: 'How It Works', href: '/for-hosts#how-it-works' }, { label: 'Earnings Calculator', href: '/for-hosts#calculator' }, { label: 'Host Stories', href: '/for-hosts#stories' }] },
  { title: 'About',     links: [{ label: 'Our Story', href: '/about' }, { label: 'Destinations', href: '/destinations' }, { label: 'Sign In', href: '/sign-in' }, { label: 'Sign Up', href: '/sign-up' }] },
  { title: 'Support',   links: [{ label: 'Help Centre', href: '/help' }, { label: 'How It Works', href: '/how-it-works' }, { label: 'Wishlist', href: '/wishlist' }, { label: 'My Profile', href: '/profile' }, { label: 'My Bookings', href: '/profile' }] },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function ExperienceCard({ exp }: { exp: ExperienceCard }) {
  return (
    <a
      href={`/experiences/${exp.slug}`}
      className="rounded-xl overflow-hidden border hover:shadow-md transition-shadow block bg-white"
      style={{ borderColor: '#E8E4DE' }}
    >
      <div className="relative" style={{ height: 200 }}>
        <img src={exp.photo} alt={exp.title} className="w-full h-full object-cover" />
        {exp.badge && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-white"
            style={{ fontSize: 11, fontWeight: 600, backgroundColor: '#C8A97E', fontFamily: 'var(--font-inter)' }}>
            {exp.badge}
          </span>
        )}
        <div className="absolute top-3 right-3">
          <WishlistHeart slug={exp.slug} size={13} compact />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{exp.area}</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#9E9A94' }}>{exp.duration}</p>
        </div>
        <h3 className="line-clamp-2 leading-snug" style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, color: '#111111', fontWeight: 600 }}>
          {exp.title}
        </h3>
        <div className="flex items-center gap-1 mt-2">
          <Star size={11} fill="#C8A97E" color="#C8A97E" />
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 700, color: '#111111' }}>{exp.rating}</span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>({exp.reviews})</span>
        </div>
        <p className="mt-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>
          From <span style={{ color: '#C8A97E' }}>IDR</span> {exp.price.toLocaleString('id-ID')}
        </p>
      </div>
    </a>
  )
}

function HostCard({ host }: { host: typeof HOSTS[0] }) {
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl" style={{ height: 200 }}>
        <img src={host.photo} alt={host.name} className="w-full h-full object-cover" />
      </div>
      <h3 className="mt-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111' }}>{host.name}</h3>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>{host.role}, {host.location}</p>
      <p className="mt-2 line-clamp-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.6, fontStyle: 'italic' }}>
        &ldquo;{host.quote}&rdquo;
      </p>
      <a href={`/hosts/${host.slug}`} className="mt-2 inline-block underline hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>
        Read {host.pronoun} story →
      </a>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function HomeClient({ experiences, upcomingEvents, featuredServices = [] }: { experiences: ExperienceCard[]; upcomingEvents: EventRow[]; featuredServices?: ServiceCard[] }) {
  const [search, setSearch]         = useState('')
  const [date, setDate]             = useState('')
  const [email, setEmail]           = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [nearbyArea, setNearbyArea]         = useState<string | null>(null)

  useEffect(() => {
    if (!navigator?.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords
        if (lat < -8.95 || lat > -8.05 || lng < 114.4 || lng > 115.75) return
        const AREAS = [
          { display: 'Ubud',      lat: -8.5069, lng: 115.2624 },
          { display: 'Canggu',    lat: -8.6482, lng: 115.1380 },
          { display: 'Seminyak',  lat: -8.6910, lng: 115.1627 },
          { display: 'Kuta',      lat: -8.7196, lng: 115.1686 },
          { display: 'Uluwatu',   lat: -8.8290, lng: 115.0849 },
          { display: 'Gianyar',   lat: -8.5384, lng: 115.3315 },
          { display: 'Sanur',     lat: -8.7134, lng: 115.2626 },
          { display: 'Nusa Dua',  lat: -8.7985, lng: 115.2326 },
          { display: 'Amed',      lat: -8.3500, lng: 115.6580 },
          { display: 'Jimbaran',  lat: -8.7815, lng: 115.1651 },
          { display: 'Kintamani', lat: -8.2458, lng: 115.3652 },
          { display: 'Medewi',    lat: -8.4770, lng: 114.8430 },
          { display: 'Sidemen',   lat: -8.4800, lng: 115.4500 },
        ]
        const R = 6371
        const toRad = (d: number) => d * Math.PI / 180
        const nearest = AREAS.reduce((best, a) => {
          const dLat = toRad(a.lat - lat), dLng = toRad(a.lng - lng)
          const dist = R * 2 * Math.atan2(
            Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(a.lat)) * Math.sin(dLng / 2) ** 2),
            Math.sqrt(1 - (Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(a.lat)) * Math.sin(dLng / 2) ** 2)),
          )
          return dist < best.dist ? { area: a.display, dist } : best
        }, { area: '', dist: Infinity })
        if (experiences.some(e => e.area === nearest.area)) {
          setNearbyArea(nearest.area)
        }
      },
      () => {},
      { timeout: 8000, maximumAge: 300_000 },
    )
  }, [experiences])

  const categories = useMemo(() => {
    const seen = new Set<string>()
    experiences.forEach(e => { if (e.category) seen.add(e.category) })
    return ['All', ...Array.from(seen).sort()]
  }, [experiences])

  const filteredExperiences = useMemo(() => {
    let list = nearbyArea ? experiences.filter(e => e.area === nearbyArea) : experiences
    if (activeCategory !== 'All') list = list.filter(e => e.category === activeCategory)
    return nearbyArea || activeCategory !== 'All' ? list : list.slice(0, 12)
  }, [activeCategory, nearbyArea, experiences])
  const dateInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const openDatePicker = (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      (dateInputRef.current as any)?.showPicker?.()
    } catch {
      dateInputRef.current?.click()
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (date) params.set('date', date)
    router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleSubscribe = () => {
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 4000)
  }


  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>

      <Navbar />

      {/* ── HERO ── */}
      <section className="relative" style={{ height: 'clamp(280px, 40vw, 520px)' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&auto=format&fit=crop&q=85"
            alt="Bali rice terraces"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
        </div>

        <div className="absolute bottom-0 left-0 p-8 lg:p-16" style={{ maxWidth: 560 }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 4vw, 52px)', color: 'white', lineHeight: 1.1, fontWeight: 700, maxWidth: 420 }}>
            Curated Experiences in Bali
          </h1>
          <p className="hidden sm:block mt-4" style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 380, lineHeight: 1.6 }}>
            Discover authentic, meaningful, and beautiful experiences across the island.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center bg-white shadow-xl mt-6 lg:mt-8" style={{ maxWidth: 500, height: 52, borderRadius: 8 }}>
            <div className="flex items-center gap-2 px-3 lg:px-4 flex-1 min-w-0">
              <Search size={15} style={{ color: '#6F675C', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search experiences…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="outline-none w-full bg-transparent placeholder:text-coconut text-charcoal"
                style={{ fontFamily: 'var(--font-inter)', fontSize: 13 }}
              />
            </div>
            <div className="w-px h-7 flex-shrink-0" style={{ backgroundColor: '#E8E4DE' }} />
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 flex-shrink-0"
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={openDatePicker}
            >
              <CalendarDays size={14} style={{ color: date ? '#111111' : '#6F675C', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: date ? '#111111' : '#6F675C', whiteSpace: 'nowrap' }}>
                {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
              </span>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                tabIndex={-1}
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', top: 0, left: 0 }}
              />
            </div>
            {/* Mobile: icon only; desktop: label */}
            <button
              type="submit"
              className="mx-2 flex-shrink-0 text-white rounded-md hover:opacity-90 transition-opacity flex items-center justify-center sm:hidden"
              style={{ backgroundColor: '#111111', border: 'none', cursor: 'pointer', width: 36, height: 36 }}
              aria-label="Search"
            >
              <Search size={15} color="white" />
            </button>
            <button
              type="submit"
              className="mx-2 flex-shrink-0 text-white rounded-md px-6 py-2 hover:opacity-90 transition-opacity hidden sm:flex items-center"
              style={{ backgroundColor: '#111111', fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
            >
              Search
            </button>
          </form>
        </div>
      </section>


      {/* ── HANDPICKED EXPERIENCES ── */}
      <section className="bg-white py-12 px-6 lg:px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              {nearbyArea && (
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={14} style={{ color: '#C8A97E' }} />
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#C8A97E', fontWeight: 500 }}>
                    You&apos;re in Bali
                  </p>
                </div>
              )}
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: '#111111', fontWeight: 700 }}>
                {nearbyArea ? `Experiences in ${nearbyArea}` : 'All Experiences'}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
                  {nearbyArea
                    ? `${filteredExperiences.length} experience${filteredExperiences.length !== 1 ? 's' : ''} near you`
                    : `${experiences.length} curated experiences across Bali`}
                </p>
                {nearbyArea && (
                  <button
                    onClick={() => setNearbyArea(null)}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full transition-colors hover:bg-stone-200"
                    style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE', fontSize: 12, color: '#6F675C', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
                  >
                    {nearbyArea}
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 transition-all"
                style={{
                  height: 34,
                  padding: '0 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: activeCategory === cat ? 600 : 400,
                  backgroundColor: activeCategory === cat ? '#111111' : 'transparent',
                  color: activeCategory === cat ? 'white' : '#6F675C',
                  border: `1px solid ${activeCategory === cat ? '#111111' : '#E8E4DE'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {filteredExperiences.map(exp => <ExperienceCard key={exp.slug} exp={exp} />)}
          </div>

          {activeCategory !== 'All' ? (
            <div className="mt-8 text-center">
              <a
                href={`/categories/${experiences.find(e => e.category === activeCategory)?.categorySlug ?? 'culture'}`}
                style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', textDecoration: 'underline' }}
                className="hover:opacity-70 transition-opacity"
              >
                See all {activeCategory} experiences →
              </a>
            </div>
          ) : !nearbyArea && experiences.length > filteredExperiences.length ? (
            <div className="mt-8 text-center">
              <a
                href="/search"
                style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', textDecoration: 'underline' }}
                className="hover:opacity-70 transition-opacity"
              >
                See all {experiences.length} experiences →
              </a>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className="py-12 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: '#111111', fontWeight: 700 }}>
                Explore by Destination
              </h2>
              <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
                13 distinct corners of Bali, each with its own character
              </p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {[
              { slug: 'ubud',      name: 'Ubud',      tagline: 'Cultural Heart',       image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&auto=format&fit=crop&q=80' },
              { slug: 'canggu',    name: 'Canggu',    tagline: 'Surf & Soul',           image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&auto=format&fit=crop&q=80' },
              { slug: 'uluwatu',   name: 'Uluwatu',   tagline: 'Clifftops & Kecak',     image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80' },
              { slug: 'seminyak',  name: 'Seminyak',  tagline: 'Sunset Dining',         image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80' },
              { slug: 'jimbaran',  name: 'Jimbaran',  tagline: 'Seafood & Bay',         image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop&q=80' },
              { slug: 'kintamani', name: 'Kintamani', tagline: 'Volcano & Caldera',     image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&auto=format&fit=crop&q=80' },
              { slug: 'sanur',     name: 'Sanur',     tagline: 'Calm Shores',           image: 'https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=400&auto=format&fit=crop&q=80' },
              { slug: 'amed',      name: 'Amed',      tagline: 'Reef & Quiet',          image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&auto=format&fit=crop&q=80' },
              { slug: 'kuta',      name: 'Kuta',      tagline: 'Surf Town',             image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&auto=format&fit=crop&q=80' },
              { slug: 'gianyar',   name: 'Gianyar',   tagline: 'Sacred Temples',        image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&auto=format&fit=crop&q=80' },
              { slug: 'sidemen',   name: 'Sidemen',   tagline: 'East Bali Valleys',     image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=400&auto=format&fit=crop&q=80' },
              { slug: 'nusa-dua',  name: 'Nusa Dua',  tagline: 'Luxury Coast',          image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&auto=format&fit=crop&q=80' },
              { slug: 'medewi',    name: 'Medewi',    tagline: 'West Bali Surf',        image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&auto=format&fit=crop&q=80' },
            ].map(dest => (
              <a
                key={dest.slug}
                href={`/destinations/${dest.slug}`}
                className="flex-shrink-0 relative rounded-2xl overflow-hidden group"
                style={{ width: 160, height: 200, textDecoration: 'none' }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{dest.name}</p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{dest.tagline}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      {upcomingEvents.length > 0 && (
        <section className="bg-white py-12 px-6 lg:px-16" style={{ borderTop: '1px solid #E8E4DE' }}>
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: '#111111', fontWeight: 700 }}>
                  Upcoming Events
                </h2>
                <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
                  One-time experiences hosted by local operators.
                </p>
              </div>
              <a href="/events" className="flex-shrink-0 hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', textDecoration: 'underline' }}>
                View all →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.slice(0, 3).map(ev => {
                const d = new Date(ev.date)
                const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Makassar' })
                const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Makassar' })
                return (
                  <a key={ev.id} href={`/events/${ev.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="rounded-xl overflow-hidden hover:shadow-md transition-shadow" style={{ border: '1px solid #E8E4DE' }}>
                      <div style={{ height: 180, backgroundColor: '#F0EDE8', position: 'relative', overflow: 'hidden' }}>
                        {ev.coverImage ? (
                          <img src={ev.coverImage} alt={ev.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span style={{ fontSize: 36 }}>🎟</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '4px 10px' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{dateStr}</span>
                        </div>
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 4 }}>{ev.title}</p>
                        <p style={{ fontSize: 12, color: '#6F675C', marginBottom: 10 }}>⏰ {timeStr} · 📍 {ev.location.split(',')[0]}</p>
                        <div className="flex items-center justify-between">
                          <span style={{ fontSize: 13, color: '#6F675C' }}>👥 Up to {ev.capacity}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#111111' }}>
                            {ev.price === 0 ? 'Free' : `IDR ${ev.price.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SERVICES ── */}
      {featuredServices.length > 0 && (
        <section className="bg-white py-12 px-6 lg:px-16" style={{ borderTop: '1px solid #E8E4DE' }}>
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: '#111111', fontWeight: 700 }}>
                  Trusted Services in Bali
                </h2>
                <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
                  From massages to private drivers — delivered to your villa.
                </p>
              </div>
              <a href="/services" className="flex-shrink-0 hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', textDecoration: 'underline' }}>
                View all →
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {featuredServices.map(s => (
                <a
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="rounded-xl overflow-hidden border hover:shadow-md transition-shadow block bg-white"
                  style={{ borderColor: '#E8E4DE', textDecoration: 'none' }}
                >
                  <div className="relative" style={{ height: 180 }}>
                    {s.image && <img src={s.image} alt={s.title} className="w-full h-full object-cover" />}
                    <span
                      className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full"
                      style={{ fontSize: 11, fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.55)', color: 'white' }}
                    >
                      {s.subcategory}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin size={11} style={{ color: '#6F675C' }} />
                      <p style={{ fontSize: 11, color: '#6F675C' }}>{s.area}</p>
                    </div>
                    <h3
                      className="line-clamp-2 leading-snug"
                      style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, color: '#111111', fontWeight: 600 }}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-0.5" style={{ fontSize: 11, color: '#9E9A94' }}>{s.category}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star size={11} fill="#C8A97E" color="#C8A97E" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{s.rating.toFixed(1)}</span>
                      <span style={{ fontSize: 12, color: '#6F675C' }}>({s.totalReviews})</span>
                    </div>
                    <p className="mt-2" style={{ fontSize: 13, color: '#111111' }}>
                      From <span style={{ color: '#C8A97E' }}>IDR</span> {s.price.toLocaleString('id-ID')}
                      {s.priceTypeKey !== 'FIXED' && (
                        <span style={{ color: '#6F675C', fontSize: 11 }}> {s.priceType}</span>
                      )}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EXPLORE BY CATEGORY ── */}
      <section className="py-12 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-[1440px] mx-auto">
          <h2 className="mb-8" style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: '#111111', fontWeight: 700 }}>
            Explore by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CAT_GRID.map(({ label, Icon, href, photo }) => (
              <a
                key={label}
                href={href}
                className="relative cursor-pointer overflow-hidden group block"
                style={{ height: 180, borderRadius: 12, textDecoration: 'none' }}
              >
                <img src={photo} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Icon size={24} color="white" strokeWidth={1.5} />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 500, color: 'white' }}>{label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BALIBLE ── */}
      <section className="bg-white py-12 px-6 lg:px-16">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="mb-10" style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: '#111111', fontWeight: 700 }}>
            Why Balible?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {WHY_ITEMS.map(({ Icon, title, body }) => (
              <div key={title}>
                <Icon size={28} style={{ color: '#111111' }} strokeWidth={1.5} />
                <h3 className="mt-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111' }}>{title}</h3>
                <p className="mt-1.5" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOST STORIES ── */}
      <section className="py-12 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: '#111111', fontWeight: 700 }}>
                Stories from Our Hosts
              </h2>
              <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
                Meet the people behind the experiences.
              </p>
            </div>
            <a href="/hosts" className="flex-shrink-0 hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', textDecoration: 'underline' }}>
              View all →
            </a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {HOSTS.map(host => <HostCard key={host.name} host={host} />)}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER CTA ── */}
      <section className="py-12 px-6 lg:px-16 text-center" style={{ backgroundColor: '#111111' }}>
        <div className="max-w-[1440px] mx-auto">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: 'white', fontWeight: 700 }}>
            Be the first to discover new experiences in Bali
          </h2>
          <p className="mt-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: 'rgba(255,255,255,0.65)' }}>
            Join thousands of travelers who get early access to new Bali experiences.
          </p>
          <div className="flex items-center justify-center flex-wrap gap-2 mt-8">
            {subscribed ? (
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#C8A97E', fontWeight: 500 }}>
                ✓ You&apos;re on the list! We&apos;ll be in touch soon.
              </p>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                  className="outline-none text-charcoal placeholder:text-coconut px-4"
                  style={{ width: 320, height: 44, borderRadius: 6, fontFamily: 'var(--font-inter)', fontSize: 14, border: 'none' }}
                />
                <button
                  onClick={handleSubscribe}
                  className="font-medium hover:opacity-90 transition-opacity px-6"
                  style={{ height: 44, backgroundColor: '#C8A97E', color: '#111111', borderRadius: 6, fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
                >
                  Subscribe
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#111111' }} className="px-6 lg:px-16 pt-12 pb-24 md:pb-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="col-span-2 lg:col-span-1">
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'white' }}>BALIBLE</span>
              <p className="mt-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                Curated experiences in the island of Bali.
              </p>
              <div className="flex gap-4 mt-4">
                {([
                  [Instagram, 'https://instagram.com/balible'],
                  [Facebook,  'https://facebook.com/balible'],
                  [Twitter,   'https://twitter.com/balible'],
                ] as const).map(([Icon, url]) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {col.title}
                </h4>
                <ul className="mt-4">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <a href={link.href} className="hover:text-white transition-colors block" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 2 }}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
              © 2026 Balible. All rights reserved.
            </p>
            <div className="flex gap-4 items-center">
              <a href="/privacy" className="hover:text-white transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Privacy Policy</a>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <a href="/terms" className="hover:text-white transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  )
}
