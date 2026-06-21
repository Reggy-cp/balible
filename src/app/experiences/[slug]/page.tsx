import { MapPin, Star, Clock, Users, Globe } from 'lucide-react'
import Navbar from '@/components/Navbar'
import BookingWidget from '@/components/BookingWidget'
import ExperienceTabs from '@/components/ExperienceTabs'
import RecommendationsSection from '@/components/RecommendationsSection'
import ReadMore from '@/components/ReadMore'
import WishlistHeart from '@/components/WishlistHeart'
import ShareButton from '@/components/ShareButton'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import MobileBookingModal from '@/components/MobileBookingModal'
import ExperienceGalleryFull from '@/components/ExperienceGalleryFull'
import { prisma } from '@/lib/prisma'

const AREA_DISPLAY: Record<string, string> = {
  UBUD: 'Ubud', CANGGU: 'Canggu', SEMINYAK: 'Seminyak', KUTA: 'Kuta',
  ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', KINTAMANI: 'Kintamani',
  AMED: 'Amed', SIDEMEN: 'Sidemen', SANUR: 'Sanur',
  NUSA_DUA: 'Nusa Dua', JIMBARAN: 'Jimbaran', MEDEWI: 'Medewi',
}

type ExpData = {
  slug: string; title: string; area: string; category: string; price: number; duration: string;
  level: string; language: string; maxGuests: number; rating: number; totalReviews: number;
  description: string; highlights: string[]; includes: string[]; excludes: string[];
  itinerary?: { time: string; activity: string }[];
  meetingPoint: string; images: string[];
  operator: { businessName: string; description: string; avatar?: string | null; rating: number; totalReviews: number; user: { name: string; image?: string | null } };
  reviews: { id: string; rating: number; comment: string; createdAt: Date; user: { name: string; image?: string | null } }[];
}


