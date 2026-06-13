'use server'

import { prisma } from './prisma'
import { getOrCreateNeonUser } from './user'
import { createSnapTransaction } from './midtrans'
import { SERVICE_FEE_RATE, computeBookingTotal } from './pricing'
import { createNotification } from './notifications'

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
  guestName: string
  guestEmail: string
  guestPhone?: string
}

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<{ ok: boolean; bookingRef?: string; snapToken?: string; error?: string }> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return { ok: false, error: 'Please sign in to complete your booking.' }

    const exp = await prisma.experience.findUnique({ where: { slug: input.slug } })
    if (!exp) return { ok: false, error: 'This experience is not available for online payment yet.' }

    // Price is computed server-side from the DB; client-supplied totals are never trusted
    const guests = Math.max(1, Math.min(exp.maxGuests, Math.trunc(input.guests) || 1))
    const totalPrice = computeBookingTotal(exp.price, guests)

    // Booking starts PENDING; the Midtrans webhook flips it to CONFIRMED on
    // settlement and sends the confirmation email at that point.
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        experienceId: exp.id,
        date: new Date(input.rawDate),
        guests,
        totalPrice,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone ?? null,
        status: 'PENDING',
      },
    })

    const snap = await createSnapTransaction({
      orderId: booking.bookingRef,
      grossAmount: totalPrice,
      customerName: input.guestName,
      customerEmail: input.guestEmail,
      customerPhone: input.guestPhone,
      itemName: exp.title,
    })
    if ('error' in snap) return { ok: false, error: snap.error }

    await createNotification({
      userId: user.id,
      type: 'booking',
      title: 'Booking received',
      body: `Your booking for ${exp.title} is awaiting payment.`,
      href: '/profile',
    })

    return { ok: true, bookingRef: booking.bookingRef, snapToken: snap.token }
  } catch {
    return { ok: false, error: 'Something went wrong. Please try again.' }
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
  'Wellness & Healing': 'WELLNESS',
  'Culture': 'CULTURE',
  'Culinary': 'FOOD_DRINK',
  'Cooking': 'COOKING',
  'Nature & Outdoors': 'NATURE',
  'Water Activities': 'SURF_WATER',
  'Spiritual': 'CULTURE',
  'Local Experts': 'LOCAL_EXPERTS',
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

// ── Checkout experience lookup ────────────────────────────────────────────────

export type ExpCheckoutMeta = { title: string; area: string; price: number; image: string; serviceFeeRate: number }

export async function getExperienceForCheckout(slug: string): Promise<ExpCheckoutMeta | null> {
  try {
    const exp = await prisma.experience.findUnique({
      where: { slug },
      select: { title: true, area: true, price: true, images: true },
    })
    if (!exp) return null
    return {
      title: exp.title,
      area: AREA_DISPLAY[String(exp.area)] ?? String(exp.area),
      price: exp.price,
      image: (exp.images as string[])[0] ?? '',
      serviceFeeRate: SERVICE_FEE_RATE,
    }
  } catch {
    return null
  }
}

// ── Wishlist experience details ───────────────────────────────────────────────

export type ExpWishlistMeta = {
  slug: string; title: string; area: string; price: number
  rating: number; totalReviews: number; category: string; duration: string; image: string
}

export async function getExperiencesForWishlist(slugs: string[]): Promise<ExpWishlistMeta[]> {
  if (!slugs.length) return []
  try {
    const exps = await prisma.experience.findMany({
      where: { slug: { in: slugs }, status: 'ACTIVE' as any },
      select: { slug: true, title: true, area: true, price: true, rating: true, totalReviews: true, category: true, duration: true, images: true },
    })
    return exps.map(e => ({
      slug: e.slug,
      title: e.title,
      area: AREA_DISPLAY[String(e.area)] ?? String(e.area),
      price: e.price,
      rating: e.rating,
      totalReviews: e.totalReviews,
      category: CATEGORY_DISPLAY[String(e.category)] ?? String(e.category),
      duration: e.duration,
      image: (e.images as string[])[0] ?? '',
    }))
  } catch {
    return []
  }
}

// ── Host dashboard data ───────────────────────────────────────────────────────

export type DashExp = {
  id: number; slug: string; title: string; category: string; area: string
  price: number; duration: string; maxGuests: number
  rating: number; totalReviews: number; bookings: number; status: string
  image: string; earnings: number
}

export type DashBooking = {
  id: string; ref: string; guest: string; email: string
  experience: string; expImage: string
  date: string; time: string; guests: number; total: number
  status: string; bookedOn: string
}

export type DashReview = { id: string; guest: string; experience: string; rating: number; comment: string; date: string }

export type HostDashboardData = {
  hostName: string
  experiences: DashExp[]
  bookings: DashBooking[]
  reviews: DashReview[]
}

export async function getHostDashboardData(): Promise<HostDashboardData | null> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return null

    const operator = await prisma.operator.findUnique({
      where: { userId: user.id },
      include: { user: { select: { name: true } } },
    })
    if (!operator) return null

    const [dbExps, dbBookings, dbReviews] = await Promise.all([
      prisma.experience.findMany({
        where: { operatorId: operator.id },
        include: { bookings: { select: { totalPrice: true } }, _count: { select: { bookings: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.booking.findMany({
        where: { experience: { operatorId: operator.id } },
        include: { experience: { select: { title: true, images: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.review.findMany({
        where: { experience: { operatorId: operator.id } },
        include: {
          user: { select: { name: true } },
          experience: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    const expStatusDisplay: Record<string, string> = {
      ACTIVE: 'Active', DRAFT: 'Draft', PENDING_REVIEW: 'Pending Review', PAUSED: 'Paused',
    }
    const bookingStatusDisplay: Record<string, string> = {
      CONFIRMED: 'Confirmed', PENDING: 'Pending', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
    }

    const experiences: DashExp[] = dbExps.map((e, i) => ({
      id: i + 1,
      slug: e.slug,
      title: e.title,
      category: CATEGORY_DISPLAY[String(e.category)] ?? String(e.category),
      area: AREA_DISPLAY[String(e.area)] ?? String(e.area),
      price: e.price,
      duration: e.duration,
      maxGuests: e.maxGuests,
      rating: e.rating,
      totalReviews: e.totalReviews,
      bookings: e._count.bookings,
      status: expStatusDisplay[String(e.status)] ?? 'Draft',
      image: (e.images as string[])[0] ?? '',
      earnings: (e.bookings as { totalPrice: number }[]).reduce((a, b) => a + b.totalPrice, 0),
    }))

    const bookings: DashBooking[] = dbBookings.map((b, i) => ({
      id: `B${String(i + 1).padStart(3, '0')}`,
      ref: b.bookingRef,
      guest: b.guestName,
      email: b.guestEmail,
      experience: b.experience.title,
      expImage: (b.experience.images as string[])[0] ?? '',
      date: b.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: '',
      guests: b.guests,
      total: b.totalPrice,
      status: bookingStatusDisplay[String(b.status)] ?? 'Confirmed',
      bookedOn: b.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))

    const reviews: DashReview[] = dbReviews.map((r, i) => ({
      id: `R${i + 1}`,
      guest: r.user.name,
      experience: r.experience.title,
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }))

    return { hostName: operator.user.name, experiences, bookings, reviews }
  } catch {
    return null
  }
}
