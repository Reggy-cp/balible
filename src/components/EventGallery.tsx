'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function EventGallery({ images, title }: { images: string[]; title: string }) {
  const photos = Array.from(new Set(images)).filter(Boolean).slice(0, 6)
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (photos.length === 0) return null

  const prev = () => setLightbox(i => (i! - 1 + photos.length) % photos.length)
  const next = () => setLightbox(i => (i! + 1) % photos.length)

  const [main, ...rest] = photos
  const thumbs = rest.slice(0, 4)
  const remaining = photos.length - 1 - thumbs.length // extras beyond what's shown

  return (
    <>
      {/* ── Desktop gallery grid ── */}
      <div className="hidden lg:grid gap-2 mb-8" style={{ gridTemplateColumns: '1fr 1fr', height: 420, borderRadius: 16, overflow: 'hidden' }}>
        {/* Main image */}
        <div className="relative cursor-pointer overflow-hidden" style={{ borderRadius: '16px 0 0 16px' }} onClick={() => setLightbox(0)}>
          <img src={main} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Right grid — up to 4 thumbs in 2x2 */}
        {thumbs.length > 0 && (
          <div className="grid gap-2" style={{
            gridTemplateColumns: thumbs.length === 1 ? '1fr' : '1fr 1fr',
            gridTemplateRows: thumbs.length <= 2 ? '1fr' : '1fr 1fr',
            borderRadius: '0 16px 16px 0',
            overflow: 'hidden',
          }}>
            {thumbs.map((src, i) => {
              const isLast = i === thumbs.length - 1 && remaining > 0
              return (
                <div key={i} className="relative cursor-pointer overflow-hidden" onClick={() => setLightbox(i + 1)}>
                  <img src={src} alt={`${title} photo ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  {isLast && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>+{remaining + 1} more</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Mobile: hero + thumbnail strip ── */}
      <div className="lg:hidden mb-6">
        <div className="relative overflow-hidden mb-2" style={{ height: 260, borderRadius: 12, cursor: 'pointer' }} onClick={() => setLightbox(0)}>
          <img src={main} alt={title} className="w-full h-full object-cover" />
          {photos.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>1 / {photos.length}</span>
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {photos.map((src, i) => (
              <button key={i} onClick={() => setLightbox(i)} style={{
                flexShrink: 0, width: 72, height: 56, borderRadius: 8, padding: 0,
                cursor: 'pointer', overflow: 'hidden', outline: 'none',
                border: '2.5px solid transparent', opacity: 0.7, transition: 'opacity 0.15s',
              }}>
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 flex items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', zIndex: 10 }}>
            <X size={20} style={{ color: 'white' }} />
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 flex items-center justify-center"
              style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', zIndex: 10 }}>
              <ChevronLeft size={22} style={{ color: 'white' }} />
            </button>
          )}

          {/* Image */}
          <img
            src={photos[lightbox]}
            alt={`${title} ${lightbox + 1}`}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, userSelect: 'none' }}
          />

          {/* Next */}
          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 flex items-center justify-center"
              style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', zIndex: 10 }}>
              <ChevronRight size={22} style={{ color: 'white' }} />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-6" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
