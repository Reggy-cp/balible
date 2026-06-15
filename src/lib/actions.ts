'use server'

import { prisma } from './prisma'
import { getSessionUser } from './user'
import { createSnapTransaction } from './midtrans'
import { SERVICE_FEE_RATE, computeBookingTotal } from './pricing'
import { createNotification } from './notifications'
import { STATIC_EXP_MAP } from './static-experiences'

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
  RENTALS: 'Rentals',
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function toggleWishlistAction(
  slug: string,
): Promise<{ ok: boolean; saved: boolean; wishlistSlugs: string[] }> {
  try {
    const user = await getSessionUser()
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
    const user = await getSessionUser()
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
  rawTime?: string
  guests: number
  guestName: string
  guestEmail: string
  guestPhone?: string
}

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<{ ok: boolean; bookingRef?: string; snapToken?: string; error?: string }> {
  try {
    const user = await getSessionUser()
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
        time: input.rawTime ?? null,
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
    const user = await getSessionUser()
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
  'Rentals': 'RENTALS',
}

const AREA_TO_ENUM: Record<string, string> = {
  'Ubud': 'UBUD', 'Canggu': 'CANGGU', 'Kuta': 'KUTA', 'Seminyak': 'SEMINYAK',
  'Uluwatu': 'ULUWATU', 'Gianyar': 'GIANYAR', 'Sanur': 'SANUR',
  'Nusa Dua': 'NUSA_DUA', 'Amed': 'AMED', 'Jimbaran': 'JIMBARAN',
  'Kintamani': 'KINTAMANI', 'Sidemen': 'SIDEMEN', 'Medewi': 'MEDEWI',
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
  const user = await getSessionUser()
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

// ── Host: status update, delete, experience list ──────────────────────────────

export async function updateExperienceStatusAction(
  slug: string,
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'PENDING_REVIEW',
): Promise<{ ok: boolean }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false }
    const operator = await prisma.operator.findUnique({ where: { userId: user.id } })
    if (!operator) return { ok: false }
    await prisma.experience.updateMany({
      where: { slug, operatorId: operator.id },
      data: { status: status as any },
    })
    return { ok: true }
  } catch { return { ok: false } }
}

export async function deleteExperienceAction(slug: string): Promise<{ ok: boolean }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false }
    const operator = await prisma.operator.findUnique({ where: { userId: user.id } })
    if (!operator) return { ok: false }
    await prisma.experience.deleteMany({ where: { slug, operatorId: operator.id } })
    return { ok: true }
  } catch { return { ok: false } }
}

export async function getHostExperiencesAction(): Promise<DashExp[] | null> {
  try {
    const user = await getSessionUser()
    if (!user) return null
    const operator = await prisma.operator.findUnique({ where: { userId: user.id } })
    if (!operator) return null
    const rows = await prisma.experience.findMany({
      where: { operatorId: operator.id },
      include: { bookings: { select: { totalPrice: true } }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'asc' },
    })
    const statusDisplay: Record<string, string> = { ACTIVE: 'Active', DRAFT: 'Draft', PENDING_REVIEW: 'Pending Review', PAUSED: 'Paused' }
    return rows.map((e, i) => ({
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
      status: statusDisplay[String(e.status)] ?? 'Draft',
      image: (e.images as string[])[0] ?? '',
      earnings: (e.bookings as { totalPrice: number }[]).reduce((a, b) => a + b.totalPrice, 0),
    }))
  } catch { return null }
}

// ── Admin: create experience ──────────────────────────────────────────────────

export type CreateExperienceInput = {
  title: string
  description: string
  category: string
  area: string
  price: number
  duration: string
  level: string
  language: string
  maxGuests: number
  meetingPoint: string
  latitude: number
  longitude: number
  images: string[]
  highlights: string[]
  includes: string[]
  excludes: string[]
  instantConfirm: boolean
  ecoLabel: boolean
  featured: boolean
  status: string
  operatorId: string
}

export async function createExperienceAction(
  data: CreateExperienceInput,
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  try {
    const base = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const existing = await prisma.experience.findUnique({ where: { slug: base } })
    const slug = existing ? `${base}-${Date.now()}` : base

    const exp = await prisma.experience.create({
      data: {
        slug,
        title: data.title,
        description: data.description,
        category: data.category as any,
        area: data.area as any,
        price: data.price,
        duration: data.duration,
        level: data.level,
        language: data.language || 'English',
        maxGuests: data.maxGuests,
        meetingPoint: data.meetingPoint,
        latitude: data.latitude,
        longitude: data.longitude,
        images: data.images,
        highlights: data.highlights,
        includes: data.includes,
        excludes: data.excludes,
        instantConfirm: data.instantConfirm,
        ecoLabel: data.ecoLabel,
        featured: data.featured,
        status: data.status as any,
        operatorId: data.operatorId,
      },
    })
    return { ok: true, slug: exp.slug }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Unknown error' }
  }
}

export async function getOperatorsAction(): Promise<
  { id: string; name: string; businessName: string }[]
> {
  try {
    const ops = await prisma.operator.findMany({
      select: { id: true, businessName: true, user: { select: { name: true } } },
      orderBy: { businessName: 'asc' },
    })
    return ops.map(o => ({ id: o.id, name: o.user.name, businessName: o.businessName }))
  } catch {
    return []
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
    duration: string
    meetingPoint: string
    includes: string[]
    latitude: number
    longitude: number
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
    const user = await getSessionUser()
    if (!user) return null

    const [fullUser, bookings, reviews] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { wishlistSlugs: true },
      }),
      prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          experience: { select: { title: true, area: true, images: true, slug: true, duration: true, meetingPoint: true, includes: true, latitude: true, longitude: true } },
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
      PENDING: 'Pending',
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
        rating: reviews.find(r => r.experienceId === b.experienceId)?.rating ?? null,
        image: (b.experience.images as string[])[0] ?? '',
        slug: b.experience.slug,
        duration: b.experience.duration,
        meetingPoint: b.experience.meetingPoint,
        includes: b.experience.includes as string[],
        latitude: b.experience.latitude,
        longitude: b.experience.longitude,
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

// ── Admin panel data ──────────────────────────────────────────────────────────

import { COMMISSION_RATE, PAYOUT_MIN_NET } from './constants'

