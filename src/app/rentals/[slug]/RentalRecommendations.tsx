'use client'

import { useState, useEffect } from 'react'
import { Star, Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toggleWishlistAction } from '@/lib/actions'

const WISHLIST_KEY = 'balible_wishlist'
function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]') } catch { return [] }
}

type RentalSummary = {
  slug: string
  title: string
  area: string
  price: number
  duration: string | null
  rating: number
  totalReviews: number
  images: string[]
}

function RentalCard({ r }: { r: RentalSummary }) {
  const { status } = useSession()
  const [wishlisted, setWishlisted] = useState(false)
  useEffect(() => {
    setWishlisted(getWishlist().includes(r.slug))
  }, [r.slug])
  const fallback = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80'
  return (
    <a
      href={`/rentals/${r.slug}`}
      className="flex-shrink-0 rounded-xl overflow-hidden hover:shadow-md transition-shadow block"
      style={{ width: 220, border: '1px solid #E8E4DE', textDecoration: 'none', backgroundColor: 'white' }}
    >
      <div className="relative" style={{ height: 160 }}>
        <img src={r.images[0] || fallback} alt={r.title} className="w-full h-full object-cover" />
        <button
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow"
          onClick={async e => {
            e.preventDefault()
            const next = !wishlisted
            setWishlisted(next)
            const list = getWishlist()
            const updated = next ? [...list, r.slug] : list.filter(s => s !== r.slug)
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
            window.dispatchEvent(new CustomEvent('balible:wishlist', { detail: { slug: r.slug, saved: next } }))
            if (status === 'authenticated') await toggleWishlistAction(r.slug)
          }}
        >
          <Heart size={12} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#111111'} />
        </button>
      </div>
      <div className="p-3">
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{r.area}</p>
        <h4 className="mt-0.5 line-clamp-2 leading-snug" style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 600, color: '#111111' }}>
          {r.title}
        </h4>
        {r.totalReviews > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={11} fill="#C8A97E" color="#C8A97E" />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#111111' }}>{r.rating.toFixed(1)}</span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>({r.totalReviews})</span>
          </div>
        )}
        <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#111111' }}>
          From <span style={{ color: '#C8A97E' }}>IDR</span> {r.price.toLocaleString('id-ID')}
          {r.duration && <span style={{ color: '#9E9A94' }}> {r.duration}</span>}
        </p>
      </div>
    </a>
  )
}

export default function RentalRecommendations({ rentals }: { rentals: RentalSummary[] }) {
  if (rentals.length === 0) return null

  return (
    <section className="py-12 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111' }}>
              You might also love
            </h2>
            <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
              More rentals available in Bali
            </p>
          </div>
          <a href="/categories/rentals" className="flex-shrink-0 hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', textDecoration: 'underline' }}>
            View all →
          </a>
        </div>
        <div className="flex gap-5 overflow-x-auto scrollbar-none pb-2">
          {rentals.map(r => <RentalCard key={r.slug} r={r} />)}
        </div>
      </div>
    </section>
  )
}
