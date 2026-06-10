import Link from 'next/link'
import { getPublishedEvents } from '@/lib/event-actions'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const events = await getPublishedEvents()

  return (
    <main style={{ backgroundColor: '#F5F1EB', minHeight: '100vh', fontFamily: 'var(--font-inter)' }}>

      {/* Nav */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #E8E4DE', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>BALIBLE</span>
          </Link>
          <Link href="/experiences" style={{ fontSize: 13, color: '#6F675C', textDecoration: 'none' }}>Browse experiences →</Link>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: '#111111', marginBottom: 12 }}>
            Upcoming Events in Bali
          </h1>
          <p style={{ fontSize: 16, color: '#6F675C', maxWidth: 520 }}>
            One-time events hosted by local operators — workshops, festivals, and special experiences.
          </p>
        </div>

        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#111111', marginBottom: 8 }}>No events scheduled yet</p>
            <p style={{ fontSize: 15, color: '#6F675C' }}>Check back soon — hosts are adding events regularly.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {events.map(ev => {
              const d = new Date(ev.date)
              const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
              const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              const isPast = d < new Date()
              return (
                <Link key={ev.id} href={`/events/${ev.slug}`} style={{ textDecoration: 'none' }}>
                  <article style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8E4DE', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>

                    {/* Cover */}
                    <div style={{ height: 200, backgroundColor: '#F0EDE8', position: 'relative', overflow: 'hidden' }}>
                      {ev.coverImage ? (
                        <img src={ev.coverImage} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 40 }}>🎟</span>
                        </div>
                      )}
                      {isPast && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', padding: '5px 14px', borderRadius: 20 }}>Event passed</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '18px 20px' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#C8A97E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        {dateStr}
                      </p>
                      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 8, lineHeight: 1.3 }}>
                        {ev.title}
                      </h2>
                      <p style={{ fontSize: 13, color: '#6F675C', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ev.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 12, color: '#6F675C' }}>⏰ {timeStr} · 📍 {ev.location}</span>
                          <span style={{ fontSize: 12, color: '#6F675C' }}>👥 Up to {ev.capacity} guests</span>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>
                          {ev.price === 0 ? 'Free' : `IDR ${ev.price.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
