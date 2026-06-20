'use client'

import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function HostCard({
  ownerSlug, ownerName, ownerAvatar, businessName, description,
}: {
  ownerSlug: string
  ownerName: string
  ownerAvatar: string | null
  businessName: string | null
  description: string | null
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={`/hosts/${ownerSlug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 18px', borderRadius: 14,
        border: `1.5px solid ${hovered ? '#C8A97E' : '#EAE6E0'}`,
        cursor: 'pointer', background: 'white', textDecoration: 'none',
        transition: 'border-color 0.15s',
      }}
    >
      {ownerAvatar ? (
        <img src={ownerAvatar} alt={ownerName} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white' }}>
          {ownerName[0]}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#111111' }}>{ownerName}</p>
        {businessName && <p style={{ fontSize: 13, color: '#9E9A94', marginTop: 2 }}>{businessName}</p>}
        {description && <p style={{ fontSize: 13, color: '#6F675C', lineHeight: 1.6, marginTop: 6 }}>{description}</p>}
      </div>
      <ChevronRight size={16} style={{ color: '#C8A97E', flexShrink: 0 }} />
    </a>
  )
}
