'use server'

import { prisma } from './prisma'
import { getOrCreateNeonUser } from './user'

const AREA_DISPLAY: Record<string, string> = {
  UBUD: 'Ubud', CANGGU: 'Canggu', SEMINYAK: 'Seminyak', KUTA: 'Kuta',
  ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', KINTAMANI: 'Kintamani',
  AMED: 'Amed', SIDEMEN: 'Sidemen',
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function toggleWishlistAction(
  slug: string,
): Promise<{ ok: boolean; saved: boolean; wishlistSlugs: string[] }> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return { ok: false, saved: false, wishlistSlugs: [] }

    const current: string[] = user.wishlistSlugs ?? []
    const isSaved = current.includes(slug)
    const next = isSaved ? current.filter(s => s !== slug) : [...current, slug]

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { wishlistSlugs: next },
      select: { wishlistSlugs: true },
    })
    return { ok: true, saved: !isSaved, wishlistSlugs: updated.wishlistSlugs }
  } catch {
    return { ok: false, saved: false, wishlistSlugs: [] }
  }
}

export async function getUserWishlist(): Promise<string[]> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return []
    const row = await prisma.user.findUnique({
      where: { id: user.id },
      select: { wishlistSlugs: true },
    })
    return row?.wishlistSlugs ?? []
  } catch {
    return []
  }
}

// ── Booking ───────────────────────────────────────────────────────────────────

export type CreateBookingInput = {
  slug: string
  rawDate: string
  guests: number
  totalPrice: number
  guestName: string
  guestEmail: string
  guestPhone?: string
}

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<{ ok: boolean; bookingRef?: string }> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return { ok: false }

    const exp = await prisma.experience.findUnique({ where: { slug: input.slug } })
    if (!exp) return { ok: false }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        experienceId: exp.id,
        date: new Date(input.rawDate),
        guests: input.guests,
        totalPrice: input.totalPrice,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone ?? null,
        status: 'CONFIRMED',
      },
    })
    return { ok: true, bookingRef: booking.bookingRef }
  } catch {
    return { ok: false }
  }
}

// ── Review ────────────────────────────────────────────────────────────────────

export async function createReviewAction(input: {
  slug: string
  rating: number
  comment: string
}): Promise<{ ok: boolean }> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return { ok: false }

    const exp = await prisma.experience.findUnique({ where: { slug: input.slug } })
    if (!exp) return { ok: false }

    // Upsert: one review per user per experience
    const existing = await prisma.review.findFirst({
      where: { userId: user.id, experienceId: exp.id },
    })

    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: { rating: input.rating, comment: input.comment },
      })
    } else {
      await prisma.review.create({
        data: {
          userId: user.id,
          experienceId: exp.id,
          rating: input.rating,
          comment: input.comment,
        },
      })
    }
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// ── Host listing management ───────────────────────────────────────────────────

const CATEGORY_TO_ENUM: Record<string, string> = {
  'Art & Craft': 'ART_CRAFT',
  'Wellness': 'WELLNESS',
  'Culture': 'CULTURE',
  'Culinary': 'FOOD_DRINK',
  'Cooking': 'COOKING',
  'Nature & Outdoors': 'NATURE',
  'Water Activities': 'SURF_WATER',
  'Spiritual': 'CULTURE',
}

const AREA_TO_ENUM: Record<string, string> = {
  'Ubud': 'UBUD', 'Canggu': 'CANGGU', 'Kuta': 'KUTA', 'Seminyak': 'SEMINYAK',
  'Uluwatu': 'ULUWATU', 'Gianyar': 'GIANYAR', 'Sanur': 'SANUR',
  'Nusa Dua': 'NUSA_DUA', 'Amed': 'AMED', 'Jimbaran': 'JIMBARAN',
  'Kintamani': 'KINTAMANI', 'Sidemen': 'AMED',
}

export type HostListingInput = {
  slug: string
  title: string
  description: string
  category: string
  area: string
  price: number
  duration: string
  maxGuests: number
  meetingPoint: string
  includes: string[]
  excludes: string[]
  imageUrl?: string
}

async function getOrCreateOperator(businessName: string) {
  const user = await getOrCreateNeonUser()
  if (!user) return null
  const existing = await prisma.operator.findUnique({ where: { userId: user.id } })
  if (existing) return existing
  return prisma.operator.create({
    data: {
      userId: user.id,
      businessName: businessName || user.name,
      description: '',
    },
  })
}

