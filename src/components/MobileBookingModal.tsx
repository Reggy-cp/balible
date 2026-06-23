'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import BookingWidget from './BookingWidget'

export default function MobileBookingModal({
  price, slug, duration, maxGuests, rating, totalReviews, blockedDates = [], title, image, area,
}: {
  price: number; slug: string; duration: string; maxGuests: number
  rating?: number; totalReviews?: number; blockedDates?: string[]
  title?: string; image?: string; area?: string
}) {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const isHost = session?.user?.role === 'OPERATOR'

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  if (isHost) return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 lg:hidden bg-white px-4 py-4"
      style={{ borderTop: '1px solid #E8E4DE', boxShadow: '0 -4px 16px rgba(0,0,0,0.08)', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <div style={{ padding: '12px 16px', borderRadius: 10, textAlign: 'center', backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE' }}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 2 }}>
          Booking not available for hosts
        </p>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>
          Please use a guest account to book.
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Sticky bottom bar */}
      <div
        className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 lg:hidden bg-white px-4 pt-3"
        style={{ borderTop: '1px solid #E8E4DE', boxShadow: '0 -4px 16px rgba(0,0,0,0.08)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>From</span>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 18, fontWeight: 700, color: '#111111', margin: 0 }}>
              <span style={{ color: '#C8A97E', fontSize: 13 }}>IDR</span> {price.toLocaleString('id-ID')}
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            style={{
              height: 44, padding: '0 24px', backgroundColor: '#111111', color: 'white',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600,
            }}
          >
            Book this experience
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className="fixed left-0 right-0 z-50 lg:hidden overflow-y-auto"
        style={{
          bottom: 0,
          maxHeight: '92vh',
          backgroundColor: 'white',
          borderRadius: '20px 20px 0 0',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#C8C4BE' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #E8E4DE' }}>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', margin: 0 }}>
            Book this experience
          </p>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}
          >
            <X size={20} style={{ color: '#6F675C' }} />
          </button>
        </div>

        {/* Widget */}
        <div className="px-5 pt-4" style={{ paddingBottom: 'max(48px, env(safe-area-inset-bottom))' }}>
          <BookingWidget price={price} slug={slug} duration={duration} maxGuests={maxGuests} rating={rating} totalReviews={totalReviews} blockedDates={blockedDates} title={title} image={image} area={area} embedded />
        </div>
      </div>
    </>
  )
}
