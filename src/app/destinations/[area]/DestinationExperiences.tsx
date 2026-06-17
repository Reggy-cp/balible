'use client'

import { useState, useMemo } from 'react'
import { Star, MapPin, Clock, Search, X, ArrowRight } from 'lucide-react'

type Experience = {
  slug: string; title: string; area: string; rating: number; reviews: number
  price: number; durationMins: number; category: string; photo: string
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60), m = mins % 60
  return m ? `${h}h ${m}m` : `${h} hours`
}

export default function DestinationExperiences({
  experiences,
  areaName,
  areaSlug,
  color,
  bg,
}: {
  experiences: Experience[]
  areaName: string
  areaSlug: string
  color: string
  bg: string
}) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    experiences.forEach(e => seen.add(e.category))
    return Array.from(seen).sort()
  }, [experiences])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return experiences.filter(e => {
      const matchQuery = !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
      const matchCat = !activeCategory || e.category === activeCategory
      return matchQuery && matchCat
    })
  }, [query, activeCategory, experiences])

  const firstName = areaName.split(' ')[0]

  return (
    <div className="py-14" style={{ borderBottom: experiences.length ? '1px solid #E8E4DE' : 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.15em', color, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
            Experiences
          </p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 700, color: '#111111' }}>
            {experiences.length > 0
              ? `${experiences.length} Experience${experiences.length !== 1 ? 's' : ''} in ${firstName}`
              : `Explore ${firstName}`}
          </h2>
        </div>
        <a
          href={`/search?location=${areaSlug}`}
          className="hidden sm:flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          style={{ fontSize: 13, color, fontWeight: 600, textDecoration: 'none' }}
        >
          View all <ArrowRight size={13} />
        </a>
      </div>

      {experiences.length > 0 && (
        <>
          {/* Search + category filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9E9A94' }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search experiences…"
                style={{
                  width: '100%', height: 42, paddingLeft: 36, paddingRight: query ? 36 : 12,
                  borderRadius: 10, border: '1.5px solid #E8E4DE', backgroundColor: 'white',
                  fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)', outline: 'none',
                }}
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={12} style={{ color: '#6F675C' }} />
                </button>
              )}
            </div>

            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const active = activeCategory === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(active ? null : cat)}
                      style={{
                        height: 42, padding: '0 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                        fontFamily: 'var(--font-inter)', cursor: 'pointer', transition: 'all 0.15s',
                        border: active ? `1.5px solid ${color}` : '1.5px solid #E8E4DE',
                        backgroundColor: active ? bg : 'white',
                        color: active ? color : '#6F675C',
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Result count when filtering */}
          {(query || activeCategory) && (
            <p className="mb-4" style={{ fontSize: 13, color: '#9E9A94', fontFamily: 'var(--font-inter)' }}>
              {filtered.length === 0 ? 'No experiences match' : `${filtered.length} experience${filtered.length !== 1 ? 's' : ''}`}
              {activeCategory ? ` in ${activeCategory}` : ''}
              {query ? ` matching "${query}"` : ''}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid #E8E4DE' }}>
              <p style={{ fontSize: 14, color: '#6F675C', fontFamily: 'var(--font-inter)' }}>No experiences match your search.</p>
              <button
                onClick={() => { setQuery(''); setActiveCategory(null) }}
                style={{ marginTop: 12, fontSize: 13, color, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {filtered.map(exp => (
                <a
                  key={exp.slug}
                  href={`/experiences/${exp.slug}`}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
                  style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
                >
                  {/* Mobile: horizontal */}
                  <div className="md:hidden flex gap-3 p-3">
                    <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 100, height: 100 }}>
                      <img src={exp.photo} alt={exp.title} className="w-full h-full object-cover" />
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
                            <span style={{ fontSize: 11, color: '#6F675C' }}>{exp.area}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={10} fill="#C8A97E" color="#C8A97E" />
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#111111' }}>{exp.rating}</span>
                            <span style={{ fontSize: 11, color: '#6F675C' }}>({exp.reviews})</span>
                          </div>
                          <span style={{ fontSize: 11, color: '#6F675C' }}>⏱ {formatDuration(exp.durationMins)}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: '#111111', marginTop: 8 }}>
                        From <span style={{ color: '#C8A97E', fontWeight: 600 }}>IDR</span>{' '}
                        <span style={{ fontWeight: 600 }}>{exp.price.toLocaleString('id-ID')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Desktop: vertical card */}
                  <div className="hidden md:block">
                    <div className="relative" style={{ height: 200, overflow: 'hidden' }}>
                      <img src={exp.photo} alt={exp.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(17,17,17,0.7)', color: 'white', fontSize: 10, fontWeight: 600 }}>
                        {exp.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', lineHeight: 1.3, marginBottom: 8 }}>
                        {exp.title}
                      </h3>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          <Star size={11} fill="#C8A97E" color="#C8A97E" />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>{exp.rating}</span>
                          <span style={{ fontSize: 12, color: '#6F675C' }}>({exp.reviews})</span>
                        </div>
                        <div style={{ width: 1, height: 12, backgroundColor: '#E8E4DE' }} />
                        <div className="flex items-center gap-1">
                          <Clock size={10} style={{ color: '#6F675C' }} />
                          <span style={{ fontSize: 12, color: '#6F675C' }}>{formatDuration(exp.durationMins)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #E8E4DE' }}>
                        <div>
                          <span style={{ fontSize: 11, color: '#6F675C' }}>From </span>
                          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111' }}>
                            IDR {exp.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color, fontWeight: 600 }}>Book →</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}

      {experiences.length === 0 && (
        <div className="text-center py-10 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid #E8E4DE' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', marginBottom: 12 }}>Browse all experiences in {areaName}</p>
          <a href={`/search?location=${areaSlug}`} className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ height: 42, padding: '0 20px', backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Search experiences <ArrowRight size={13} />
          </a>
        </div>
      )}
    </div>
  )
}
