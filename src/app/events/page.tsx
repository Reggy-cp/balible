import { getPublishedEvents } from '@/lib/event-actions'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const events = await getPublishedEvents()

  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>
      <style>{`.event-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.10); }`}</style>

      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-10" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, color: '#111111', marginBottom: 10 }}>
            Upcoming Events in Bali
          </h1>
          <p style={{ fontSize: 15, color: '#6F675C', maxWidth: 520 }}>
            One-time events hosted by local operators — workshops, festivals, and special experiences.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center" style={{ padding: '80px 24px' }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#111111', marginBottom: 8 }}>No events scheduled yet</p>
            <p style={{ fontSize: 15, color: '#6F675C' }}>Check back soon — hosts are adding events regularly.</p>
          </div>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', display: 'grid' }}>
            {events.map(ev => {
              const d = new Date(ev.date)
              const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
              const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              const isPast = d < new Date()
              return (
                <Link key={ev.id} href={`/events/${ev.slug}`} style={{ textDecoration: 'none' }}>
                  <article className="event-card" style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8E4DE', transition: 'box-shadow 0.2s', cursor: 'pointer' }}>

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
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 12, color: '#6F675C' }}>⏰ {timeStr} · 📍 {ev.location.split(',')[0]}</span>
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

      <MobileNav />
    </div>
  )
}
