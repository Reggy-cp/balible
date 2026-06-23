'use server'

import { prisma } from './prisma'
import { getSessionUser } from './user'
import { createSnapTransaction } from './midtrans'
import { createNotification } from './notifications'

async function getFeeRate(): Promise<number> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'service_fee' } })
    if (row?.value) {
      const pct = parseFloat(JSON.parse(row.value))
      if (!isNaN(pct) && pct > 0) return pct / 100
    }
  } catch {}
  return 0.1
}

export type EventInput = {
  title: string
  description: string
  date: string       // ISO string
  location: string
  price: number
  capacity: number
  coverImage?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
}

export type EventRow = {
  id: string
  slug: string
  title: string
  description: string
  date: string
  location: string
  price: number
  capacity: number
  coverImage: string | null
  images: string[]
  status: string
  createdAt: string
}

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
    '-' + Math.random().toString(36).slice(2, 6)
}

async function getOperator() {
  const user = await getSessionUser()
  if (!user) return null
  return prisma.operator.findUnique({ where: { userId: user.id } })
}

function toRow(e: {
  id: string; slug: string; title: string; description: string;
  date: Date; location: string; price: number; capacity: number;
  coverImage: string | null; images: string[]; status: string; createdAt: Date
}): EventRow {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    date: e.date.toISOString(),
    location: e.location,
    price: e.price,
    capacity: e.capacity,
    coverImage: e.coverImage,
    images: e.images,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
  }
}

export async function updateEventImagesAction(id: string, images: string[]): Promise<{ ok: boolean }> {
  try {
    const op = await getOperator()
    if (!op) return { ok: false }
    await prisma.event.update({ where: { id, operatorId: op.id }, data: { images } })
    return { ok: true }
  } catch { return { ok: false } }
}

export async function getHostEvents(): Promise<EventRow[]> {
  try {
    const op = await getOperator()
    if (!op) return []
    const events = await prisma.event.findMany({
      where: { operatorId: op.id },
      orderBy: { date: 'asc' },
    })
    return events.map(toRow)
  } catch {
    return []
  }
}

export async function createEvent(input: EventInput): Promise<{ ok: boolean; event?: EventRow }> {
  try {
    const op = await getOperator()
    if (!op) return { ok: false }

    const event = await prisma.event.create({
      data: {
        slug: toSlug(input.title),
        operatorId: op.id,
        title: input.title,
        description: input.description,
        date: new Date(input.date.length === 16 ? input.date + ':00+08:00' : input.date),
        location: input.location,
        price: input.price,
        capacity: input.capacity,
        coverImage: input.coverImage ?? null,
        status: input.status ?? 'DRAFT',
      },
    })
    return { ok: true, event: toRow(event) }
  } catch {
    return { ok: false }
  }
}

export async function updateEvent(id: string, input: Partial<EventInput>): Promise<{ ok: boolean }> {
  try {
    const op = await getOperator()
    if (!op) return { ok: false }

    await prisma.event.update({
      where: { id, operatorId: op.id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.date !== undefined && { date: new Date(input.date.length === 16 ? input.date + ':00+08:00' : input.date) }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.capacity !== undefined && { capacity: input.capacity }),
        ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
        ...(input.status !== undefined && { status: input.status }),
      },
    })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function deleteEvent(id: string): Promise<{ ok: boolean }> {
  try {
    const op = await getOperator()
    if (!op) return { ok: false }
    await prisma.event.delete({ where: { id, operatorId: op.id } })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// ── Public queries ────────────────────────────────────────────────────────────

export async function getPublishedEvents(): Promise<EventRow[]> {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { date: 'asc' },
    })
    return events.map(toRow)
  } catch {
    return []
  }
}

export async function getEventRemainingTickets(slug: string): Promise<number | null> {
  try {
    const event = await prisma.event.findUnique({ where: { slug }, select: { capacity: true, id: true } })
    if (!event) return null
    const booked = await prisma.eventBooking.aggregate({
      where: { eventId: event.id, status: { in: ['PENDING', 'CONFIRMED'] } },
      _sum: { tickets: true },
    })
    return event.capacity - (booked._sum.tickets ?? 0)
  } catch { return null }
}

