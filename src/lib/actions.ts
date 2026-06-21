'use server'

import { prisma } from './prisma'
import { getSessionUser } from './user'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { createSnapTransaction } from './midtrans'
import { SERVICE_FEE_RATE, computeBookingTotal } from './pricing'

export async function getServiceFeeRateAction(): Promise<number> {
  return getServiceFeeRate()
}

export async function upgradeToOperatorAction(): Promise<void> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return
  await prisma.user.updateMany({
    where: { id: session.user.id, role: 'TOURIST' },
    data: { role: 'OPERATOR' },
  })
}

async function getServiceFeeRate(): Promise<number> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'service_fee' } })
    if (row?.value) {
      const pct = parseFloat(JSON.parse(row.value))
      if (!isNaN(pct) && pct > 0) return pct / 100
    }
  } catch {}
  return SERVICE_FEE_RATE
}
import { createNotification } from './notifications'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const AREA_DISPLAY: Record<string, string> = {
  UBUD: 'Ubud', CANGGU: 'Canggu', SEMINYAK: 'Seminyak', KUTA: 'Kuta',
  ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', KINTAMANI: 'Kintamani',
  AMED: 'Amed', SIDEMEN: 'Sidemen', SANUR: 'Sanur',
  NUSA_DUA: 'Nusa Dua', JIMBARAN: 'Jimbaran', MEDEWI: 'Medewi',
}

const CATEGORY_DISPLAY: Record<string, string> = {
  WELLNESS_HEALING: 'Wellness & Healing', ART_CRAFT: 'Art & Craft', CULTURE_SPIRITUAL: 'Culture & Spiritual',
  CULINARY: 'Culinary', NATURE_OUTDOORS: 'Nature & Outdoors',
  WATER_ACTIVITIES: 'Water Activities', LOCAL_EXPERTS: 'Local Experts', RENTALS: 'Rentals',
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
  notes?: string
}

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<{ ok: boolean; bookingRef?: string; snapToken?: string; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Please sign in to complete your booking.' }

    const exp = await prisma.experience.findUnique({ where: { slug: input.slug } })
    if (!exp) return { ok: false, error: 'This experience is not available for online payment yet.' }

    // Block duplicate bookings on the same date
    const bookingDate = new Date(input.rawDate)
    bookingDate.setUTCHours(0, 0, 0, 0)
    const nextDay = new Date(bookingDate)
    nextDay.setUTCDate(nextDay.getUTCDate() + 1)
    const duplicate = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        experienceId: exp.id,
        date: { gte: bookingDate, lt: nextDay },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })
    if (duplicate) return { ok: false, error: 'You already have a booking for this experience on that date.' }

    // Price is computed server-side from the DB; client-supplied totals are never trusted
    const minG = (exp as any).minGuests ?? 1
    const guests = Math.max(minG, Math.min(exp.maxGuests, Math.trunc(input.guests) || minG))
    const feeRate = await getServiceFeeRate()
    const totalPrice = computeBookingTotal(exp.price, guests, feeRate)

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
        notes: input.notes ?? null,
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

// ── Rental Booking ────────────────────────────────────────────────────────────

function rentalPeriodMs(period: string): number {
  if (period === 'per hour') return 1000 * 60 * 60
  if (period === 'per week') return 1000 * 60 * 60 * 24 * 7
  return 1000 * 60 * 60 * 24
}

export async function createRentalBookingAction(input: {
  slug: string
  startDate: string
  endDate: string
  units: number
  guestName: string
  guestEmail: string
  guestPhone?: string
  notes?: string
}): Promise<{ ok: boolean; bookingRef?: string; snapToken?: string; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Please sign in to complete your booking.' }

    const rental = await prisma.experience.findUnique({ where: { slug: input.slug } })
    if (!rental || String(rental.category) !== 'RENTALS') {
      return { ok: false, error: 'This rental is not available for online booking.' }
    }

    const diff = new Date(input.endDate).getTime() - new Date(input.startDate).getTime()
    if (diff <= 0) return { ok: false, error: 'Return date must be after pick-up date.' }

    // Block duplicate rentals starting on the same date
    const pickupDate = new Date(input.startDate)
    pickupDate.setUTCHours(0, 0, 0, 0)
    const pickupNextDay = new Date(pickupDate)
    pickupNextDay.setUTCDate(pickupNextDay.getUTCDate() + 1)
    const duplicateRental = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        experienceId: rental.id,
        date: { gte: pickupDate, lt: pickupNextDay },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })
    if (duplicateRental) return { ok: false, error: 'You already have a booking for this rental on that date.' }

    const period = rental.duration || 'per day'
    const periods = Math.max(1, Math.ceil(diff / rentalPeriodMs(period)))
    const units = Math.max(1, Math.trunc(input.units) || 1)
    const subtotal = periods * rental.price * units
    const feeRate = await getServiceFeeRate()
    const fee = Math.round(subtotal * feeRate)
    const totalPrice = subtotal + fee

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        experienceId: rental.id,
        date: new Date(input.startDate),
        time: input.endDate,
        guests: units,
        totalPrice,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone ?? null,
        notes: `Rental: ${periods} × ${period}${input.notes ? ` | ${input.notes}` : ''}`,
        status: 'PENDING',
      },
    })

    const snap = await createSnapTransaction({
      orderId: booking.bookingRef,
      grossAmount: totalPrice,
      customerName: input.guestName,
      customerEmail: input.guestEmail,
      customerPhone: input.guestPhone,
      itemName: rental.title,
    })
    if ('error' in snap) return { ok: false, error: snap.error }

    await createNotification({
      userId: user.id,
      type: 'booking',
      title: 'Rental booking received',
      body: `Your booking for ${rental.title} is awaiting payment.`,
      href: '/profile',
    })

    return { ok: true, bookingRef: booking.bookingRef, snapToken: snap.token }
  } catch {
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}

