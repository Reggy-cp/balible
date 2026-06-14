import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Category, Area } from '@prisma/client'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, category, area, description, price, duration, maxGuests, meetingPoint } = await req.json()
  if (!title || !category || !area || !description || !price || !duration || !maxGuests)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const operator = await prisma.operator.findUnique({ where: { userId: session.user.id } })
  if (!operator) return NextResponse.json({ error: 'No operator profile found' }, { status: 404 })

  const base = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 50)
  const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`

  const experience = await prisma.experience.create({
    data: {
      slug,
      operatorId: operator.id,
      title: title.trim(),
      description: description.trim(),
      category: category as Category,
      area: area as Area,
      price: Math.round(Number(price)),
      duration: duration.trim(),
      maxGuests: Math.round(Number(maxGuests)),
      meetingPoint: meetingPoint?.trim() || 'TBD',
      level: 'All levels',
      latitude: -8.4095,
      longitude: 115.1889,
      status: 'PENDING_REVIEW',
    },
  })

  return NextResponse.json({ experienceId: experience.id, slug: experience.slug })
}
