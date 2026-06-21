'use client'

import { useState } from 'react'
import { Star, CheckCircle2, XCircle, MapPin, ExternalLink } from 'lucide-react'
import Image from 'next/image'

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

type ExperienceData = {
  slug: string
  title: string
  images: string[]
  description: string
  highlights: string[]
  includes: string[]
  excludes: string[]
  itinerary?: { time: string; activity: string }[]
  duration: string
  level: string
  language: string
  maxGuests: number
  meetingPoint: string
  operator: {
    businessName: string
    description: string
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

export default function ExperienceTabs({ exp }: { exp: ExperienceData }) {
  const [active, setActive] = useState('About')
  const [includes] = useState<string[]>(exp.includes)
  const [excludes] = useState<string[]>(exp.excludes)

  return (
    <>
      {/* Tab bar */}
      <div className="relative mt-8" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const label = tab === 'Reviews' ? `Reviews (${exp.totalReviews})` : tab
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
          <div className="flex gap-8">
            <div className="flex-1">
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.7 }}>
                {exp.description}
              </p>
              {exp.highlights.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>
                    Highlights
                  </h4>
                  <ul className="space-y-2">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={15} style={{ color: '#4A7C59', marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.5 }}>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exp.meetingPoint && (
                <div className="mt-6">
                  <h4 className="mb-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>Meeting point</h4>
                  <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE' }}>
                    <MapPin size={15} style={{ color: '#C8A97E', flexShrink: 0, marginTop: 2 }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', fontWeight: 500, lineHeight: 1.5 }}>{exp.meetingPoint}</p>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(exp.meetingPoint + ', Bali, Indonesia')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 hover:opacity-70 transition-opacity"
                        style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#C8A97E', textDecoration: 'none' }}
                      >
                        <ExternalLink size={11} />
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Host card */}
            <div className="flex-shrink-0 hidden lg:block" style={{ width: 200 }}>
              <div className="p-4 rounded-xl" style={{ border: '1px solid #E8E4DE' }}>
                <div className="flex items-center justify-between mb-2">
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>Your host</p>
                  <span className="flex items-center gap-1" style={{ backgroundColor: '#F0F7F2', border: '1px solid #C6DFD0', borderRadius: 20, padding: '2px 8px' }}>
                    <CheckCircle2 size={10} style={{ color: '#4A7C59' }} />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 10, fontWeight: 600, color: '#4A7C59', letterSpacing: '0.03em' }}>Verified</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <img
                    src={(exp.operator.avatar || exp.operator.user.image) ?? '/avatar-default.png'}
                    alt={exp.operator.user.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: '#111111' }}>{exp.operator.user.name}</p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>{exp.operator.businessName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Star size={11} fill="#C8A97E" color="#C8A97E" />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 700, color: '#111111' }}>{exp.operator.rating}</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>({exp.operator.totalReviews})</span>
                </div>
                <a href={`/hosts/${hostSlug(exp.operator.user.name)}`} className="mt-3 inline-block underline hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>
                  View profile →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── WHAT'S INCLUDED ── */}
        {active === "What's included" && (
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h4 className="mb-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>Included</h4>
              <ul className="space-y-2">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={15} style={{ color: '#4A7C59', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>Not included</h4>
              <ul className="space-y-2">
                {excludes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle size={15} style={{ color: '#B66A45', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>Meeting point</h4>
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE' }}>
                <MapPin size={16} style={{ color: '#C8A97E', flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', fontWeight: 500, lineHeight: 1.5 }}>{exp.meetingPoint}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(exp.meetingPoint + ', Bali, Indonesia')}`}
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
          </div>
        )}

        {/* ── REVIEWS ── */}
        {active === 'Reviews' && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid #E8E4DE' }}>
              <div className="flex items-center gap-4">
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 52, fontWeight: 700, color: '#111111', lineHeight: 1 }}>
                  {exp.rating.toFixed(1)}
                </span>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={16} fill={i <= Math.round(exp.rating) ? '#C8A97E' : 'none'} color="#C8A97E" />
                    ))}
                  </div>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>
                    {exp.totalReviews} reviews
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">

              {exp.reviews.map(rev => (
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
            </div>
          </div>
        )}

        {/* ── HOST ── */}
        {active === 'Host' && (
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={(exp.operator.avatar || exp.operator.user.image) ?? '/avatar-default.png'}
                alt={exp.operator.user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
            <div>
              <a href={`/hosts/${hostSlug(exp.operator.user.name)}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111' }} className="hover:opacity-70 transition-opacity">
                  {exp.operator.user.name}
                </h3>
              </a>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginTop: 4 }}>
                {exp.operator.businessName}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Star size={13} fill="#C8A97E" color="#C8A97E" />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{exp.operator.rating}</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>· {exp.operator.totalReviews} reviews</span>
              </div>
              <p className="mt-4" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.7, maxWidth: 480 }}>
                {exp.operator.description}
              </p>
              <a href={`/hosts/${hostSlug(exp.operator.user.name)}`} className="mt-4 inline-flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111', textDecoration: 'none', borderBottom: '1px solid #111111', paddingBottom: 1 }}>
                See all experiences by {exp.operator.user.name.split(' ')[0]} →
              </a>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
