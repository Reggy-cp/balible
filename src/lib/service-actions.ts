'use server'

import { prisma } from './prisma'
import { getOrCreateNeonUser } from './user'
import { computeBookingTotal } from './pricing'
import { createNotification } from './notifications'

const AREA_DISPLAY: Record<string, string> = {
  UBUD: 'Ubud', CANGGU: 'Canggu', SEMINYAK: 'Seminyak', KUTA: 'Kuta',
  ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', KINTAMANI: 'Kintamani',
  AMED: 'Amed', SIDEMEN: 'Sidemen', SANUR: 'Sanur',
  NUSA_DUA: 'Nusa Dua', JIMBARAN: 'Jimbaran', MEDEWI: 'Medewi',
}

const CATEGORY_DISPLAY: Record<string, string> = {
  WELLNESS_BEAUTY: 'Wellness & Beauty',
  PHOTOGRAPHY_CONTENT: 'Photography & Content',
  TRANSPORTATION: 'Transportation',
  FOOD_DINING: 'Food & Dining',
  EVENT_WEDDING: 'Event & Wedding',
  FITNESS_COACHING: 'Fitness & Coaching',
  VILLA_SERVICE: 'Villa Service',
  PET_SERVICE: 'Pet Service',
}

const PRICE_TYPE_DISPLAY: Record<string, string> = {
  HOURLY: '/ hour',
  DAILY: '/ day',
  FIXED: 'fixed',
}

export type ServiceCard = {
  slug: string
  title: string
  category: string
  categoryKey: string
  subcategory: string
  area: string
  priceType: string
  priceTypeKey: string
  price: number
  image: string
  rating: number
  totalReviews: number
  featured: boolean
  providerName: string
  providerAvatar: string
}

export async function getAllServices(): Promise<ServiceCard[]> {
  try {
    const listings = await prisma.serviceListing.findMany({
      where: { status: 'ACTIVE', available: true },
      select: {
        slug: true, title: true, category: true, subcategory: true,
        area: true, priceType: true, price: true, images: true,
        rating: true, totalReviews: true, featured: true,
        provider: { select: { businessName: true, avatar: true } },
      },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    })

    return listings.map(l => ({
      slug: l.slug,
      title: l.title,
      category: CATEGORY_DISPLAY[String(l.category)] ?? String(l.category),
      categoryKey: String(l.category),
      subcategory: l.subcategory,
      area: AREA_DISPLAY[String(l.area)] ?? String(l.area),
      priceType: PRICE_TYPE_DISPLAY[String(l.priceType)] ?? String(l.priceType),
      priceTypeKey: String(l.priceType),
      price: l.price,
      image: (l.images as string[])[0] ?? '',
      rating: l.rating,
      totalReviews: l.totalReviews,
      featured: l.featured,
      providerName: l.provider.businessName,
      providerAvatar: l.provider.avatar ?? '',
    }))
  } catch {
    return []
  }
}

export type ServiceDetail = {
  slug: string
  title: string
  description: string
  category: string
  subcategory: string
  area: string
  priceType: string
  priceTypeKey: string
  price: number
  images: string[]
  highlights: string[]
  includes: string[]
  excludes: string[]
  instantConfirm: boolean
  rating: number
  totalReviews: number
  provider: {
    businessName: string
    description: string
    avatar: string
    verified: boolean
    rating: number
    totalReviews: number
  }
}

export async function getServiceBySlug(slug: string): Promise<ServiceDetail | null> {
  try {
    const listing = await prisma.serviceListing.findUnique({
      where: { slug },
      include: { provider: true },
    })
    if (!listing || listing.status !== 'ACTIVE') return null

    return {
      slug: listing.slug,
      title: listing.title,
      description: listing.description,
      category: CATEGORY_DISPLAY[String(listing.category)] ?? String(listing.category),
      subcategory: listing.subcategory,
      area: AREA_DISPLAY[String(listing.area)] ?? String(listing.area),
      priceType: PRICE_TYPE_DISPLAY[String(listing.priceType)] ?? String(listing.priceType),
      priceTypeKey: String(listing.priceType),
      price: listing.price,
      images: listing.images as string[],
      highlights: listing.highlights as string[],
      includes: listing.includes as string[],
      excludes: listing.excludes as string[],
      instantConfirm: listing.instantConfirm,
      rating: listing.rating,
      totalReviews: listing.totalReviews,
      provider: {
        businessName: listing.provider.businessName,
        description: listing.provider.description,
        avatar: listing.provider.avatar ?? '',
        verified: listing.provider.verified,
        rating: listing.provider.rating,
        totalReviews: listing.provider.totalReviews,
      },
    }
  } catch {
    return null
  }
}

