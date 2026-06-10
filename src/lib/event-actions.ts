'use server'

import { prisma } from './prisma'
import { getOrCreateNeonUser } from './user'

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
  status: string
  createdAt: string
}

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
    '-' + Math.random().toString(36).slice(2, 6)
}

async function getOperator() {
  const user = await getOrCreateNeonUser()
  if (!user) return null
  return prisma.operator.findUnique({ where: { userId: user.id } })
}

function toRow(e: {
  id: string; slug: string; title: string; description: string;
  date: Date; location: string; price: number; capacity: number;
  coverImage: string | null; status: string; createdAt: Date
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
    status: e.status,
    createdAt: e.createdAt.toISOString(),
  }
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
        date: new Date(input.date),
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
        ...(input.date !== undefined && { date: new Date(input.date) }),
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

export async function getEventBySlug(slug: string): Promise<(EventRow & { operatorName: string; operatorAvatar: string | null }) | null> {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: { operator: { select: { businessName: true, avatar: true } } },
    })
    if (!event) return null
    return {
      ...toRow(event),
      operatorName: event.operator.businessName,
      operatorAvatar: event.operator.avatar,
    }
  } catch {
    return null
  }
}
