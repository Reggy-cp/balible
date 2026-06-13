import { Star, MapPin, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import WishlistHeart from '@/components/WishlistHeart'
import { prisma } from '@/lib/prisma'

const AREA_DISPLAY: Record<string, string> = {
  UBUD: 'Ubud', CANGGU: 'Canggu', SEMINYAK: 'Seminyak', KUTA: 'Kuta',
  ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', KINTAMANI: 'Kintamani',
  AMED: 'Amed', SIDEMEN: 'Sidemen', SANUR: 'Sanur',
  NUSA_DUA: 'Nusa Dua', JIMBARAN: 'Jimbaran', MEDEWI: 'Medewi',
}

const CATEGORY_DISPLAY: Record<string, string> = {
  WELLNESS: 'Wellness & Healing', ART_CRAFT: 'Art & Craft', CULTURE: 'Culture',
  FOOD_DRINK: 'Culinary', NATURE: 'Nature & Outdoors', ARCHITECTURE: 'Architecture',
  SURF_WATER: 'Water Activities', DIVING: 'Diving', COOKING: 'Cooking',
  LOCAL_EXPERTS: 'Local Experts',
}

async function getExperiences() {
  try {
    return await prisma.experience.findMany({
      where: { status: 'ACTIVE' },
      select: {
        slug: true, title: true, area: true, category: true,
        price: true, duration: true, rating: true, totalReviews: true,
        images: true, featured: true,
      },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    })
  } catch {
    return []
  }
}

export default async function ExperiencesPage() {
  const experiences = await getExperiences()

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-10 pb-24">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, color: '#111111' }}>
            All Experiences
          </h1>
          <p className="mt-2" style={{ fontSize: 15, color: '#6F675C' }}>
            {experiences.length} curated experiences across Bali
          </p>
        </div>

        {experiences.length === 0 ? (
          <div className="py-24 text-center">
            <p style={{ fontSize: 15, color: '#6F675C' }}>No experiences available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {experiences.map(exp => {
              const area = AREA_DISPLAY[String(exp.area)] ?? String(exp.area)
              const category = CATEGORY_DISPLAY[String(exp.category)] ?? String(exp.category)
              const image = (exp.images as string[])[0] ?? ''
              return (
                <a
                  key={exp.slug}
                  href={`/experiences/${exp.slug}`}
                  className="rounded-xl overflow-hidden border hover:shadow-md transition-shadow block bg-white"
                  style={{ borderColor: '#E8E4DE', textDecoration: 'none' }}
                >
                  <div className="relative" style={{ height: 200 }}>
                    {image && <img src={image} alt={exp.title} className="w-full h-full object-cover" />}
                    {exp.featured && (
                      <span
                        className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-white"
                        style={{ fontSize: 11, fontWeight: 600, backgroundColor: '#C8A97E' }}
                      >
                        Featured
                      </span>
                    )}
                    <div className="absolute top-3 right-3">
                      <WishlistHeart slug={exp.slug} size={13} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <MapPin size={11} style={{ color: '#6F675C' }} />
                        <p style={{ fontSize: 11, color: '#6F675C' }}>{area}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={11} style={{ color: '#9E9A94' }} />
                        <p style={{ fontSize: 11, color: '#9E9A94' }}>{exp.duration}</p>
                      </div>
                    </div>
                    <h3
                      className="line-clamp-2 leading-snug mt-1"
                      style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, color: '#111111', fontWeight: 600 }}
                    >
                      {exp.title}
                    </h3>
                    <p className="mt-1" style={{ fontSize: 11, color: '#9E9A94' }}>{category}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star size={11} fill="#C8A97E" color="#C8A97E" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{exp.rating.toFixed(1)}</span>
                      <span style={{ fontSize: 12, color: '#6F675C' }}>({exp.totalReviews})</span>
                    </div>
                    <p className="mt-2" style={{ fontSize: 13, color: '#111111' }}>
                      From <span style={{ color: '#C8A97E' }}>IDR</span> {exp.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
