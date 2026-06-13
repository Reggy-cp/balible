import { ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Browse by Category — Balible',
  description: 'Explore Bali through 8 categories of curated experiences — art & craft, wellness, culture, spiritual, food, nature, water activities, and local experts.',
}

const CATEGORIES = [
  {
    slug: 'art-craft',
    label: 'Art & Craft',
    tagline: 'Make something with your hands',
    description: 'Pottery, silver jewelry, batik, wood carving, weaving — learn from masters who have spent a lifetime perfecting their craft.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
    count: 6,
    avgPrice: 440000,
    featured: ['Pottery Making Class', 'Silver Jewelry Workshop', 'Batik Painting'],
    accent: '#B66A45',
    span: 'lg:col-span-2 lg:row-span-2',
    imageHeight: 'h-80 lg:h-full',
  },
  {
    slug: 'wellness',
    label: 'Wellness & Healing',
    tagline: 'Restore mind, body and spirit',
    description: 'Sound healing, yoga at sunrise, traditional jamu rituals — guided by healers with decades of experience.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=80',
    count: 4,
    avgPrice: 357500,
    featured: ['Sound Healing Journey', 'Sunrise Yoga', 'Jamu Ritual'],
    accent: '#4A7C59',
    span: 'lg:col-span-2',
    imageHeight: 'h-48',
  },
  {
    slug: 'culture',
    label: 'Culture',
    tagline: 'Live the living tradition',
    description: 'Sacred temple ceremonies, Legong dance, Kecak fire shows — ancient traditions, open to you.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    count: 4,
    avgPrice: 352500,
    featured: ['Kecak Fire Dance', 'Water Temple Ceremony', 'Heritage Walk'],
    accent: '#6F675C',
    span: 'lg:col-span-2',
    imageHeight: 'h-48',
  },
  {
    slug: 'nature',
    label: 'Nature & Outdoors',
    tagline: 'Bali beyond the beach',
    description: 'Trek Mount Batur before dawn, swim in hidden waterfalls, wander emerald rice terraces.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
    count: 3,
    avgPrice: 473333,
    featured: ['Mount Batur Sunrise Trek', 'Waterfall Canyon Hike', 'Rice Terrace Trek'],
    accent: '#4A7C59',
    span: 'lg:col-span-2',
    imageHeight: 'h-48',
  },
  {
    slug: 'water-activities',
    label: 'Water Activities',
    tagline: 'Surf, dive, and explore the sea',
    description: 'Surfing at Canggu, snorkelling a WWII shipwreck in Amed, freediving and scuba diving — all of Bali\'s water experiences in one place.',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop&q=80',
    count: 4,
    avgPrice: 462500,
    featured: ['Surfing for Beginners', 'USAT Liberty Snorkel', 'Stand-Up Paddle'],
    accent: '#3B82F6',
    span: 'lg:col-span-2',
    imageHeight: 'h-48',
  },
  {
    slug: 'spiritual',
    label: 'Spiritual',
    tagline: 'Connect with the sacred',
    description: 'Holy water rituals at Tirta Empul, traditional Balian healer sessions, temple offering ceremonies — Bali\'s spiritual life, open to respectful visitors.',
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&auto=format&fit=crop&q=80',
    count: 6,
    avgPrice: 433000,
    featured: ['Tirta Empul Ritual', 'Balian Healer Session', 'Temple Offering'],
    accent: '#9B7DB8',
    span: 'lg:col-span-2',
    imageHeight: 'h-48',
  },
  {
    slug: 'culinary',
    label: 'Culinary',
    tagline: 'Cook, taste, and discover',
    description: 'Balinese cooking classes, spice workshops, tempeh fermentation, jamu making, and farm-to-table lunches deep in the jungle — food as a way into the culture.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    count: 6,
    avgPrice: 385000,
    featured: ['Balinese Cooking Class', 'Balinese Spice Workshop', 'Farm to Table Lunch'],
    accent: '#C8A97E',
    span: 'lg:col-span-2',
    imageHeight: 'h-48',
  },
  {
    slug: 'local-experts',
    label: 'Local Experts',
    tagline: 'Trusted locals, at your side',
    description: 'Photographers, guides, wellness practitioners, childcare, pet care, creative mentors, and drivers — trusted local professionals for the practical side of your trip.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    count: 7,
    avgPrice: 547000,
    featured: ['Vacation Photoshoot', 'Private Driver', 'Trusted Babysitter'],
    accent: '#34657F',
    span: 'lg:col-span-2',
    imageHeight: 'h-48',
  },
]

function formatIDR(n: number) {
  return 'IDR ' + Math.round(n).toLocaleString('id-ID')
}

