import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Map — Browse Experiences in Bali | Balible',
  description: 'Explore curated experiences across Bali on an interactive map. Filter by category and find activities near you.',
}

// Leaflet touches window — must be client-only
const BaliMapView = dynamic(
  () => import('@/components/BaliMapView'),
  { ssr: false, loading: () => <MapLoading /> }
)

function MapLoading() {
  return (
    <div
      style={{
        height: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        backgroundColor: '#F5F1EB',
        fontFamily: 'var(--font-inter), sans-serif',
      }}
    >
      <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111' }}>
        BALIBLE
      </div>
      <div style={{ fontSize: 14, color: '#6F675C' }}>Loading map…</div>
      {/* Pulse animation */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#C8A97E',
              animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default function MapPage() {
  return <BaliMapView />
}
