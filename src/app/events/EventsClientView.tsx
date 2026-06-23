'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, MapPin, Clock, Users, Ticket, X } from 'lucide-react'
import type { EventRow } from '@/lib/event-actions'

const TZ = 'Asia/Makassar'

type Filter = 'all' | 'free' | 'paid'

export default function EventsClientView({ events }: { events: EventRow[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [pastVisible, setPastVisible] = useState(false)

  const now = new Date()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter(ev => {
      const isPast = new Date(ev.date) < now
      if (!pastVisible && isPast) return false
      if (filter === 'free' && ev.price !== 0) return false
      if (filter === 'paid' && ev.price === 0) return false
      if (q) {
        const haystack = `${ev.title} ${ev.description} ${ev.location}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [events, query, filter, pastVisible])

  const hasUpcoming = events.some(ev => new Date(ev.date) >= now)

  return (
    <>
      {/* ── HERO ── */}
      <div className="relative" style={{ height: 'clamp(360px, 45vw, 520px)', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1600&auto=format&fit=crop&q=85"
          alt="Events in Bali"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(17,17,17,0.72) 0%, rgba(17,17,17,0.38) 60%, rgba(17,17,17,0.55) 100%)' }} />

        <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-16">
          <div className="max-w-[680px]">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 14 }}>
              Bali Events
            </p>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(30px, 5vw, 54px)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
              One-of-a-Kind Events<br />Across the Island
            </h1>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(14px, 1.6vw, 17px)', color: 'rgba(255,255,255,0.72)', marginBottom: 32, lineHeight: 1.7, maxWidth: 480 }}>
              Festivals, workshops, ceremonies, and special experiences — hosted by Bali's finest local operators.
            </p>

            {/* Search bar */}
            <div className="relative" style={{ maxWidth: 520 }}>
              <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9E9A94', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search events, venues, or experiences…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: '100%', height: 52, borderRadius: 14, border: 'none',
                  paddingLeft: 46, paddingRight: query ? 44 : 18,
                  fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111',
                  backgroundColor: 'white', outline: 'none',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
                  <X size={15} style={{ color: '#9E9A94' }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="sticky z-20 bg-white" style={{ top: 64, borderBottom: '1px solid #E8E4DE' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 flex items-center gap-2 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {(['all', 'free', 'paid'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                flexShrink: 0, height: 34, padding: '0 16px', borderRadius: 20,
                border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-inter)', transition: 'all 0.15s',
                backgroundColor: filter === f ? '#111111' : 'white',
                borderColor: filter === f ? '#111111' : '#E8E4DE',
                color: filter === f ? 'white' : '#6F675C',
              }}>
              {f === 'all' ? 'All events' : f === 'free' ? 'Free entry' : 'Paid'}
            </button>
          ))}

          <div style={{ width: 1, height: 20, backgroundColor: '#E8E4DE', flexShrink: 0, margin: '0 4px' }} />

          <button onClick={() => setPastVisible(v => !v)}
            style={{
              flexShrink: 0, height: 34, padding: '0 16px', borderRadius: 20,
              border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-inter)', transition: 'all 0.15s',
              backgroundColor: pastVisible ? '#111111' : 'white',
              borderColor: pastVisible ? '#111111' : '#E8E4DE',
              color: pastVisible ? 'white' : '#6F675C',
            }}>
            {pastVisible ? 'Hide past' : 'Show past'}
          </button>

          {(query || filter !== 'all' || pastVisible) && (
            <button
              onClick={() => { setQuery(''); setFilter('all'); setPastVisible(false) }}
              className="flex items-center gap-1"
              style={{ flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 20, border: '1px solid #E8E4DE', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-inter)', color: '#B66A45', backgroundColor: '#FEF3ED', borderColor: '#F5C9AE' }}>
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-10" style={{ minHeight: 300 }}>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#F5F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ticket size={22} style={{ color: '#C8A97E' }} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#111111', marginBottom: 6, fontFamily: 'var(--font-playfair)' }}>
              {query ? 'No events match your search' : 'No events found'}
            </p>
            <p style={{ fontSize: 14, color: '#6F675C', fontFamily: 'var(--font-inter)' }}>
              {query ? `Try different keywords or clear the filter.` : 'Check back soon — hosts are adding events regularly.'}
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#9E9A94', marginBottom: 20, fontFamily: 'var(--font-inter)' }}>
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
              {query ? ` matching "${query}"` : ''}
            </p>
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {filtered.map(ev => {
                const d = new Date(ev.date)
                const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: TZ })
                const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ })
                const isPast = d < now
                return (
                  <Link key={ev.id} href={`/events/${ev.slug}`} style={{ textDecoration: 'none' }}>
                    <article style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8E4DE', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }}
                      className="event-card">

                      {/* Cover */}
                      <div style={{ height: 200, backgroundColor: '#F0EDE8', position: 'relative', overflow: 'hidden' }}>
                        {ev.coverImage ? (
                          <img src={ev.coverImage} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} className="event-img" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ticket size={36} style={{ color: '#C8C4BE' }} />
                          </div>
                        )}
                        {isPast && (
                          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', padding: '5px 14px', borderRadius: 20 }}>Event passed</span>
                          </div>
                        )}
                        {ev.price === 0 && !isPast && (
                          <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#4A7C59', borderRadius: 20, padding: '3px 10px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>Free</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '18px 20px' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#C8A97E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'var(--font-inter)' }}>
                          {dateStr}
                        </p>
                        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 8, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {ev.title}
                        </h2>
                        <p style={{ fontSize: 13, color: '#6F675C', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
                          {ev.description}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                          <span style={{ fontSize: 12, color: '#6F675C', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-inter)' }}>
                            <Clock size={11} style={{ color: '#9E9A94', flexShrink: 0 }} />{timeStr}
                            <span style={{ color: '#D1CDC7' }}>·</span>
                            <MapPin size={11} style={{ color: '#9E9A94', flexShrink: 0 }} />{ev.location.split(',')[0]}
                          </span>
                          <span style={{ fontSize: 12, color: '#6F675C', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-inter)' }}>
                            <Users size={11} style={{ color: '#9E9A94', flexShrink: 0 }} />Up to {ev.capacity} guests
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F5F1EB', paddingTop: 12 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#111111', fontFamily: 'var(--font-inter)' }}>
                            {ev.price === 0 ? 'Free' : `IDR ${ev.price.toLocaleString('id-ID')}`}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E', fontFamily: 'var(--font-inter)' }}>View event →</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        .event-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.10); transform: translateY(-2px); }
        .event-card:hover .event-img { transform: scale(1.05); }
      `}</style>
    </>
  )
}