// ── Review ────────────────────────────────────────────────────────────────────

export async function checkCanReviewAction(slug: string): Promise<{ canReview: boolean }> {
  try {
    const user = await getSessionUser()
    if (!user) return { canReview: false }
    const exp = await prisma.experience.findUnique({ where: { slug }, select: { id: true } })
    if (!exp) return { canReview: false }
    const hasCompleted = await prisma.booking.findFirst({
      where: { userId: user.id, experienceId: exp.id, status: 'COMPLETED' },
      select: { id: true },
    })
    return { canReview: !!hasCompleted }
  } catch {
    return { canReview: false }
  }
}

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

    const hasCompleted = await prisma.booking.findFirst({
      where: { userId: user.id, experienceId: exp.id, status: 'COMPLETED' },
      select: { id: true },
    })
    if (!hasCompleted) return { ok: false }

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
  'Wellness & Healing': 'WELLNESS_HEALING',
  'Culture & Spiritual': 'CULTURE_SPIRITUAL',
  'Culinary': 'CULINARY',
  'Nature & Outdoors': 'NATURE_OUTDOORS',
  'Water Activities': 'WATER_ACTIVITIES',
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
  subcategory: string
  area: string
  price: number
  duration: string
  maxGuests: number
  minGuests: number
  meetingPoint: string
  includes: string[]
  excludes: string[]
  itinerary: { time: string; activity: string }[]
  imageUrl?: string
}

async function getOrCreateOperator(businessName: string) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return null
  const existing = await prisma.operator.findUnique({ where: { userId } })
  if (existing) return existing
  return prisma.operator.create({
    data: { userId, businessName: businessName || 'My Business', description: '' },
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
      subcategory: input.subcategory || '',
      area: areaEnum as any,
      price: input.price || 0,
      duration: input.duration || '',
      level: 'All levels',
      maxGuests: input.maxGuests || 8,
      minGuests: input.minGuests || 1,
      images: input.imageUrl ? [input.imageUrl] : [],
      highlights: [],
      includes: input.includes,
      excludes: input.excludes,
      itinerary: input.itinerary,
      meetingPoint: input.meetingPoint || '',
      latitude: 0,
      longitude: 0,
      status: 'DRAFT' as any,
    }

    const existing = await prisma.experience.findUnique({ where: { slug: input.slug } })
    if (existing && existing.operatorId === operator.id) {
      // Preserve existing status — don't demote an active listing back to draft on save
      const updated = await prisma.experience.update({
        where: { slug: input.slug },
        data: { ...data, status: existing.status },
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
      subcategory: input.subcategory || '',
      area: areaEnum as any,
      price: input.price || 0,
      duration: input.duration || '',
      level: 'All levels',
      maxGuests: input.maxGuests || 8,
      minGuests: input.minGuests || 1,
      images: input.imageUrl ? [input.imageUrl] : [],
      highlights: [],
      includes: input.includes,
      excludes: input.excludes,
      itinerary: input.itinerary,
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

export async function saveExperienceFullAction(
  input: HostListingInput & { schedule?: any; images?: string[] },
  mode: 'draft' | 'submit',
): Promise<{ ok: boolean; experiences?: DashExp[] }> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return { ok: false }

    // Fetch operator and existing experience in parallel
    const [existing_op, existing] = await Promise.all([
      prisma.operator.findUnique({ where: { userId } }),
      prisma.experience.findUnique({ where: { slug: input.slug }, select: { operatorId: true, status: true } }),
    ])
    const operator = existing_op ?? await prisma.operator.create({
      data: { userId, businessName: input.title || 'My Business', description: '' },
    })

    const categoryEnum = CATEGORY_TO_ENUM[input.category] ?? 'ART_CRAFT'
    const areaEnum = AREA_TO_ENUM[input.area] ?? 'UBUD'
    const allImages = (input.images?.length ? input.images : (input.imageUrl ? [input.imageUrl] : []))

    const data: any = {
      operatorId: operator.id,
      title: input.title,
      description: input.description || '',
      category: categoryEnum,
      subcategory: input.subcategory || '',
      area: areaEnum,
      price: input.price || 0,
      duration: input.duration || '',
      level: 'All levels',
      maxGuests: input.maxGuests || 8,
      minGuests: input.minGuests || 1,
      images: allImages,
      highlights: [],
      includes: input.includes,
      excludes: input.excludes,
      itinerary: input.itinerary,
      meetingPoint: input.meetingPoint || '',
      latitude: 0,
      longitude: 0,
      ...(input.schedule !== undefined && { schedule: input.schedule }),
    }

    if (existing && existing.operatorId === operator.id) {
      await prisma.experience.update({
        where: { slug: input.slug },
        data: { ...data, status: mode === 'submit' ? 'PENDING_REVIEW' : existing.status },
      })
    } else {
      await prisma.experience.create({
        data: { slug: input.slug, ...data, status: mode === 'submit' ? 'PENDING_REVIEW' : 'DRAFT' },
      })
    }

    return { ok: true }
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
  await requireAdmin()
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
      category: String(r.category).replace('_', ' & ').replace('CULINARY', 'Culinary'),
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
  await requireAdmin()
  try {
    const exp = await prisma.experience.update({ where: { id }, data: { status: 'ACTIVE' as any } })
    const session = await getServerSession(authOptions)
    await logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Approved experience "${exp.title}"`, type: 'experience', entityId: id })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function rejectListingAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  try {
    const exp = await prisma.experience.update({ where: { id }, data: { status: 'DRAFT' as any } })
    const session = await getServerSession(authOptions)
    await logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Rejected experience "${exp.title}"`, type: 'experience', entityId: id })
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
      include: { bookings: { where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }, select: { totalPrice: true } }, _count: { select: { bookings: true } } },
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
      minGuests: (e as any).minGuests ?? 1,
      subcategory: (e as any).subcategory ?? '',
      rating: e.rating,
      totalReviews: e.totalReviews,
      bookings: e._count.bookings,
      status: statusDisplay[String(e.status)] ?? 'Draft',
      image: (e.images as string[])[0] ?? '',
      images: e.images as string[],
      schedule: e.schedule ?? null,
      earnings: (e.bookings as { totalPrice: number }[]).reduce((a, b) => a + b.totalPrice, 0),
      description: e.description,
      meetingPoint: e.meetingPoint,
      includes: e.includes,
      excludes: e.excludes,
      itinerary: Array.isArray(e.itinerary) ? (e.itinerary as { time: string; activity: string }[]) : [],
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
  await requireAdmin()
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
  createdAt: string
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
    category: string
    duration: string
    meetingPoint: string
    includes: string[]
    latitude: number
    longitude: number
    operatorId: string
    host: string
    time?: string
  }[]
  reviews: {
    experience: string
    slug: string
    date: string
    rating: number
    comment: string
    image: string
  }[]
  eventBookings: {
    id: string
    title: string
    date: string
    location: string
    tickets: number
    total: number
    status: string
    image: string
    slug: string
    cancellable: boolean
  }[]
}

