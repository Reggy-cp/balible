'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

const KEY = 'balible_wishlist'

function getList(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

export default function WishlistHeart({
  slug,
  size = 14,
  compact = false,
}: {
  slug: string
  size?: number
  compact?: boolean
}) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getList().includes(slug))
  }, [slug])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const list = getList()
    const next = list.includes(slug) ? list.filter(s => s !== slug) : [...list, slug]
    localStorage.setItem(KEY, JSON.stringify(next))
    setSaved(next.includes(slug))
  }

  return (
    <button
      onClick={toggle}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform`}
      style={{ border: 'none', cursor: 'pointer', flexShrink: 0 }}
    >
      <Heart size={size} fill={saved ? '#ef4444' : 'none'} color={saved ? '#ef4444' : '#6F675C'} />
    </button>
  )
}