// Pre-render known slugs at build time; revalidate hourly for new/updated experiences
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const experiences = await prisma.experience.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true },
    })
    return experiences.map(e => ({ slug: e.slug }))
  } catch {
    return []
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ExperienceDetailPage({ params }: { params: { slug: string } }) {
  let experience: ExpData | null = null
  let allOthers: {slug:string;title:string;category:string;area:string;price:number;rating:number;totalReviews:number;images:string[]}[] = []

  // Try DB first; gracefully fall back to static data if not yet connected
  try {
    const dbExp = await prisma.experience.findUnique({
      where: { slug: params.slug },
      include: {
        operator: { include: { user: true } },
        reviews: { include: { user: true }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })

    if (dbExp) {
      experience = {
        slug: dbExp.slug, title: dbExp.title, area: AREA_DISPLAY[String(dbExp.area)] ?? String(dbExp.area),
        category: String(dbExp.category),
        price: dbExp.price, duration: dbExp.duration, level: dbExp.level,
        language: dbExp.language, maxGuests: dbExp.maxGuests,
        rating: dbExp.rating, totalReviews: dbExp.totalReviews,
        description: dbExp.description, highlights: dbExp.highlights,
        includes: dbExp.includes, excludes: dbExp.excludes,
        itinerary: Array.isArray(dbExp.itinerary) ? (dbExp.itinerary as { time: string; activity: string }[]) : [],
        meetingPoint: dbExp.meetingPoint, images: dbExp.images,
        operator: {
          businessName: dbExp.operator.businessName,
          description: dbExp.operator.description,
          avatar: dbExp.operator.avatar,
          rating: dbExp.operator.rating,
          totalReviews: dbExp.operator.totalReviews,
          user: { name: dbExp.operator.user.name, image: dbExp.operator.user.image },
        },
        reviews: dbExp.reviews.map((r: typeof dbExp.reviews[number]) => ({
          id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt,
          user: { name: r.user.name, image: r.user.image },
        })),
      }

      const others = await prisma.experience.findMany({
        where: { status: 'ACTIVE', NOT: { slug: params.slug } },
        select: { slug: true, title: true, category: true, area: true, price: true, rating: true, totalReviews: true, images: true },
      })
      allOthers = others.map((e: typeof others[number]) => ({ ...e, category: String(e.category), area: AREA_DISPLAY[String(e.area)] ?? String(e.area) }))
    }
  } catch {
    // DB error
  }

  if (!experience) {
    const prettyTitle = params.slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', backgroundColor: '#F5F1EB' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C8A97E', marginBottom: 12, fontFamily: 'var(--font-inter)' }}>COMING SOON</p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#111111', marginBottom: 16, maxWidth: 480 }}>{prettyTitle}</h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', maxWidth: 420, lineHeight: 1.7, marginBottom: 32 }}>
            We&apos;re working with a local host to bring this experience online. Check back soon, or explore what&apos;s available now.
          </p>
          <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', height: 46, padding: '0 28px', backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
            Browse all experiences
          </a>
          <a href="/" style={{ display: 'block', marginTop: 16, fontSize: 13, color: '#C8A97E', fontFamily: 'var(--font-inter)', textDecoration: 'underline' }}>
            ← Back to home
          </a>
        </div>
        <MobileNav />
      </>
    )
  }

  const currentForRec = {
    slug: experience.slug, title: experience.title,
    category: experience.category, area: experience.area,
    price: experience.price, rating: experience.rating,
    totalReviews: experience.totalReviews, images: experience.images,
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>

      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8">

        {/* Back link */}
        <a href="/search" className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity mb-6 text-coconut" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, textDecoration: 'none' }}>
          ← Back to all experiences
        </a>

        {/* ── PHOTO GALLERY ── */}
        <ExperienceGalleryFull images={experience.images} title={experience.title} />

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <MapPin size={12} style={{ color: '#C8A97E' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{experience.area}</span>
            </div>

            <div className="flex items-start justify-between gap-3 mt-2">
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: '#111111' }}>
                {experience.title}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ShareButton slug={experience.slug} title={experience.title} />
                <WishlistHeart slug={experience.slug} size={18} />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                {experience.totalReviews > 0 ? (
                  <>
                    <Star size={14} fill="#C8A97E" color="#C8A97E" />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 700, color: '#C8A97E' }}>{experience.rating.toFixed(1)}</span>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>({experience.totalReviews} reviews)</span>
                  </>
                ) : (
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#9E9A94' }}>No reviews yet</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={12} style={{ color: '#6F675C' }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>{experience.area}, Bali</span>
              </div>
            </div>

            <div className="mt-4">
              <ReadMore text={experience.description} />
            </div>

            {/* Info badges */}
            <div className="flex flex-wrap gap-5 mt-5">
              {[
                { Icon: Clock,  text: experience.duration },
                { Icon: Users,  text: experience.level },
                { Icon: Globe,  text: experience.language },
                { Icon: Users,  text: `Max ${experience.maxGuests} people` },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon size={15} strokeWidth={1.5} style={{ color: '#111111' }} />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Tabs (client island) */}
            <ExperienceTabs exp={experience} />
          </div>

          {/* RIGHT — booking widget (client island) */}
          <div id="booking" className="hidden lg:block lg:w-[340px] flex-shrink-0">
            <BookingWidget price={experience.price} slug={experience.slug} duration={experience.duration} maxGuests={experience.maxGuests} rating={experience.rating} totalReviews={experience.totalReviews} />
          </div>
        </div>
      </div>

      {/* ── AI RECOMMENDATIONS ── */}
      <RecommendationsSection current={currentForRec} others={allOthers} />
      <Footer />

      {/* ── MOBILE BOOKING MODAL ── */}
      <MobileBookingModal
        price={experience.price}
        slug={experience.slug}
        duration={experience.duration}
        maxGuests={experience.maxGuests}
        rating={experience.rating}
        totalReviews={experience.totalReviews}
      />

      <MobileNav />
    </div>
  )
}
