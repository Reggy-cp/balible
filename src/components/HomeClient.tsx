'use client'

import { useState, useRef } from 'react'
import {
  Heart, Search, CalendarDays, ChevronDown,
  ChevronRight, ChevronLeft, Leaf, Scissors, Landmark, ChefHat, Sun,
  Mountain, Waves, Grid3x3, Star, ShieldCheck, Users, Sparkles,
  MapPin, Instagram, Facebook, Twitter,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import type { FeaturedExp } from '@/lib/experiences'
import type { EventRow } from '@/lib/event-actions'

// ── Static data ───────────────────────────────────────────────────────────────

const CAT_STRIP = [
  { label: 'Wellness',      Icon: Leaf,      href: '/categories/wellness'   },
  { label: 'Art & Craft',   Icon: Scissors,  href: '/categories/art-craft'  },
  { label: 'Culture',       Icon: Landmark,  href: '/categories/culture'    },
  { label: 'Culinary',      Icon: ChefHat,   href: '/categories/culinary'   },
  { label: 'Spiritual',     Icon: Sun,       href: '/categories/spiritual'  },
  { label: 'Nature & Outdoors', Icon: Mountain, href: '/categories/nature'  },
  { label: 'Water Activities', Icon: Waves,   href: '/categories/water-activities' },
  { label: 'All Categories',  Icon: Grid3x3, href: '/categories'            },
]

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
  { title: 'Explore',   links: [{ label: 'All Experiences', href: '/search' }, { label: 'Events', href: '/events' }, { label: 'By Destination', href: '/destinations' }, { label: 'How It Works', href: '/how-it-works' }, { label: 'Map View', href: '/map' }, { label: 'Journal', href: '/blog' }] },
  { title: 'For Hosts', links: [{ label: 'Become a Host', href: '/for-hosts' }, { label: 'Host Dashboard', href: '/dashboard' }, { label: 'How It Works', href: '/for-hosts#how-it-works' }, { label: 'Earnings Calculator', href: '/for-hosts#calculator' }, { label: 'Host Stories', href: '/for-hosts#stories' }] },
  { title: 'About',     links: [{ label: 'Our Story', href: '/about' }, { label: 'Destinations', href: '/destinations' }, { label: 'Blog', href: '/blog' }, { label: 'Sign In', href: '/auth/signin' }, { label: 'Sign Up', href: '/auth/signup' }] },
  { title: 'Support',   links: [{ label: 'Help Centre', href: '/help' }, { label: 'How It Works', href: '/how-it-works' }, { label: 'Wishlist', href: '/wishlist' }, { label: 'My Profile', href: '/profile' }, { label: 'My Bookings', href: '/profile' }] },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function ExperienceCard({ exp }: { exp: FeaturedExp }) {
  const [liked, setLiked] = useState(false)
  return (
    <a
      href={`/experiences/${exp.slug}`}
      className="flex-shrink-0 rounded-xl overflow-hidden border hover:shadow-md transition-shadow block"
      style={{ width: 240, borderColor: '#E8E4DE' }}
    >
      <div className="relative" style={{ height: 180 }}>
        <img src={exp.photo} alt={exp.title} className="w-full h-full object-cover" />
        <button
          className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
          onClick={e => { e.preventDefault(); setLiked(!liked) }}
        >
          <Heart size={13} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#111111'} />
        </button>
      </div>
      <div className="p-3.5">
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{exp.area}</p>
        <h3 className="mt-1 line-clamp-2 leading-snug" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: '#111111', fontWeight: 600 }}>
          {exp.title}
        </h3>
        <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{exp.meta}</p>
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
  const [liked, setLiked] = useState(false)
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl" style={{ height: 200 }}>
        <img src={host.photo} alt={host.name} className="w-full h-full object-cover" />
        <button
          className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
          onClick={() => setLiked(!liked)}
        >
          <Heart size={13} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#111111'} />
        </button>
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

export default function HomeClient({ featuredExperiences, upcomingEvents }: { featuredExperiences: FeaturedExp[]; upcomingEvents: EventRow[] }) {
  const [search, setSearch]         = useState('')
  const [email, setEmail]           = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSubscribe = () => {
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 4000)
  }

  const scrollCards = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' })
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
          <div className="flex items-center bg-white shadow-xl mt-6 lg:mt-8" style={{ maxWidth: 500, height: 52, borderRadius: 8 }}>
            <div className="flex items-center gap-2 px-3 lg:px-4 flex-1 min-w-0">
              <Search size={15} style={{ color: '#6F675C', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search experiences, places, activities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="outline-none w-full bg-transparent placeholder:text-coconut text-charcoal truncate"
                style={{ fontFamily: 'var(--font-inter)', fontSize: 13 }}
              />
            </div>
            <div className="w-px h-7 flex-shrink-0" style={{ backgroundColor: '#E8E4DE' }} />
            <div className="hidden sm:flex items-center gap-1.5 px-3 flex-shrink-0">
              <CalendarDays size={14} style={{ color: '#6F675C' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', whiteSpace: 'nowrap' }}>Add date</span>
            </div>
            <a
              href={`/search${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`}
              className="mx-2 flex-shrink-0 text-white rounded-md px-4 lg:px-6 py-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#111111', fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              Search
            </a>
          </div>
        </div>
      </section>

      {/* ── CATEGORY STRIP ── */}
      <section className="bg-white py-8 px-6 lg:px-16" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between overflow-x-auto scrollbar-none gap-4">
          {CAT_STRIP.map(({ label, Icon, href }) => (
            <a key={label} href={href} className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer" style={{ textDecoration: 'none' }}>
              <Icon size={24} strokeWidth={1.5} className="group-hover:text-gold transition-colors" style={{ color: '#111111' }} />
              <span className="group-hover:text-gold transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── HANDPICKED EXPERIENCES ── */}
      <section className="bg-white py-12 px-6 lg:px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: '#111111', fontWeight: 700 }}>
                Handpicked Experiences
              </h2>
              <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
                Curated by local experts. Loved by travelers.
              </p>
            </div>
            <a href="/search" className="flex-shrink-0 hover:opacity-70 transition-opacity underline" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', textDecoration: 'underline' }}>
              View all →
            </a>
          </div>

          <div className="relative">
            <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
              {featuredExperiences.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
            </div>
            <button
              onClick={() => scrollCards(-1)}
              className="hidden lg:flex absolute -left-5 top-[90px] -translate-y-1/2 w-10 h-10 bg-white rounded-full items-center justify-center hover:bg-ivory transition-colors shadow-sm"
              style={{ border: '1px solid #E8E4DE' }}
            >
              <ChevronLeft size={18} style={{ color: '#111111' }} />
            </button>
            <button
              onClick={() => scrollCards(1)}
              className="hidden lg:flex absolute -right-5 top-[90px] -translate-y-1/2 w-10 h-10 bg-white rounded-full items-center justify-center hover:bg-ivory transition-colors shadow-sm"
              style={{ border: '1px solid #E8E4DE' }}
            >
              <ChevronRight size={18} style={{ color: '#111111' }} />
            </button>
          </div>
        </div>
      </section>

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
            <a href="/for-hosts" className="flex-shrink-0 hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', textDecoration: 'underline' }}>
              View all →
            </a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {HOSTS.map(host => <HostCard key={host.name} host={host} />)}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      {upcomingEvents.length > 0 && (
        <section className="bg-white py-12 px-6 lg:px-16">
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
                const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
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
      <footer style={{ backgroundColor: '#111111' }} className="px-6 lg:px-16 pt-12 pb-8 md:pb-8 pb-24">
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
              <a href="/help" className="hover:text-white transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Privacy Policy</a>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <a href="/help" className="hover:text-white transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  )
}
