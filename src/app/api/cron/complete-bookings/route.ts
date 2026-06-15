import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Called daily at 02:00 UTC (10:00 AM Bali time).
// Flips CONFIRMED → COMPLETED for bookings whose date has passed.
// This unlocks the "Leave a review" button on the profile page.
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Complete bookings dated strictly before today UTC midnight.
  // Experiences are in Bali (UTC+8); running at 02:00 UTC = 10:00 Bali ensures
  // all of yesterday's sessions have long finished before we flip the status.
  const todayUtcMidnight = new Date()
  todayUtcMidnight.setUTCHours(0, 0, 0, 0)

  const result = await prisma.booking.updateMany({
    where: {
      status: 'CONFIRMED',
      date: { lt: todayUtcMidnight },
    },
    data: { status: 'COMPLETED' },
  })

  return NextResponse.json({ completed: result.count })
}