export async function getUserData(): Promise<UserData | null> {
  try {
    const user = await getSessionUser()
    if (!user) return null

    const [fullUser, bookings, reviews, eventBookings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { wishlistSlugs: true },
      }),
      prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          experience: { select: { title: true, area: true, images: true, slug: true, category: true, duration: true, meetingPoint: true, includes: true, latitude: true, longitude: true, operatorId: true, operator: { select: { businessName: true } } } },
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
      prisma.eventBooking.findMany({
        where: { userId: user.id },
        include: { event: { select: { title: true, location: true, date: true, slug: true, coverImage: true } } },
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
      createdAt: (user as any).createdAt
        ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '',
      wishlistSlugs: fullUser?.wishlistSlugs ?? [],
      bookings: bookings.map(b => ({
        id: b.bookingRef,
        title: b.experience.title,
        area: AREA_DISPLAY[String(b.experience.area)] ?? String(b.experience.area),
        date: b.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        guests: b.guests,
        total: b.totalPrice,
        status: statusMap[String(b.status)] ?? 'Upcoming',
        cancellable: b.status === 'CONFIRMED' && b.date.getTime() - Date.now() > 24 * 60 * 60 * 1000,
        rating: reviews.find(r => r.experienceId === b.experienceId)?.rating ?? null,
        image: (b.experience.images as string[])[0] ?? '',
        slug: b.experience.slug,
        category: String(b.experience.category),
        duration: b.experience.duration,
        meetingPoint: b.experience.meetingPoint,
        includes: b.experience.includes as string[],
        latitude: b.experience.latitude,
        longitude: b.experience.longitude,
        operatorId: b.experience.operatorId,
        host: b.experience.operator.businessName,
        time: b.time ?? undefined,
      })),
      reviews: reviews.map(r => ({
        experience: r.experience.title,
        slug: r.experience.slug,
        date: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rating: r.rating,
        comment: r.comment,
        image: (r.experience.images as string[])[0] ?? '',
      })),
      eventBookings: eventBookings.map(b => ({
        id: b.bookingRef,
        title: b.event.title,
        date: b.event.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        location: b.event.location,
        tickets: b.tickets,
        total: b.totalPrice,
        status: statusMap[String(b.status)] ?? 'Upcoming',
        image: b.event.coverImage ?? '',
        slug: b.event.slug,
        cancellable: b.status === 'CONFIRMED' && (b.event.date.getTime() - Date.now()) > 24 * 60 * 60 * 1000,
      })),
    }
  } catch {
    return null
  }
}

// ── Admin panel data ──────────────────────────────────────────────────────────

import { COMMISSION_RATE, PAYOUT_MIN_NET } from './constants'

// Server actions are individually addressable RPC endpoints — middleware route
// protection does NOT cover them, so every admin action must authorize itself.
async function requireAdmin() {
  const user = await getSessionUser()
  if (!user || (user as any).role !== 'ADMIN') throw new Error('Unauthorized')
  return user
}

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
  await requireAdmin()
  try {
    const [totalUsers, totalExperiences, totalBookings, rev, pendingListings, pendingHosts, activeHosts] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'ADMIN' as any } } }),
      prisma.experience.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
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
  featured: boolean
}

export async function getAdminExperiencesAction(): Promise<AdminExp[]> {
  await requireAdmin()
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
      featured: r.featured,
    }))
  } catch { return [] }
}

