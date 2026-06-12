'use client'

import { useState } from 'react'

export default function ExperienceGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0)

  // Deduplicate and cap at 5
  const photos = Array.from(new Set(images)).slice(0, 5)
  if (photos.length === 0) return null

  return (
    <div className="lg:hidden mb-6">
      {/* Main image */}
      <div className="overflow-hidden mb-2.5" style={{ height: 260, borderRadius: 12 }}>
        <img
          key={active}
          src={photos[active]}
          alt={title}
          className="w-full h-full object-cover"
          style={{ animation: 'galleryFade 0.2s ease-in' }}
        />
      </div>

      {/* Thumbnail strip — only shown when there are multiple images */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {photos.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: 72,
                height: 56,
                borderRadius: 8,
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                overflow: 'hidden',
                border: active === i ? '2.5px solid #B58A4B' : '2.5px solid transparent',
                opacity: active === i ? 1 : 0.65,
                transition: 'border-color 0.15s, opacity 0.15s',
              }}
            >
              <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes galleryFade {
          from { opacity: 0.6; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
