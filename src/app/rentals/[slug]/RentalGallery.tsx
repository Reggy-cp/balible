'use client'

import { useState } from 'react'

export default function RentalGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0)
  const photos = Array.from(new Set(images.filter(Boolean))).slice(0, 5)
  if (photos.length === 0) return null

  return (
    <div className="mb-6">
      {/* Main image */}
      <div
        style={{
          height: 260,
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 10,
          backgroundColor: '#E8E4DE',
          position: 'relative',
        }}
      >
        <img
          key={active}
          src={photos[active]}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            animation: 'rentalGalleryFade 0.2s ease-in',
          }}
        />
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
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
                border: active === i ? '2.5px solid #C8A97E' : '2.5px solid transparent',
                opacity: active === i ? 1 : 0.65,
                transition: 'border-color 0.15s, opacity 0.15s',
                backgroundColor: '#E8E4DE',
              }}
            >
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes rentalGalleryFade {
          from { opacity: 0.6; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
