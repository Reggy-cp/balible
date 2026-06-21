'use client'

import { useState } from 'react'
import { Star, CheckCircle2, XCircle, MapPin, ExternalLink, Package, Shield } from 'lucide-react'

function hostSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

type Review = {
  id: string
  rating: number
  comment: string
  createdAt: string | Date
  user: { name: string; image?: string | null }
}

type RentalData = {
  slug: string
  title: string
  images: string[]
  description: string | null
  includes: string[]
  excludes: string[]
  meetingPoint: string | null
  depositAmt: number
  operator: {
    businessName: string | null
    description: string | null
    avatar?: string | null
    rating: number
    totalReviews: number
    user: { name: string; image?: string | null }
  }
  reviews: Review[]
  rating: number
  totalReviews: number
}

const TABS = ['About', "What's included", 'Reviews', 'Host']

export default function RentalTabs({ rental }: { rental: RentalData }) {
  const [active, setActive] = useState('About')

  const ownerName = rental.operator.user.name
  const ownerAvatar = rental.operator.avatar ?? rental.operator.user.image
  const slug = hostSlug(ownerName)

  return (
    <>
      {/* Tab bar */}
      <div className="relative mt-8" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const label = tab === 'Reviews' ? `Reviews (${rental.totalReviews})` : tab
            const isActive = active === tab
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className="flex-shrink-0 px-4 py-2 rounded-full transition-all"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 14,
                  backgroundColor: isActive ? '#111111' : 'transparent',
                  color: isActive ? 'white' : '#6F675C',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? 500 : 400,
                  marginBottom: -1,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-6">

        {/* ── ABOUT ── */}
        {active === 'About' && (
          <div>
            {rental.description && (
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.7, marginBottom: 24 }}>
                {rental.description}
              </p>
            )}

            {/* Pickup location */}
            {rental.meetingPoint && (
              <div className="mb-6">
                <h4 className="mb-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>Pickup location</h4>
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE' }}>
                  <MapPin size={16} style={{ color: '#C8A97E', flexShrink: 0, marginTop: 2 }} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', fontWeight: 500, lineHeight: 1.5 }}>{rental.meetingPoint}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(rental.meetingPoint + ', Bali, Indonesia')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 hover:opacity-70 transition-opacity"
                      style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#C8A97E', textDecoration: 'none' }}
                    >
                      <ExternalLink size={12} />
                      Get directions on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Deposit */}
            {rental.depositAmt > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#FFFBF0', border: '1px solid #F5DFA0' }}>
                <Shield size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111', marginBottom: 4 }}>Refundable deposit</p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.6 }}>
                    IDR {rental.depositAmt.toLocaleString('id-ID')} collected at pickup and refunded in full when you return the item.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WHAT'S INCLUDED ── */}
        {active === "What's included" && (
          <div className="grid sm:grid-cols-2 gap-8">
            {rental.includes.length > 0 && (
              <div>
                <h4 className="mb-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>Included</h4>
                <ul className="space-y-2">
                  {rental.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={15} style={{ color: '#4A7C59', marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rental.excludes.length > 0 && (
              <div>
                <h4 className="mb-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>Not included</h4>
                <ul className="space-y-2">
                  {rental.excludes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle size={15} style={{ color: '#B66A45', marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rental.meetingPoint && (
              <div>
                <h4 className="mb-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>Pickup location</h4>
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE' }}>
                  <MapPin size={16} style={{ color: '#C8A97E', flexShrink: 0, marginTop: 2 }} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', fontWeight: 500, lineHeight: 1.5 }}>{rental.meetingPoint}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(rental.meetingPoint + ', Bali, Indonesia')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 hover:opacity-70 transition-opacity"
                      style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#C8A97E', textDecoration: 'none' }}
                    >
                      <ExternalLink size={12} />
                      Get directions on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {active === 'Reviews' && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid #E8E4DE' }}>
              <div className="flex items-center gap-4">
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 52, fontWeight: 700, color: '#111111', lineHeight: 1 }}>
                  {rental.rating.toFixed(1)}
                </span>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={16} fill={i <= Math.round(rental.rating) ? '#C8A97E' : 'none'} color="#C8A97E" />
                    ))}
                  </div>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>
                    {rental.totalReviews} reviews
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {rental.reviews.map(rev => (
                <div key={rev.id} className="pb-6" style={{ borderBottom: '1px solid #E8E4DE' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={rev.user.image ?? '/avatar-default.png'}
                      alt={rev.user.name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>{rev.user.name}</p>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>
                        {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} fill={i <= rev.rating ? '#C8A97E' : 'none'} color="#C8A97E" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.6 }}>{rev.comment}</p>
                </div>
              ))}

              {rental.reviews.length === 0 && (
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#9E9A94', textAlign: 'center', padding: '32px 0' }}>
                  No reviews yet — be the first to share your experience.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── HOST ── */}
        {active === 'Host' && (
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              {ownerAvatar ? (
                <img src={ownerAvatar} alt={ownerName} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#111111', fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 700, color: 'white' }}>
                  {ownerName[0]}
                </div>
              )}
            </div>
            <div>
              <a href={`/hosts/${slug}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111' }} className="hover:opacity-70 transition-opacity">
                  {ownerName}
                </h3>
              </a>
              {rental.operator.businessName && (
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginTop: 4 }}>
                  {rental.operator.businessName}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Star size={13} fill="#C8A97E" color="#C8A97E" />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{rental.operator.rating}</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>· {rental.operator.totalReviews} reviews</span>
              </div>
              {rental.operator.description && (
                <p className="mt-4" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.7, maxWidth: 480 }}>
                  {rental.operator.description}
                </p>
              )}
              <a href={`/hosts/${slug}`} className="mt-4 inline-flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111', textDecoration: 'none', borderBottom: '1px solid #111111', paddingBottom: 1 }}>
                See all listings by {ownerName.split(' ')[0]} →
              </a>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
