import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Users, CalendarDays, Home, Ticket } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import EventGallery from '@/components/EventGallery'
import { getEventBySlug, getPublishedEvents } from '@/lib/event-actions'
import EventBookingCard from './EventBookingCard'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const events = await getPublishedEvents()
    return events.map(e => ({ slug: e.slug }))
  } catch {
    return []
  }
}


export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const [event, allEvents, feeSetting] = await Promise.all([
    getEventBySlug(params.slug),
    getPublishedEvents(),
    prisma.setting.findUnique({ where: { key: 'service_fee' } }).catch(() => null),
  ])
  if (!event || event.status !== 'PUBLISHED') notFound()

  const feeRate = (() => {
    try {
      if (feeSetting?.value) {
        const pct = parseFloat(JSON.parse(feeSetting.value))
        if (!isNaN(pct) && pct > 0) return pct / 100
      }
    } catch {}
    return 0.1
  })()

  const otherEvents = allEvents
    .filter(e => e.slug !== params.slug && new Date(e.date) >= new Date())
    .slice(0, 3)

  const d = new Date(event.date)
  const TZ = 'Asia/Makassar' // Bali is WITA (UTC+8)
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: TZ })
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ })
  const isPast = d < new Date()

  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8">

        {/* Back link */}
        <Link href="/events"
          className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity mb-6"
          style={{ fontSize: 13, color: '#6F675C', textDecoration: 'none' }}>
          ← Back to all events
        </Link>

        {/* Gallery */}
        {(() => {
          const galleryImages = event.images.length > 0 ? event.images : (event.coverImage ? [event.coverImage] : [])
          return galleryImages.length > 0 ? (
            <div className="relative">
              <EventGallery images={galleryImages} title={event.title} />
              {isPast && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 16, zIndex: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px 20px', borderRadius: 20, pointerEvents: 'none' }}>
                    This event has passed
                  </span>
                </div>
              )}
            </div>
          ) : null
        })()}

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0">

            {/* Date pill */}
            <div className="inline-flex items-center gap-2 mb-4"
              style={{ backgroundColor: '#FDF8F4', border: '1px solid #F0E6D6', borderRadius: 20, padding: '5px 14px' }}>
              <CalendarDays size={13} style={{ color: '#C8A97E' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#C8A97E' }}>{dateStr} · {timeStr}</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 700, color: '#111111', lineHeight: 1.2, marginBottom: 16 }}>
              {event.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} style={{ color: '#6F675C', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#6F675C' }}>{event.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} style={{ color: '#6F675C', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#6F675C' }}>Up to {event.capacity} guests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} style={{ color: '#6F675C', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#6F675C' }}>{timeStr}</span>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #E8E4DE' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 12 }}>
                About this event
              </h2>
              <p style={{ fontSize: 15, color: '#3A3530', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {event.description}
              </p>
            </div>

            {/* Hosted by */}
            {event.operatorName && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E8E4DE' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 14 }}>
                  Hosted by
                </h2>
                <div className="flex items-center gap-4">
                  {event.operatorAvatar ? (
                    <img src={event.operatorAvatar} alt={event.operatorName}
                      className="rounded-full object-cover flex-shrink-0"
                      style={{ width: 52, height: 52 }} />
                  ) : (
                    <div className="flex-shrink-0 flex items-center justify-center rounded-full"
                      style={{ width: 52, height: 52, backgroundColor: '#F0EDE8' }}>
                      <Home size={22} style={{ color: '#9E9A94' }} />
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#111111' }}>{event.operatorName}</p>
                    <p style={{ fontSize: 13, color: '#6F675C', marginTop: 2 }}>Verified Balible host</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Booking card ── */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky bg-white rounded-2xl p-6" style={{ top: 88, border: '1px solid #E8E4DE', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

              {/* Price */}
              <div className="mb-5">
                <span style={{ fontSize: 26, fontWeight: 800, color: '#111111' }}>
                  {event.price === 0 ? 'Free' : `IDR ${event.price.toLocaleString('id-ID')}`}
                </span>
                {event.price > 0 && (
                  <span style={{ fontSize: 13, color: '#9E9A94', marginLeft: 6 }}>/ ticket</span>
                )}
              </div>

              {/* Event summary */}
              <div className="rounded-xl p-4 mb-5 space-y-2" style={{ backgroundColor: '#F5F1EB' }}>
                <div className="flex items-start gap-2">
                  <CalendarDays size={14} style={{ color: '#6F675C', marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#111111', fontWeight: 600 }}>{dateStr}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={14} style={{ color: '#6F675C', marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#6F675C' }}>{timeStr}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} style={{ color: '#6F675C', marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#6F675C' }}>{event.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users size={14} style={{ color: '#6F675C', marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#6F675C' }}>Up to {event.capacity} guests</span>
                </div>
              </div>

              {isPast ? (
                <div className="text-center py-3">
                  <p style={{ fontSize: 14, color: '#9E9A94', fontWeight: 500 }}>This event has already taken place</p>
                </div>
              ) : (
                <EventBookingCard
                  slug={event.slug}
                  title={event.title}
                  image={event.coverImage ?? ''}
                  location={event.location}
                  dateStr={dateStr}
                  timeStr={timeStr}
                  price={event.price}
                  feeRate={feeRate}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── YOU MIGHT ALSO LOVE ── */}
      {otherEvents.length > 0 && (
        <section className="py-12 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
          <div className="max-w-[1440px] mx-auto">
            <h2 className="mb-8" style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: '#111111' }}>
              You might also love
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherEvents.map(ev => {
                const d = new Date(ev.date)
                const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: TZ })
                const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ })
                return (
                  <Link key={ev.id} href={`/events/${ev.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow" style={{ border: '1px solid #E8E4DE' }}>
                      <div className="relative" style={{ height: 200 }}>
                        {ev.coverImage ? (
                          <img src={ev.coverImage} alt={ev.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F0EDE8' }}>
                            <Ticket size={36} style={{ color: '#C8C4BE' }} />
                          </div>
                        )}
                        <div className="absolute top-3 left-3" style={{ backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '4px 10px' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{dateStr}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="line-clamp-2 mb-3" style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', lineHeight: 1.3 }}>
                          {ev.title}
                        </h3>
                        <div className="flex flex-col gap-1.5 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} style={{ color: '#6F675C', flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#6F675C' }}>{timeStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} style={{ color: '#6F675C', flexShrink: 0 }} />
                            <span className="line-clamp-1" style={{ fontSize: 13, color: '#6F675C' }}>{ev.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#111111' }}>
                            {ev.price === 0 ? 'Free' : `IDR ${ev.price.toLocaleString('id-ID')}`}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#C8A97E' }}>View event →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <MobileNav />
    </div>
  )
}
