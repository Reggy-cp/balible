import { prisma } from './prisma'

export type ExperienceCard = {
  slug: string
  title: string
  area: string
  rating: number
  reviews: number
  price: number
  durationMins: number
  duration: string
  maxGuests: number
  category: string      // display: "Art & Craft"
  categorySlug: string  // url: "art-craft"
  photo: string
  featured: boolean
  badge: string | null
  subcategory: string | null
  level: string
}

export type FeaturedExp = {
  id: number
  slug: string
  title: string
  area: string
  meta: string
  rating: number
  reviews: number
  price: number
  photo: string
}

const CATEGORY_DISPLAY: Record<string, string> = {
  WELLNESS: 'Wellness & Healing',
  ART_CRAFT: 'Art & Craft',
  CULTURE: 'Culture',
  FOOD_DRINK: 'Culinary',
  NATURE: 'Nature & Outdoors',
  WATER_ACTIVITIES: 'Water Activities',
  LOCAL_EXPERTS: 'Local Experts',
  RENTALS: 'Rentals',
}

const CATEGORY_SLUG: Record<string, string> = {
  WELLNESS: 'wellness',
  ART_CRAFT: 'art-craft',
  CULTURE: 'culture',
  FOOD_DRINK: 'culinary',
  NATURE: 'nature',
  WATER_ACTIVITIES: 'water-activities',
  LOCAL_EXPERTS: 'local-experts',
  RENTALS: 'rentals',
}

const AREA_DISPLAY: Record<string, string> = {
  UBUD: 'Ubud',
  CANGGU: 'Canggu',
  KUTA: 'Kuta',
  SEMINYAK: 'Seminyak',
  ULUWATU: 'Uluwatu',
  GIANYAR: 'Gianyar',
  SANUR: 'Sanur',
  NUSA_DUA: 'Nusa Dua',
  AMED: 'Amed',
  MEDEWI: 'Medewi',
  JIMBARAN: 'Jimbaran',
  KINTAMANI: 'Kintamani',
  SIDEMEN: 'Sidemen',
}

function parseDurationMins(d: string): number {
  const m = d.match(/(\d+\.?\d*)\s*(hour|hr|h\b|min)/i)
  if (!m) return 120
  const val = parseFloat(m[1])
  return m[2].toLowerCase().startsWith('h') ? Math.round(val * 60) : Math.round(val)
}

// Fetch all active experiences from DB. Returns [] on error so callers can
// fall back to their own static lists.
export async function getExperienceCards(): Promise<ExperienceCard[]> {
  try {
    const rows = await prisma.experience.findMany({
      where: { status: 'ACTIVE' },
      select: {
        slug: true, title: true, area: true, rating: true, totalReviews: true,
        price: true, duration: true, maxGuests: true, category: true, images: true,
        featured: true, level: true,
      },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    })
    return rows.map(e => ({
      slug: e.slug,
      title: e.title,
      area: AREA_DISPLAY[e.area] ?? e.area,
      rating: e.rating,
      reviews: e.totalReviews,
      price: e.price,
      durationMins: parseDurationMins(e.duration),
      duration: e.duration,
      maxGuests: e.maxGuests,
      category: CATEGORY_DISPLAY[e.category] ?? e.category,
      categorySlug: CATEGORY_SLUG[e.category] ?? 'culture',
      photo: e.images[0] ?? '',
      featured: e.featured,
      badge: e.featured ? 'Bestseller' : null,
      subcategory: null,
      level: e.level,
    }))
  } catch {
    return []
  }
}

// Returns up to 4 featured experiences for the homepage carousel.
export async function getFeaturedExperiences(): Promise<FeaturedExp[]> {
  try {
    const rows = await prisma.experience.findMany({
      where: { status: 'ACTIVE', featured: true },
      select: {
        slug: true, title: true, area: true, rating: true, totalReviews: true,
        price: true, duration: true, level: true, images: true,
      },
      take: 4,
    })
    if (rows.length > 0) {
      return rows.map((e, i) => ({
        id: i + 1,
        slug: e.slug,
        title: e.title,
        area: AREA_DISPLAY[e.area as string] ?? e.area,
        meta: e.level ? `${e.duration} · ${e.level}` : e.duration,
        rating: e.rating,
        reviews: e.totalReviews,
        price: e.price,
        photo: e.images[0] ?? '',
      }))
    }
  } catch { /* fall through */ }
  return []
}
