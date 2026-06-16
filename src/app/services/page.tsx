import { Star, MapPin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import { getAllServices, type ServiceCard } from '@/lib/service-actions'

const CATEGORIES = [
  { key: 'ALL',                  label: 'All Services',          emoji: '✦' },
  { key: 'WELLNESS_BEAUTY',      label: 'Wellness & Beauty',     emoji: '💆' },
  { key: 'PHOTOGRAPHY_CONTENT',  label: 'Photography & Content', emoji: '📸' },
  { key: 'TRANSPORTATION',       label: 'Transportation',         emoji: '🚗' },
  { key: 'FOOD_DINING',          label: 'Food & Dining',         emoji: '🍽️' },
  { key: 'EVENT_WEDDING',        label: 'Event & Wedding',       emoji: '💍' },
  { key: 'FITNESS_COACHING',     label: 'Fitness & Coaching',    emoji: '🧘' },
  { key: 'VILLA_SERVICE',        label: 'Villa Service',         emoji: '🏡' },
  { key: 'PET_SERVICE',          label: 'Pet Service',           emoji: '🐾' },
]

const PRICE_LABEL: Record<string, string> = {
  HOURLY: '/ hr', DAILY: '/ day', FIXED: '',
}

function ServiceCardUI({ s }: { s: ServiceCard }) {
  return (
    <a
      href={`/services/${s.slug}`}
      className="rounded-xl overflow-hidden border hover:shadow-md transition-shadow block bg-white"
      style={{ borderColor: '#E8E4DE', textDecoration: 'none' }}
    >
      <div className="relative" style={{ height: 200 }}>
        {s.image && <img src={s.image} alt={s.title} className="w-full h-full object-cover" />}
        {s.featured && (
          <span
            className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-white"
            style={{ fontSize: 11, fontWeight: 600, backgroundColor: '#C8A97E' }}
          >
            Featured
          </span>
        )}
        <span
          className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full"
          style={{ fontSize: 11, fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.55)', color: 'white' }}
        >
          {s.subcategory}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1">
          <MapPin size={11} style={{ color: '#6F675C' }} />
          <p style={{ fontSize: 11, color: '#6F675C' }}>{s.area}</p>
        </div>
        <h3
          className="line-clamp-2 leading-snug"
          style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, color: '#111111', fontWeight: 600 }}
        >
          {s.title}
        </h3>
        <p className="mt-0.5" style={{ fontSize: 11, color: '#9E9A94' }}>{s.category}</p>

        <div className="flex items-center gap-1 mt-2">
          <Star size={11} fill="#C8A97E" color="#C8A97E" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{s.rating.toFixed(1)}</span>
          <span style={{ fontSize: 12, color: '#6F675C' }}>({s.totalReviews})</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p style={{ fontSize: 13, color: '#111111' }}>
            From <span style={{ color: '#C8A97E' }}>IDR</span> {s.price.toLocaleString('id-ID')}
            {PRICE_LABEL[s.priceTypeKey] && (
              <span style={{ color: '#6F675C', fontSize: 11 }}> {PRICE_LABEL[s.priceTypeKey]}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #F5F1EB' }}>
          {s.providerAvatar && (
            <img src={s.providerAvatar} alt={s.providerName} className="rounded-full object-cover flex-shrink-0" style={{ width: 22, height: 22 }} />
          )}
          <p style={{ fontSize: 11, color: '#6F675C' }}>{s.providerName}</p>
        </div>
      </div>
    </a>
  )
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category = 'ALL' } = await searchParams
  const all = await getAllServices()
  const services = category === 'ALL' ? all : all.filter(s => s.categoryKey === category)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 pt-10 pb-6">
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, color: '#111111' }}>
          Services in Bali
        </h1>
        <p className="mt-2" style={{ fontSize: 15, color: '#6F675C' }}>
          Trusted local providers — delivered to your villa
        </p>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-20 bg-[#F5F1EB]" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex gap-2 overflow-x-auto scrollbar-none py-3">
            {CATEGORIES.map(c => (
              <a
                key={c.key}
                href={c.key === 'ALL' ? '/services' : `/services?category=${c.key}`}
                className="flex items-center gap-1.5 flex-shrink-0 px-4 rounded-full transition-all"
                style={{
                  height: 36, fontSize: 13, fontWeight: category === c.key ? 600 : 400, textDecoration: 'none',
                  backgroundColor: category === c.key ? '#111111' : 'white',
                  color: category === c.key ? 'white' : '#6F675C',
                  border: `1px solid ${category === c.key ? '#111111' : '#E8E4DE'}`,
                }}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8 pb-24">
        {services.length === 0 ? (
          <div className="py-24 text-center">
            <p style={{ fontSize: 15, color: '#6F675C' }}>No services in this category yet. Check back soon.</p>
          </div>
        ) : (
          <>
            <p className="mb-5" style={{ fontSize: 13, color: '#6F675C' }}>
              {services.length} service{services.length !== 1 ? 's' : ''} available
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {services.map(s => <ServiceCardUI key={s.slug} s={s} />)}
            </div>
          </>
        )}
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
