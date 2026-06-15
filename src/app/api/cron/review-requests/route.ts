import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReviewRequest } from '@/lib/email'

// Called by Vercel Cron daily at 08:00 Bali time (01:00 UTC).
// Sends review request emails to guests whose experience date was yesterday.
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  // Window: experiences that ended between 18h and 42h ago (catches yesterday's sessions)
  const from = new Date(now.getTime() - 42 * 60 * 60 * 1000)
  const to = new Date(now.getTime() - 18 * 60 * 60 * 1000)

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ['CONFIRMED', 'COMPLETED'] as any[] },
      date: { gte: from, lte: to },
      reviewRequested: false,
    },
    include: {
      experience: { select: { slug: true, title: true } },
    },
  }).catch(() => [])

  let sent = 0
  for (const b of bookings) {
    const { sent: ok } = await sendReviewRequest({
      to: b.guestEmail,
      guestName: b.guestName,
      bookingRef: b.bookingRef,
      experienceTitle: b.experience.title,
      experienceSlug: b.experience.slug,
    })
    if (ok) {
      await prisma.booking.update({
        where: { id: b.id },
        data: { reviewRequested: true },
      }).catch(() => null)
      sent++
    }
  }

  return NextResponse.json({ processed: bookings.length, sent })
}
