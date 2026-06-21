import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'

export const revalidate = 3600
import { MapPin, Star, Clock, Users, Award, ChevronRight, CalendarDays, Ticket, ExternalLink } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import WishlistHeart from '@/components/WishlistHeart'
import { prisma } from '@/lib/prisma'

// ── Host + experience data ────────────────────────────────────────────────────

type Experience = {
  slug: string; title: string; area: string; price: number
  duration: string; rating: number; reviews: number; category: string; image: string
}

type HostEvent = {
  slug: string; title: string; date: string; location: string
  price: number; capacity: number; coverImage: string | null
}

type Host = {
  slug: string; name: string; businessName: string; area: string
  avatar: string | null; coverImage: string; website: string
  bio: string; rating: number; totalReviews: number
  memberSince: string; languages: string[]
  experiences: Experience[]
  events: HostEvent[]
}

export async function generateStaticParams() {
  try {
    const operators = await prisma.operator.findMany({ include: { user: { select: { name: true } } } })
    return operators.map(op => ({
      slug: op.user.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const host = await getHostFromDB(params.slug)
  if (!host) return { title: 'Host not found' }
  return {
    title: `${host.name} — ${host.businessName} | Balible`,
    description: host.bio.slice(0, 155),
  }
}

async function getHostFromDB(slug: string): Promise<Host | null> {
  try {
    const CATEGORY_DISPLAY: Record<string, string> = {
      WELLNESS_HEALING: 'Wellness & Healing', ART_CRAFT: 'Art & Craft', CULTURE_SPIRITUAL: 'Culture & Spiritual', RENTALS: 'Rentals', LOCAL_EXPERTS: 'Local Experts',
      CULINARY: 'Culinary', NATURE_OUTDOORS: 'Nature & Outdoors',
      WATER_ACTIVITIES: 'Water Activities',
    }
    const AREA_DISPLAY: Record<string, string> = {
      UBUD: 'Ubud', CANGGU: 'Canggu', SEMINYAK: 'Seminyak', KUTA: 'Kuta',
      ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', KINTAMANI: 'Kintamani',
      AMED: 'Amed', SIDEMEN: 'Sidemen', SANUR: 'Sanur',
      NUSA_DUA: 'Nusa Dua', JIMBARAN: 'Jimbaran', MEDEWI: 'Medewi',
    }
    const operators = await prisma.operator.findMany({
      include: {
        user: true,
        experiences: {
          where: { status: 'ACTIVE' },
          select: { slug: true, title: true, area: true, price: true, duration: true, rating: true, totalReviews: true, category: true, images: true },
        },
        events: {
          where: { status: 'PUBLISHED' },
          select: { slug: true, title: true, date: true, location: true, price: true, capacity: true, coverImage: true },
          orderBy: { date: 'asc' },
        },
      },
    })
    const op = operators.find(o => {
      const nameSlug = o.user.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      return nameSlug === slug
    })
    if (!op) return null

    const operatorArea = op.area ? AREA_DISPLAY[String(op.area)] ?? '' : ''
    const firstExpArea = op.experiences[0] ? AREA_DISPLAY[String(op.experiences[0].area)] ?? '' : ''
    const coverImage = (op.experiences[0]?.images as string[] | undefined)?.[0]
      ?? 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&auto=format&fit=crop&q=85'

    return {
      slug,
      name: op.user.name,
      businessName: op.businessName,
      area: operatorArea || firstExpArea,
      avatar: op.avatar ?? null,
      coverImage,
      website: op.website ?? '',
      bio: op.description,
      rating: op.rating,
      totalReviews: op.totalReviews,
      memberSince: new Date(op.user.createdAt).getFullYear().toString(),
      languages: op.languages ? op.languages.split(',').map((l: string) => l.trim()) : ['English'],
      experiences: op.experiences.map(e => ({
        slug: e.slug,
        title: e.title,
        area: AREA_DISPLAY[String(e.area)] ?? String(e.area),
        price: e.price,
        duration: e.duration,
        rating: e.rating,
        reviews: e.totalReviews,
        category: CATEGORY_DISPLAY[String(e.category)] ?? String(e.category),
        image: (e.images as string[])[0] ?? '',
      })),
      events: op.events.map(ev => ({
        slug: ev.slug,
        title: ev.title,
        date: ev.date.toISOString(),
        location: ev.location,
        price: ev.price,
        capacity: ev.capacity,
        coverImage: ev.coverImage,
      })),
    }
  } catch {
    return null
  }
}

// ── Experience card ───────────────────────────────────────────────────────────

function ExpCard({ exp }: { exp: Experience }) {
  return (
    <a
      href={`/experiences/${exp.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
      style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
    >
      {/* Mobile: horizontal search-style */}
      <div className="md:hidden flex gap-3 p-3">
        <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 100, height: 100 }}>
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
          <div className="absolute top-1.5 right-1.5">
            <WishlistHeart slug={exp.slug} size={11} compact />
          </div>
          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, fontWeight: 600 }}>
            {exp.category}
          </span>
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
          <div>
            <h3 className="line-clamp-2 leading-snug" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111' }}>
              {exp.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
              <div className="flex items-center gap-1">
                <MapPin size={10} style={{ color: '#6F675C' }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{exp.area}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={10} fill="#C8A97E" color="#C8A97E" />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#111111' }}>{exp.rating}</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>({exp.reviews})</span>
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
          </div>
        </div>
      </div>

      {/* Desktop: vertical card */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3">
            <span style={{ backgroundColor: 'rgba(17,17,17,0.65)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
              {exp.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <WishlistHeart slug={exp.slug} size={12} compact />
          </div>
        </div>
        <div style={{ padding: '14px 16px 16px' }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', lineHeight: 1.3, marginBottom: 8 }}>
            {exp.title}
          </h3>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 10 }}>
            <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
              <MapPin size={11} style={{ color: '#C8A97E' }} />{exp.area}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
              <Clock size={11} />{exp.duration}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
              <Star size={11} fill="#C8A97E" color="#C8A97E" />
              <strong style={{ color: '#111111' }}>{exp.rating}</strong>
              <span>({exp.reviews})</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111' }}>
              From <span style={{ color: '#C8A97E', fontWeight: 700 }}>IDR</span>{' '}
              <span style={{ fontWeight: 700 }}>{exp.price.toLocaleString('id-ID')}</span>
            </p>
            <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E' }}>
              Book <ChevronRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCard({ ev }: { ev: HostEvent }) {
  const d = new Date(ev.date)
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const isPast = d < new Date()

  return (
    <a href={`/events/${ev.slug}`} className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
      style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}>
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        {ev.coverImage ? (
          <img src={ev.coverImage} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F0EDE8' }}>
            <Ticket size={32} style={{ color: '#C8A97E' }} />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span style={{ backgroundColor: 'rgba(17,17,17,0.65)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
            {isPast ? 'Past event' : 'Upcoming'}
          </span>
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#C8A97E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{dateStr}</p>
        <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', lineHeight: 1.3, marginBottom: 8 }}>
          {ev.title}
        </h3>
        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 10 }}>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
            <CalendarDays size={11} style={{ color: '#C8A97E' }} />{timeStr}
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
            <MapPin size={11} />{ev.location.split(',')[0]}
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
            <Users size={11} />Up to {ev.capacity}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111' }}>
            {ev.price === 0 ? 'Free' : <><span style={{ color: '#C8A97E', fontWeight: 700 }}>IDR</span>{' '}<span style={{ fontWeight: 700 }}>{ev.price.toLocaleString('id-ID')}</span></>}
          </p>
          <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E' }}>
            View <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </a>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HostPage({ params }: { params: { slug: string } }) {
  const host = await getHostFromDB(params.slug)
  if (!host) notFound()

  const totalReviews = host.experiences.reduce((s: number, e: Experience) => s + e.reviews, 0)

  const displayName = host.businessName || host.name

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <Navbar />

      {/* ── COVER BANNER ── */}
      <div className="relative w-full" style={{ height: 'clamp(200px, 28vw, 340px)', overflow: 'hidden' }}>
        <img src={host.coverImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)' }} />
      </div>

      {/* ── PROFILE CARD (overlaps banner) ── */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row sm:items-end gap-5">

          {/* Avatar */}
          <div className="flex-shrink-0" style={{ zIndex: 1 }}>
            <img
              src={host.avatar ?? '/avatar-default.png'}
              alt={host.name}
              className="rounded-2xl object-cover"
              style={{ width: 128, height: 128, border: '4px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            />
          </div>

          {/* Name + stats row */}
          <div className="flex-1 pb-1" style={{ zIndex: 1 }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                {host.businessName && (
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                    {host.name}
                  </p>
                )}
                <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: '#111111', lineHeight: 1.2 }}>
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  {host.area && (
                    <span className="flex items-center gap-1" style={{ fontSize: 13, color: '#6F675C' }}>
                      <MapPin size={12} style={{ color: '#C8A97E' }} />{host.area}, Bali
                    </span>
                  )}
                  {totalReviews > 0 && (
                    <span className="flex items-center gap-1" style={{ fontSize: 13, color: '#6F675C' }}>
                      <Star size={12} fill="#C8A97E" color="#C8A97E" />
                      <strong style={{ color: '#111111' }}>{host.rating.toFixed(1)}</strong>
                      &nbsp;({totalReviews} reviews)
                    </span>
                  )}
                  <span className="flex items-center gap-1" style={{ fontSize: 13, color: '#6F675C' }}>
                    <Award size={12} style={{ color: '#C8A97E' }} />Host since {host.memberSince}
                  </span>
                  <span className="flex items-center gap-1" style={{ fontSize: 13, color: '#6F675C' }}>
                    <ChevronRight size={12} style={{ color: '#C8A97E' }} />{host.experiences.length} experience{host.experiences.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {host.website && (
                <a
                  href={host.website.startsWith('http') ? host.website : `https://${host.website}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity"
                  style={{ height: 38, paddingInline: 16, borderRadius: 10, border: '1px solid #E8E4DE', backgroundColor: 'white', fontSize: 13, fontWeight: 600, color: '#111111', textDecoration: 'none' }}
                >
                  <ExternalLink size={13} style={{ color: '#C8A97E' }} />
                  {host.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16 pb-28">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT — bio + experiences + events */}
          <div className="flex-1 min-w-0">

            {/* About */}
            {host.bio && (
              <div className="bg-white rounded-2xl p-6 mb-7" style={{ border: '1px solid #E8E4DE' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 19, fontWeight: 700, color: '#111111', marginBottom: 12 }}>
                  About {displayName}
                </h2>
                <p style={{ fontSize: 15, color: '#4A4540', lineHeight: 1.8 }}>{host.bio}</p>
                {host.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {host.languages.map((lang: string) => (
                      <span key={lang} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: '#F5F1EB', color: '#6F675C', border: '1px solid #E8E4DE' }}>
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Experiences */}
            {host.experiences.length > 0 && (
              <div className="mb-8">
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 19, fontWeight: 700, color: '#111111', marginBottom: 16 }}>
                  Experiences
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 400, color: '#9E9A94', marginLeft: 10 }}>
                    {host.experiences.length} listing{host.experiences.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className={`grid gap-5 ${host.experiences.length === 1 ? 'grid-cols-1 max-w-sm' : 'sm:grid-cols-2'}`}>
                  {host.experiences.map((exp: Experience) => <ExpCard key={exp.slug} exp={exp} />)}
                </div>
              </div>
            )}

            {/* Events */}
            {host.events.length > 0 && (
              <div className="mb-8">
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 19, fontWeight: 700, color: '#111111', marginBottom: 16 }}>
                  Events
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 400, color: '#9E9A94', marginLeft: 10 }}>
                    {host.events.length} event{host.events.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className={`grid gap-5 ${host.events.length === 1 ? 'grid-cols-1 max-w-sm' : 'sm:grid-cols-2'}`}>
                  {host.events.map((ev: HostEvent) => <EventCard key={ev.slug} ev={ev} />)}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — details card */}
          <div style={{ width: 272, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 88 }}>
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E8E4DE' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 14 }}>
                Host details
              </h3>

              <div className="space-y-3">
                {totalReviews > 0 && (
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 13, color: '#6F675C' }}>Rating</span>
                    <span className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>
                      <Star size={11} fill="#C8A97E" color="#C8A97E" /> {host.rating.toFixed(1)} ({totalReviews})
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13, color: '#6F675C' }}>Experiences</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{host.experiences.length}</span>
                </div>
                {host.events.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 13, color: '#6F675C' }}>Events</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{host.events.length}</span>
                  </div>
                )}
                {host.area && (
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 13, color: '#6F675C' }}>Based in</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{host.area}, Bali</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13, color: '#6F675C' }}>Host since</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{host.memberSince}</span>
                </div>
                {host.languages.length > 0 && (
                  <div className="flex items-start justify-between gap-2">
                    <span style={{ fontSize: 13, color: '#6F675C', flexShrink: 0 }}>Languages</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111111', textAlign: 'right' }}>{host.languages.join(', ')}</span>
                  </div>
                )}
                {host.website && (
                  <div className="flex items-center justify-between gap-2">
                    <span style={{ fontSize: 13, color: '#6F675C', flexShrink: 0 }}>Website</span>
                    <a
                      href={host.website.startsWith('http') ? host.website : `https://${host.website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      style={{ fontSize: 13, fontWeight: 600, color: '#C8A97E', textDecoration: 'none', textAlign: 'right' }}
                    >
                      {host.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F0EDE8' }}>
                <a
                  href="/experiences"
                  className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ height: 44, backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                >
                  Browse all experiences
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
