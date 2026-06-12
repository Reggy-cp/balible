import type { Metadata } from 'next'
import { MapPin, Star, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Meet Our Hosts | Balible',
  description: 'Discover the passionate local artisans, guides, and teachers behind every Balible experience.',
}

const HOSTS = [
  { slug: 'made-sari',       name: 'Made Sari',       businessName: 'Made Sari Pottery Studio',   area: 'Ubud',     category: 'Art & Craft',   rating: 4.9, reviews: 128, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80', tagline: 'Third-generation Balinese potter sharing the ancient art of wheel-throwing.' },
  { slug: 'ketut-suardana',  name: 'Ketut Suardana',  businessName: 'Ketut Silver Artistry',       area: 'Canggu',   category: 'Art & Craft',   rating: 4.8, reviews: 94,  avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80', tagline: 'Master silversmith blending traditional Balinese craft with contemporary design.' },
  { slug: 'ni-wayan-artini', name: 'Ni Wayan Artini', businessName: 'Ubud Batik Studio',           area: 'Ubud',     category: 'Art & Craft',   rating: 4.7, reviews: 148, avatar: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&auto=format&fit=crop&q=80', tagline: 'Sharing the UNESCO-recognised art of batik with visitors from around the world.' },
  { slug: 'nina-putri',      name: 'Nina Putri',      businessName: 'Sukha Healing Space',         area: 'Ubud',     category: 'Wellness',      rating: 4.9, reviews: 390, avatar: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80', tagline: 'Sound healing, breathwork and somatic therapies from the heart of Ubud.' },
  { slug: 'komang-dewi',     name: 'Komang Dewi',     businessName: 'Jiwa Yoga Canggu',            area: 'Canggu',   category: 'Wellness',      rating: 4.9, reviews: 203, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80', tagline: 'Rooftop sunrise yoga and breathwork for the wandering soul in Canggu.' },
  { slug: 'wayan-gede',      name: 'Wayan Gede',      businessName: 'Sacred Bali Ceremonies',      area: 'Ubud',     category: 'Culture',       rating: 4.8, reviews: 78,  avatar: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&auto=format&fit=crop&q=80', tagline: 'Third-generation temple guide opening the sacred world of Balinese ceremony.' },
  { slug: 'i-nyoman-arta',   name: 'I Nyoman Arta',   businessName: 'Bali Culture Tours',          area: 'Uluwatu', category: 'Culture',       rating: 4.9, reviews: 312, avatar: null, tagline: 'Specialist in Balinese cultural experiences with 18 years guiding guests.' },
  { slug: 'putu-sari',       name: 'Putu Sari',       businessName: 'Warung Dapur Bali',           area: 'Seminyak', category: 'Culinary',          rating: 4.8, reviews: 156, avatar: null, tagline: 'Family-run cooking school teaching traditional Balinese cuisine for a decade.' },
  { slug: 'komang-surya',    name: 'Komang Surya',    businessName: 'Kuta Surf Academy',           area: 'Kuta',     category: 'Water Activities',  rating: 4.7, reviews: 428, avatar: null, tagline: 'Bali\'s most-reviewed surf school with certified ISA instructors.' },
  { slug: 'gede-arnawa',     name: 'Gede Arnawa',     businessName: 'Tegalalang Walking Tours',    area: 'Ubud',     category: 'Nature & Outdoors', rating: 4.8, reviews: 192, avatar: null, tagline: 'Local farmer-guide sharing the living landscape of Tegalalang rice terraces.' },
  { slug: 'ni-made-suari',   name: 'Ni Made Suari',   businessName: 'Sidemen Weave & Dye',        area: 'Sidemen',  category: 'Art & Craft',   rating: 4.7, reviews: 31,  avatar: null, tagline: 'Preserving ancient natural dyeing and traditional weaving in East Bali.' },
  { slug: 'i-nyoman-karsa',  name: 'I Nyoman Karsa',  businessName: 'Karsa Wood Studio',           area: 'Ubud',     category: 'Art & Craft',   rating: 4.6, reviews: 47,  avatar: null, tagline: 'Third-generation wood carving family from Mas Village, Ubud.' },
  { slug: 'ni-komang-ayu',   name: 'Ni Komang Ayu',   businessName: 'Sidemen Village Crafts',      area: 'Sidemen',  category: 'Art & Craft',   rating: 4.8, reviews: 29,  avatar: null, tagline: 'Women\'s weaving collective preserving traditional rattan craft in East Bali.' },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Art & Craft':       '#B58A4B',
  'Wellness':          '#7EB5A6',
  'Culture':           '#A97EB5',
  'Culinary':          '#B5A07E',
  'Spiritual':         '#B58A4B',
  'Nature & Outdoors': '#7EA67E',
  'Water Activities':  '#7E9EB5',
}

export default function HostsPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F3EEE5', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ backgroundColor: '#1D1D1D', paddingTop: 64, paddingBottom: 64 }}>
        <div className="max-w-[1100px] mx-auto px-6 lg:px-16 text-center">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#B58A4B', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            The people behind Balible
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
            Meet Our Hosts
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: '#9E9A94', maxWidth: 540, margin: '0 auto' }}>
            Passionate local artisans, guides, and teachers who share Bali&apos;s living culture one guest at a time.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16 py-12 pb-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOSTS.map(host => {
            const initials = host.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)
            const catColor = CATEGORY_COLORS[host.category] ?? '#B58A4B'
            return (
              <a
                key={host.slug}
                href={`/hosts/${host.slug}`}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow block"
                style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
              >
                {/* Photo or initials */}
                <div className="relative overflow-hidden" style={{ height: 180 }}>
                  {host.avatar ? (
                    <img
                      src={host.avatar} alt={host.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#2A2A2A' }}>
                      <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 48, fontWeight: 700, color: '#B58A4B' }}>{initials}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span style={{ backgroundColor: catColor, color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
                      {host.category}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '16px 18px 18px' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#1D1D1D', marginBottom: 2 }}>
                    {host.name}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginBottom: 10 }}>
                    {host.businessName}
                  </p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A4540', lineHeight: 1.6, marginBottom: 12 }}>
                    {host.tagline}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
                        <MapPin size={11} style={{ color: '#B58A4B' }} />{host.area}
                      </span>
                      <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
                        <Star size={11} fill="#B58A4B" color="#B58A4B" />
                        <strong style={{ color: '#1D1D1D', fontSize: 12 }}>{host.rating}</strong>
                        <span>({host.reviews})</span>
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#B58A4B' }}>View profile →</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* Become a host CTA */}
        <div className="mt-16 text-center rounded-2xl py-14 px-8" style={{ backgroundColor: '#1D1D1D' }}>
          <Award size={32} style={{ color: '#B58A4B', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 10 }}>
            Share your craft with the world
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#9E9A94', maxWidth: 440, margin: '0 auto 24px' }}>
            Join Balible as a host and earn income doing what you love while giving travellers an authentic Balinese experience.
          </p>
          <a
            href="/for-hosts"
            style={{ display: 'inline-block', backgroundColor: '#B58A4B', color: 'white', fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}
          >
            Become A Host
          </a>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
