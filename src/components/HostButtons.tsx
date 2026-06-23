'use client'

import { useState, useEffect } from 'react'
import { Star, X, Bookmark } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toggleSavedHostAction } from '@/lib/actions'

const HOST_KEY = 'balible_saved_hosts'

function getSavedHosts(): string[] {
  try { return JSON.parse(localStorage.getItem(HOST_KEY) ?? '[]') } catch { return [] }
}

export function HostChatButton({ firstName, operatorId }: { firstName: string; operatorId: string }) {
  const { status } = useSession()
  const href = status === 'authenticated'
    ? `/profile?tab=messages&operator=${operatorId}`
    : `/auth/signin?callbackUrl=${encodeURIComponent(`/profile?tab=messages&operator=${operatorId}`)}`

  return (
    <a
      href={href}
      className="flex items-center gap-2 hover:opacity-90 transition-opacity"
      style={{ height: 44, paddingInline: 22, borderRadius: 22, backgroundColor: 'white', color: '#111111', fontSize: 14, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
    >
      Chat with {firstName}
    </a>
  )
}

export function SaveHostButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false)
  const { status } = useSession()
  const isSignedIn = status === 'authenticated'

  useEffect(() => {
    setSaved(getSavedHosts().includes(slug))
  }, [slug])

  const toggle = async () => {
    const next = !saved
    setSaved(next)
    const list = getSavedHosts()
    const updated = next ? [...list, slug] : list.filter(s => s !== slug)
    localStorage.setItem(HOST_KEY, JSON.stringify(updated))
    if (isSignedIn) toggleSavedHostAction(slug).catch(() => {})
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 hover:opacity-90 transition-opacity"
      style={{ height: 44, paddingInline: 20, borderRadius: 22, border: '1.5px solid rgba(255,255,255,0.4)', backgroundColor: 'transparent', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
    >
      <Bookmark size={14} fill={saved ? 'white' : 'none'} />
      {saved ? 'Saved' : 'Save host'}
    </button>
  )
}

export function AskKalaButton({ firstName }: { firstName: string }) {
  const openChat = () => window.dispatchEvent(new CustomEvent('balible:open-chat'))
  return (
    <button
      onClick={openChat}
      className="w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      style={{ height: 40, borderRadius: 10, border: '1.5px solid #E8E4DE', fontSize: 13, fontWeight: 600, color: '#111111', backgroundColor: 'white', cursor: 'pointer' }}
    >
      ✦ Ask Kala about {firstName}
    </button>
  )
}

type Review = {
  id: string; rating: number; comment: string; createdAt: string
  user: { name: string; image: string | null }
}

export function AllReviewsModal({
  reviews,
  hostName,
  rating,
  totalReviews,
}: {
  reviews: Review[]
  hostName: string
  rating: number
  totalReviews: number
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ fontSize: 13, fontWeight: 600, color: '#C8A97E', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        View all reviews →
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #F0EDE8', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>
                  Reviews for {hostName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star size={14} fill="#C8A97E" color="#C8A97E" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111111' }}>{rating.toFixed(1)}</span>
                  <span style={{ fontSize: 13, color: '#6F675C' }}>· {totalReviews} reviews</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #E8E4DE', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} style={{ color: '#6F675C' }} />
              </button>
            </div>

            {/* Reviews list */}
            <div className="overflow-y-auto p-6 space-y-5" style={{ flex: 1 }}>
              {reviews.length === 0 ? (
                <p style={{ fontSize: 14, color: '#9E9A94', textAlign: 'center', padding: '40px 0' }}>No reviews yet.</p>
              ) : reviews.map(r => (
                <div key={r.id} className="pb-5" style={{ borderBottom: '1px solid #F5F1EB' }}>
                  <div className="flex items-start gap-3 mb-3">
                    {r.user.image
                      ? <img src={r.user.image} alt={r.user.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: '#F5F1EB', fontSize: 15, fontWeight: 700, color: '#6F675C' }}>{r.user.name.charAt(0)}</div>
                    }
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111111' }}>{r.user.name.split(' ')[0]} {r.user.name.split(' ')[1]?.charAt(0)}.</p>
                      <p style={{ fontSize: 12, color: '#9E9A94' }}>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={12} fill="#C8A97E" color="#C8A97E" />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: '#4A4540', lineHeight: 1.7 }}>&ldquo;{r.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
