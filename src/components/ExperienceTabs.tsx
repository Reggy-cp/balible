'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle2, XCircle, X, MapPin, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { createReviewAction } from '@/lib/actions'

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

type UserReview = {
  bookingId: string; experience: string; slug: string
  reviewDate: string; rating: number; comment: string; image: string
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

const TABS = ['About', 'Itinerary', "What's included", 'Reviews', 'Host']
const RATING_LABELS = ['', 'Disappointing', 'Below average', 'Good', 'Very good', 'Exceptional']


function ReviewForm({ onSubmit, onCancel }: {
  onSubmit: (rating: number, comment: string) => void
  onCancel: () => void
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const active = hover || rating
  const canSubmit = rating > 0 && comment.trim().length > 0

  return (
    <div className="p-5 rounded-xl mb-6" style={{ border: '1px solid #C8A97E', backgroundColor: '#FFFDF9' }}>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>Write a review</p>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <X size={16} style={{ color: '#6F675C' }} />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex gap-1.5 mb-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className="hover:scale-110 transition-transform"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <Star size={26} fill={active >= i ? '#C8A97E' : 'none'} color={active >= i ? '#C8A97E' : '#E8E4DE'} />
            </button>
          ))}
        </div>
        {active > 0 && (
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#C8A97E', fontWeight: 500 }}>
            {RATING_LABELS[active]}
          </p>
        )}
      </div>

      <textarea
        value={comment}
        onChange={e => { if (e.target.value.length <= 500) setComment(e.target.value) }}
        placeholder="Share what you loved about this experience..."
        rows={3}
        style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E4DE', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-inter)', color: '#111111', resize: 'none', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
        onFocus={e => (e.target.style.borderColor = '#C8A97E')}
        onBlur={e => (e.target.style.borderColor = '#E8E4DE')}
      />
      <div className="flex items-center justify-between mt-2">
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#C8C4BE' }}>{comment.length}/500</p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            style={{ height: 36, padding: '0 16px', border: '1px solid #E8E4DE', borderRadius: 8, fontSize: 13, color: '#6F675C', background: 'white', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
            Cancel
          </button>
          <button onClick={() => canSubmit && onSubmit(rating, comment)} disabled={!canSubmit}
            style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-inter)', backgroundColor: canSubmit ? '#111111' : '#E8E4DE', color: canSubmit ? 'white' : '#9E9A94', cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ExperienceTabs({ exp }: { exp: ExperienceData }) {
  const [active, setActive] = useState('About')
  const [userReview, setUserReview] = useState<UserReview | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [includes] = useState<string[]>(exp.includes)
  const [excludes] = useState<string[]>(exp.excludes)

  const submitReview = async (rating: number, comment: string) => {
    setSubmitError('')
    const res = await createReviewAction({ slug: exp.slug, rating, comment })
    if (!res.ok) { setSubmitError('Could not submit review. Please try again.'); return }
    setUserReview({
      bookingId: `exp-${exp.slug}`,
      experience: exp.title,
      slug: exp.slug,
      reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating,
      comment,
      image: exp.images[0] ?? '',
    })
    setShowForm(false)
  }

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
              {!userReview && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{ height: 38, padding: '0 18px', borderRadius: 8, border: '1px solid #111111', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111', flexShrink: 0 }}
                  className="hover:bg-stone-50 transition-colors"
                >
                  ★ Write a review
                </button>
              )}
            </div>

            {showForm && (
              <>
                <ReviewForm onSubmit={submitReview} onCancel={() => { setShowForm(false); setSubmitError('') }} />
                {submitError && <p style={{ fontSize: 13, color: '#B66A45', marginTop: -8, marginBottom: 8 }}>{submitError}</p>}
              </>
            )}

            <div className="space-y-6">
              {/* User's own review — always shown at top */}
              {userReview && (
                <div className="pb-6" style={{ borderBottom: '1px solid #E8E4DE' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold" style={{ backgroundColor: '#C8A97E', color: 'white' }}>
                      Y
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>You</p>
                        <span style={{ fontSize: 11, color: '#4A7C59', backgroundColor: '#F0F7F2', padding: '1px 8px', borderRadius: 20, fontWeight: 500 }}>Your review</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{userReview.reviewDate}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} fill={i <= userReview.rating ? '#C8A97E' : 'none'} color="#C8A97E" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.6 }}>{userReview.comment}</p>
                </div>
              )}

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

        {active === 'Itinerary' && (
          <div>
            {exp.itinerary && exp.itinerary.length > 0 ? (
              <div className="space-y-0">
                {exp.itinerary.map((step, i) => (
                  <div key={i} className="flex gap-5" style={{ paddingBottom: i < exp.itinerary!.length - 1 ? 28 : 0 }}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F1EB', border: '2px solid #E8E4DE', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#6F675C' }}>{i + 1}</span>
                      </div>
                      {i < exp.itinerary!.length - 1 && <div style={{ flex: 1, width: 1, backgroundColor: '#E8E4DE', marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {step.time && (
                          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C', backgroundColor: '#F5F1EB', padding: '2px 8px', borderRadius: 20 }}>{step.time}</span>
                        )}
                      </div>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111', lineHeight: 1.75 }}>{step.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback: generated itinerary derived from duration */
              (() => {
                const totalMins = (() => {
                  const d = exp.duration.toLowerCase()
                  if (d.includes('hour')) return Math.round(parseFloat(d) * 60)
                  if (d.includes('min')) return parseInt(d)
                  return 120
                })()
                const steps = [
                  { label: 'Welcome & Introduction', mins: Math.max(10, Math.round(totalMins * 0.1)), desc: `Meet your host ${exp.operator.user.name} at ${exp.meetingPoint}. Get a brief introduction to the experience, the tools, and the cultural context behind what you're about to make or do.` },
                  { label: 'Demonstration', mins: Math.max(15, Math.round(totalMins * 0.2)), desc: 'Watch your host demonstrate the core techniques with calm expertise. Ask as many questions as you like — this is where the real learning begins.' },
                  { label: 'Hands-On Practice', mins: Math.max(30, Math.round(totalMins * 0.45)), desc: 'Now it\'s your turn. Your host guides you through the process step by step, offering individual feedback and encouragement. This is the heart of the experience.' },
                  { label: 'Refinement & Finishing', mins: Math.max(10, Math.round(totalMins * 0.15)), desc: 'Add the finishing touches to your creation or practice. Your host shows you the final details that separate good from beautiful.' },
                  { label: 'Reflection & Farewell', mins: Math.max(5, Math.round(totalMins * 0.1)), desc: 'Enjoy a brief moment of reflection with your host, hear the stories behind the craft, and take your creation (or experience) home with you.' },
                ]
                let elapsed = 0
                const fmt = (m: number) => m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ''}`.trim()
                return (
                  <div className="space-y-0">
                    {steps.map(({ label, mins, desc }, i) => {
                      const start = elapsed
                      elapsed += mins
                      return (
                        <div key={label} className="flex gap-5" style={{ paddingBottom: i < steps.length - 1 ? 28 : 0 }}>
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: i === 2 ? '#111111' : '#F5F1EB', border: '2px solid #E8E4DE', flexShrink: 0 }}>
                              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: i === 2 ? '#C8A97E' : '#6F675C' }}>{i + 1}</span>
                            </div>
                            {i < steps.length - 1 && <div style={{ flex: 1, width: 1, backgroundColor: '#E8E4DE', marginTop: 4 }} />}
                          </div>
                          <div style={{ paddingTop: 4 }}>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <h4 style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 700, color: '#111111' }}>{label}</h4>
                              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C', backgroundColor: '#F5F1EB', padding: '2px 8px', borderRadius: 20 }}>{fmt(start)} – {fmt(start + mins)}</span>
                              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#C8A97E' }}>~{fmt(mins)}</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.75 }}>{desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()
            )}
            <p className="mt-6" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', fontStyle: 'italic' }}>
              * Times are approximate and may vary based on group pace and host discretion.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