export async function adminSaveFeaturedAction(ids: string[]): Promise<{ ok: boolean }> {
  await requireAdmin()
  try {
    await prisma.$transaction([
      prisma.experience.updateMany({ where: {}, data: { featured: false } }),
      ...(ids.length > 0
        ? [prisma.experience.updateMany({ where: { id: { in: ids } }, data: { featured: true } })]
        : []),
    ])
    const session = await getServerSession(authOptions)
    await logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Updated featured experiences (${ids.length} selected)`, type: 'experience' })
    return { ok: true }
  } catch { return { ok: false } }
}

export async function adminUpdateExperienceStatusAction(id: string, status: string): Promise<{ ok: boolean }> {
  await requireAdmin()
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
  await requireAdmin()
  try {
    const rows = await prisma.operator.findMany({
      include: {
        user: { select: { name: true, createdAt: true } },
        experiences: {
          include: { _count: { select: { bookings: true } }, bookings: { where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }, select: { totalPrice: true } } },
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
  await requireAdmin()
  try {
    const op = await prisma.operator.update({ where: { id }, data: { verified: true }, include: { user: { select: { name: true } } } })
    const session = await getServerSession(authOptions)
    await logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Approved host "${op.user.name}"`, type: 'host', entityId: id })
    return { ok: true }
  } catch { return { ok: false } }
}

export async function suspendHostAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  try {
    const op = await prisma.operator.update({ where: { id }, data: { verified: false }, include: { user: { select: { name: true } } } })
    const session = await getServerSession(authOptions)
    await logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Suspended host "${op.user.name}"`, type: 'host', entityId: id })
    return { ok: true }
  } catch { return { ok: false } }
}

export type AdminBooking = {
  id: string; ref: string; guest: string; email: string; phone: string
  experience: string; host: string; hostEmail: string
  date: string; bookedOn: string
  guests: number; total: number; commission: number; hostPayout: number
  status: string; paymentId: string
}

export async function getAdminBookingsAction(): Promise<AdminBooking[]> {
  await requireAdmin()
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
  await requireAdmin()
  try {
    await prisma.booking.update({ where: { bookingRef: ref }, data: { status: status as any } })
    const session = await getServerSession(authOptions)
    await logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Set booking ${ref} to ${status}`, type: 'booking', entityId: ref })
    return { ok: true }
  } catch { return { ok: false } }
}

export async function adminCompleteBookingAction(ref: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  try {
    await prisma.booking.update({ where: { bookingRef: ref }, data: { status: 'COMPLETED' } })
    const session = await getServerSession(authOptions)
    await logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Completed booking ${ref}`, type: 'booking', entityId: ref })
    return { ok: true }
  } catch { return { ok: false } }
}

// ── Event booking admin ───────────────────────────────────────────────────────

export type AdminEventBooking = {
  id: string; ref: string; guest: string; email: string; phone: string
  event: string; eventDate: string; host: string
  tickets: number; total: number; status: string
  bookedOn: string; paymentId: string
}

export async function getAdminEventBookingsAction(): Promise<AdminEventBooking[]> {
  await requireAdmin()
  try {
    const rows = await prisma.eventBooking.findMany({
      include: {
        event: { include: { operator: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    const statusDisplay: Record<string, string> = { CONFIRMED: 'Confirmed', PENDING: 'Pending', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }
    const TZ = 'Asia/Makassar'
    return rows.map((b, i) => ({
      id: `EB${String(i + 1).padStart(3, '0')}`,
      ref: b.bookingRef,
      guest: b.guestName, email: b.guestEmail, phone: b.guestPhone ?? '',
      event: b.event.title,
      eventDate: b.event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: TZ }),
      host: b.event.operator.user.name,
      tickets: b.tickets, total: b.totalPrice,
      status: statusDisplay[String(b.status)] ?? 'Pending',
      bookedOn: b.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      paymentId: b.paymentId ?? '',
    }))
  } catch { return [] }
}

export async function adminCancelEventBookingAction(ref: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  try {
    const booking = await prisma.eventBooking.update({
      where: { bookingRef: ref },
      data: { status: 'CANCELLED' },
      include: { event: { select: { title: true, date: true } } },
    })
    const session = await getServerSession(authOptions)
    await Promise.allSettled([
      logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Cancelled event booking ${ref}`, type: 'booking', entityId: ref }),
      import('./email').then(m => m.sendEventBookingCancellationEmail({
        to: booking.guestEmail,
        guestName: booking.guestName,
        bookingRef: booking.bookingRef,
        eventTitle: booking.event.title,
        eventDate: booking.event.date,
        tickets: booking.tickets,
        totalPaid: booking.totalPrice,
      })),
      import('./email').then(m => m.sendAdminEventCancellationAlert({
        bookingRef: booking.bookingRef,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone ?? '',
        eventTitle: booking.event.title,
        eventDate: booking.event.date,
        tickets: booking.tickets,
        totalPaid: booking.totalPrice,
      })),
    ])
    return { ok: true }
  } catch { return { ok: false } }
}

export type AdminUser = {
  id: string; name: string; email: string; role: string
  bookings: number; totalSpend: number; joined: string; status: string
}