// ── Checkout meta ─────────────────────────────────────────────────────────────

export type ServiceCheckoutMeta = {
  id: string
  title: string
  area: string
  price: number
  priceTypeKey: string
  priceLabel: string
  image: string
  instantConfirm: boolean
  providerName: string
}

export async function getServiceForCheckout(slug: string): Promise<ServiceCheckoutMeta | null> {
  try {
    const listing = await prisma.serviceListing.findUnique({
      where: { slug },
      select: {
        id: true, title: true, area: true, price: true,
        priceType: true, images: true, instantConfirm: true,
        provider: { select: { businessName: true } },
      },
    })
    if (!listing) return null
    const priceTypeKey = String(listing.priceType)
    return {
      id: listing.id,
      title: listing.title,
      area: AREA_DISPLAY[String(listing.area)] ?? String(listing.area),
      price: listing.price,
      priceTypeKey,
      priceLabel: PRICE_TYPE_DISPLAY[priceTypeKey] ?? '',
      image: (listing.images as string[])[0] ?? '',
      instantConfirm: listing.instantConfirm,
      providerName: listing.provider.businessName,
    }
  } catch {
    return null
  }
}

// ── Create Service Booking ────────────────────────────────────────────────────

export async function createServiceBookingAction(input: {
  listingId: string
  startDate: string
  duration: number
  guests: number
  notes: string
  guestName: string
  guestEmail: string
  guestPhone: string
}): Promise<{ ok: boolean; bookingRef?: string; status?: string; total?: number; error?: string }> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return { ok: false, error: 'SIGN_IN_REQUIRED' }

    const listing = await prisma.serviceListing.findUnique({
      where: { id: input.listingId },
      select: { price: true, priceType: true, instantConfirm: true, status: true, available: true },
    })
    if (!listing || String(listing.status) !== 'ACTIVE' || !listing.available) {
      return { ok: false, error: 'UNAVAILABLE' }
    }

    // Price is computed server-side; client-supplied totals are never trusted
    const duration = Number.isFinite(input.duration) && input.duration > 0 ? input.duration : 1
    const units = String(listing.priceType) === 'FIXED' ? 1 : duration
    const totalPrice = computeBookingTotal(listing.price, units)
    const status = listing.instantConfirm ? 'CONFIRMED' : 'PENDING'

    const booking = await prisma.serviceBooking.create({
      data: {
        userId: user.id,
        listingId: input.listingId,
        startDate: new Date(input.startDate),
        duration: String(duration),
        guests: input.guests,
        notes: input.notes || null,
        totalPrice,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone || null,
        status,
      },
    })
    await createNotification({
      userId: user.id,
      type: 'booking',
      title: status === 'CONFIRMED' ? 'Service booked ✓' : 'Service request sent',
      body: status === 'CONFIRMED'
        ? 'Your service booking is confirmed.'
        : 'Your request was sent to the provider — we\'ll notify you when it\'s confirmed.',
      href: '/profile',
    })

    return { ok: true, bookingRef: booking.bookingRef, status, total: totalPrice }
  } catch {
    return { ok: false }
  }
}

// ── Accept / Decline Booking ──────────────────────────────────────────────────

export async function updateServiceBookingStatusAction(
  bookingId: string,
  action: 'accept' | 'decline',
): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return { ok: false, error: 'SIGN_IN_REQUIRED' }

    const provider = await prisma.provider.findUnique({ where: { userId: user.id } })
    if (!provider) return { ok: false, error: 'NOT_A_PROVIDER' }

    const booking = await prisma.serviceBooking.findFirst({
      where: { id: bookingId, listing: { providerId: provider.id } },
      select: { id: true, status: true },
    })
    if (!booking) return { ok: false, error: 'NOT_FOUND' }
    if (String(booking.status) !== 'PENDING') return { ok: false, error: 'NOT_PENDING' }

    const status = action === 'accept' ? 'CONFIRMED' : 'CANCELLED'
    await prisma.serviceBooking.update({ where: { id: booking.id }, data: { status } })
    return { ok: true, status }
  } catch {
    return { ok: false }
  }
}

// ── Provider Dashboard ────────────────────────────────────────────────────────

export type ProviderListing = {
  id: string; slug: string; title: string
  subcategory: string; area: string; price: number
  priceTypeKey: string; status: string
  rating: number; totalReviews: number
  bookings: number; earnings: number; image: string
}

