import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendActivityReminder } from '@/lib/email'

// Called by Vercel Cron every hour.
// Sends activity reminders to guests and hosts whose experience starts in ~1 hour (Bali time, UTC+8).
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Compute the target start time window in Bali (UTC+8)
  // We look for activities starting between 50 and 70 minutes from now
  const BALI_OFFSET_MS = 8 * 60 * 60 * 1000
  const nowUtc = Date.now()
  const windowStartBali = new Date(nowUtc + BALI_OFFSET_MS + 50 * 60 * 1000)
  const windowEndBali   = new Date(nowUtc + BALI_OFFSET_MS + 70 * 60 * 1000)

  // Time range as HH:MM strings
  const toHHMM = (d: Date) =>
    `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  const windowStartTime = toHHMM(windowStartBali)
  const windowEndTime   = toHHMM(windowEndBali)

  // Date of the target window (in Bali) — use the start of the window
  // stored as midnight UTC of that date
  const targetDateStr = `${windowStartBali.getUTCFullYear()}-${String(windowStartBali.getUTCMonth() + 1).padStart(2, '0')}-${String(windowStartBali.getUTCDate()).padStart(2, '0')}`
  const targetDate = new Date(targetDateStr)

  // Fetch confirmed bookings on that date that haven't received a reminder yet
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      date: targetDate,
      reminderSent: false,
      time: { not: null },
    },
    include: {
      experience: {
        select: {
          title: true, slug: true, meetingPoint: true,
          operator: { include: { user: { select: { name: true, email: true } } } },
        },
      },
    },
  }).catch(() => [])

  // Filter by time window (handles midnight crossing safely via string compare when same hour)
  const inWindow = (t: string) => t >= windowStartTime && t <= windowEndTime

  let sent = 0
  for (const b of bookings) {
    if (!b.time || !inWindow(b.time)) continue

    const dateFormatted = b.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    const [h, m] = b.time.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const timeFormatted = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`

    const base = {
      experienceTitle: b.experience.title,
      experienceSlug: b.experience.slug,
      date: dateFormatted,
      time: timeFormatted,
      meetingPoint: b.experience.meetingPoint,
      bookingRef: b.bookingRef,
    }

    // Send to guest and host in parallel (best-effort)
    const [guestRes, hostRes] = await Promise.all([
      sendActivityReminder({ ...base, to: b.guestEmail, name: b.guestName }),
      b.experience.operator?.user
        ? sendActivityReminder({ ...base, to: b.experience.operator.user.email, name: b.experience.operator.user.name, isHost: true })
        : Promise.resolve({ sent: false }),
    ])

    if (guestRes.sent || hostRes.sent) {
      await prisma.booking.update({
        where: { id: b.id },
        data: { reminderSent: true },
      }).catch(() => null)
      sent++
    }
  }

  return NextResponse.json({ checked: bookings.length, sent, window: `${windowStartTime}–${windowEndTime}` })
}
