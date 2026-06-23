'use client'

import { useState, useEffect } from 'react'
import { Star, Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toggleWishlistAction } from '@/lib/actions'

const WISHLIST_KEY = 'balible_wishlist'
function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]') } catch { return [] }
}

type ExpSummary = {
  slug: string
  title: string
  category: string
  area: string
  price: number
  rating: number
  totalReviews: number
  images: string[]
}

function RecommendationCard({ exp }: { exp: ExpSummary }) {
  const [liked, setLiked] = useState(false)
  const { status } = useSession()

  useEffect(() => {
    setLiked(getWishlist().includes(exp.slug))
  }, [exp.slug])

  const handleHeart = (e: React.MouseEvent) => {
    e.preventDefault()
    const next = !liked
    setLiked(next)
    const list = getWishlist()
    const updated = next ? [...list, exp.slug] : list.filter(s => s !== exp.slug)
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('balible:wishlist', { detail: { slug: exp.slug, saved: next } }))
    if (status === 'authenticated') toggleWishlistAction(exp.slug).catch(() => {})
  }

  return (
    <a
      href={exp.category === 'RENTALS' ? `/rentals/${exp.slug}` : `/experiences/${exp.slug}`}
      className="flex-shrink-0 rounded-xl overflow-hidden border hover:shadow-md transition-shadow block"
      style={{ width: 220, borderColor: '#E8E4DE', textDecoration: 'none' }}
    >
      <div className="relative" style={{ height: 160 }}>
        <img
          src={exp.images[0] || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80'}
          alt={exp.title}
          className="w-full h-full object-cover"
        />
        <button
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow"
          onClick={handleHeart}
        >
          <Heart size={12} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#111111'} />
        </button>
      </div>
      <div className="p-3">
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{exp.area}</p>
        <h4 className="mt-0.5 line-clamp-2 leading-snug" style={{ fontFamily: 'var(--font-playfair)', fontSize: 14, fontWeight: 600, color: '#111111' }}>
          {exp.title}
        </h4>
        <div className="flex items-center gap-1 mt-1.5">
          {exp.totalReviews > 0 ? (
            <>
              <Star size={11} fill="#C8A97E" color="#C8A97E" />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#111111' }}>{exp.rating.toFixed(1)}</span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>({exp.totalReviews})</span>
            </>
          ) : (
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#9E9A94' }}>New</span>
          )}
        </div>
        <p className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#111111' }}>
          From <span style={{ color: '#C8A97E' }}>IDR</span> {exp.price.toLocaleString('id-ID')}
        </p>
      </div>
    </a>
  )
}

export default function RecommendationsSection({ items }: { items: ExpSummary[] }) {
  if (items.length === 0) return null

  return (
    <section className="py-12 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: '#111111' }}>
            You might also love
          </h2>
          <a href="/search" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', textDecoration: 'underline' }} className="flex-shrink-0 hover:opacity-70 transition-opacity">
            View all →
          </a>
        </div>
        <div className="flex gap-5 overflow-x-auto scrollbar-none pb-2">
          {items.map(exp => <RecommendationCard key={exp.slug} exp={exp} />)}
        </div>
      </div>
    </section>
  )
}
