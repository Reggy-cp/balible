import { notFound } from 'next/navigation'
import { Star, MapPin, CheckCircle, Shield, Clock, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import { getServiceBySlug } from '@/lib/service-actions'
import ServiceBookingWidget from './ServiceBookingWidget'

const PRICE_LABEL: Record<string, string> = {
  HOURLY: '/ hour', DAILY: '/ day', FIXED: 'fixed price',
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-6 text-sm" style={{ color: '#6F675C' }}>
          <a href="/services" style={{ color: '#6F675C', textDecoration: 'none' }}>Services</a>
          <ChevronRight size={13} />
          <span style={{ color: '#9E9A94' }}>{service.category}</span>
          <ChevronRight size={13} />
          <span style={{ color: '#111111' }}>{service.subcategory}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left: content */}
          <div className="flex-1 min-w-0">

            {/* Images */}
            <div className="grid gap-2 mb-8" style={{ gridTemplateColumns: service.images.length > 1 ? '2fr 1fr' : '1fr' }}>
              <div className="rounded-xl overflow-hidden" style={{ height: 380 }}>
                <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
              </div>
              {service.images.length > 1 && (
                <div className="flex flex-col gap-2">
                  {service.images.slice(1, 3).map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden flex-1">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & meta */}
            <div className="mb-2">
              <span style={{ fontSize: 12, color: '#C8A97E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {service.category} · {service.subcategory}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color: '#111111', marginBottom: 12 }}>
              {service.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5">
                <Star size={14} fill="#C8A97E" color="#C8A97E" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111111' }}>{service.rating.toFixed(1)}</span>
                <span style={{ fontSize: 14, color: '#6F675C' }}>({service.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={13} style={{ color: '#6F675C' }} />
                <span style={{ fontSize: 14, color: '#6F675C' }}>{service.area}, Bali</span>
              </div>
              {service.instantConfirm && (
                <div className="flex items-center gap-1">
                  <CheckCircle size={13} style={{ color: '#4A7C59' }} />
                  <span style={{ fontSize: 13, color: '#4A7C59', fontWeight: 500 }}>Instant Confirm</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 mb-5" style={{ border: '1px solid #E8E4DE' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 10 }}>About this service</h2>
              <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7 }}>{service.description}</p>
            </div>

            {/* Highlights */}
            {service.highlights.length > 0 && (
              <div className="bg-white rounded-xl p-6 mb-5" style={{ border: '1px solid #E8E4DE' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 12 }}>Highlights</h2>
                <ul className="space-y-3">
                  {service.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F1EB' }}>
                        <CheckCircle size={12} style={{ color: '#C8A97E' }} />
                      </div>
                      <span style={{ fontSize: 14, color: '#333' }}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Includes / Excludes */}
            {(service.includes.length > 0 || service.excludes.length > 0) && (
              <div className="bg-white rounded-xl p-6 mb-5" style={{ border: '1px solid #E8E4DE' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 12 }}>What's included</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {service.includes.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#4A7C59', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Included</p>
                      <ul className="space-y-2">
                        {service.includes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span style={{ color: '#4A7C59', fontSize: 14, marginTop: 1 }}>✓</span>
                            <span style={{ fontSize: 14, color: '#333' }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {service.excludes.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#B66A45', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Not included</p>
                      <ul className="space-y-2">
                        {service.excludes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span style={{ color: '#B66A45', fontSize: 14, marginTop: 1 }}>✕</span>
                            <span style={{ fontSize: 14, color: '#333' }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Provider */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DE' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111', marginBottom: 14 }}>Your provider</h2>
              <div className="flex items-start gap-4">
                {service.provider.avatar && (
                  <img src={service.provider.avatar} alt={service.provider.businessName} className="rounded-full object-cover flex-shrink-0" style={{ width: 56, height: 56 }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#111111' }}>{service.provider.businessName}</p>
                    {service.provider.verified && (
                      <div className="flex items-center gap-1">
                        <Shield size={12} style={{ color: '#4A7C59' }} />
                        <span style={{ fontSize: 11, color: '#4A7C59', fontWeight: 600 }}>Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={12} fill="#C8A97E" color="#C8A97E" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>{service.provider.rating.toFixed(1)}</span>
                    <span style={{ fontSize: 13, color: '#6F675C' }}>· {service.provider.totalReviews} reviews</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>{service.provider.description}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right: booking widget (sticky) */}
          <div className="lg:w-[360px] flex-shrink-0">
            <div className="sticky top-24">
              <ServiceBookingWidget
                slug={service.slug}
                title={service.title}
                price={service.price}
                priceType={service.priceTypeKey}
                priceLabel={PRICE_LABEL[service.priceTypeKey] ?? ''}
                area={service.area}
                image={service.images[0] ?? ''}
                instantConfirm={service.instantConfirm}
              />
            </div>
          </div>

        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