export async function getAdminUsersAction(): Promise<AdminUser[]> {
  await requireAdmin()
  try {
    const rows = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' as any } },
      include: { bookings: { where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }, select: { totalPrice: true } }, _count: { select: { bookings: true } } },
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
  await requireAdmin()
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
  await requireAdmin()
  try {
    await prisma.review.delete({ where: { id } })
    const session = await getServerSession(authOptions)
    await logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Deleted review`, type: 'review', entityId: id })
    return { ok: true }
  } catch { return { ok: false } }
}

export async function adminApproveReviewAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  try { await prisma.review.update({ where: { id }, data: { flagged: false, hidden: false } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminFlagReviewAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  try { await prisma.review.update({ where: { id }, data: { flagged: true } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminHideReviewAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  try { await prisma.review.update({ where: { id }, data: { hidden: true, flagged: false } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminDeleteExperienceAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  try {
    const exp = await prisma.experience.findUnique({ where: { id }, select: { title: true } })
    await prisma.experience.delete({ where: { id } })
    const session = await getServerSession(authOptions)
    await logActivity({ actor: session?.user?.name ?? 'Admin', actorId: session?.user?.id, action: `Deleted experience "${exp?.title ?? id}"`, type: 'experience', entityId: id })
    return { ok: true }
  } catch { return { ok: false } }
}

export async function adminUpdateUserAction(id: string, data: { name: string; email: string; role: string }): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  try {
    await prisma.user.update({ where: { id }, data: { name: data.name, email: data.email, role: data.role as any } })
    return { ok: true }
  } catch (e: any) { return { ok: false, error: e.message } }
}

export async function adminUpdateHostAction(id: string, data: { businessName: string; description: string; payoutBank: string; payoutAccountNumber: string; payoutAccountName: string }): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
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
  await requireAdmin()
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
        prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { createdAt: { gte: start, lt: end }, status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
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
      WELLNESS_HEALING: '#4A7C59', ART_CRAFT: '#C8A97E', CULTURE_SPIRITUAL: '#B66A45',
      NATURE_OUTDOORS: '#6F675C', CULINARY: '#111111', WATER_ACTIVITIES: '#3B82F6',
      LOCAL_EXPERTS: '#8B5CF6', RENTALS: '#EC4899',
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
  await requireAdmin()
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
  await requireAdmin()
  try { await prisma.event.update({ where: { id }, data: { status: status as any } }); return { ok: true } }
  catch { return { ok: false } }
}

export async function adminDeleteEventAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  try { await prisma.event.delete({ where: { id } }); return { ok: true } }
  catch { return { ok: false } }
}

// ── Checkout experience lookup ────────────────────────────────────────────────

export type ExpCheckoutMeta = { title: string; area: string; price: number; image: string; serviceFeeRate: number; meetingPoint: string; minGuests: number; maxGuests: number }

export async function getExperienceForCheckout(slug: string): Promise<ExpCheckoutMeta | null> {
  try {
    const exp = await prisma.experience.findUnique({
      where: { slug },
      select: { title: true, area: true, price: true, images: true, meetingPoint: true, maxGuests: true, minGuests: true },
    })
    if (!exp) return null
    return {
      title: exp.title,
      area: AREA_DISPLAY[String(exp.area)] ?? String(exp.area),
      price: exp.price,
      image: (exp.images as string[])[0] ?? '',
      serviceFeeRate: await getServiceFeeRate(),
      meetingPoint: exp.meetingPoint ?? '',
      minGuests: (exp as any).minGuests ?? 1,
      maxGuests: exp.maxGuests,
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
    return dbResults
  } catch {
    return []
  }
}

export async function submitReviewAction(slug: string, rating: number, comment: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Not signed in' }
    const exp = await prisma.experience.findUnique({ where: { slug }, select: { id: true } })
    if (!exp) return { ok: false, error: 'Experience not found' }
    const hasCompleted = await prisma.booking.findFirst({
      where: { userId: user.id, experienceId: exp.id, status: 'COMPLETED' },
      select: { id: true },
    })
    if (!hasCompleted) return { ok: false, error: 'You can only review experiences you have completed.' }
    const existing = await prisma.review.findFirst({ where: { userId: user.id, experienceId: exp.id } })
    if (existing) return { ok: false, error: 'You have already reviewed this experience' }
    const expFull = await prisma.experience.findUnique({
      where: { id: exp.id },
      select: { operatorId: true },
    })
    await prisma.review.create({ data: { userId: user.id, experienceId: exp.id, rating, comment } })

    // Recalculate experience rating
    const expReviews = await prisma.review.findMany({ where: { experienceId: exp.id }, select: { rating: true } })
    const expAvg = expReviews.reduce((a, r) => a + r.rating, 0) / expReviews.length
    await prisma.experience.update({
      where: { id: exp.id },
      data: { rating: Math.round(expAvg * 10) / 10, totalReviews: expReviews.length },
    })

    // Recalculate operator aggregate rating across all their experiences
    if (expFull?.operatorId) {
      const opReviews = await prisma.review.findMany({
        where: { experience: { operatorId: expFull.operatorId } },
        select: { rating: true },
      })
      const opAvg = opReviews.reduce((a, r) => a + r.rating, 0) / opReviews.length
      await prisma.operator.update({
        where: { id: expFull.operatorId },
        data: { rating: Math.round(opAvg * 10) / 10, totalReviews: opReviews.length },
      })
    }

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
  price: number; duration: string; maxGuests: number; minGuests: number; subcategory: string
  rating: number; totalReviews: number; bookings: number; status: string
  image: string; images: string[]; earnings: number
  description: string; meetingPoint: string
  schedule: any | null
  includes: string[]; excludes: string[]
  itinerary: { time: string; activity: string }[]
}

export type DashBooking = {
  id: string; ref: string; guest: string; email: string
  experience: string; expImage: string
  date: string; time: string; guests: number; total: number
  status: string; bookedOn: string
}

export type DashReview = { id: string; guest: string; experience: string; rating: number; comment: string; date: string }

export type EarningsByMonth = { month: string; gross: number }

export type HostProfile = {
  name: string
  email: string
  image: string | null
  businessName: string
  bio: string
  phone: string
  area: string
  languages: string
  website: string
  address: string
  city: string
  country: string
  nationality: string
  dateOfBirth: string
}

export type HostDashboardData = {
  hostName: string
  commissionRate: number
  experiences: DashExp[]
  bookings: DashBooking[]
  reviews: DashReview[]
  earningsByMonth: EarningsByMonth[]
  totalGross: number
  pendingPayout: number
  profile: HostProfile
}

export async function getHostDashboardData(viewOperatorId?: string): Promise<HostDashboardData | null> {
  try {
    const user = await getSessionUser()
    if (!user) return null

    // Admins may view a specific host's dashboard read-only by passing an
    // operatorId. Anyone else can only ever see their own operator.
    const isAdminView = !!viewOperatorId && (user as any).role === 'ADMIN'
    const operator = await prisma.operator.findUnique({
      where: isAdminView ? { id: viewOperatorId } : { userId: user.id },
      include: { user: { select: { name: true, email: true, image: true, nationality: true, dateOfBirth: true } } },
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
      minGuests: (e as any).minGuests ?? 1,
      subcategory: (e as any).subcategory ?? '',
      rating: e.rating,
      totalReviews: e.totalReviews,
      bookings: e._count.bookings,
      status: expStatusDisplay[String(e.status)] ?? 'Draft',
      image: (e.images as string[])[0] ?? '',
      images: e.images as string[],
      schedule: e.schedule ?? null,
      earnings: (e.bookings as { totalPrice: number }[]).reduce((a, b) => a + b.totalPrice, 0),
      description: e.description,
      meetingPoint: e.meetingPoint,
      includes: e.includes,
      excludes: e.excludes,
      itinerary: Array.isArray(e.itinerary) ? (e.itinerary as { time: string; activity: string }[]) : [],
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

    const profile: HostProfile = {
      name: operator.user.name,
      email: operator.user.email,
      image: operator.avatar ?? operator.user.image ?? null,
      businessName: operator.businessName,
      bio: operator.description,
      phone: operator.phone ?? '',
      area: operator.area ?? '',
      languages: operator.languages ?? '',
      website: operator.website ?? '',
      address: operator.address ?? '',
      city: operator.city ?? '',
      country: operator.country ?? '',
      nationality: (operator.user as any).nationality ?? '',
      dateOfBirth: (operator.user as any).dateOfBirth ? new Date((operator.user as any).dateOfBirth).toISOString().slice(0, 10) : '',
    }
    return { hostName: operator.user.name, commissionRate: Math.round(commRateDecimal * 100), experiences, bookings, reviews, earningsByMonth, totalGross, pendingPayout, profile }
  } catch {
    return null
  }
}

// Host updates their own profile. Scoped to the caller's own operator — never
// accepts an operatorId, so a host can only ever edit themselves.
export async function updateHostProfileAction(input: {
  name?: string; businessName?: string; bio?: string
  phone?: string; area?: string; languages?: string
  website?: string; address?: string; city?: string; country?: string
  nationality?: string; dateOfBirth?: string; avatar?: string
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Not signed in' }
    const operator = await prisma.operator.findUnique({ where: { userId: user.id } })
    if (!operator) return { ok: false, error: 'No operator account' }

    await prisma.operator.update({
      where: { id: operator.id },
      data: {
        ...(input.businessName !== undefined ? { businessName: input.businessName.trim() } : {}),
        ...(input.bio !== undefined ? { description: input.bio.trim() } : {}),
        phone: input.phone?.trim() || null,
        area: input.area?.trim() || null,
        languages: input.languages?.trim() || null,
        website: input.website?.trim() || null,
        address: input.address?.trim() || null,
        city: input.city?.trim() || null,
        country: input.country?.trim() || null,
        ...(input.avatar !== undefined ? { avatar: input.avatar } : {}),
      },
    })
    const userUpdate: Record<string, unknown> = {}
    if (input.name?.trim()) userUpdate.name = input.name.trim()
    if (input.nationality !== undefined) userUpdate.nationality = input.nationality.trim() || null
    if (input.dateOfBirth !== undefined) userUpdate.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: user.id }, data: userUpdate })
    }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
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
  WELLNESS_HEALING: '#4A7C59', ART_CRAFT: '#C8A97E', CULTURE_SPIRITUAL: '#B66A45',
  NATURE_OUTDOORS: '#6F675C', CULINARY: '#111111', WATER_ACTIVITIES: '#3B82F6',
  LOCAL_EXPERTS: '#8B5CF6', RENTALS: '#EC4899',
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#4A7C59', PENDING: '#C8A97E', COMPLETED: '#4B6CB7', CANCELLED: '#B66A45',
}

export async function getAnalyticsDataAction(days: number): Promise<AnalyticsData> {
  await requireAdmin()
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
  await requireAdmin()
  try {
    const rows = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } })
    return rows.map(r => ({
      id: r.id, email: r.email, source: r.source,
      joinedAt: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }))
  } catch { return [] }
}

export async function deleteNewsletterSubAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
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
  await requireAdmin()
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
  await requireAdmin()
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
  await requireAdmin()
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

export async function getOperatorPayoutsAction(viewOperatorId?: string): Promise<OperatorPayout[]> {
  try {
    const user = await getSessionUser()
    if (!user) return []
    // Admin read-only view of a specific host's payouts; everyone else self-only.
    const isAdminView = !!viewOperatorId && (user as any).role === 'ADMIN'
    const operator = await prisma.operator.findUnique({
      where: isAdminView ? { id: viewOperatorId } : { userId: user.id },
    })
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

    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: { experience: { select: { title: true, category: true } } },
    })
    if (!booking) return { ok: false, error: 'Booking not found' }
    if (booking.userId !== user.id) return { ok: false, error: 'Unauthorised' }
    if (booking.status !== 'CONFIRMED') return { ok: false, error: 'Only confirmed bookings can be cancelled.' }
    if (booking.date.getTime() - Date.now() <= 24 * 60 * 60 * 1000) {
      return { ok: false, error: 'Cancellations must be made at least 24 hours before the booking date.' }
    }

    await prisma.booking.update({ where: { bookingRef }, data: { status: 'CANCELLED' } })

    const dateStr = booking.date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Makassar',
    })
    const isRental = String(booking.experience.category) === 'RENTALS'
    const emailInput = {
      bookingRef,
      guestName:        booking.guestName,
      guestEmail:       booking.guestEmail,
      experienceTitle:  booking.experience.title,
      date:             dateStr,
      dateLabel:        isRental ? 'Pickup date' : 'Date',
      guestsLabel:      isRental ? 'Units' : 'Guests',
      guests:           booking.guests,
      totalPaid:        booking.totalPrice,
    }

    const { sendCustomerCancellationEmail, sendAdminRefundAlert } = await import('./email')
    await Promise.allSettled([
      sendCustomerCancellationEmail({ to: booking.guestEmail, ...emailInput }),
      sendAdminRefundAlert({ to: 'hello@balible.com', ...emailInput }),
    ])

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
  await requireAdmin()
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
  await requireAdmin()
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

// ── Activity log ─────────────────────────────────────────────────────────────

async function logActivity(opts: {
  actor: string; actorId?: string; action: string; type: string; entityId?: string
}) {
  try {
    await prisma.auditLog.create({ data: opts })
  } catch {}
}

export type AuditLogEntry = {
  id: string; actor: string; actorId: string | null
  action: string; type: string; entityId: string | null; createdAt: string
}

export async function getActivityLogsAction(limit = 200): Promise<AuditLogEntry[]> {
  await requireAdmin()
  try {
    const rows = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return rows.map(r => ({
      id: r.id, actor: r.actor, actorId: r.actorId,
      action: r.action, type: r.type, entityId: r.entityId,
      createdAt: r.createdAt.toISOString(),
    }))
  } catch { return [] }
}

// ── Admin settings (Setting model) ───────────────────────────────────────────

export async function getAdminSettingsAction(keys: string[]): Promise<Record<string, string | null>> {
  await requireAdmin()
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } })
  const result: Record<string, string | null> = {}
  for (const k of keys) result[k] = rows.find(r => r.key === k)?.value ?? null
  return result
}

export async function saveAdminSettingsAction(settings: Record<string, string>): Promise<{ ok: boolean }> {
  try {
    await requireAdmin()
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
      )
    )
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// ── Operator settings (notifs + payout bank + blocked dates) ─────────────────

export type OperatorSettings = {
  notifSettings: Record<string, boolean> | null
  payoutBank: string
  payoutAccountNumber: string
  payoutAccountName: string
  blockedDates: string[]
}

export async function getOperatorSettingsAction(): Promise<OperatorSettings | null> {
  try {
    const user = await getSessionUser()
    if (!user) return null
    const op = await prisma.operator.findUnique({
      where: { userId: user.id },
      select: { notifSettings: true, payoutBank: true, payoutAccountNumber: true, payoutAccountName: true, blockedDates: true },
    })
    if (!op) return null
    return {
      notifSettings: (op.notifSettings as Record<string, boolean> | null) ?? null,
      payoutBank: op.payoutBank ?? '',
      payoutAccountNumber: op.payoutAccountNumber ?? '',
      payoutAccountName: op.payoutAccountName ?? '',
      blockedDates: op.blockedDates as string[],
    }
  } catch { return null }
}

export async function updateOperatorSettingsAction(data: {
  notifSettings?: Record<string, boolean>
  payoutBank?: string
  payoutAccountNumber?: string
  payoutAccountName?: string
  blockedDates?: string[]
}): Promise<{ ok: boolean }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false }
    await prisma.operator.update({
      where: { userId: user.id },
      data: {
        ...(data.notifSettings !== undefined && { notifSettings: data.notifSettings }),
        ...(data.payoutBank !== undefined && { payoutBank: data.payoutBank || null }),
        ...(data.payoutAccountNumber !== undefined && { payoutAccountNumber: data.payoutAccountNumber || null }),
        ...(data.payoutAccountName !== undefined && { payoutAccountName: data.payoutAccountName || null }),
        ...(data.blockedDates !== undefined && { blockedDates: data.blockedDates }),
      },
    })
    return { ok: true }
  } catch { return { ok: false } }
}

// ── Experience gallery images ─────────────────────────────────────────────────

export async function updateExperienceImagesAction(slug: string, images: string[]): Promise<{ ok: boolean }> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return { ok: false }
    const op = await prisma.operator.findUnique({ where: { userId } })
    if (!op) return { ok: false }
    await prisma.experience.update({ where: { slug, operatorId: op.id }, data: { images } })
    return { ok: true }
  } catch { return { ok: false } }
}

// ── User profile settings (tourists) ─────────────────────────────────────────

export type UserProfileSettings = {
  name: string
  phone: string
  nationality: string
  bio: string
  dateOfBirth: string
  address: string
  city: string
  country: string
  notifSettings: Record<string, boolean> | null
}

export async function getUserProfileSettingsAction(): Promise<UserProfileSettings | null> {
  try {
    const user = await getSessionUser()
    if (!user) return null
    const full = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, phone: true, nationality: true, bio: true, dateOfBirth: true, address: true, city: true, country: true, notifSettings: true },
    })
    if (!full) return null
    return {
      name: full.name ?? '',
      phone: full.phone ?? '',
      nationality: full.nationality ?? '',
      bio: full.bio ?? '',
      dateOfBirth: full.dateOfBirth ? full.dateOfBirth.toISOString().slice(0, 10) : '',
      address: full.address ?? '',
      city: full.city ?? '',
      country: full.country ?? '',
      notifSettings: (full.notifSettings as Record<string, boolean> | null) ?? null,
    }
  } catch { return null }
}

export async function updateUserProfileSettingsAction(data: {
  name?: string
  phone?: string
  nationality?: string
  bio?: string
  dateOfBirth?: string
  address?: string
  city?: string
  country?: string
  notifSettings?: Record<string, boolean>
}): Promise<{ ok: boolean }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name?.trim() && { name: data.name.trim() }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.nationality !== undefined && { nationality: data.nationality || null }),
        ...(data.bio !== undefined && { bio: data.bio || null }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.country !== undefined && { country: data.country || null }),
        ...(data.notifSettings !== undefined && { notifSettings: data.notifSettings }),
      },
    })
    return { ok: true }
  } catch { return { ok: false } }
}

// ── User locale preference ────────────────────────────────────────────────────

export async function getUserLocaleAction(): Promise<string | null> {
  try {
    const user = await getSessionUser()
    if (!user) return null
    const row = await prisma.user.findUnique({ where: { id: user.id }, select: { locale: true } })
    return row?.locale ?? null
  } catch { return null }
}

export async function updateUserLocaleAction(locale: string): Promise<{ ok: boolean }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false }
    await prisma.user.update({ where: { id: user.id }, data: { locale } })
    return { ok: true }
  } catch { return { ok: false } }
}

// ── Experience schedule (availability) ───────────────────────────────────────

export async function getExperienceScheduleAction(slug: string): Promise<any | null> {
  try {
    const exp = await prisma.experience.findUnique({ where: { slug }, select: { schedule: true } })
    return exp?.schedule ?? null
  } catch { return null }
}

export async function updateExperienceScheduleAction(slug: string, schedule: any): Promise<{ ok: boolean }> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return { ok: false }
    const op = await prisma.operator.findUnique({ where: { userId } })
    if (!op) return { ok: false }
    await prisma.experience.update({ where: { slug, operatorId: op.id }, data: { schedule } })
    return { ok: true }
  } catch { return { ok: false } }
}

// ── Booked slots (derived from Booking table) ─────────────────────────────────

export async function getBookedSlotsAction(slug: string, date: string): Promise<Record<string, number>> {
  try {
    const exp = await prisma.experience.findUnique({ where: { slug }, select: { id: true } })
    if (!exp) return {}
    const start = new Date(date)
    const end = new Date(date)
    end.setDate(end.getDate() + 1)
    const bookings = await prisma.booking.findMany({
      where: {
        experienceId: exp.id,
        date: { gte: start, lt: end },
        status: { in: ['CONFIRMED', 'PENDING'] as any },
      },
      select: { time: true, guests: true },
    })
    const result: Record<string, number> = {}
    for (const b of bookings) {
      if (b.time) result[b.time] = (result[b.time] ?? 0) + b.guests
    }
    return result
  } catch { return {} }
}

// ── Map experiences (active DB experiences with coordinates) ─────────────────

export type MapExp = {
  id: number; slug: string; title: string; category: string; area: string
  lat: number; lng: number; price: number; rating: number; reviews: number
  duration: string; image: string
}

export async function getMapExperiencesAction(): Promise<MapExp[]> {
  try {
    const rows = await prisma.experience.findMany({
      where: { status: 'ACTIVE' as any, latitude: { not: 0 } },
      select: { id: true, slug: true, title: true, category: true, area: true, latitude: true, longitude: true, price: true, rating: true, totalReviews: true, duration: true, images: true },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((e, i) => ({
      id: i + 1,
      slug: e.slug,
      title: e.title,
      category: CATEGORY_DISPLAY[String(e.category)] ?? String(e.category),
      area: AREA_DISPLAY[String(e.area)] ?? String(e.area),
      lat: e.latitude,
      lng: e.longitude,
      price: e.price,
      rating: e.rating,
      reviews: e.totalReviews,
      duration: e.duration,
      image: (e.images as string[])[0] ?? '',
    }))
  } catch { return [] }
}

// ── Password reset ─────────────────────────────────────────────────────────────

export async function requestPasswordResetAction(email: string): Promise<{ ok: boolean }> {
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    // Always return ok to avoid email enumeration
    if (!user || !user.password) return { ok: true }

    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    })

    const { sendPasswordResetEmail } = await import('./email')
    await sendPasswordResetEmail({ to: user.email, name: user.name, token })
    return { ok: true }
  } catch { return { ok: true } }
}

export async function resetPasswordAction(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!token || newPassword.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' }

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    })
    if (!user) return { ok: false, error: 'This link is invalid or has expired. Please request a new one.' }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    })
    return { ok: true }
  } catch { return { ok: false, error: 'Something went wrong. Please try again.' } }
}

// ── Host contact support ───────────────────────────────────────────────────────

export async function sendContactSupportAction(input: {
  subject: string
  message: string
}): Promise<{ ok: boolean }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false }
    const { sendContactSupportEmail } = await import('./email')
    const sent = await sendContactSupportEmail({
      fromName:  user.name  ?? 'Unknown',
      fromEmail: user.email ?? 'unknown@balible.com',
      subject:   input.subject.trim(),
      message:   input.message.trim(),
    })
    return { ok: sent.sent }
  } catch { return { ok: false } }
}
