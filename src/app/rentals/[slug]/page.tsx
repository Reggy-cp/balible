import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServiceFeeRateAction } from '@/lib/actions'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import RentalGallery from './RentalGallery'
import RentalBookingWidget from './RentalBookingWidget'
import RentalMobileModal from './RentalMobileModal'
import RentalTabs from './RentalTabs'
import RentalRecommendations from './RentalRecommendations'
import { MapPin, Star, Camera, Clock, Package } from 'lucide-react'

export const revalidate = 300

const AREA_LABEL: Record<string, string> = {
  UBUD: 'Ubud', CANGGU: 'Canggu', KUTA: 'Kuta', SEMINYAK: 'Seminyak',
  ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', SANUR: 'Sanur', NUSA_DUA: 'Nusa Dua',
  AMED: 'Amed', MEDEWI: 'Medewi', JIMBARAN: 'Jimbaran', KINTAMANI: 'Kintamani',
  SIDEMEN: 'Sidemen',
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const r = await prisma.experience.findUnique({ where: { slug: params.slug }, select: { title: true, description: true } })
  if (!r) return {}
  return { title: `${r.title} — Balible Rentals`, description: r.description?.slice(0, 160) }
}

export default async function RentalPage({ params }: { params: { slug: string } }) {
  const rental = await prisma.experience.findUnique({
    where: { slug: params.slug },
    include: {
      operator: { include: { user: { select: { name: true, image: true } } } },
      reviews: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })

  if (!rental || String(rental.category) !== 'RENTALS') notFound()

  const relatedSelect = { slug: true, title: true, area: true, price: true, duration: true, rating: true, totalReviews: true, images: true }
  const sameArea = await prisma.experience.findMany({
    where: { category: 'RENTALS', slug: { not: params.slug }, area: rental.area ?? undefined },
    orderBy: { totalReviews: 'desc' },
    take: 6,
    select: relatedSelect,
  })
  const related = sameArea.length >= 4 ? sameArea : await prisma.experience.findMany({
    where: { category: 'RENTALS', slug: { not: params.slug } },
    orderBy: { totalReviews: 'desc' },
    take: 6,
    select: relatedSelect,
  })

  const area         = AREA_LABEL[String(rental.area)] ?? String(rental.area)
  const fallback     = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80'
  const images       = rental.images.length ? rental.images : [fallback]
  const thumbPhotos  = [...images.slice(0, 5)]
  while (thumbPhotos.length < 5) thumbPhotos.push(thumbPhotos[0])

  const depositLine  = (rental.includes ?? []).find((l: string) => l.startsWith('Deposit:')) ?? null
  const depositRaw   = depositLine ? depositLine.replace('Deposit: IDR ', '').replace(' (refundable)', '') : null
  const includeItems = (rental.includes ?? []).filter((l: string) => !l.startsWith('Deposit:'))
  const excludeItems = rental.excludes ?? []
  const ownerName    = rental.operator?.user?.name ?? rental.operator?.businessName ?? 'Host'
  const period       = rental.duration || 'per day'
  const depositAmt   = depositRaw ? Number(depositRaw.replace(/\D/g, '')) : 0
  const serviceFeeRate = await getServiceFeeRateAction()

  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8">

        {/* Back link */}
        <a href="/categories/rentals" className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity mb-6" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', textDecoration: 'none' }}>
          ← Back to rentals
        </a>

        {/* ── DESKTOP GALLERY ── */}
        <div className="hidden lg:flex gap-2 mb-8" style={{ height: 380 }}>
          {/* Main photo */}
          <div className="relative overflow-hidden flex-1" style={{ borderRadius: 12 }}>
            <img src={thumbPhotos[0]} alt={rental.title} className="w-full h-full object-cover" />
          </div>
          {/* 2×2 grid */}
          <div className="grid grid-cols-2 gap-2" style={{ width: '38%' }}>
            {thumbPhotos.slice(1, 5).map((src, i) => (
              <div key={i} className="relative overflow-hidden" style={{ borderRadius: 8 }}>
                <img src={src} alt={`View ${i + 2}`} className="w-full h-full object-cover" />
                {i === 3 && (
                  <button className="absolute inset-0 flex items-center justify-center gap-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <Camera size={14} color="white" />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'white', fontWeight: 500 }}>View all photos</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── MOBILE GALLERY ── visible only on screens < 1024px */}
        <div className="block lg:hidden">
          <RentalGallery images={images} title={rental.title} />
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── LEFT ── */}
          <div className="flex-1 min-w-0">

            {/* Area */}
            <div className="flex items-center gap-1">
              <MapPin size={12} style={{ color: '#C8A97E' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{area}</span>
            </div>

            {/* Title */}
            <div className="mt-2">
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: '#111111' }}>
                {rental.title}
              </h1>
            </div>

            {/* Rating + location */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {rental.totalReviews > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={14} fill="#C8A97E" color="#C8A97E" />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 700, color: '#C8A97E' }}>{rental.rating.toFixed(1)}</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>({rental.totalReviews} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin size={12} style={{ color: '#6F675C' }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>{area}, Bali</span>
              </div>
            </div>

            {/* Description */}
            {rental.description && (
              <div className="mt-4">
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#4A4540', lineHeight: 1.8 }}>{rental.description}</p>
              </div>
            )}

            {/* Info badges */}
            <div className="flex flex-wrap gap-5 mt-5">
              {[
                { Icon: Clock,   text: period },
                ...(rental.subcategory ? [{ Icon: Package, text: rental.subcategory }] : []),
                { Icon: MapPin,  text: area },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon size={15} strokeWidth={1.5} style={{ color: '#111111' }} />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Tabs: About / What's included / Reviews / Host */}
            <RentalTabs
              rental={{
                slug: rental.slug,
                title: rental.title,
                images: rental.images,
                description: rental.description,
                includes: includeItems,
                excludes: excludeItems,
                meetingPoint: rental.meetingPoint,
                depositAmt,
                operator: {
                  businessName: rental.operator?.businessName ?? null,
                  description: rental.operator?.description ?? null,
                  avatar: rental.operator?.avatar ?? null,
                  rating: rental.operator?.rating ?? 0,
                  totalReviews: rental.operator?.totalReviews ?? 0,
                  user: {
                    name: ownerName,
                    image: rental.operator?.user?.image ?? null,
                  },
                },
                reviews: rental.reviews ?? [],
                rating: rental.rating,
                totalReviews: rental.totalReviews,
              }}
            />
          </div>

          {/* ── RIGHT: booking widget (desktop only) ── */}
          <div id="booking" className="hidden lg:block lg:w-[340px] flex-shrink-0 sticky top-24 self-start">
            <RentalBookingWidget
              price={rental.price}
              period={period}
              depositRaw={depositRaw}
              slug={rental.slug}
              title={rental.title}
              image={images[0]}
              area={area}
              serviceFeeRate={serviceFeeRate}
            />
          </div>
        </div>
      </div>

      <RentalRecommendations
        rentals={related.map(r => ({
          slug: r.slug,
          title: r.title,
          area: AREA_LABEL[String(r.area)] ?? String(r.area),
          price: r.price,
          duration: r.duration,
          rating: r.rating,
          totalReviews: r.totalReviews,
          images: r.images,
        }))}
      />

      <Footer />

      {/* ── MOBILE: sticky bar + bottom sheet ── */}
      <RentalMobileModal
        price={rental.price}
        period={period}
        depositRaw={depositRaw}
        slug={rental.slug}
        title={rental.title}
        image={images[0]}
        area={area}
        serviceFeeRate={serviceFeeRate}
      />

      <MobileNav />
    </div>
  )
}
