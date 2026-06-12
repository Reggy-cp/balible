'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, X, Star, MapPin, Clock, ArrowLeft, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import WishlistHeart from '@/components/WishlistHeart'

// ── Experience data with coordinates ─────────────────────────────────────────

export const MAP_EXPERIENCES = [
  // Art & Craft
  { id: 1,  slug: 'pottery-making-class',       title: 'Pottery Making Class',          category: 'Art & Craft',  area: 'Ubud',     lat: -8.5069,  lng: 115.2625, price: 450000, rating: 4.9, reviews: 128, duration: '2.5 hrs', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80' },
  { id: 2,  slug: 'silver-jewelry-workshop',    title: 'Silver Jewelry Workshop',        category: 'Art & Craft',  area: 'Canggu',   lat: -8.6478,  lng: 115.1383, price: 550000, rating: 4.8, reviews: 94,  duration: '3 hrs',   image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&auto=format&fit=crop&q=80' },
  { id: 3,  slug: 'batik-painting-workshop',    title: 'Batik Painting Workshop',        category: 'Art & Craft',  area: 'Ubud',     lat: -8.5200,  lng: 115.2750, price: 380000, rating: 4.7, reviews: 64,  duration: '3 hrs',   image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&auto=format&fit=crop&q=80' },
  // Wellness
  { id: 4,  slug: 'sound-healing-journey',      title: 'Sound Healing Journey',          category: 'Wellness',     area: 'Ubud',     lat: -8.5150,  lng: 115.2580, price: 350000, rating: 4.8, reviews: 178, duration: '90 min',  image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80' },
  { id: 5,  slug: 'sunrise-yoga-class',         title: 'Sunrise Yoga & Meditation',      category: 'Wellness',     area: 'Canggu',   lat: -8.6550,  lng: 115.1420, price: 250000, rating: 4.9, reviews: 203, duration: '75 min',  image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&auto=format&fit=crop&q=80' },
  // Culture
  { id: 6,  slug: 'water-temple-purification',  title: 'Water Temple Purification',      category: 'Culture',      area: 'Gianyar',  lat: -8.5374,  lng: 115.3247, price: 600000, rating: 4.8, reviews: 78,  duration: '4 hrs',   image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&auto=format&fit=crop&q=80' },
  { id: 7,  slug: 'uluwatu-kecak-sunset',       title: 'Uluwatu Sunset & Kecak Dance',   category: 'Culture',      area: 'Uluwatu',  lat: -8.8293,  lng: 115.0849, price: 450000, rating: 4.9, reviews: 312, duration: '3 hrs',   image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80' },
  // Culinary
  { id: 8,  slug: 'balinese-cooking-class',     title: 'Balinese Cooking Class',         category: 'Culinary',         area: 'Seminyak', lat: -8.6906,  lng: 115.1589, price: 480000, rating: 4.8, reviews: 156, duration: '3.5 hrs', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80' },
  { id: 9,  slug: 'jimbaran-seafood-sunset',    title: 'Jimbaran Seafood & Sunset',      category: 'Culinary',         area: 'Jimbaran', lat: -8.7898,  lng: 115.1687, price: 350000, rating: 4.6, reviews: 89,  duration: '2 hrs',   image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop&q=80' },
  // Water Activities
  { id: 10, slug: 'beginner-surf-lesson',       title: 'Beginner Surf Lesson',           category: 'Water Activities', area: 'Kuta',     lat: -8.7183,  lng: 115.1685, price: 320000, rating: 4.7, reviews: 428, duration: '2 hrs',   image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&auto=format&fit=crop&q=80' },
  // Water Activities
  { id: 11, slug: 'snorkeling-amed',            title: 'Snorkeling at Amed Reef',        category: 'Water Activities', area: 'Amed',     lat: -8.3428,  lng: 115.6478, price: 420000, rating: 4.8, reviews: 67,  duration: '3 hrs',   image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&auto=format&fit=crop&q=80' },
  // Nature & Outdoors
  { id: 12, slug: 'rice-terrace-walk',          title: 'Tegalalang Rice Terrace Walk',   category: 'Nature & Outdoors', area: 'Ubud',    lat: -8.4316,  lng: 115.2791, price: 280000, rating: 4.8, reviews: 192, duration: '2.5 hrs', image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&auto=format&fit=crop&q=80' },
]

const CATEGORIES = ['All', 'Art & Craft', 'Wellness', 'Culture', 'Culinary', 'Spiritual', 'Nature & Outdoors', 'Water Activities']

const CAT_COLORS: Record<string, string> = {
  'Art & Craft':     '#C8A97E',
  'Wellness':        '#4A7C59',
  'Culture':         '#8B6E9E',
  'Culinary':        '#B66A45',
  'Spiritual':       '#D4842A',
  'Nature & Outdoors': '#6B8F3E',
  'Water Activities': '#3B82C4',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(p: number) {
  return `IDR ${Math.round(p / 1000)}K`
}

function markerHtml(exp: typeof MAP_EXPERIENCES[0], selected: boolean) {
  const bg    = selected ? '#C8A97E' : '#111111'
  const color = selected ? '#111111' : '#ffffff'
  const scale = selected ? 'scale(1.15)' : 'scale(1)'
  const shadow = selected
    ? '0 4px 16px rgba(200,169,126,0.5)'
    : '0 2px 8px rgba(0,0,0,0.35)'
  return `<div style="
    background:${bg};color:${color};
    padding:5px 11px;border-radius:20px;
    font-size:12px;font-weight:700;
    white-space:nowrap;
    border:2.5px solid #ffffff;
    box-shadow:${shadow};
    transform:${scale};
    transition:all 0.2s;
    font-family:-apple-system,sans-serif;
    cursor:pointer;
  ">${fmtPrice(exp.price)}</div>`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BaliMapView() {
  const mapElRef      = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<any>(null)
  const markersRef    = useRef<Record<number, any>>({})
  const sidebarRef    = useRef<HTMLDivElement>(null)
  const cardRefs      = useRef<Record<number, HTMLDivElement | null>>({})

  const [selected, setSelected]   = useState<number | null>(null)
  const [category, setCategory]   = useState('All')
  const [search, setSearch]       = useState('')
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')
  const [showFilters, setShowFilters] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mapLocked, setMapLocked] = useState(true)
  const [hostExps, setHostExps]   = useState<typeof MAP_EXPERIENCES>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('balible_host_new_experiences') ?? '[]')
      setHostExps(stored)
    } catch {}
  }, [])

  const allExperiences = [...MAP_EXPERIENCES, ...hostExps]

  const visible = allExperiences.filter(e => {
    const matchCat = category === 'All' || e.category === category
    const q = search.toLowerCase()
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.area.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  // ── Initialize Leaflet ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return

    const L = require('leaflet')

    // Fix default icon paths broken by webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(mapElRef.current, {
      center: [-8.62, 115.22],
      zoom: 10,
      zoomControl: false,
    })

    // CartoDB Positron — clean minimal tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // ── Sync markers with visible list ─────────────────────────────────────────

  const updateMarkers = useCallback(() => {
    const L = require('leaflet')
    const map = mapRef.current
    if (!map) return

    // Remove all existing markers
    Object.values(markersRef.current).forEach((m: any) => m.remove())
    markersRef.current = {}

    visible.forEach(exp => {
      const icon = L.divIcon({
        className: '',
        html: markerHtml(exp, exp.id === selected),
        iconAnchor: [32, 16],
      })
      const marker = L.marker([exp.lat, exp.lng], { icon }).addTo(map)
      marker.on('click', () => {
        setSelected(id => id === exp.id ? null : exp.id)
      })
      markersRef.current[exp.id] = marker
    })
  }, [visible, selected])

  useEffect(() => { updateMarkers() }, [updateMarkers])

  // ── Fly to selected & scroll card into view ─────────────────────────────────

  useEffect(() => {
    if (!selected || !mapRef.current) return
    const exp = allExperiences.find(e => e.id === selected)
    if (!exp) return
    mapRef.current.flyTo([exp.lat, exp.lng], 13, { duration: 0.8, easeLinearity: 0.5 })

    // Scroll the sidebar card into view
    setTimeout(() => {
      const card = cardRefs.current[selected]
      if (card && sidebarRef.current) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 200)
  }, [selected])

  // ── Derived selected experience ─────────────────────────────────────────────

  const selectedExp = selected ? allExperiences.find(e => e.id === selected) : null

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Leaflet CSS */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-control-attribution { font-size: 10px !important; }
        .leaflet-control-zoom a { border-radius: 8px !important; font-size: 16px !important; }
      `}</style>

      <div style={{ display: 'flex', height: '100svh', fontFamily: 'var(--font-inter), -apple-system, sans-serif', overflow: 'hidden' }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside
          style={{
            width: 340, flexShrink: 0, flexDirection: 'column',
            backgroundColor: '#ffffff', borderRight: '1px solid #E8E4DE',
            height: '100svh', overflow: 'hidden',
          }}
          className={sidebarOpen ? 'hidden lg:flex' : 'hidden'}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px 0', borderBottom: '1px solid #E8E4DE' }}>
            <div className="flex items-center justify-between mb-3">
              <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111', textDecoration: 'none', letterSpacing: '0.02em' }}>
                BALIBLE
              </a>
              <div className="flex items-center gap-2">
                <a href="/search"
                  className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                  style={{ fontSize: 13, color: '#6F675C', textDecoration: 'none' }}>
                  <ArrowLeft size={14} /> All experiences
                </a>
                <button
                  onClick={() => setSidebarOpen(false)}
                  title="Hide sidebar"
                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E8E4DE', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  className="hover:bg-stone-50 transition-colors"
                >
                  <ChevronLeft size={14} style={{ color: '#6F675C' }} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
              <input
                placeholder="Search by name, area, or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', height: 38, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 34, paddingRight: search ? 34 : 14, fontSize: 13, color: '#111111', outline: 'none', backgroundColor: '#F9F9F7' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={13} style={{ color: '#6F675C' }} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-none">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: category === cat ? 600 : 400, flexShrink: 0, cursor: 'pointer',
                    backgroundColor: category === cat ? '#111111' : '#F5F1EB',
                    color: category === cat ? 'white' : '#6F675C',
                    border: 'none', transition: 'all 0.15s',
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div style={{ padding: '10px 20px 6px', fontSize: 12, color: '#6F675C' }}>
            {visible.length} experience{visible.length !== 1 ? 's' : ''} found
          </div>

          {/* Experience cards */}
          <div ref={sidebarRef} className="overflow-y-auto flex-1 scrollbar-none" style={{ padding: '0 12px 20px' }}>
            {visible.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6F675C', fontSize: 14 }}>
                No experiences match your filter.
              </div>
            )}
            {visible.map(exp => {
              const isSelected = selected === exp.id
              return (
                <div
                  key={exp.id}
                  ref={el => { cardRefs.current[exp.id] = el }}
                  onClick={() => setSelected(id => id === exp.id ? null : exp.id)}
                  style={{
                    borderRadius: 14, marginBottom: 10, cursor: 'pointer', overflow: 'hidden',
                    border: isSelected ? '2px solid #C8A97E' : '1px solid #E8E4DE',
                    backgroundColor: isSelected ? '#FFFDF9' : 'white',
                    boxShadow: isSelected ? '0 2px 12px rgba(200,169,126,0.2)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ position: 'relative', height: 140 }}>
                    <img src={exp.image} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* Category chip */}
                    <span style={{
                      position: 'absolute', top: 10, left: 10,
                      backgroundColor: CAT_COLORS[exp.category] ?? '#C8A97E',
                      color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                    }}>
                      {exp.category}
                    </span>
                    {/* Like button */}
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <WishlistHeart slug={exp.slug} size={13} compact />
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div className="flex items-start justify-between gap-1">
                      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 700, color: '#111111', lineHeight: 1.3 }}>{exp.title}</h3>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111111', flexShrink: 0, paddingTop: 1 }}>
                        {fmtPrice(exp.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#6F675C' }}>
                        <MapPin size={10} />{exp.area}
                      </span>
                      <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#6F675C' }}>
                        <Clock size={10} />{exp.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star size={11} fill="#C8A97E" color="#C8A97E" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>{exp.rating}</span>
                        <span style={{ fontSize: 12, color: '#6F675C' }}>({exp.reviews})</span>
                      </div>
                      <a
                        href={`/experiences/${exp.slug}`}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E', textDecoration: 'none' }}>
                        Book →
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* ── MAP CONTAINER ───────────────────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>

          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white" style={{ borderBottom: '1px solid #E8E4DE', flexShrink: 0 }}>
            <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', textDecoration: 'none' }}>
              BALIBLE
            </a>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid #E8E4DE', background: 'none', cursor: 'pointer', fontSize: 13, color: '#6F675C' }}>
                <SlidersHorizontal size={13} /> Filter
              </button>
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
                {(['map', 'list'] as const).map(v => (
                  <button key={v} onClick={() => { setMobileView(v); if (v === 'map') setMapLocked(true) }}
                    style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: mobileView === v ? '#111111' : 'white', color: mobileView === v ? 'white' : '#6F675C', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div className="lg:hidden px-4 py-3 bg-white" style={{ borderBottom: '1px solid #E8E4DE', flexShrink: 0 }}>
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6F675C' }} />
                <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', height: 36, borderRadius: 10, border: '1px solid #E8E4DE', paddingLeft: 30, fontSize: 13, color: '#111111', outline: 'none' }} />
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setShowFilters(false) }}
                    style={{ padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: category === cat ? 600 : 400, flexShrink: 0, cursor: 'pointer', backgroundColor: category === cat ? '#111111' : '#F5F1EB', color: category === cat ? 'white' : '#6F675C', border: 'none' }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div style={{ flex: 1, position: 'relative', display: mobileView === 'list' ? 'none' : 'flex', flexDirection: 'column' }}>
            <div
              ref={mapElRef}
              style={{ flex: 1 }}
              className="lg:block"
            />
            {/* Mobile tap-to-interact overlay */}
            {mapLocked && mobileView === 'map' && (
              <div
                className="lg:hidden"
                onClick={() => setMapLocked(false)}
                style={{
                  position: 'absolute', inset: 0, zIndex: 500,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                  backgroundColor: 'rgba(17,17,17,0.35)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  backgroundColor: 'white', borderRadius: 14, padding: '12px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}>
                  <span style={{ fontSize: 22 }}>👆</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>Tap to interact with map</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>Scroll page normally until tapped</span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: list view */}
          {mobileView === 'list' && (
            <div className="lg:hidden flex-1 overflow-y-auto" style={{ backgroundColor: '#F5F1EB', padding: 12 }}>
              <p style={{ fontSize: 12, color: '#6F675C', marginBottom: 8 }}>{visible.length} experiences found</p>
              <div className="space-y-3">
                {visible.map(exp => (
                  <div key={exp.id}
                    onClick={() => { setMobileView('map'); setTimeout(() => setSelected(exp.id), 100) }}
                    style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #E8E4DE', cursor: 'pointer' }}>
                    <div className="flex gap-3 p-3">
                      <img src={exp.image} alt={exp.title} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 700, color: '#111111', lineHeight: 1.3 }}>{exp.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span style={{ fontSize: 10, color: 'white', backgroundColor: CAT_COLORS[exp.category] ?? '#C8A97E', padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>{exp.category}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#6F675C' }}><MapPin size={10} />{exp.area}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>{fmtPrice(exp.price)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <div className="flex items-center gap-1">
                            <Star size={10} fill="#C8A97E" color="#C8A97E" />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#111111' }}>{exp.rating}</span>
                            <span style={{ fontSize: 11, color: '#6F675C' }}>({exp.reviews})</span>
                          </div>
                          <a
                            href={`/experiences/${exp.slug}`}
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E', textDecoration: 'none' }}>
                            Book →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Selected experience popup card (floats over map) ──────────── */}
          {selectedExp && mobileView === 'map' && (
            <div
              className="lg:hidden"
              style={{
                position: 'absolute', bottom: 80, left: 12, right: 12, zIndex: 1000,
                backgroundColor: 'white', borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid #E8E4DE',
              }}>
              <div style={{ position: 'relative', height: 130 }}>
                <img src={selectedExp.image} alt={selectedExp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setSelected(null)}
                  style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', backgroundColor: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={13} style={{ color: '#111111' }} />
                </button>
              </div>
              <div style={{ padding: '10px 14px 14px' }}>
                <div className="flex items-start justify-between">
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', flex: 1, lineHeight: 1.3 }}>{selectedExp.title}</h3>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111111', flexShrink: 0, paddingLeft: 8 }}>{fmtPrice(selectedExp.price)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><MapPin size={11} />{selectedExp.area}</span>
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><Star size={11} fill="#C8A97E" color="#C8A97E" />{selectedExp.rating} ({selectedExp.reviews})</span>
                </div>
                <a href={`/experiences/${selectedExp.slug}`}
                  style={{ display: 'block', marginTop: 10, textAlign: 'center', backgroundColor: '#111111', color: 'white', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  View Experience
                </a>
              </div>
            </div>
          )}

          {/* ── Desktop: floating card over map when selected ─────────────── */}
          {selectedExp && (
            <div
              className="hidden lg:block"
              style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                width: 360, zIndex: 1000,
                backgroundColor: 'white', borderRadius: 18, overflow: 'hidden',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)', border: '1px solid #E8E4DE',
              }}>
              <div style={{ position: 'relative', height: 160 }}>
                <img src={selectedExp.image} alt={selectedExp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{
                  position: 'absolute', top: 12, left: 12,
                  backgroundColor: CAT_COLORS[selectedExp.category] ?? '#C8A97E',
                  color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                }}>
                  {selectedExp.category}
                </span>
                <button onClick={() => setSelected(null)}
                  style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.2)' }}>
                  <X size={14} style={{ color: '#111111' }} />
                </button>
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <div className="flex items-start justify-between gap-2">
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', lineHeight: 1.3 }}>{selectedExp.title}</h3>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>{fmtPrice(selectedExp.price)}</p>
                    <p style={{ fontSize: 11, color: '#6F675C', marginTop: 1 }}>per person</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><MapPin size={12} />{selectedExp.area}</span>
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}><Clock size={12} />{selectedExp.duration}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <Star size={12} fill="#C8A97E" color="#C8A97E" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{selectedExp.rating}</span>
                  <span style={{ fontSize: 13, color: '#6F675C' }}>({selectedExp.reviews} reviews)</span>
                </div>
                <a href={`/experiences/${selectedExp.slug}`}
                  style={{ display: 'block', marginTop: 12, textAlign: 'center', backgroundColor: '#111111', color: 'white', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.15s' }}>
                  Book this experience →
                </a>
              </div>
            </div>
          )}

          {/* Result count badge on map */}
          <div
            className="hidden lg:block"
            style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              backgroundColor: 'white', borderRadius: 20, padding: '6px 16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)', border: '1px solid #E8E4DE',
              fontSize: 13, fontWeight: 500, color: '#111111', zIndex: 999, pointerEvents: 'none',
            }}>
            {visible.length} experience{visible.length !== 1 ? 's' : ''} in this area
          </div>

          {/* Desktop: expand sidebar button (shown when sidebar is collapsed) */}
          {!sidebarOpen && (
            <div className="hidden lg:block" style={{ position: 'absolute', top: 16, left: 16, zIndex: 999 }}>
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  backgroundColor: 'white', border: '1px solid #E8E4DE',
                  borderRadius: 10, padding: '8px 14px',
                  cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                  fontSize: 13, fontWeight: 600, color: '#111111',
                  fontFamily: 'var(--font-inter)',
                }}
                className="hover:bg-stone-50 transition-colors"
              >
                <ChevronRight size={14} style={{ color: '#6F675C' }} />
                Show list
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
