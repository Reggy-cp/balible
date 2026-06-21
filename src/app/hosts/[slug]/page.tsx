import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600
import { MapPin, Star, Clock, Users, Award, ChevronRight, CalendarDays, Ticket, ExternalLink } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import WishlistHeart from '@/components/WishlistHeart'
import { HostChatButton, SaveHostButton, AskKalaButton, AllReviewsModal } from '@/components/HostButtons'
import { prisma } from '@/lib/prisma'

// ── Types ─────────────────────────────────────────────────────────────────────

type Experience = {
  slug: string; title: string; area: string; price: number
  duration: string; rating: number; reviews: number; category: string; image: string
}

type HostEvent = {
  slug: string; title: string; date: string; location: string
  price: number; capacity: number; coverImage: string | null
}

type Review = {
  id: string; rating: number; comment: string; createdAt: string
  user: { name: string; image: string | null }
}

type Host = {
  slug: string; operatorId: string; name: string; businessName: string; area: string
  avatar: string | null; coverImage: string; website: string
  bio: string; rating: number; totalReviews: number
  memberSince: string; languages: string[]
  experiences: Experience[]
  events: HostEvent[]
  reviews: Review[]
  galleryImages: string[]
}

// ── Data ──────────────────────────────────────────────────────────────────────

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
    title: `${host.businessName || host.name} | Balible`,
    description: host.bio.slice(0, 155),
  }
}

async function getHostFromDB(slug: string): Promise<Host | null> {
  try {
    const CATEGORY_DISPLAY: Record<string, string> = {
      WELLNESS_HEALING: 'Wellness & Healing', ART_CRAFT: 'Art & Craft', CULTURE_SPIRITUAL: 'Culture & Spiritual', RENTALS: 'Rentals', LOCAL_EXPERTS: 'Local Experts',
      CULINARY: 'Culinary', NATURE_OUTDOORS: 'Nature & Outdoors', WATER_ACTIVITIES: 'Water Activities', SERVICES: 'Services',
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
          include: {
            reviews: {
              include: { user: { select: { name: true, image: true } } },
              orderBy: { createdAt: 'desc' },
              take: 4,
            },
          },
          orderBy: { rating: 'desc' },
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

    // Flatten gallery: all images from all experiences, deduplicated
    const galleryImages = Array.from(new Set(
      op.experiences.flatMap(e => (e.images as string[]) ?? [])
    )).slice(0, 10)

    // Flatten reviews across all experiences
    type DbReview = { id: string; rating: number; comment: string; createdAt: Date; user: { name: string; image: string | null } }
    const reviews: Review[] = op.experiences
      .flatMap(e => (e.reviews as DbReview[]).map(r => ({
        id: r.id, rating: r.rating, comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        user: { name: r.user.name, image: r.user.image },
      })))
      .slice(0, 6)

    return {
      slug,
      operatorId: op.id,
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
        slug: e.slug, title: e.title,
        area: AREA_DISPLAY[String(e.area)] ?? String(e.area),
        price: e.price, duration: e.duration, rating: e.rating, reviews: e.totalReviews,
        category: CATEGORY_DISPLAY[String(e.category)] ?? String(e.category),
        image: (e.images as string[])[0] ?? '',
      })),
      events: op.events.map(ev => ({
        slug: ev.slug, title: ev.title, date: ev.date.toISOString(),
        location: ev.location, price: ev.price, capacity: ev.capacity, coverImage: ev.coverImage,
      })),
      reviews,
      galleryImages,
    }
  } catch {
    return null
  }
}

// ── Experience card ───────────────────────────────────────────────────────────

