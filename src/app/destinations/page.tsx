import { Star, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'

const AREAS = [
  { slug: 'ubud',      name: 'Ubud',              tagline: 'Cultural Heart of Bali',        description: 'Nestled among rice terraces and jungle, Ubud is Bali\'s artistic and spiritual centre. Expect world-class galleries, traditional dance performances, healing rituals, and wellness retreats tucked down lush laneways.', highlights: ['Tegalalang Rice Terraces', 'Monkey Forest', 'Ubud Palace', 'Campuhan Ridge Walk', 'Art Market'], topCategory: 'Art & Craft', rating: 4.85, image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=80', color: '#2E4A35', bg: '#F0F7F2' },
  { slug: 'canggu',    name: 'Canggu',             tagline: 'Surf, Soul & Slow Mornings',    description: 'Once a sleepy rice paddy village, Canggu has evolved into Bali\'s most vibrant creative district. Black-sand beaches, world-class surf breaks, sunrise yoga on rooftops, and specialty coffee at every turn.', highlights: ['Echo Beach', 'Batu Bolong Temple', 'Berawa Beach', 'Pererenan Rice Fields', 'Sunrise Yoga'], topCategory: 'Wellness', rating: 4.82, image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&auto=format&fit=crop&q=80', color: '#B66A45', bg: '#FDF8F4' },
  { slug: 'uluwatu',   name: 'Uluwatu',            tagline: 'Clifftops, Kecak & Surf',       description: 'Perched on dramatic limestone cliffs above the Indian Ocean, Uluwatu is one of Bali\'s most awe-inspiring locations. Famous for the sacred temple, the mesmerising Kecak fire dance at sunset, and serious surf breaks below.', highlights: ['Uluwatu Temple', 'Kecak Sunset Dance', 'Padang Padang Beach', 'Bingin Beach', 'Blue Point Bay'], topCategory: 'Culture', rating: 4.92, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80', color: '#6F675C', bg: '#F3EEE5' },
  { slug: 'seminyak',  name: 'Seminyak',           tagline: 'Sunset Dining & Bali Chic',     description: 'Seminyak is Bali\'s most sophisticated beach destination — a refined strip of boutique hotels, acclaimed restaurants, rooftop bars, and beautiful shops. The sunsets here are legendary, best watched from a bean bag on the sand.', highlights: ['Seminyak Beach', 'Petitenget Temple', 'Eat Street', 'Boutique Shopping', 'Sunset Cocktails'], topCategory: 'Culinary', rating: 4.78, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80', color: '#B58A4B', bg: '#FFFDF9' },
  { slug: 'jimbaran',  name: 'Jimbaran',           tagline: 'Fresh Catch & Firelit Tables',  description: 'A traditional fishing village turned seafood paradise, Jimbaran Bay is famed for its candlelit beach warungs serving the day\'s catch grilled over coconut husks. Watch the sun melt into the ocean while fishermen bring in their boats.', highlights: ['Jimbaran Fish Market', 'Seafood Beach Warungs', 'Jimbaran Bay Sunset', 'Four Seasons Beach', 'Kedonganan Market'], topCategory: 'Culinary', rating: 4.62, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80', color: '#2E4A35', bg: '#F0F7F2' },
  { slug: 'sidemen',   name: 'Sidemen & East Bali', tagline: 'The Bali Fewer People Find',   description: 'Away from the tourist trail, East Bali is where the island breathes slowly. Sidemen valley, with Mount Agung as its backdrop, is a patchwork of emerald terraces, weaving villages, and morning mist.', highlights: ['Sidemen Valley', 'Mount Agung Views', 'Ikat Weaving Villages', 'Amed Reef Snorkelling', 'Tirta Gangga'], topCategory: 'Art & Craft', rating: 4.75, image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&auto=format&fit=crop&q=80', color: '#B66A45', bg: '#FDF8F4' },
  { slug: 'kuta',      name: 'Kuta',               tagline: 'Where Bali Meets the Ocean',    description: 'Kuta is where most visitors first land in Bali — and its long surf beach, energetic streets, and legendary sunsets make it impossible to overlook. The original surf town still has magic beneath the noise.', highlights: ['Kuta Beach', 'Beginner Surf Breaks', 'Sunset Strip', 'Kuta Art Market', 'Poppies Lane'], topCategory: 'Water Activities', rating: 4.65, image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&auto=format&fit=crop&q=80', color: '#1A6B8A', bg: '#EFF8FC' },
  { slug: 'gianyar',   name: 'Gianyar',            tagline: 'Sacred Water & Living Temples', description: 'Gianyar regency is the spiritual and artistic heartland of Bali — home to sacred water temples, master weavers, wood carvers, and the famous purification ritual at Pura Tirta Empul.', highlights: ['Pura Tirta Empul', 'Batuan Painting Village', 'Celuk Silver Workshops', 'Goa Gajah', 'Blahbatuh Temple'], topCategory: 'Culture', rating: 4.80, image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=80', color: '#2E4A35', bg: '#F0F7F2' },
  { slug: 'sanur',     name: 'Sanur',              tagline: 'Calm Shores & Sunrise Walks',   description: 'Sanur is Bali\'s original resort town — calm, tree-lined, and facing east for spectacular sunrises over the water. Its protected reef keeps the sea flat for swimming, and its 5km beach walk is the finest in South Bali.', highlights: ['Sanur Beach Promenade', 'Sunrise on the Beach', 'Museum Le Mayeur', 'Nusa Penida Boats', 'Kite Festival'], topCategory: 'Wellness', rating: 4.72, image: 'https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=800&auto=format&fit=crop&q=80', color: '#1A6B8A', bg: '#EFF8FC' },
  { slug: 'nusa-dua',  name: 'Nusa Dua',           tagline: 'Luxury Coast & Calm Waters',    description: 'Nusa Dua is Bali\'s purpose-built luxury enclave — a gated peninsula of world-class resorts, white-sand beaches, and calm turquoise water protected by an offshore reef. Quiet, polished, and utterly relaxing.', highlights: ['Nusa Dua Beach', 'Water Blow Blowhole', 'Snorkelling the Reef', 'Tanjung Benoa', 'BNDCC Cultural Square'], topCategory: 'Water Activities', rating: 4.68, image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&auto=format&fit=crop&q=80', color: '#1A6B8A', bg: '#EFF8FC' },
  { slug: 'amed',      name: 'Amed',               tagline: 'Black Sand, Coral & Deep Quiet', description: 'Amed is a string of fishing villages on Bali\'s far east coast — volcanic black sand, excellent snorkelling directly off the beach, WWII shipwrecks for divers, and the kind of silence that only exists far from the tourist trail.', highlights: ['Jemeluk Bay Reef', 'Japanese Shipwreck', 'Mount Agung Views', 'Traditional Fishing Boats', 'Sunrise on Black Sand'], topCategory: 'Water Activities', rating: 4.83, image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&auto=format&fit=crop&q=80', color: '#B66A45', bg: '#FDF8F4' },
  { slug: 'medewi',    name: 'Medewi',             tagline: "West Bali's Long Left Wave",     description: 'Medewi is one of Bali\'s best-kept secrets — a quiet black-sand beach on the west coast known for its exceptionally long, slow left-hand surf break and the vast rice paddies that stretch back from the shore.', highlights: ['Medewi Point Break', 'Pura Rambut Siwi', 'West Bali Rice Paddies', 'Black Sand Beach', 'Tanah Lot Nearby'], topCategory: 'Water Activities', rating: 4.70, image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop&q=80', color: '#2E4A35', bg: '#F0F7F2' },
  { slug: 'kintamani', name: 'Kintamani',          tagline: 'Volcanoes, Caldera & Cool Air', description: 'Kintamani sits on the rim of an ancient volcanic caldera, with Lake Batur shimmering far below and the dark cone of Gunung Batur rising above the water. At 1,500 metres, the air is cool, the views are extraordinary.', highlights: ['Gunung Batur Sunrise Trek', 'Lake Batur', 'Caldera Rim Viewpoint', 'Trunyan Village', 'Coffee Plantations'], topCategory: 'Nature & Outdoors', rating: 4.88, image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&auto=format&fit=crop&q=80', color: '#6F675C', bg: '#F3EEE5' },
]

export const metadata = {
  title: 'Destinations — Balible',
  description: 'Explore Bali\'s most iconic regions and find curated experiences in Ubud, Canggu, Uluwatu, Seminyak, Jimbaran and beyond.',
}

export default function DestinationsPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F3EEE5', minHeight: '100vh' }}>

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
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, color: '#1D1D1D', marginBottom: 10 }}>
            13 Destinations, Endless Experiences
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: '#6F675C', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            We've handpicked experiences in each area so you can dive deep, wherever you land.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {AREAS.map(area => (
            <a
              key={area.slug}
              href={`/destinations/${area.slug}`}
              className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 block"
              style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
            >
              {/* Image */}
              <div className="relative" style={{ height: 200, overflow: 'hidden' }}>
                <img src={area.image} alt={area.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)' }} />
                <div className="absolute bottom-0 left-0 p-4">
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                    {area.tagline}
                  </p>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                    {area.name}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.7, marginBottom: 14 }}>
                  {area.description.length > 120 ? area.description.slice(0, 120) + '…' : area.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {area.highlights.slice(0, 3).map(h => (
                    <span key={h} className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: area.bg, color: area.color, fontSize: 11, fontWeight: 500 }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F3EEE5' }}>
                  <div className="flex items-center gap-1">
                    <Star size={11} fill="#B58A4B" color="#B58A4B" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1D1D1D' }}>{area.rating}</span>
                    <span style={{ fontSize: 11, color: '#6F675C', marginLeft: 2 }}>{area.topCategory}</span>
                  </div>
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: area.color, fontWeight: 600 }}>
                    Explore <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div className="mx-5 lg:mx-16 mb-16 rounded-2xl overflow-hidden" style={{ maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="relative px-8 py-14 text-center" style={{ backgroundColor: '#1D1D1D' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #B58A4B 0%, transparent 50%), radial-gradient(circle at 80% 50%, #2E4A35 0%, transparent 50%)' }} />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#B58A4B', textTransform: 'uppercase', marginBottom: 10 }}>Not sure where to start?</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: 'white', marginBottom: 14 }}>
            Browse All Experiences
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
            Filter by category, area, price, and duration to find your perfect Bali moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/search" style={{ height: 48, display: 'inline-flex', alignItems: 'center', padding: '0 32px', backgroundColor: '#B58A4B', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }} className="hover:opacity-90 transition-opacity">
              Browse experiences
            </a>
            <a href="/map" style={{ height: 48, display: 'inline-flex', alignItems: 'center', padding: '0 32px', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }} className="hover:bg-white/10 transition-colors">
              View on map
            </a>
          </div>
        </div>
      </div>

      <MobileNav />

      <Footer />
    </div>
  )
}
