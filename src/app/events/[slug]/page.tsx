import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/event-actions'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug)
  if (!event || event.status !== 'PUBLISHED') notFound()

  const d = new Date(event.date)
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const isPast = d < new Date()

  return (
    <main style={{ backgroundColor: '#F5F1EB', minHeight: '100vh', fontFamily: 'var(--font-inter)' }}>

      {/* Nav */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #E8E4DE', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>BALIBLE</span>
          </Link>
          <span style={{ color: '#C8C4BE', fontSize: 14 }}>/</span>
          <Link href="/events" style={{ fontSize: 13, color: '#6F675C', textDecoration: 'none' }}>Events</Link>
          <span style={{ color: '#C8C4BE', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{event.title}</span>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Cover image */}
        {event.coverImage && (
          <div style={{ borderRadius: 20, overflow: 'hidden', height: 'clamp(220px,40vw,420px)', marginBottom: 36, position: 'relative' }}>
            <img src={event.coverImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {isPast && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px 20px', borderRadius: 20 }}>This event has passed</span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'start' }}>
          <div>
            {/* Date pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#FDF8F4', border: '1px solid #F0E6D6', borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E' }}>📅 {dateStr} · {timeStr}</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, color: '#111111', marginBottom: 16, lineHeight: 1.25 }}>
              {event.title}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ fontSize: 14, color: '#6F675C' }}>{event.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>👥</span>
                <span style={{ fontSize: 14, color: '#6F675C' }}>Up to {event.capacity} guests</span>
              </div>
              {event.operatorName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {event.operatorAvatar ? (
                    <img src={event.operatorAvatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 16 }}>🏡</span>
                  )}
                  <span style={{ fontSize: 14, color: '#6F675C' }}>Hosted by {event.operatorName}</span>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, border: '1px solid #E8E4DE', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 12 }}>About this event</h2>
              <p style={{ fontSize: 15, color: '#3A3530', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{event.description}</p>
            </div>
          </div>

          {/* Booking card */}
          <div style={{ position: 'sticky', top: 80, width: 'min(280px, 100%)', backgroundColor: 'white', borderRadius: 20, padding: 24, border: '1px solid #E8E4DE', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#111111', marginBottom: 2 }}>
              {event.price === 0 ? 'Free' : `IDR ${event.price.toLocaleString('id-ID')}`}
            </p>
            {event.price > 0 && <p style={{ fontSize: 12, color: '#9E9A94', marginBottom: 20 }}>per ticket</p>}

            <div style={{ backgroundColor: '#F5F1EB', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 2 }}>📅 {dateStr}</p>
              <p style={{ fontSize: 13, color: '#6F675C' }}>⏰ {timeStr}</p>
              <p style={{ fontSize: 13, color: '#6F675C', marginTop: 4 }}>📍 {event.location}</p>
            </div>

            {isPast ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ fontSize: 14, color: '#9E9A94', fontWeight: 500 }}>This event has already taken place</p>
              </div>
            ) : (
              <Link href="/checkout" style={{ textDecoration: 'none', display: 'block' }}>
                <button style={{ width: '100%', height: 48, borderRadius: 12, border: 'none', backgroundColor: '#111111', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Get tickets
                </button>
              </Link>
            )}

            <p style={{ fontSize: 11, color: '#C8C4BE', textAlign: 'center', marginTop: 12 }}>Free cancellation up to 24h before the event</p>
          </div>
        </div>

        <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6F675C', textDecoration: 'none', marginTop: 8 }}>
          ← Back to all events
        </Link>
      </div>
    </main>
  )
}