function ExpCard({ exp }: { exp: Experience }) {
  return (
    <a href={`/experiences/${exp.slug}`} className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow" style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}>
      {/* Mobile: horizontal */}
      <div className="md:hidden flex gap-3 p-3">
        <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 100, height: 100 }}>
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, fontWeight: 600 }}>{exp.category}</span>
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
          <h3 className="line-clamp-2 leading-snug" style={{ fontSize: 15, fontWeight: 600, color: '#111111' }}>{exp.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Star size={10} fill="#C8A97E" color="#C8A97E" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#111111' }}>{exp.rating}</span>
            <span style={{ fontSize: 11, color: '#6F675C' }}>({exp.reviews})</span>
          </div>
          <p style={{ fontSize: 13, color: '#111111', marginTop: 4 }}>
            From <span style={{ color: '#C8A97E', fontWeight: 600 }}>IDR</span> <span style={{ fontWeight: 600 }}>{exp.price.toLocaleString('id-ID')}</span>
          </p>
        </div>
      </div>

      {/* Desktop: vertical */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden" style={{ height: 190 }}>
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3">
            <span style={{ backgroundColor: 'rgba(17,17,17,0.65)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>{exp.category}</span>
          </div>
          <div className="absolute top-3 right-3"><WishlistHeart slug={exp.slug} size={12} compact /></div>
        </div>
        <div style={{ padding: '14px 16px 16px' }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', lineHeight: 1.3, marginBottom: 8 }}>{exp.title}</h3>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 10 }}>
            <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><MapPin size={11} style={{ color: '#C8A97E' }} />{exp.area}</span>
            <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><Clock size={11} />{exp.duration}</span>
            <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><Star size={11} fill="#C8A97E" color="#C8A97E" /><strong style={{ color: '#111111' }}>{exp.rating}</strong> ({exp.reviews})</span>
          </div>
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 14, color: '#111111' }}>From <span style={{ color: '#C8A97E', fontWeight: 700 }}>IDR</span>{' '}<span style={{ fontWeight: 700 }}>{exp.price.toLocaleString('id-ID')}</span></p>
            <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E' }}>Book <ChevronRight size={13} /></span>
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
    <a href={`/events/${ev.slug}`} className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow" style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}>
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        {ev.coverImage
          ? <img src={ev.coverImage} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F0EDE8' }}><Ticket size={32} style={{ color: '#C8A97E' }} /></div>
        }
        <div className="absolute top-3 left-3">
          <span style={{ backgroundColor: 'rgba(17,17,17,0.65)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>{isPast ? 'Past event' : 'Upcoming'}</span>
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#C8A97E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{dateStr}</p>
        <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', lineHeight: 1.3, marginBottom: 8 }}>{ev.title}</h3>
        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 10 }}>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><CalendarDays size={11} style={{ color: '#C8A97E' }} />{timeStr}</span>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><MapPin size={11} />{ev.location.split(',')[0]}</span>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><Users size={11} />Up to {ev.capacity}</span>
        </div>
        <div className="flex items-center justify-between">
          <p style={{ fontSize: 14, color: '#111111' }}>
            {ev.price === 0 ? 'Free' : <><span style={{ color: '#C8A97E', fontWeight: 700 }}>IDR</span>{' '}<span style={{ fontWeight: 700 }}>{ev.price.toLocaleString('id-ID')}</span></>}
          </p>
          <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E' }}>View <ChevronRight size={13} /></span>
        </div>
      </div>
    </a>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HostPage({ params }: { params: { slug: string } }) {
  const host = await getHostFromDB(params.slug)
  if (!host) notFound()

  const displayName = host.businessName || host.name
  const firstName = host.name.split(' ')[0]
  const totalReviews = host.totalReviews || host.experiences.reduce((s, e) => s + e.reviews, 0)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: 'white', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 'clamp(380px, 52vw, 520px)', backgroundColor: '#111' }}>
        {/* Blurred bg */}
        <img src={host.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'blur(3px)', opacity: 0.35, transform: 'scale(1.06)' }} />
        {/* Gradient: heavy left, fade right */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.15) 100%)' }} />

        <div className="relative max-w-[1100px] mx-auto px-6 lg:px-16 h-full flex items-center" style={{ minHeight: 'inherit', paddingTop: 60, paddingBottom: 60 }}>
          <div className="flex items-center justify-between w-full gap-10">

            {/* LEFT — text */}
            <div style={{ flex: 1, maxWidth: 520 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#C8A97E', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                Host on Balible
              </p>
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: 14 }}>
                {displayName}
              </h1>
              {host.area && (
                <div className="flex items-center gap-1.5 mb-4">
                  <MapPin size={14} style={{ color: '#C8A97E', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{host.area}, Bali</span>
                </div>
              )}
              {host.bio && (
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 20, maxWidth: 440 }}>
                  {host.bio.length > 140 ? host.bio.slice(0, 140).replace(/\s\S+$/, '') + '…' : host.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-5 mb-8">
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <Star size={16} fill="#C8A97E" color="#C8A97E" />
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{host.rating.toFixed(1)}</span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>({totalReviews} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Award size={15} style={{ color: '#C8A97E' }} />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Member since {host.memberSince}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HostChatButton firstName={displayName} operatorId={host.operatorId} />
                <SaveHostButton slug={host.slug} />
              </div>
            </div>

          </div>
        </div>
      </div>


{/* ── BODY ── */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16 py-10 pb-28">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT — main content */}
          <div className="flex-1 min-w-0">

            {/* Gallery strip */}
            {host.galleryImages.length > 1 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>
                    A glimpse into {firstName}&apos;s world
                  </h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {host.galleryImages.map((img, i) => (
                    <div key={i} className="flex-shrink-0 overflow-hidden rounded-2xl" style={{ width: 160, height: 120 }}>
                      <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experiences */}
            {host.experiences.length > 0 && (
              <div className="mb-10">
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>
                  Experience by {displayName}
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 400, color: '#9E9A94', marginLeft: 10 }}>
                    {host.experiences.length} listing{host.experiences.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className={`grid gap-5 ${host.experiences.length === 1 ? 'grid-cols-1 max-w-xs' : 'sm:grid-cols-2'}`}>
                  {host.experiences.map(exp => <ExpCard key={exp.slug} exp={exp} />)}
                </div>
              </div>
            )}

            {/* Events */}
            {host.events.length > 0 && (
              <div className="mb-10">
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>
                  Event by {displayName}
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 400, color: '#9E9A94', marginLeft: 10 }}>
                    {host.events.length} event{host.events.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className={`grid gap-5 ${host.events.length === 1 ? 'grid-cols-1 max-w-xs' : 'sm:grid-cols-2'}`}>
                  {host.events.map(ev => <EventCard key={ev.slug} ev={ev} />)}
                </div>
              </div>
            )}

            {/* Reviews */}
            {host.reviews.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>
                    What travelers say about {firstName}
                  </h2>
                  {host.reviews.length > 0 && (
                    <AllReviewsModal
                      reviews={host.reviews}
                      hostName={displayName}
                      rating={host.rating}
                      totalReviews={totalReviews}
                    />
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {host.reviews.slice(0, 3).map(r => (
                    <div key={r.id} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E8E4DE' }}>
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={13} fill="#C8A97E" color="#C8A97E" />
                        ))}
                      </div>
                      <p style={{ fontSize: 13, color: '#4A4540', lineHeight: 1.7, marginBottom: 16 }} className="line-clamp-4">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                      <div className="flex items-center gap-2.5">
                        {r.user.image
                          ? <img src={r.user.image} alt={r.user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, backgroundColor: '#F5F1EB', fontSize: 13, fontWeight: 700, color: '#6F675C' }}>{r.user.name.charAt(0)}</div>
                        }
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{r.user.name.split(' ')[0]} {r.user.name.split(' ')[1]?.charAt(0)}.</p>
                          <p style={{ fontSize: 11, color: '#9E9A94' }}>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Banner */}
            {host.experiences.length > 0 && (
              <div className="rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5" style={{ backgroundColor: 'white', border: '1px solid #E8E4DE' }}>
                <img
                  src={host.avatar ?? host.coverImage}
                  alt={host.name}
                  style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div className="flex-1">
                  <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 4 }}>
                    Ready to create something special with {firstName}?
                  </p>
                  <p style={{ fontSize: 13, color: '#6F675C' }}>
                    Join {host.businessName ? `${host.businessName}` : firstName} for an unforgettable experience in Bali.
                  </p>
                </div>
                <a
                  href={`/experiences/${host.experiences[0].slug}`}
                  className="flex-shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ height: 44, paddingInline: 22, borderRadius: 22, backgroundColor: '#111111', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                >
                  Book an experience <ChevronRight size={15} />
                </a>
              </div>
            )}
          </div>

          {/* RIGHT — sticky sidebar */}
          <div style={{ width: '100%', maxWidth: 280, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 88 }}>

            {/* Host details card */}
            <div className="bg-white rounded-2xl p-5 mb-4" style={{ border: '1px solid #E8E4DE' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 14 }}>
                Host details
              </h3>
              <div className="space-y-3">
                {totalReviews > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: '#6F675C' }}>
                        <Star size={12} style={{ color: '#C8A97E' }} /> Rating
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{host.rating.toFixed(1)} ★</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 13, color: '#6F675C' }}>Total reviews</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{totalReviews}</span>
                    </div>
                  </>
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
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13, color: '#6F675C' }}>Member since</span>
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
                  className="flex items-center justify-center hover:opacity-90 transition-opacity"
                  style={{ height: 42, backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  Browse all experiences
                </a>
              </div>
            </div>

            {/* Ask Kala card */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E8E4DE' }}>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 6 }}>
                Have a question?
              </p>
              <p style={{ fontSize: 13, color: '#6F675C', lineHeight: 1.6, marginBottom: 14 }}>
                Ask Kala, your AI travel guide, about {firstName} or their experiences.
              </p>
              <AskKalaButton firstName={firstName} />
            </div>

          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