export async function saveHostListingAction(
  input: HostListingInput,
): Promise<{ ok: boolean; id?: string }> {
  try {
    const operator = await getOrCreateOperator(input.title)
    if (!operator) return { ok: false }

    const categoryEnum = CATEGORY_TO_ENUM[input.category] ?? 'ART_CRAFT'
    const areaEnum = AREA_TO_ENUM[input.area] ?? 'UBUD'

    const data = {
      operatorId: operator.id,
      title: input.title,
      description: input.description || '',
      category: categoryEnum as any,
      area: areaEnum as any,
      price: input.price || 0,
      duration: input.duration || '',
      level: 'All levels',
      maxGuests: input.maxGuests || 8,
      images: input.imageUrl ? [input.imageUrl] : [],
      highlights: [],
      includes: input.includes,
      excludes: input.excludes,
      meetingPoint: input.meetingPoint || '',
      latitude: 0,
      longitude: 0,
      status: 'DRAFT' as any,
    }

    const existing = await prisma.experience.findUnique({ where: { slug: input.slug } })
    if (existing && existing.operatorId === operator.id) {
      const updated = await prisma.experience.update({
        where: { slug: input.slug },
        data: { ...data, status: existing.status === 'PENDING_REVIEW' ? 'PENDING_REVIEW' : 'DRAFT' as any },
      })
      return { ok: true, id: updated.id }
    }
    const created = await prisma.experience.create({ data: { slug: input.slug, ...data } })
    return { ok: true, id: created.id }
  } catch {
    return { ok: false }
  }
}

export async function submitHostListingAction(
  input: HostListingInput,
): Promise<{ ok: boolean; id?: string }> {
  try {
    const operator = await getOrCreateOperator(input.title)
    if (!operator) return { ok: false }

    const categoryEnum = CATEGORY_TO_ENUM[input.category] ?? 'ART_CRAFT'
    const areaEnum = AREA_TO_ENUM[input.area] ?? 'UBUD'

    const data = {
      operatorId: operator.id,
      title: input.title,
      description: input.description || '',
      category: categoryEnum as any,
      area: areaEnum as any,
      price: input.price || 0,
      duration: input.duration || '',
      level: 'All levels',
      maxGuests: input.maxGuests || 8,
      images: input.imageUrl ? [input.imageUrl] : [],
      highlights: [],
      includes: input.includes,
      excludes: input.excludes,
      meetingPoint: input.meetingPoint || '',
      latitude: 0,
      longitude: 0,
      status: 'PENDING_REVIEW' as any,
    }

    const existing = await prisma.experience.findUnique({ where: { slug: input.slug } })
    if (existing && existing.operatorId === operator.id) {
      const updated = await prisma.experience.update({ where: { slug: input.slug }, data })
      return { ok: true, id: updated.id }
    }
    const created = await prisma.experience.create({ data: { slug: input.slug, ...data } })
    return { ok: true, id: created.id }
  } catch {
    return { ok: false }
  }
}

export type PendingListing = {
  id: string
  slug: string
  title: string
  area: string
  category: string
  price: number
  duration: string
  hostName: string
  submittedAt: string
  image: string
}

export async function getPendingListingsAction(): Promise<PendingListing[]> {
  try {
    const rows = await prisma.experience.findMany({
      where: { status: 'PENDING_REVIEW' as any },
      include: { operator: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map(r => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      area: AREA_DISPLAY[String(r.area)] ?? String(r.area),
      category: String(r.category).replace('_', ' & ').replace('FOOD_DRINK', 'Culinary'),
      price: r.price,
      duration: r.duration,
      hostName: r.operator.user.name,
      submittedAt: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: (r.images as string[])[0] ?? '',
    }))
  } catch {
    return []
  }
}

export async function approveListingAction(id: string): Promise<{ ok: boolean }> {
  try {
    await prisma.experience.update({ where: { id }, data: { status: 'ACTIVE' as any } })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function rejectListingAction(id: string): Promise<{ ok: boolean }> {
  try {
    await prisma.experience.update({ where: { id }, data: { status: 'DRAFT' as any } })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// ── User data (profile + wishlist pages) ─────────────────────────────────────

export type UserData = {
  name: string
  email: string
  image: string | null
  wishlistSlugs: string[]
  bookings: {
    id: string
    title: string
    area: string
    date: string
    guests: number
    total: number
    status: string
    rating: number | null
    image: string
    slug: string
  }[]
  reviews: {
    experience: string
    slug: string
    date: string
    rating: number
    comment: string
    image: string
  }[]
}

export async function getUserData(): Promise<UserData | null> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return null

    const [fullUser, bookings, reviews] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { wishlistSlugs: true },
      }),
      prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          experience: { select: { title: true, area: true, images: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.findMany({
        where: { userId: user.id },
        include: {
          experience: { select: { title: true, slug: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const statusMap: Record<string, string> = {
      CONFIRMED: 'Upcoming',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      PENDING: 'Upcoming',
    }

    return {
      name: user.name,
      email: user.email,
      image: user.image,
      wishlistSlugs: fullUser?.wishlistSlugs ?? [],
      bookings: bookings.map(b => ({
        id: b.bookingRef,
        title: b.experience.title,
        area: AREA_DISPLAY[String(b.experience.area)] ?? String(b.experience.area),
        date: b.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        guests: b.guests,
        total: b.totalPrice,
        status: statusMap[String(b.status)] ?? 'Upcoming',
        rating: null,
        image: (b.experience.images as string[])[0] ?? '',
        slug: b.experience.slug,
      })),
      reviews: reviews.map(r => ({
        experience: r.experience.title,
        slug: r.experience.slug,
        date: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rating: r.rating,
        comment: r.comment,
        image: (r.experience.images as string[])[0] ?? '',
      })),
    }
  } catch {
    return null
  }
}
