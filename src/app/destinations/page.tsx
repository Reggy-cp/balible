import { MapPin, Star, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'

const AREAS = [
  {
    slug: 'Ubud',
    name: 'Ubud',
    tagline: 'Cultural Heart of Bali',
    description: 'Nestled among rice terraces and jungle, Ubud is Bali\'s artistic and spiritual centre. Expect world-class galleries, traditional dance performances, healing rituals, and an abundance of wellness retreats tucked down lush laneways.',
    highlights: ['Tegalalang Rice Terraces', 'Monkey Forest', 'Ubud Palace', 'Campuhan Ridge Walk', 'Art Market'],
    experienceCount: 7,
    topCategory: 'Art & Craft',
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80',
    color: '#4A7C59',
    bg: '#F0F7F2',
  },
  {
    slug: 'Canggu',
    name: 'Canggu',
    tagline: 'Surf, Soul & Slow Mornings',
    description: 'Once a sleepy rice paddy village, Canggu has evolved into Bali\'s most vibrant creative district. Black-sand beaches, world-class surf breaks, sunrise yoga on rooftops, and specialty coffee at every turn.',
    highlights: ['Echo Beach', 'Batu Bolong Temple', 'Berawa Beach', 'Pererenan Rice Fields', 'Tanah Lot (nearby)'],
    experienceCount: 3,
    topCategory: 'Wellness',
    rating: 4.82,
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&auto=format&fit=crop&q=80',
    color: '#B66A45',
    bg: '#FDF8F4',
  },
  {
    slug: 'Uluwatu',
    name: 'Uluwatu',
    tagline: 'Clifftops, Kecak & Surf',
    description: 'Perched on dramatic limestone cliffs above the Indian Ocean, Uluwatu is one of Bali\'s most awe-inspiring locations. Famous for the sacred temple, the mesmerising Kecak fire dance at sunset, and serious surf breaks below.',
    highlights: ['Uluwatu Temple', 'Kecak Sunset Dance', 'Padang Padang Beach', 'Bingin Beach', 'Blue Point Bay'],
    experienceCount: 2,
    topCategory: 'Culture',
    rating: 4.92,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80',
    color: '#6F675C',
    bg: '#F5F1EB',
  },
  {
    slug: 'Seminyak',
    name: 'Seminyak',
    tagline: 'Sunset Dining & Bali Chic',
    description: 'Seminyak is Bali\'s most sophisticated beach destination — a refined strip of boutique hotels, acclaimed restaurants, rooftop bars, and beautiful shops. The sunsets here are legendary, best watched from a bean bag on the sand.',
    highlights: ['Seminyak Beach', 'Potato Head Beach Club', 'Petitenget Temple', 'Eat Street', 'Sunset cocktails'],
    experienceCount: 1,
    topCategory: 'Food & Drink',
    rating: 4.78,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop&q=80',
    color: '#C8A97E',
    bg: '#FFFDF9',
  },
  {
    slug: 'Jimbaran',
    name: 'Jimbaran',
    tagline: 'Fresh Catch & Firelit Tables',
    description: 'A traditional fishing village turned seafood paradise, Jimbaran Bay is famed for its candlelit beach warungs serving the day\'s catch grilled over coconut husks. Watch the sun melt into the ocean while fishermen bring in their boats.',
    highlights: ['Jimbaran Fish Market', 'Seafood Beach Warungs', 'Jimbaran Bay Sunset', 'Four Seasons Beach', 'Kedonganan Market'],
    experienceCount: 1,
    topCategory: 'Food & Drink',
    rating: 4.62,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop&q=80',
    color: '#4A7C59',
    bg: '#F0F7F2',
  },
  {
    slug: 'Sidemen',
    name: 'Sidemen & East Bali',
    tagline: 'The Bali Fewer People Find',
    description: 'Away from the tourist trail, East Bali is where the island breathes slowly. Sidemen valley, with Mount Agung as its backdrop, is a patchwork of emerald terraces, weaving villages, and morning mist. Amed\'s black-sand coast hides some of Bali\'s best snorkelling and dive sites.',
    highlights: ['Sidemen Valley', 'Mount Agung views', 'Ikat weaving villages', 'Amed Reef snorkelling', 'Tirta Gangga Water Palace'],
    experienceCount: 3,
    topCategory: 'Art & Craft',
    rating: 4.75,
    image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=400&auto=format&fit=crop&q=80',
    color: '#B66A45',
    bg: '#FDF8F4',
  },
]

export const metadata = {
  title: 'Destinations — Balible',
  description: 'Explore Bali\'s most iconic regions and find curated experiences in Ubud, Canggu, Uluwatu, Seminyak, Jimbaran and beyond.',
}

export default function DestinationsPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ height: 360 }}>
        <img
          src="https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1600&auto=format&fit=crop&q=80"
          alt="Bali"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 12 }}>
            Explore Bali
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
            Find Your Corner of the Island
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(14px, 2vw, 17px)', color: 'rgba(255,255,255,0.8)', maxWidth: 540, lineHeight: 1.7 }}>
            From jungle temples to clifftop sunsets — each part of Bali has its own character, rhythm, and magic.
          </p>
        </div>
      </div>

      {/* AREA GRID */}
      <div className="max-w-[1200px] mx-auto px-5 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, color: '#111111', marginBottom: 10 }}>
            6 Destinations, Endless Experiences
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: '#6F675C', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            We've handpicked experiences in each area so you can dive deep, wherever you land.
          </p>
        </div>

        <div className="space-y-6">
          {AREAS.map((area, i) => (
            <div
              key={area.slug}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #E8E4DE', display: 'grid', gridTemplateColumns: i % 2 === 0 ? '1fr 1.2fr' : '1.2fr 1fr' }}
            >
              {/* Image — left on even, right on odd */}
              {i % 2 === 0 && (
                <div className="relative" style={{ minHeight: 280 }}>
                  <img src={area.image} alt={area.name} className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0) 70%, rgba(0,0,0,0.05) 100%)' }} />
                </div>
              )}

              {/* Content */}
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={13} style={{ color: area.color }} />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: area.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {area.name}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: '#111111', lineHeight: 1.2, marginBottom: 12 }}>
                  {area.tagline}
                </h3>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.8, marginBottom: 16, maxWidth: 440 }}>
                  {area.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {area.highlights.map(h => (
                    <span key={h} className="px-3 py-1 rounded-full" style={{ backgroundColor: area.bg, color: area.color, fontSize: 12, fontWeight: 500 }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Stats + CTA */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>{area.experienceCount}</p>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>Experiences</p>
                    </div>
                    <div style={{ width: 1, height: 28, backgroundColor: '#E8E4DE' }} />
                    <div className="flex items-center gap-1">
                      <Star size={13} fill="#C8A97E" color="#C8A97E" />
                      <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111' }}>{area.rating}</span>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C', marginLeft: 2 }}>avg rating</span>
                    </div>
                    <div style={{ width: 1, height: 28, backgroundColor: '#E8E4DE' }} />
                    <div>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>Top category</p>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#111111' }}>{area.topCategory}</p>
                    </div>
                  </div>
                  <a
                    href={`/destinations/${area.slug}`}
                    className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ height: 40, paddingInline: 20, backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
                  >
                    Explore {area.name.split(' ')[0]} <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* Image — right on odd */}
              {i % 2 !== 0 && (
                <div className="relative" style={{ minHeight: 280 }}>
                  <img src={area.image} alt={area.name} className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, rgba(0,0,0,0) 70%, rgba(0,0,0,0.05) 100%)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div className="mx-5 lg:mx-16 mb-16 rounded-2xl overflow-hidden" style={{ maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="relative px-8 py-14 text-center" style={{ backgroundColor: '#111111' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C8A97E 0%, transparent 50%), radial-gradient(circle at 80% 50%, #4A7C59 0%, transparent 50%)' }} />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 10 }}>Not sure where to start?</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: 'white', marginBottom: 14 }}>
            Browse All Experiences
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
            Filter by category, area, price, and duration to find your perfect Bali moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/search" style={{ height: 48, display: 'inline-flex', alignItems: 'center', padding: '0 32px', backgroundColor: '#C8A97E', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }} className="hover:opacity-90 transition-opacity">
              Browse experiences
            </a>
            <a href="/map" style={{ height: 48, display: 'inline-flex', alignItems: 'center', padding: '0 32px', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }} className="hover:bg-white/10 transition-colors">
              View on map
            </a>
          </div>
        </div>
      </div>

      <MobileNav />

      {/* FOOTER */}
      <footer className="pt-12 px-6 pb-20 md:pb-8" style={{ backgroundColor: '#111111' }}>
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: 'white', textDecoration: 'none' }}>BALIBLE</a>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>© 2024 Balible. All rights reserved.</p>
          <div className="flex gap-6">
            {[{ label: 'Experiences', href: '/search' }, { label: 'Map', href: '/map' }, { label: 'About', href: '/about' }].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
