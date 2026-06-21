'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toggleWishlistAction } from '@/lib/actions'

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
  const { status } = useSession()
  const isSignedIn = status === 'authenticated'
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getList().includes(slug))
  }, [slug, status])

  useEffect(() => {
    const resync = () => setSaved(getList().includes(slug))
    window.addEventListener('balible:wishlist-sync', resync)
    return () => window.removeEventListener('balible:wishlist-sync', resync)
  }, [slug])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic update
    const next = !saved
    setSaved(next)

    // Always update localStorage (works for both signed-in and anonymous)
    const list = getList()
    const updated = next ? [...list, slug] : list.filter(s => s !== slug)
    localStorage.setItem(KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('balible:wishlist', { detail: { slug, saved: next } }))

    // Persist to DB when signed in
    if (isSignedIn) {
      await toggleWishlistAction(slug)
    }
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
