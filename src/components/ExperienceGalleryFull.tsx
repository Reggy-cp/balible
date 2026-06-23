'use client'

import { useState, useEffect } from 'react'
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react'

const FALLBACK = 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=80'

export default function ExperienceGalleryFull({ images, imageAlts, title }: { images: string[]; imageAlts?: string[]; title: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [mobileActive, setMobileActive] = useState(0)

  const allPhotos = images.filter(Boolean).length > 0 ? images.filter(Boolean) : [FALLBACK]
  const thumbPhotos = [...allPhotos.slice(0, 5)]
  while (thumbPhotos.length < 5) thumbPhotos.push(thumbPhotos[0])

  const openAt = (index: number) => {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  const prev = () => setActiveIndex(i => (i - 1 + allPhotos.length) % allPhotos.length)
  const next = () => setActiveIndex(i => (i + 1) % allPhotos.length)

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen])

  return (
    <>
      {/* ── DESKTOP: 1 large + 2×2 grid ── */}
      <div className="hidden lg:flex gap-2 mb-8" style={{ height: 380 }}>
        <div
          className="relative overflow-hidden flex-1 cursor-pointer group"
          style={{ borderRadius: 12 }}
          onClick={() => openAt(0)}
        >
          <img
            src={thumbPhotos[0]}
            alt={imageAlts?.[0] || title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2" style={{ width: '38%' }}>
          {thumbPhotos.slice(1, 5).map((src, i) => (
            <div
              key={i}
              className="relative overflow-hidden cursor-pointer group"
              style={{ borderRadius: 8 }}
              onClick={() => openAt(i + 1)}
            >
              <img
                src={src}
                alt={imageAlts?.[i + 1] || title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
              />
              {i === 3 && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 transition-colors" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                  <Camera size={14} color="white" />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'white', fontWeight: 500 }}>
                    View all photos
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── MOBILE: main image + thumbnail strip ── */}
      <div className="lg:hidden mb-6">
        <div
          className="overflow-hidden mb-2.5 cursor-pointer"
          style={{ height: 260, borderRadius: 12 }}
          onClick={() => openAt(mobileActive)}
        >
          <img
            key={mobileActive}
            src={allPhotos[mobileActive]}
            alt={imageAlts?.[mobileActive] || title}
            className="w-full h-full object-cover"
            style={{ animation: 'galleryFade 0.2s ease-in' }}
          />
        </div>

        {allPhotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {allPhotos.slice(0, 5).map((src, i) => (
              <button
                key={i}
                onClick={() => setMobileActive(i)}
                style={{
                  flexShrink: 0, width: 72, height: 56,
                  borderRadius: 8, padding: 0, cursor: 'pointer',
                  outline: 'none', overflow: 'hidden',
                  border: mobileActive === i ? '2.5px solid #C8A97E' : '2.5px solid transparent',
                  opacity: mobileActive === i ? 1 : 0.65,
                  transition: 'border-color 0.15s, opacity 0.15s',
                }}
              >
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
          onClick={e => { if (e.target === e.currentTarget) setLightboxOpen(false) }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
              {activeIndex + 1} / {allPhotos.length}
            </span>
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, color: 'white', fontWeight: 600 }}>
              {title}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              aria-label="Close"
            >
              <X size={20} color="white" />
            </button>
          </div>

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center relative px-14 min-h-0">
            <img
              key={activeIndex}
              src={allPhotos[activeIndex]}
              alt={imageAlts?.[activeIndex] || title}
              className="max-w-full max-h-full object-contain select-none"
              style={{ borderRadius: 8, animation: 'galleryFade 0.15s ease-in' }}
              draggable={false}
            />

            {allPhotos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={22} color="white" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  aria-label="Next photo"
                >
                  <ChevronRight size={22} color="white" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {allPhotos.length > 1 && (
            <div className="flex justify-center gap-2 py-4 px-4 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
              {allPhotos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    flexShrink: 0, width: 60, height: 46,
                    borderRadius: 6, padding: 0, overflow: 'hidden',
                    border: i === activeIndex ? '2px solid #C8A97E' : '2px solid transparent',
                    opacity: i === activeIndex ? 1 : 0.45,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s, border-color 0.15s',
                  }}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes galleryFade {
          from { opacity: 0.6; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  )
}
