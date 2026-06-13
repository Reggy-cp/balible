'use client'

import { useState } from 'react'
import { Star, MapPin, ChevronRight } from 'lucide-react'

type RentalItem = {
  slug: string
  title: string
  area: string
  price: number
  priceLabel: string
  category: string
  rating: number
  reviews: number
  photo: string
  badge?: string
  description: string
}

const RENTALS: RentalItem[] = [
  {
    slug: 'scooter-rental-canggu',
    title: 'Scooter Rental — Daily',
    area: 'Canggu',
    price: 80000,
    priceLabel: 'per day',
    category: 'Scooters & Bikes',
    rating: 4.7,
    reviews: 342,
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=85',
    badge: 'Most Popular',
    description: 'Automatic scooter, weekly serviced. Helmets, lock, and free roadside assistance included.',
  },
  {
    slug: 'motorbike-rental-ubud',
    title: 'Motorbike Rental — Semi-auto',
    area: 'Ubud',
    price: 100000,
    priceLabel: 'per day',
    category: 'Scooters & Bikes',
    rating: 4.6,
    reviews: 218,
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=85',
    description: 'Semi-auto Honda or Yamaha. Perfect for the highland back roads and rice terrace tracks around Ubud.',
  },
  {
    slug: 'ebike-rental-canggu',
    title: 'E-Bike Rental — Full Day',
    area: 'Canggu',
    price: 150000,
    priceLabel: 'per day',
    category: 'E-Bikes',
    rating: 4.8,
    reviews: 93,
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=85',
    badge: 'Eco Friendly',
    description: 'High-quality e-bike, 60km range. Explore rice terraces and coastal paths without breaking a sweat.',
  },
  {
    slug: 'surfboard-rental-kuta',
    title: 'Surfboard Rental',
    area: 'Kuta',
    price: 75000,
    priceLabel: 'per session',
    category: 'Surf Gear',
    rating: 4.5,
    reviews: 156,
    photo: 'https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=600&auto=format&fit=crop&q=85',
    description: 'Longboards, shortboards, and softboards. Leash and wax included. Right on Kuta Beach.',
  },
  {
    slug: 'villa-rental-seminyak',
    title: 'Private Pool Villa — 3BR',
    area: 'Seminyak',
    price: 2200000,
    priceLabel: 'per night',
    category: 'Villas',
    rating: 4.9,
    reviews: 87,
    photo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=85',
    badge: 'Top Rated',
    description: 'Three-bedroom private pool villa, daily housekeeping, 5 min walk from Seminyak Beach.',
  },
  {
    slug: 'coworking-space-canggu',
    title: 'Coworking Day Pass',
    area: 'Canggu',
    price: 120000,
    priceLabel: 'per day',
    category: 'Workspaces',
    rating: 4.7,
    reviews: 74,
    photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=85',
    description: '100 Mbps fiber, ergonomic desks, unlimited coffee, meeting room access. The best nomad hub in Canggu.',
  },
]

const CATEGORIES = ['All', 'Scooters & Bikes', 'E-Bikes', 'Surf Gear', 'Villas', 'Workspaces']

const AREAS = ['All Areas', 'Canggu', 'Ubud', 'Seminyak', 'Kuta']

function fmt(n: number) {
  return 'IDR ' + n.toLocaleString('id-ID')
}

function RentalCard({ item }: { item: RentalItem }) {
  return (
    <a
      href={`/experiences/${item.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      className="group"
    >
      <div
        className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-lg"
        style={{ border: '1px solid #E8E4DE' }}
      >
        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <img
            src={item.photo}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {item.badge && (
            <span
              className="absolute top-3 left-3"
              style={{
                backgroundColor: '#C8A97E', color: 'white',
                fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-inter)',
                padding: '3px 8px', borderRadius: 20, letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {item.badge}
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', lineHeight: 1.3 }}>
              {item.title}
            </p>
          </div>

          <div className="flex items-center gap-1 mb-2">
            <MapPin size={11} style={{ color: '#6F675C', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{item.area}</span>
          </div>

          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', lineHeight: 1.5, marginBottom: 12 }}>
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111' }}>
                {fmt(item.price)}
              </span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C', marginLeft: 4 }}>
                {item.priceLabel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={11} fill="#C8A97E" style={{ color: '#C8A97E' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#111111' }}>
                {item.rating}
              </span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>
                ({item.reviews})
              </span>
            </div>
          </div>

          <button
            className="w-full mt-3 flex items-center justify-center gap-1 transition-opacity hover:opacity-80"
            style={{
              height: 38, backgroundColor: '#111111', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-inter)', cursor: 'pointer',
            }}
          >
            View & Book <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </a>
  )
}

export default function RentalsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeArea, setActiveArea] = useState('All Areas')

  const filtered = RENTALS.filter(r => {
    const catMatch = activeCategory === 'All' || r.category === activeCategory
    const areaMatch = activeArea === 'All Areas' || r.area === activeArea
    return catMatch && areaMatch
  })

  return (
    <main style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ backgroundColor: '#111111', paddingTop: 64, paddingBottom: 56 }}>
        <div className="max-w-[1200px] mx-auto px-5 lg:px-8">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C8A97E', marginBottom: 12 }}>
            BALIBLE RENTALS
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: 16, maxWidth: 560 }}>
            Everything you need<br />to move through Bali
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 480, lineHeight: 1.7 }}>
            Verified rental operators. Transparent daily rates. From scooters and surfboards to private villas and coworking desks — all bookable in minutes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="max-w-[1200px] mx-auto px-5 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto py-3" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 20,
                  fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400,
                  backgroundColor: activeCategory === cat ? '#111111' : 'transparent',
                  color: activeCategory === cat ? 'white' : '#6F675C',
                  border: activeCategory === cat ? '1px solid #111111' : '1px solid #E8E4DE',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
            <div style={{ width: 1, height: 20, backgroundColor: '#E8E4DE', flexShrink: 0 }} />
            <select
              value={activeArea}
              onChange={e => setActiveArea(e.target.value)}
              style={{
                flexShrink: 0, height: 34, padding: '0 10px', borderRadius: 8,
                fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111',
                border: '1px solid #E8E4DE', backgroundColor: 'white', cursor: 'pointer',
              }}
            >
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1200px] mx-auto px-5 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C' }}>
              No rentals match your filters.
            </p>
            <button
              onClick={() => { setActiveCategory('All'); setActiveArea('All Areas') }}
              style={{ marginTop: 12, fontSize: 13, color: '#C8A97E', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => <RentalCard key={item.slug} item={item} />)}
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid #E8E4DE' }}>
        <div className="max-w-[1200px] mx-auto px-5 lg:px-8 py-14">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', textAlign: 'center', marginBottom: 40 }}>
            How renting works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-[760px] mx-auto">
            {[
              { step: '01', title: 'Pick & book', body: 'Choose your rental, select a date, and pay securely online. Instant confirmation.' },
              { step: '02', title: 'Collect or receive', body: 'Meet the operator at their location, or opt for villa delivery where available.' },
              { step: '03', title: 'Explore freely', body: 'Enjoy Bali on your own terms. Return when you\'re done — no hidden fees.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#F5F1EB' }}>
                  <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 13, fontWeight: 700, color: '#C8A97E' }}>{step}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 6 }}>{title}</p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </main>
  )
}