export default function CategoriesPage() {
  const totalExperiences = CATEGORIES.reduce((s, c) => s + c.count, 0)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      {/* ── HERO ── */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-14 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 14 }}>
              Browse by category
            </p>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, color: '#111111', lineHeight: 1.05, maxWidth: 560 }}>
              Every way to experience Bali
            </h1>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: '#6F675C', marginTop: 16, lineHeight: 1.75, maxWidth: 520 }}>
              {totalExperiences} handpicked experiences across 8 categories — art, wellness, culture, spiritual, culinary, nature, water activities, and local experts. Each one led by a local who knows their craft.
            </p>
          </div>

          <a
            href="/search"
            className="flex-shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{
              height: 48, padding: '0 28px', backgroundColor: '#111111', color: 'white',
              borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
              fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap',
            }}
          >
            Browse all experiences <ArrowRight size={15} />
          </a>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-8 mt-10 pt-8" style={{ borderTop: '1px solid #E8E4DE' }}>
          {[
            { value: `${totalExperiences}+`, label: 'curated experiences' },
            { value: '8',   label: 'categories' },
            { value: '4.8', label: 'average rating' },
            { value: '10+', label: 'areas of Bali' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, color: '#111111', lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED HERO CARD (Art & Craft) + row of 2 ── */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pb-6">

        {/* Row 1: big Art & Craft card left + Wellness + Culture stacked right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

          {/* Big card */}
          <a
            href={`/categories/${CATEGORIES[0].slug}`}
            className="group relative lg:col-span-3 rounded-2xl overflow-hidden"
            style={{ minHeight: 480, textDecoration: 'none', display: 'block' }}
          >
            <img
              src={CATEGORIES[0].image}
              alt={CATEGORIES[0].label}
              className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0) 100%)' }} />

            {/* Badge */}
            <div className="absolute top-5 left-5">
              <span
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: CATEGORIES[0].accent, color: 'white', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', fontFamily: 'var(--font-inter)' }}
              >
                Most popular
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-7">
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', marginBottom: 8 }}>
                {CATEGORIES[0].tagline}
              </p>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 34, fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 10 }}>
                {CATEGORIES[0].label}
              </h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, marginBottom: 20, maxWidth: 420 }}>
                {CATEGORIES[0].description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: 'white' }}>{CATEGORIES[0].count}</p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>experiences</p>
                  </div>
                  <div style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                  <div>
                    <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: 'white' }}>From {formatIDR(350000)}</p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>per person</p>
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors"
                  style={{ border: '1.5px solid rgba(255,255,255,0.5)' }}
                >
                  <ArrowRight size={16} style={{ color: 'white' }} />
                </div>
              </div>
            </div>
          </a>

          {/* Right column: Wellness + Culture */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {CATEGORIES.slice(1, 3).map(cat => (
              <a
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden flex-1"
                style={{ minHeight: 220, textDecoration: 'none', display: 'block' }}
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
                    {cat.tagline}
                  </p>
                  <div className="flex items-end justify-between">
                    <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.15 }}>
                      {cat.label}
                    </h2>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{cat.count} exp.</span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.4)' }}
                      >
                        <ArrowRight size={13} style={{ color: 'white' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Row 2: Nature + Water + Culinary + Spiritual — four equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.slice(3).map(cat => (
            <a
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden"
              style={{ minHeight: 300, textDecoration: 'none', display: 'block' }}
            >
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0) 100%)' }} />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 5 }}>
                  {cat.tagline}
                </p>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 6, lineHeight: 1.15 }}>
                  {cat.label}
                </h2>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, marginBottom: 16 }}>
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 11, fontFamily: 'var(--font-inter)' }}
                    >
                      {cat.count} experiences
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 11, fontFamily: 'var(--font-inter)' }}
                    >
                      From {formatIDR(Math.min(...[280000, 320000, 350000]))}
                    </span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.4)' }}
                  >
                    <ArrowRight size={13} style={{ color: 'white' }} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── WHAT TO EXPECT STRIP ── */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl p-8 lg:p-12" style={{ border: '1px solid #E8E4DE' }}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 12 }}>
                What makes us different
              </p>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, color: '#111111', lineHeight: 1.15, marginBottom: 16 }}>
                Every experience is personally reviewed
              </h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.8, marginBottom: 24 }}>
                Our team visits every host before they go live on Balible. We say no to far more than we say yes. What you see on this page has earned its place.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'Small groups — max 6–12 guests per experience',
                  '85% of every payment goes directly to the host',
                  'Free cancellation up to 24 hours before',
                  'Instant booking confirmation — no waiting',
                ].map(point => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: '#F5F1EB' }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#C8A97E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.55 }}>{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo mosaic */}
            <div className="grid grid-cols-2 gap-3">
              {[
                'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop&q=80',
              ].map((src, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ height: i % 2 === 0 ? 160 : 130, marginTop: i % 2 !== 0 ? 24 : 0 }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pb-16">
        <div
          className="rounded-2xl text-center px-8 py-14 relative overflow-hidden"
          style={{ backgroundColor: '#111111' }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #C8A97E 0%, transparent 60%)' }} />
          <div className="relative">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 14 }}>
              Not sure where to start?
            </p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white', marginBottom: 16, lineHeight: 1.15 }}>
              Browse all experiences at once
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              Filter by location, price, duration, or category — find exactly what fits your trip.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/search"
                style={{
                  height: 50, display: 'inline-flex', alignItems: 'center', padding: '0 32px',
                  backgroundColor: '#C8A97E', color: '#111111', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-inter)',
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Browse all experiences →
              </a>
              <a
                href="/how-it-works"
                style={{
                  height: 50, display: 'inline-flex', alignItems: 'center', padding: '0 32px',
                  border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)',
                  borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)',
                }}
                className="hover:border-white/40 transition-colors"
              >
                How it works
              </a>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />

      <Footer />
    </div>
  )
}