export type ProviderBooking = {
  id: string; ref: string; guest: string; email: string
  service: string; serviceImage: string
  date: string; duration: string; guests: number
  total: number; status: string; bookedOn: string
}

export type ProviderDashboardData = {
  providerName: string
  listings: ProviderListing[]
  bookings: ProviderBooking[]
}

export async function getProviderDashboardData(): Promise<ProviderDashboardData | null> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return null

    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      include: { user: { select: { name: true } } },
    })
    if (!provider) return null

    const [dbListings, dbBookings] = await Promise.all([
      prisma.serviceListing.findMany({
        where: { providerId: provider.id },
        include: {
          bookings: {
            select: { totalPrice: true },
            where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
          },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.serviceBooking.findMany({
        where: { listing: { providerId: provider.id } },
        include: { listing: { select: { title: true, images: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    const statusDisplay: Record<string, string> = {
      ACTIVE: 'Active', DRAFT: 'Draft', PENDING_REVIEW: 'Pending Review', PAUSED: 'Paused',
    }
    const bookingStatusDisplay: Record<string, string> = {
      CONFIRMED: 'Confirmed', PENDING: 'Pending', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
    }

    const listings: ProviderListing[] = dbListings.map(l => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      subcategory: l.subcategory,
      area: AREA_DISPLAY[String(l.area)] ?? String(l.area),
      price: l.price,
      priceTypeKey: String(l.priceType),
      status: statusDisplay[String(l.status)] ?? 'Draft',
      rating: l.rating,
      totalReviews: l.totalReviews,
      bookings: l._count.bookings,
      earnings: (l.bookings as { totalPrice: number }[]).reduce((a, b) => a + b.totalPrice, 0),
      image: (l.images as string[])[0] ?? '',
    }))

    const bookings: ProviderBooking[] = dbBookings.map(b => ({
      id: b.id,
      ref: b.bookingRef,
      guest: b.guestName,
      email: b.guestEmail,
      service: b.listing.title,
      serviceImage: (b.listing.images as string[])[0] ?? '',
      date: b.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: b.duration ?? '',
      guests: b.guests,
      total: b.totalPrice,
      status: bookingStatusDisplay[String(b.status)] ?? 'Pending',
      bookedOn: b.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))

    return { providerName: provider.user.name, listings, bookings }
  } catch {
    return null
  }
}

// ── Register as Provider ──────────────────────────────────────────────────────

export async function registerAsProviderAction(input: {
  businessName: string
  description: string
  phone: string
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return { ok: false, error: 'Not signed in' }

    const existing = await prisma.provider.findUnique({ where: { userId: user.id } })
    if (existing) return { ok: false, error: 'Already registered as a provider' }

    await prisma.provider.create({
      data: {
        userId: user.id,
        businessName: input.businessName,
        description: input.description,
        verified: false,
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'PROVIDER' },
    })

    return { ok: true }
  } catch {
    return { ok: false, error: 'Something went wrong' }
  }
}

// ── Create Service Listing ────────────────────────────────────────────────────

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function createServiceListingAction(input: {
  title: string
  description: string
  category: string
  subcategory: string
  area: string
  priceType: string
  price: number
  highlights: string[]
  includes: string[]
  excludes: string[]
  images: string[]
  instantConfirm: boolean
}): Promise<{ ok: boolean; slug?: string; error?: string }> {
  try {
    const user = await getOrCreateNeonUser()
    if (!user) return { ok: false, error: 'Not signed in' }

    const provider = await prisma.provider.findUnique({ where: { userId: user.id } })
    if (!provider) return { ok: false, error: 'No provider account found' }

    const baseSlug = slugify(input.title)
    let slug = baseSlug
    let attempt = 0
    while (await prisma.serviceListing.findUnique({ where: { slug } })) {
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const listing = await prisma.serviceListing.create({
      data: {
        slug,
        providerId: provider.id,
        title: input.title,
        description: input.description,
        category: input.category as any,
        subcategory: input.subcategory,
        area: input.area as any,
        priceType: input.priceType as any,
        price: input.price,
        highlights: input.highlights.filter(Boolean),
        includes: input.includes.filter(Boolean),
        excludes: input.excludes.filter(Boolean),
        images: input.images.filter(Boolean),
        instantConfirm: input.instantConfirm,
        status: 'ACTIVE',
        available: true,
      },
    })

    return { ok: true, slug: listing.slug }
  } catch (e) {
    return { ok: false, error: 'Something went wrong' }
  }
}