async function getCommissionRate(): Promise<number> {
  try {
    const s = await prisma.setting.findUnique({ where: { key: 'commission_rate' } })
    if (!s) return COMMISSION_RATE
    const n = parseFloat(s.value)
    return isNaN(n) ? COMMISSION_RATE : n
  } catch { return COMMISSION_RATE }
}

export async function getCommissionRateAction(): Promise<number> {
  return getCommissionRate()
}

// ratePercent: percentage value, e.g. 10 for 10%
export async function updateCommissionRateAction(ratePercent: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user || (user as any).role !== 'ADMIN') return { ok: false, error: 'Unauthorized' }
    if (ratePercent < 0 || ratePercent >= 100) return { ok: false, error: 'Rate must be between 0 and 100' }
    await prisma.setting.upsert({
      where:  { key: 'commission_rate' },
      update: { value: String(ratePercent / 100) },
      create: { key: 'commission_rate', value: String(ratePercent / 100) },
    })
    return { ok: true }
  } catch (e: any) { return { ok: false, error: e.message } }
}

export type AdminStats = {
  totalUsers: number; totalExperiences: number; totalBookings: number
  totalRevenue: number; pendingListings: number; pendingHosts: number; activeHosts: number
}

export async function getAdminStatsAction(): Promise<AdminStats> {
  try {
    const [totalUsers, totalExperiences, totalBookings, rev, pendingListings, pendingHosts, activeHosts] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'ADMIN' as any } } }),
      prisma.experience.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { totalPrice: true } }),
      prisma.experience.count({ where: { status: 'PENDING_REVIEW' as any } }),
      prisma.operator.count({ where: { verified: false } }),
      prisma.operator.count({ where: { verified: true } }),
    ])
    return { totalUsers, totalExperiences, totalBookings, totalRevenue: rev._sum.totalPrice ?? 0, pendingListings, pendingHosts, activeHosts }
  } catch {
    return { totalUsers: 0, totalExperiences: 0, totalBookings: 0, totalRevenue: 0, pendingListings: 0, pendingHosts: 0, activeHosts: 0 }
  }
}

export type AdminExp = {
  id: string; slug: string; title: string; host: string
  area: string; category: string; price: number
  rating: number; reviews: number; bookings: number; status: string; image: string
}

