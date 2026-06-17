'use client'

import { useState, useMemo } from 'react'
import { Star, ArrowRight, Search, X } from 'lucide-react'

type Area = {
  slug: string
  name: string
  tagline: string
  description: string
  highlights: string[]
  topCategory: string
  rating: number
  image: string
  color: string
  bg: string
}

export default function DestinationsGrid({ areas }: { areas: Area[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return areas
    return areas.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      a.topCategory.toLowerCase().includes(q) ||
      a.highlights.some(h => h.toLowerCase().includes(q))
    )
  }, [query, areas])

  return (
    <div className="max-w-[1200px] mx-auto px-5 lg:px-8 pb-16">
      {/* SEARCH BAR */}
      <div className="mb-8">
        <div className="relative max-w-[520px] mx-auto">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#9E9A94' }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by destination, highlight, or activity…"
            style={{
              width: '100%',
              height: 50,
              paddingLeft: 44,
              paddingRight: query ? 44 : 16,
              borderRadius: 12,
              border: '1.5px solid #E8E4DE',
              backgroundColor: 'white',
              fontFamily: 'var(--font-inter)',
              fontSize: 14,
              color: '#111111',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              outline: 'none',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={14} style={{ color: '#6F675C' }} />
            </button>
          )}
        </div>
        {query && (
          <p className="text-center mt-3" style={{ fontSize: 13, color: '#9E9A94', fontFamily: 'var(--font-inter)' }}>
            {filtered.length === 0
              ? `No destinations match "${query}"`
              : `${filtered.length} destination${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        )}
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C' }}>
            No destinations match &ldquo;{query}&rdquo;
          </p>
          <button
            onClick={() => setQuery('')}
            className="mt-4 inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            style={{ fontSize: 13, color: '#C8A97E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(area => (
            <a
              key={area.slug}
              href={`/destinations/${area.slug}`}
              className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 block"
              style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
            >
              <div className="relative" style={{ height: 200, overflow: 'hidden' }}>
                <img src={area.image} alt={area.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)' }} />
                <div className="absolute bottom-0 left-0 p-4">
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                    {area.tagline}
                  </p>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                    {area.name}
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.7, marginBottom: 14 }}>
                  {area.description.length > 120 ? area.description.slice(0, 120) + '…' : area.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {area.highlights.slice(0, 3).map(h => (
                    <span key={h} className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: area.bg, color: area.color, fontSize: 11, fontWeight: 500 }}>
                      {h}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F5F1EB' }}>
                  <div className="flex items-center gap-1">
                    <Star size={11} fill="#C8A97E" color="#C8A97E" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{area.rating}</span>
                    <span style={{ fontSize: 11, color: '#6F675C', marginLeft: 2 }}>{area.topCategory}</span>
                  </div>
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: area.color, fontWeight: 600 }}>
                    Explore <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