export async function getEventBySlug(slug: string): Promise<(EventRow & { operatorName: string; operatorAvatar: string | null; operatorPhone: string | null }) | null> {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: { operator: { select: { businessName: true, avatar: true, phone: true } } },
    })
    if (!event) return null
    return {
      ...toRow(event),
      operatorName: event.operator.businessName,
      operatorAvatar: event.operator.avatar,
      operatorPhone: event.operator.phone ?? null,
    }
  } catch {
    return null
  }
}

// ── Event booking ─────────────────────────────────────────────────────────────

export async function createEventBookingAction(input: {
  slug: string
  tickets: number
  guestName: string
  guestEmail: string
  guestPhone?: string
  notes?: string
}): Promise<{ ok: boolean; bookingRef?: string; snapToken?: string; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Please sign in to complete your booking.' }

    const event = await prisma.event.findUnique({ where: { slug: input.slug } })
    if (!event || event.status !== 'PUBLISHED') return { ok: false, error: 'This event is not available for booking.' }

    if (new Date(event.date) < new Date()) return { ok: false, error: 'This event has already taken place.' }

    // Block duplicate bookings for the same event
    const duplicate = await prisma.eventBooking.findFirst({
      where: { userId: user.id, eventId: event.id, status: { in: ['PENDING', 'CONFIRMED'] } },
    })
    if (duplicate) return { ok: false, error: 'You already have a booking for this event.' }

    const tickets = Math.max(1, Math.trunc(input.tickets) || 1)

    // Capacity check — count tickets already reserved (pending or confirmed)
    const booked = await prisma.eventBooking.aggregate({
      where: { eventId: event.id, status: { in: ['PENDING', 'CONFIRMED'] } },
      _sum: { tickets: true },
    })
    const reserved = booked._sum.tickets ?? 0
    const remaining = event.capacity - reserved
    if (remaining <= 0) return { ok: false, error: 'Sorry, this event is sold out.' }
    if (tickets > remaining) return { ok: false, error: `Only ${remaining} ticket${remaining !== 1 ? 's' : ''} remaining.` }
    const feeRate = await getFeeRate()
    const subtotal = event.price * tickets
    const fee = event.price === 0 ? 0 : Math.round(subtotal * feeRate)
    const totalPrice = subtotal + fee

    const booking = await prisma.eventBooking.create({
      data: {
        userId: user.id,
        eventId: event.id,
        tickets,
        totalPrice,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone ?? null,
        notes: input.notes ?? null,
        status: event.price === 0 ? 'CONFIRMED' : 'PENDING',
      },
    })

    if (event.price === 0) {
      await createNotification({
        userId: user.id,
        type: 'booking',
        title: 'Event booking confirmed 🎉',
        body: `You're registered for ${event.title}. See you there!`,
        href: '/profile?tab=bookings',
      })
      return { ok: true, bookingRef: booking.bookingRef }
    }

    const snap = await createSnapTransaction({
      orderId: booking.bookingRef,
      grossAmount: totalPrice,
      customerName: input.guestName,
      customerEmail: input.guestEmail,
      customerPhone: input.guestPhone,
      itemName: `${tickets}x ticket — ${event.title}`,
    })
    if ('error' in snap) return { ok: false, error: snap.error }

    await createNotification({
      userId: user.id,
      type: 'booking',
      title: 'Event booking received',
      body: `Your tickets for ${event.title} are awaiting payment.`,
      href: '/profile?tab=bookings',
    })

    return { ok: true, bookingRef: booking.bookingRef, snapToken: snap.token }
  } catch {
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function cancelEventBookingAction(bookingRef: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false, error: 'Not authenticated.' }

    const booking = await prisma.eventBooking.findUnique({
      where: { bookingRef },
      include: { event: { select: { date: true, title: true } } },
    })
    if (!booking || booking.userId !== user.id) return { ok: false, error: 'Booking not found.' }
    if (booking.status === 'CANCELLED') return { ok: false, error: 'Already cancelled.' }

    const hoursUntil = (booking.event.date.getTime() - Date.now()) / (60 * 60 * 1000)
    if (hoursUntil < 24) return { ok: false, error: 'Cancellations must be made at least 24 hours before the event.' }

    await prisma.eventBooking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Something went wrong.' }
  }
}