export async function getAdminExperiencesAction(): Promise<AdminExp[]> {
  try {
    const rows = await prisma.experience.findMany({
      include: {
        operator: { include: { user: { select: { name: true } } } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    const statusDisplay: Record<string, string> = { ACTIVE: 'Active', DRAFT: 'Draft', PENDING_REVIEW: 'Pending Review', PAUSED: 'Paused' }
    return rows.map(r => ({
      id: r.id, slug: r.slug, title: r.title,
      host: r.operator.user.name,
      area: AREA_DISPLAY[String(r.area)] ?? String(r.area),
      category: CATEGORY_DISPLAY[String(r.category)] ?? String(r.category),
      price: r.price, rating: r.rating, reviews: r.totalReviews, bookings: r._count.bookings,
      status: statusDisplay[String(r.status)] ?? 'Draft',
      image: (r.images as string[])[0] ?? '',
    }))
  } catch { return [] }
}

export async function adminUpdateExperienceStatusAction(id: string, status: string): Promise<{ ok: boolean }> {
  try { await prisma.experience.update({ where: { id }, data: { status: status as any } }); return { ok: true } }
  catch { return { ok: false } }
}

export type AdminHost = {
  id: string; name: string; business: string; area: string
  experiences: number; totalBookings: number; totalEarnings: number
  rating: number; totalReviews: number; status: string; joined: string
  avatar: string | null
  description: string
  payoutBank: string; payoutAccountNumber: string; payoutAccountName: string
}

export async function getAdminHostsAction(): Promise<AdminHost[]> {
  try {
    const rows = await prisma.operator.findMany({
      include: {
        user: { select: { name: true, createdAt: true } },
        experiences: {
          include: { _count: { select: { bookings: true } }, bookings: { select: { totalPrice: true } } },
        },
      },
      orderBy: { user: { createdAt: 'asc' } },
    })
    return rows.map(r => {
      const totalBookings = r.experiences.reduce((a, e) => a + e._count.bookings, 0)
      const totalEarnings = r.experiences.reduce((a, e) => a + (e.bookings as { totalPrice: number }[]).reduce((s, b) => s + b.totalPrice, 0), 0)
      const area = r.experiences[0]?.area ? (AREA_DISPLAY[String(r.experiences[0].area)] ?? String(r.experiences[0].area)) : '—'
      return {
        id: r.id, name: r.user.name, business: r.businessName, area,
        experiences: r.experiences.length, totalBookings, totalEarnings,
        rating: r.rating, totalReviews: r.totalReviews, status: r.verified ? 'Verified' : 'Pending',
        joined: r.user.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        avatar: r.avatar ?? null,
        description: r.description,
        payoutBank: r.payoutBank ?? '', payoutAccountNumber: r.payoutAccountNumber ?? '', payoutAccountName: r.payoutAccountName ?? '',
      }
    })
  } catch { return [] }
}

export async function approveHostAction(id: string): Promise<{ ok: boolean }> {
  try { await prisma.operator.update({ where: { id }, data: { verified: true } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function suspendHostAction(id: string): Promise<{ ok: boolean }> {
  try { await prisma.operator.update({ where: { id }, data: { verified: false } }); return { ok: true } }
  catch { return { ok: false } }
}

export type AdminBooking = {
  id: string; ref: string; guest: string; email: string; phone: string
  experience: string; host: string; hostEmail: string
  date: string; bookedOn: string
  guests: number; total: number; commission: number; hostPayout: number
  status: string; paymentId: string
}

export async function getAdminBookingsAction(): Promise<AdminBooking[]> {
  try {
    const rows = await prisma.booking.findMany({
      include: {
        experience: { include: { operator: { include: { user: { select: { name: true, email: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    const statusDisplay: Record<string, string> = { CONFIRMED: 'Confirmed', PENDING: 'Pending', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }
    return rows.map((b, i) => {
      const commission = Math.round(b.totalPrice * COMMISSION_RATE)
      return {
        id: `B${String(i + 1).padStart(3, '0')}`,
        ref: b.bookingRef,
        guest: b.guestName, email: b.guestEmail, phone: b.guestPhone ?? '',
        experience: b.experience.title,
        host: b.experience.operator.user.name,
        hostEmail: b.experience.operator.user.email ?? '',
        date: b.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        bookedOn: b.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        guests: b.guests, total: b.totalPrice,
        commission, hostPayout: b.totalPrice - commission,
        status: statusDisplay[String(b.status)] ?? 'Pending',
        paymentId: b.paymentId ?? '',
      }
    })
  } catch { return [] }
}

export async function adminUpdateBookingStatusAction(ref: string, status: string): Promise<{ ok: boolean }> {
  try { await prisma.booking.update({ where: { bookingRef: ref }, data: { status: status as any } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminCompleteBookingAction(ref: string): Promise<{ ok: boolean }> {
  try { await prisma.booking.update({ where: { bookingRef: ref }, data: { status: 'COMPLETED' } }); return { ok: true } }
  catch { return { ok: false } }
}

export type AdminUser = {
  id: string; name: string; email: string; role: string
  bookings: number; totalSpend: number; joined: string; status: string
}

export async function getAdminUsersAction(): Promise<AdminUser[]> {
  try {
    const rows = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' as any } },
      include: { bookings: { select: { totalPrice: true } }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(u => ({
      id: u.id, name: u.name, email: u.email, role: String(u.role),
      bookings: u._count.bookings,
      totalSpend: (u.bookings as { totalPrice: number }[]).reduce((a, b) => a + b.totalPrice, 0),
      joined: u.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: u.emailVerified ? 'Active' : 'Unverified',
    }))
  } catch { return [] }
}

export type AdminReview = {
  id: string; guest: string; experience: string; host: string
  rating: number; comment: string; date: string; status: string; hidden: boolean
}

export async function getAdminReviewsAction(): Promise<AdminReview[]> {
  try {
    const rows = await prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        experience: { include: { operator: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(r => ({
      id: r.id, guest: r.user.name, experience: r.experience.title,
      host: r.experience.operator.user.name,
      rating: r.rating, comment: r.comment,
      date: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: r.hidden ? 'Hidden' : r.flagged ? 'Flagged' : 'Published',
      hidden: r.hidden,
    }))
  } catch { return [] }
}

export async function adminDeleteReviewAction(id: string): Promise<{ ok: boolean }> {
  try { await prisma.review.delete({ where: { id } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminApproveReviewAction(id: string): Promise<{ ok: boolean }> {
  try { await prisma.review.update({ where: { id }, data: { flagged: false, hidden: false } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminFlagReviewAction(id: string): Promise<{ ok: boolean }> {
  try { await prisma.review.update({ where: { id }, data: { flagged: true } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminHideReviewAction(id: string): Promise<{ ok: boolean }> {
  try { await prisma.review.update({ where: { id }, data: { hidden: true, flagged: false } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminDeleteExperienceAction(id: string): Promise<{ ok: boolean }> {
  try { await prisma.experience.delete({ where: { id } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminUpdateUserAction(id: string, data: { name: string; email: string; role: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.user.update({ where: { id }, data: { name: data.name, email: data.email, role: data.role as any } })
    return { ok: true }
  } catch (e: any) { return { ok: false, error: e.message } }
}

export async function adminUpdateHostAction(id: string, data: { businessName: string; description: string; payoutBank: string; payoutAccountNumber: string; payoutAccountName: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.operator.update({ where: { id }, data })
    return { ok: true }
  } catch (e: any) { return { ok: false, error: e.message } }
}

export type AdminAnalytics = {
  topExperiences: { title: string; bookings: number }[]
  monthlyBookings: number[]
  monthlyRevenue: number[]
  months: string[]
  categoryDist: { name: string; pct: number; color: string }[]
  avgBookingValue: number
  avgRating: number
}

export async function getAdminAnalyticsAction(): Promise<AdminAnalytics> {
  try {
    const now = new Date()
    const months: string[] = []
    const monthlyBookings: number[] = []
    const monthlyRevenue: number[] = []

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(d.toLocaleString('en-US', { month: 'short' }))
      const start = d
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const [count, rev] = await Promise.all([
        prisma.booking.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { createdAt: { gte: start, lt: end } } }),
      ])
      monthlyBookings.push(count)
      monthlyRevenue.push(rev._sum.totalPrice ?? 0)
    }

    const exps = await prisma.experience.findMany({
      include: { _count: { select: { bookings: true } } },
      orderBy: { totalReviews: 'desc' },
    })
    const topExperiences = [...exps]
      .sort((a, b) => b._count.bookings - a._count.bookings)
      .slice(0, 5)
      .map(e => ({ title: e.title, bookings: e._count.bookings }))

    const catColors: Record<string, string> = {
      WELLNESS: '#4A7C59', ART_CRAFT: '#C8A97E', CULTURE: '#B66A45',
      NATURE: '#6F675C', FOOD_DRINK: '#111111', SURF_WATER: '#3B82F6',
      DIVING: '#0EA5E9', COOKING: '#D97706', LOCAL_EXPERTS: '#8B5CF6', RENTALS: '#EC4899',
    }
    const catCounts = exps.reduce((acc, e) => {
      const k = String(e.category)
      acc[k] = (acc[k] ?? 0) + e._count.bookings
      return acc
    }, {} as Record<string, number>)
    const totalCatBookings = Object.values(catCounts).reduce((a, b) => a + b, 0) || 1
    const categoryDist = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat, count]) => ({
        name: CATEGORY_DISPLAY[cat] ?? cat,
        pct: Math.round((count / totalCatBookings) * 100),
        color: catColors[cat] ?? '#9E9A94',
      }))

    const totalBookings = monthlyBookings.reduce((a, b) => a + b, 0)
    const totalRevenue  = monthlyRevenue.reduce((a, b) => a + b, 0)
    const avgRating     = exps.length ? exps.reduce((a, e) => a + e.rating, 0) / exps.length : 0

    return {
      topExperiences, monthlyBookings, monthlyRevenue, months, categoryDist,
      avgBookingValue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
      avgRating: Math.round(avgRating * 100) / 100,
    }
  } catch {
    return { topExperiences: [], monthlyBookings: Array(12).fill(0), monthlyRevenue: Array(12).fill(0), months: [], categoryDist: [], avgBookingValue: 0, avgRating: 0 }
  }
}

export type AdminEvent = {
  id: string; slug: string; title: string; host: string
  date: string; location: string; price: number; capacity: number; status: string
}

export async function getAdminEventsAction(): Promise<AdminEvent[]> {
  try {
    const rows = await prisma.event.findMany({
      include: { operator: { include: { user: { select: { name: true } } } } },
      orderBy: { date: 'asc' },
    })
    const statusDisplay: Record<string, string> = { DRAFT: 'Draft', PUBLISHED: 'Published', CANCELLED: 'Cancelled' }
    return rows.map(e => ({
      id: e.id, slug: e.slug, title: e.title,
      host: e.operator.user.name,
      date: e.date.toISOString(),
      location: e.location, price: e.price, capacity: e.capacity,
      status: statusDisplay[String(e.status)] ?? 'Draft',
    }))
  } catch { return [] }
}

export async function adminUpdateEventStatusAction(id: string, status: string): Promise<{ ok: boolean }> {
  try { await prisma.event.update({ where: { id }, data: { status: status as any } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminDeleteEventAction(id: string): Promise<{ ok: boolean }> {
  try { await prisma.event.delete({ where: { id } }); return { ok: true } }
  catch { return { ok: false } }
}

// ── Checkout experience lookup ────────────────────────────────────────────────

export type ExpCheckoutMeta = { title: string; area: string; price: number; image: string; serviceFeeRate: number; meetingPoint: string }

export async function getExperienceForCheckout(slug: string): Promise<ExpCheckoutMeta | null> {
  try {
    const exp = await prisma.experience.findUnique({
      where: { slug },
      select: { title: true, area: true, price: true, images: true, meetingPoint: true },
    })
    if (!exp) return null
    return {
      title: exp.title,
      area: AREA_DISPLAY[String(exp.area)] ?? String(exp.area),
      price: exp.price,
      image: (exp.images as string[])[0] ?? '',
      serviceFeeRate: SERVICE_FEE_RATE,
      meetingPoint: exp.meetingPoint ?? '',
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
    const dbResults: ExpWishlistMeta[] = exps.map(e => ({
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
    const dbSlugs = new Set(exps.map(e => e.slug))
    const staticResults = slugs
      .filter(s => !dbSlugs.has(s))
      .map(s => STATIC_EXP_MAP.get(s))
      .filter((e): e is ExpWishlistMeta => e !== undefined)
    return [...dbResults, ...staticResults]
  } catch {
    return slugs.map(s => STATIC_EXP_MAP.get(s)).filter((e): e is ExpWishlistMeta => e !== undefined)
  }
}

export async function submitReviewAction(slug: string, rating: number, comment: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Not signed in' }
    const exp = await prisma.experience.findUnique({ where: { slug }, select: { id: true } })
    if (!exp) return { ok: false, error: 'Experience not found' }
    const existing = await prisma.review.findFirst({ where: { userId: user.id, experienceId: exp.id } })
    if (existing) return { ok: false, error: 'You have already reviewed this experience' }
    await prisma.review.create({ data: { userId: user.id, experienceId: exp.id, rating, comment } })
    const allRatings = await prisma.review.findMany({ where: { experienceId: exp.id }, select: { rating: true } })
    const avg = allRatings.reduce((a, r) => a + r.rating, 0) / allRatings.length
    await prisma.experience.update({
      where: { id: exp.id },
      data: { rating: Math.round(avg * 10) / 10, totalReviews: allRatings.length },
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Failed to submit review' }
  }
}

export async function getExperienceMetaForModal(slug: string): Promise<{
  meetingPoint: string | null
  duration: string | null
  includes: string[]
} | null> {
  try {
    const exp = await prisma.experience.findUnique({
      where: { slug },
      select: { meetingPoint: true, duration: true, includes: true },
    })
    if (!exp) return null
    return {
      meetingPoint: exp.meetingPoint ?? null,
      duration: exp.duration ?? null,
      includes: (exp.includes as string[]) ?? [],
    }
  } catch {
    return null
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

export type EarningsByMonth = { month: string; gross: number }

export type HostDashboardData = {
  hostName: string
  commissionRate: number
  experiences: DashExp[]
  bookings: DashBooking[]
  reviews: DashReview[]
  earningsByMonth: EarningsByMonth[]
  totalGross: number
  pendingPayout: number
}

export async function getHostDashboardData(): Promise<HostDashboardData | null> {
  try {
    const user = await getSessionUser()
    if (!user) return null

    const operator = await prisma.operator.findUnique({
      where: { userId: user.id },
      include: { user: { select: { name: true } } },
    })
    if (!operator) return null

    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    const [dbExps, dbBookings, dbReviews, earnedBookings, allEarnedBookings, paidPayouts, commRateDecimal] = await Promise.all([
      prisma.experience.findMany({
        where: { operatorId: operator.id },
        include: {
          bookings: {
            where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
            select: { totalPrice: true },
          },
          _count: { select: { bookings: true } },
        },
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
      // Last 12 months for chart
      prisma.booking.findMany({
        where: {
          experience: { operatorId: operator.id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          createdAt: { gte: twelveMonthsAgo },
        },
        select: { totalPrice: true, createdAt: true },
      }),
      // All time confirmed/completed for pendingPayout calculation
      prisma.booking.findMany({
        where: {
          experience: { operatorId: operator.id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        select: { totalPrice: true },
      }),
      // Already-paid payouts to subtract
      prisma.payout.findMany({
        where: { operatorId: operator.id, status: 'PAID' as any },
        select: { gross: true },
      }),
      getCommissionRate(),
    ])

    // 12-month rolling earnings breakdown
    const earningsByMonth: EarningsByMonth[] = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const gross = earnedBookings
        .filter(b => b.createdAt.getFullYear() === d.getFullYear() && b.createdAt.getMonth() === d.getMonth())
        .reduce((a, b) => a + b.totalPrice, 0)
      return { month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), gross }
    })

    const totalGross   = earnedBookings.reduce((a, b) => a + b.totalPrice, 0)
    const totalEarned  = allEarnedBookings.reduce((a, b) => a + b.totalPrice, 0)
    const totalPaid    = paidPayouts.reduce((a, p) => a + p.gross, 0)
    const pendingPayout = Math.max(0, totalEarned - totalPaid)

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

    return { hostName: operator.user.name, commissionRate: Math.round(commRateDecimal * 100), experiences, bookings, reviews, earningsByMonth, totalGross, pendingPayout }
  } catch {
    return null
  }
}

// ── GA-style analytics ────────────────────────────────────────────────────────

export type AnalyticsMetric = { value: number; change: number }

export type AnalyticsData = {
  metrics: {
    bookings: AnalyticsMetric
    revenue: AnalyticsMetric
    newUsers: AnalyticsMetric
    newHosts: AnalyticsMetric
    avgBookingValue: AnalyticsMetric
    cancelRate: AnalyticsMetric
  }
  bookingTrend: { label: string; current: number; prev: number }[]
  revenueTrend:  { label: string; current: number; prev: number }[]
  userGrowth:    { label: string; count: number }[]
  topExperiences: { title: string; bookings: number; revenue: number; rating: number; area: string; category: string }[]
  categoryBreakdown: { name: string; bookings: number; revenue: number; pct: number; color: string }[]
  areaBreakdown:  { name: string; bookings: number; revenue: number }[]
  topHosts:       { name: string; business: string; bookings: number; revenue: number; rating: number }[]
  bookingStatus:  { status: string; count: number; color: string }[]
}

const CAT_COLORS: Record<string, string> = {
  WELLNESS: '#4A7C59', ART_CRAFT: '#C8A97E', CULTURE: '#B66A45',
  NATURE: '#6F675C', FOOD_DRINK: '#111111', SURF_WATER: '#3B82F6',
  DIVING: '#0EA5E9', COOKING: '#D97706', LOCAL_EXPERTS: '#8B5CF6', RENTALS: '#EC4899',
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#4A7C59', PENDING: '#C8A97E', COMPLETED: '#4B6CB7', CANCELLED: '#B66A45',
}

export async function getAnalyticsDataAction(days: number): Promise<AnalyticsData> {
  const empty: AnalyticsData = {
    metrics: { bookings: { value: 0, change: 0 }, revenue: { value: 0, change: 0 }, newUsers: { value: 0, change: 0 }, newHosts: { value: 0, change: 0 }, avgBookingValue: { value: 0, change: 0 }, cancelRate: { value: 0, change: 0 } },
    bookingTrend: [], revenueTrend: [], userGrowth: [],
    topExperiences: [], categoryBreakdown: [], areaBreakdown: [], topHosts: [], bookingStatus: [],
  }
  try {
    const now = new Date()
    const periodStart = new Date(now.getTime() - days * 86400000)
    const prevStart   = new Date(periodStart.getTime() - days * 86400000)
    const pct = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

    // ── Bookings (both periods in one query) ──────────────────────────────────
    const allBookings = await prisma.booking.findMany({
      where: { createdAt: { gte: prevStart } },
      include: {
        experience: {
          select: {
            category: true, area: true, title: true, rating: true,
            operator: { select: { businessName: true, user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    const curr = allBookings.filter(b => b.createdAt >= periodStart)
    const prev = allBookings.filter(b => b.createdAt < periodStart)

    const currRev  = curr.reduce((a, b) => a + b.totalPrice, 0)
    const prevRev  = prev.reduce((a, b) => a + b.totalPrice, 0)
    const currAvg  = curr.length ? Math.round(currRev / curr.length) : 0
    const prevAvg  = prev.length ? Math.round(prevRev / prev.length) : 0
    const currCancel = curr.length ? Math.round((curr.filter(b => b.status === 'CANCELLED').length / curr.length) * 100) : 0
    const prevCancel = prev.length ? Math.round((prev.filter(b => b.status === 'CANCELLED').length / prev.length) * 100) : 0

    // ── Users ─────────────────────────────────────────────────────────────────
    const allUsers = await prisma.user.findMany({
      where: { createdAt: { gte: prevStart } },
      select: { createdAt: true, role: true },
    })
    const currUsers = allUsers.filter(u => u.createdAt >= periodStart).length
    const prevUsers = allUsers.filter(u => u.createdAt < periodStart).length

    // ── Hosts ─────────────────────────────────────────────────────────────────
    const allOps = await prisma.operator.findMany({
      where: { user: { createdAt: { gte: prevStart } } },
      include: { user: { select: { createdAt: true } } },
    })
    const currHosts = allOps.filter(o => o.user.createdAt >= periodStart).length
    const prevHosts = allOps.filter(o => o.user.createdAt < periodStart).length

    // ── Trend buckets ─────────────────────────────────────────────────────────
    const bucketMs  = days <= 30 ? 86400000 : days <= 90 ? 7 * 86400000 : 30 * 86400000
    const numBuckets = days <= 30 ? days : days <= 90 ? 13 : 12
    const fmtLabel  = (d: Date) => days <= 30
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : days <= 90
        ? `W${Math.ceil(((d.getTime() - periodStart.getTime()) / 86400000 + 1) / 7)}`
        : d.toLocaleDateString('en-US', { month: 'short' })

    const bookingTrend: AnalyticsData['bookingTrend'] = []
    const revenueTrend:  AnalyticsData['revenueTrend']  = []
    const userGrowth:    AnalyticsData['userGrowth']    = []

    for (let i = 0; i < numBuckets; i++) {
      const bs  = new Date(periodStart.getTime() + i * bucketMs)
      const be  = new Date(bs.getTime() + bucketMs)
      const pbs = new Date(prevStart.getTime()   + i * bucketMs)
      const pbe = new Date(pbs.getTime() + bucketMs)
      const cB  = curr.filter(b => b.createdAt >= bs && b.createdAt < be)
      const pB  = prev.filter(b => b.createdAt >= pbs && b.createdAt < pbe)
      const label = fmtLabel(bs)
      bookingTrend.push({ label, current: cB.length,   prev: pB.length })
      revenueTrend.push({ label, current: cB.reduce((a, b) => a + b.totalPrice, 0), prev: pB.reduce((a, b) => a + b.totalPrice, 0) })
      userGrowth.push({ label, count: allUsers.filter(u => u.createdAt >= bs && u.createdAt < be).length })
    }

    // ── Top experiences ───────────────────────────────────────────────────────
    const expMap = new Map<string, AnalyticsData['topExperiences'][0]>()
    for (const b of curr) {
      const key = b.experience.title
      const e = expMap.get(key) ?? { title: b.experience.title, bookings: 0, revenue: 0, rating: b.experience.rating, area: AREA_DISPLAY[String(b.experience.area)] ?? String(b.experience.area), category: CATEGORY_DISPLAY[String(b.experience.category)] ?? String(b.experience.category) }
      e.bookings++; e.revenue += b.totalPrice
      expMap.set(key, e)
    }
    const topExperiences = Array.from(expMap.values()).sort((a, b) => b.bookings - a.bookings).slice(0, 10)

    // ── Category breakdown ────────────────────────────────────────────────────
    const catMap = new Map<string, { bookings: number; revenue: number }>()
    for (const b of curr) {
      const k = String(b.experience.category)
      const e = catMap.get(k) ?? { bookings: 0, revenue: 0 }
      e.bookings++; e.revenue += b.totalPrice; catMap.set(k, e)
    }
    const totalCatB = Array.from(catMap.values()).reduce((a, b) => a + b.bookings, 0) || 1
    const categoryBreakdown = Array.from(catMap.entries()).sort((a, b) => b[1].bookings - a[1].bookings)
      .map(([cat, d]) => ({ name: CATEGORY_DISPLAY[cat] ?? cat, ...d, pct: Math.round((d.bookings / totalCatB) * 100), color: CAT_COLORS[cat] ?? '#9E9A94' }))

    // ── Area breakdown ────────────────────────────────────────────────────────
    const areaMap = new Map<string, { bookings: number; revenue: number }>()
    for (const b of curr) {
      const k = AREA_DISPLAY[String(b.experience.area)] ?? String(b.experience.area)
      const e = areaMap.get(k) ?? { bookings: 0, revenue: 0 }
      e.bookings++; e.revenue += b.totalPrice; areaMap.set(k, e)
    }
    const areaBreakdown = Array.from(areaMap.entries()).sort((a, b) => b[1].bookings - a[1].bookings).map(([name, d]) => ({ name, ...d }))

    // ── Top hosts ─────────────────────────────────────────────────────────────
    const hostMap = new Map<string, AnalyticsData['topHosts'][0]>()
    for (const b of curr) {
      const k = b.experience.operator.businessName
      const h = hostMap.get(k) ?? { name: b.experience.operator.user.name, business: b.experience.operator.businessName, bookings: 0, revenue: 0, rating: 0 }
      h.bookings++; h.revenue += b.totalPrice; hostMap.set(k, h)
    }
    const topHosts = Array.from(hostMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10)

    // ── Booking status ────────────────────────────────────────────────────────
    const statusMap = new Map<string, number>()
    for (const b of curr) { const s = String(b.status); statusMap.set(s, (statusMap.get(s) ?? 0) + 1) }
    const bookingStatus = Array.from(statusMap.entries()).map(([s, count]) => ({
      status: s.charAt(0) + s.slice(1).toLowerCase(), count, color: STATUS_COLORS[s] ?? '#9E9A94',
    }))

    return {
      metrics: {
        bookings:       { value: curr.length, change: pct(curr.length, prev.length) },
        revenue:        { value: currRev,     change: pct(currRev, prevRev) },
        newUsers:       { value: currUsers,   change: pct(currUsers, prevUsers) },
        newHosts:       { value: currHosts,   change: pct(currHosts, prevHosts) },
        avgBookingValue: { value: currAvg,    change: pct(currAvg, prevAvg) },
        cancelRate:     { value: currCancel,  change: pct(prevCancel, currCancel) },
      },
      bookingTrend, revenueTrend, userGrowth,
      topExperiences, categoryBreakdown, areaBreakdown, topHosts, bookingStatus,
    }
  } catch { return empty }
}

// ── Newsletter subscribers ────────────────────────────────────────────────────

export type NewsletterSub = { id: string; email: string; source: string; joinedAt: string }

export async function getNewsletterSubscribersAction(): Promise<NewsletterSub[]> {
  try {
    const rows = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } })
    return rows.map(r => ({
      id: r.id, email: r.email, source: r.source,
      joinedAt: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }))
  } catch { return [] }
}

export async function deleteNewsletterSubAction(id: string): Promise<{ ok: boolean }> {
  try { await prisma.newsletterSubscriber.delete({ where: { id } }); return { ok: true } }
  catch { return { ok: false } }
}

// ── Real payments (booking aggregates per operator) ───────────────────────────

export type AdminRealPayout = {
  key: string; operatorId: string; name: string; business: string
  bookings: number; gross: number; commission: number; net: number
  period: string; periodLabel: string
}

export async function getAdminRealPayoutsAction(): Promise<AdminRealPayout[]> {
  try {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

    const [commissionRate, bookings] = await Promise.all([
      getCommissionRate(),
      prisma.booking.findMany({
        where: { status: { in: ['CONFIRMED' as any, 'COMPLETED' as any] }, date: { gte: twoMonthsAgo } },
        include: {
          experience: {
            include: { operator: { include: { user: { select: { name: true } } } } },
          },
        },
      }),
    ])

    const map = new Map<string, AdminRealPayout>()
    for (const b of bookings) {
      const op = b.experience.operator
      const month = b.date.toISOString().slice(0, 7)
      const key = `${op.id}:${month}`
      const existing = map.get(key) ?? {
        key, operatorId: op.id, name: op.user.name, business: op.businessName,
        bookings: 0, gross: 0, commission: 0, net: 0,
        period: month,
        periodLabel: b.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      }
      existing.bookings++
      existing.gross += b.totalPrice
      existing.commission = Math.round(existing.gross * COMMISSION_RATE)
      existing.net = existing.gross - existing.commission
      map.set(key, existing)
    }

    return Array.from(map.values()).sort((a, b) => b.period.localeCompare(a.period))
  } catch { return [] }
}

// ── Payout DB actions ─────────────────────────────────────────────────────────

export type AdminPayout = {
  id: string; operatorId: string; name: string; business: string
  periodStart: string; periodEnd: string; periodLabel: string
  gross: number; commission: number; net: number; bookings: number
  status: string; paidAt: string | null; notes: string
}

export async function adminMarkPayoutPaidAction(input: {
  operatorId: string; periodStart: string; periodEnd: string
  gross: number; commission: number; net: number; bookings: number
}): Promise<{ ok: boolean; id?: string }> {
  try {
    const payout = await prisma.payout.upsert({
      where: {
        operatorId_periodStart_periodEnd: {
          operatorId: input.operatorId,
          periodStart: new Date(input.periodStart),
          periodEnd: new Date(input.periodEnd),
        },
      },
      update: { status: 'PAID', paidAt: new Date(), gross: input.gross, commission: input.commission, net: input.net, bookings: input.bookings },
      create: {
        operatorId: input.operatorId,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
        gross: input.gross, commission: input.commission, net: input.net, bookings: input.bookings,
        status: 'PAID', paidAt: new Date(),
      },
    })
    return { ok: true, id: payout.id }
  } catch { return { ok: false } }
}

export async function getAdminPayoutsAction(): Promise<AdminPayout[]> {
  try {
    const rows = await prisma.payout.findMany({
      include: { operator: { include: { user: { select: { name: true } } } } },
      orderBy: { periodStart: 'desc' },
    })
    return rows.map(p => ({
      id: p.id,
      operatorId: p.operatorId,
      name: p.operator.user.name,
      business: p.operator.businessName,
      periodStart: p.periodStart.toISOString(),
      periodEnd: p.periodEnd.toISOString(),
      periodLabel: p.periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      gross: p.gross, commission: p.commission, net: p.net, bookings: p.bookings,
      status: p.status === 'PAID' ? 'Paid' : p.status === 'REQUESTED' ? 'Requested' : 'Pending',
      paidAt: p.paidAt ? p.paidAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
      notes: p.notes ?? '',
    }))
  } catch { return [] }
}

export type OperatorPayout = {
  id: string; periodLabel: string; gross: number; commission: number; net: number
  bookings: number; status: string; paidAt: string | null
}

export async function getOperatorPayoutsAction(): Promise<OperatorPayout[]> {
  try {
    const user = await getSessionUser()
    if (!user) return []
    const operator = await prisma.operator.findUnique({ where: { userId: user.id } })
    if (!operator) return []
    const rows = await prisma.payout.findMany({
      where: { operatorId: operator.id },
      orderBy: { periodStart: 'desc' },
    })
    return rows.map(p => ({
      id: p.id,
      periodLabel: p.periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      gross: p.gross, commission: p.commission, net: p.net, bookings: p.bookings,
      status: p.status === 'PAID' ? 'Paid' : p.status === 'REQUESTED' ? 'Requested' : 'Pending',
      paidAt: p.paidAt ? p.paidAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
    }))
  } catch { return [] }
}

// requestedNet: the net amount the host wants to receive (after commission)
export async function requestPayoutAction(requestedNet: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Not signed in' }
    const operator = await prisma.operator.findUnique({ where: { userId: user.id } })
    if (!operator) return { ok: false, error: 'No operator account' }

    const now = new Date()
    const y = now.getUTCFullYear(), m = now.getUTCMonth()
    const periodStart = new Date(Date.UTC(y, m, 1))
    const periodEnd   = new Date(Date.UTC(y, m + 1, 1))

    const existing = await prisma.payout.findUnique({
      where: { operatorId_periodStart_periodEnd: { operatorId: operator.id, periodStart, periodEnd } },
    })
    if ((existing?.status as string) === 'PAID')      return { ok: false, error: 'This period is already paid.' }
    if ((existing?.status as string) === 'REQUESTED') return { ok: false, error: 'Payout already requested.' }

    const [commissionRate, allBookings, paidPayouts] = await Promise.all([
      getCommissionRate(),
      prisma.booking.findMany({
        where: {
          experience: { operatorId: operator.id },
          status: { in: ['CONFIRMED', 'COMPLETED'] as any },
        },
        select: { totalPrice: true },
      }),
      prisma.payout.findMany({
        where: { operatorId: operator.id, status: 'PAID' as any },
        select: { gross: true },
      }),
    ])

    const totalEarned    = allBookings.reduce((a, b) => a + b.totalPrice, 0)
    const totalPaid      = paidPayouts.reduce((a, p) => a + p.gross, 0)
    const outstandingNet = Math.round((totalEarned - totalPaid) * (1 - commissionRate))

    if (outstandingNet <= 0) return { ok: false, error: 'No outstanding earnings to pay out.' }
    if (requestedNet < PAYOUT_MIN_NET) {
      return { ok: false, error: `Minimum payout is IDR ${PAYOUT_MIN_NET.toLocaleString()}.` }
    }
    if (requestedNet > outstandingNet) {
      return { ok: false, error: `Maximum payout is IDR ${outstandingNet.toLocaleString()} (your outstanding net).` }
    }

    // Back-calculate gross from the requested net
    const gross      = Math.round(requestedNet / (1 - commissionRate))
    const commission = gross - requestedNet
    const net        = requestedNet

    await prisma.payout.upsert({
      where: { operatorId_periodStart_periodEnd: { operatorId: operator.id, periodStart, periodEnd } },
      update: { status: 'REQUESTED' as any, gross, commission, net, bookings: allBookings.length },
      create: { operatorId: operator.id, periodStart, periodEnd, gross, commission, net, bookings: allBookings.length, status: 'REQUESTED' as any },
    })
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

// ── Booking management ───────────────────────────────────────────────────────

export async function updateBookingStatusAction(
  bookingRef: string,
  status: 'CONFIRMED' | 'CANCELLED',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Not signed in' }

    const operator = await prisma.operator.findUnique({ where: { userId: user.id } })
    if (!operator) return { ok: false, error: 'Not an operator' }

    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: { experience: { select: { operatorId: true } } },
    })
    if (!booking) return { ok: false, error: 'Booking not found' }
    if (booking.experience.operatorId !== operator.id) return { ok: false, error: 'Unauthorised' }

    await prisma.booking.update({ where: { bookingRef }, data: { status } })
    return { ok: true }
  } catch (err) {
    console.error('[updateBookingStatus]', err)
    return { ok: false, error: 'Something went wrong.' }
  }
}

export async function getBookingStatusAction(bookingRef: string): Promise<{ status: string } | null> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      select: { status: true },
    })
    return booking ? { status: String(booking.status) } : null
  } catch { return null }
}

export async function cancelBookingAction(bookingRef: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Not signed in' }

    const booking = await prisma.booking.findUnique({ where: { bookingRef } })
    if (!booking) return { ok: false, error: 'Booking not found' }
    if (booking.userId !== user.id) return { ok: false, error: 'Unauthorised' }
    if (booking.status !== 'CONFIRMED') return { ok: false, error: 'Only confirmed bookings can be cancelled.' }

    await prisma.booking.update({ where: { bookingRef }, data: { status: 'CANCELLED' } })
    return { ok: true }
  } catch (err) {
    console.error('[cancelBooking]', err)
    return { ok: false, error: 'Something went wrong.' }
  }
}

// ── Broadcast notifications ───────────────────────────────────────────────────

export async function sendBroadcastAction(
  target: 'all' | 'tourists' | 'operators',
  title: string,
  body: string,
  href?: string,
): Promise<{ ok: boolean; count: number; error?: string }> {
  try {
    const roleMap = { tourists: 'TOURIST', operators: 'OPERATOR' }
    const where = target === 'all' ? {} : { role: roleMap[target] as any }
    const users = await prisma.user.findMany({ where, select: { id: true } })
    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id, title, body,
        href: href || null,
        type: 'broadcast',
      })),
    })
    return { ok: true, count: users.length }
  } catch (e: any) {
    return { ok: false, count: 0, error: e.message }
  }
}

// ── Google Analytics Data API ─────────────────────────────────────────────────

export type GAMetrics = {
  sessions: number; users: number; newUsers: number
  pageViews: number; engagementRate: number; avgSessionDuration: number
  sessionsPrev: number; usersPrev: number; pageViewsPrev: number
}

export type GATopPage = { path: string; sessions: number; users: number }
export type GASource = { source: string; sessions: number; pct: number }
export type GADevice = { device: string; sessions: number; pct: number }
export type GACountry = { country: string; users: number; pct: number }
export type GADayPoint = { date: string; sessions: number; users: number }

export type GAData = {
  metrics: GAMetrics
  topPages: GATopPage[]
  sources: GASource[]
  devices: GADevice[]
  countries: GACountry[]
  trend: GADayPoint[]
}

function getGAClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set')
  const creds = JSON.parse(raw)
  const { BetaAnalyticsDataClient } = require('@google-analytics/data')
  return new BetaAnalyticsDataClient({ credentials: creds })
}

export async function getGADataAction(
  days = 30,
  customStart?: string,
  customEnd?: string,
): Promise<GAData | null> {
  try {
    const propertyId = process.env.GOOGLE_GA4_PROPERTY_ID
    if (!propertyId) return null

    const client = getGAClient()
    const property = `properties/${propertyId}`

    let currRange: { startDate: string; endDate: string }
    let prevRange: { startDate: string; endDate: string }

    if (customStart && customEnd) {
      const start = new Date(customStart)
      const end = new Date(customEnd)
      const rangeDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
      const prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1)
      const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - rangeDays + 1)
      const fmt = (d: Date) => d.toISOString().slice(0, 10)
      currRange = { startDate: customStart, endDate: customEnd }
      prevRange = { startDate: fmt(prevStart), endDate: fmt(prevEnd) }
    } else {
      currRange = { startDate: `${days}daysAgo`, endDate: 'today' }
      prevRange = { startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` }
    }

    const [summaryRes, pagesRes, sourcesRes, devicesRes, countriesRes, trendRes] = await Promise.all([
      // Summary metrics — current + previous period
      client.runReport({
        property,
        dateRanges: [currRange, prevRange],
        metrics: [
          { name: 'sessions' }, { name: 'activeUsers' }, { name: 'newUsers' },
          { name: 'screenPageViews' }, { name: 'engagementRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
      // Top pages
      client.runReport({
        property, dateRanges: [currRange],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      // Traffic sources
      client.runReport({
        property, dateRanges: [currRange],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
      // Devices
      client.runReport({
        property, dateRanges: [currRange],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
      }),
      // Countries
      client.runReport({
        property, dateRanges: [currRange],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 8,
      }),
      // Daily trend
      client.runReport({
        property, dateRanges: [currRange],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
    ])

    const g = (row: any, idx: number) => Number(row.metricValues?.[idx]?.value ?? 0)
    const d = (row: any, idx: number) => row.dimensionValues?.[idx]?.value ?? ''

    // Summary — GA returns dateRange0 = current, dateRange1 = prev
    const currRow = summaryRes[0]?.rows?.find((r: any) => d(r, 0) === 'date_range_0') ??
      summaryRes[0]?.rows?.[0]
    const prevRow = summaryRes[0]?.rows?.find((r: any) => d(r, 0) === 'date_range_1') ??
      summaryRes[0]?.rows?.[1]

    // When dateRanges has 2 entries, rows have a dimension for dateRange
    const rowsByRange: Record<string, any> = {}
    for (const row of (summaryRes[0]?.rows ?? [])) {
      const rangeKey = row.dimensionValues?.[0]?.value ?? 'date_range_0'
      rowsByRange[rangeKey] = row
    }
    const cr = rowsByRange['date_range_0']
    const pr = rowsByRange['date_range_1']

    const metrics: GAMetrics = {
      sessions: g(cr, 0), users: g(cr, 1), newUsers: g(cr, 2),
      pageViews: g(cr, 3), engagementRate: Math.round(g(cr, 4) * 100),
      avgSessionDuration: Math.round(g(cr, 5)),
      sessionsPrev: g(pr, 0), usersPrev: g(pr, 1), pageViewsPrev: g(pr, 3),
    }

    const topPages: GATopPage[] = (pagesRes[0]?.rows ?? []).map((r: any) => ({
      path: d(r, 0), sessions: g(r, 0), users: g(r, 1),
    }))

    const totalSrc = (sourcesRes[0]?.rows ?? []).reduce((a: number, r: any) => a + g(r, 0), 0) || 1
    const sources: GASource[] = (sourcesRes[0]?.rows ?? []).map((r: any) => ({
      source: d(r, 0) || 'Direct', sessions: g(r, 0),
      pct: Math.round((g(r, 0) / totalSrc) * 100),
    }))

    const totalDev = (devicesRes[0]?.rows ?? []).reduce((a: number, r: any) => a + g(r, 0), 0) || 1
    const devices: GADevice[] = (devicesRes[0]?.rows ?? []).map((r: any) => ({
      device: d(r, 0), sessions: g(r, 0),
      pct: Math.round((g(r, 0) / totalDev) * 100),
    }))

    const totalCountry = (countriesRes[0]?.rows ?? []).reduce((a: number, r: any) => a + g(r, 0), 0) || 1
    const countries: GACountry[] = (countriesRes[0]?.rows ?? []).map((r: any) => ({
      country: d(r, 0), users: g(r, 0),
      pct: Math.round((g(r, 0) / totalCountry) * 100),
    }))

    const trend: GADayPoint[] = (trendRes[0]?.rows ?? []).map((r: any) => {
      const raw = d(r, 0) // "20260101"
      const label = `${raw.slice(4, 6)}/${raw.slice(6, 8)}`
      return { date: label, sessions: g(r, 0), users: g(r, 1) }
    })

    return { metrics, topPages, sources, devices, countries, trend }
  } catch (e) {
    console.error('GA Data API error:', e)
    return null
  }
}
