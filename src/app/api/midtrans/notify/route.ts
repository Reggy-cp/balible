import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyNotificationSignature } from '@/lib/midtrans'
import { sendBookingConfirmation } from '@/lib/email'

const AREA_DISPLAY: Record<string, string> = {
  UBUD: 'Ubud', CANGGU: 'Canggu', SEMINYAK: 'Seminyak', KUTA: 'Kuta',
  ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', KINTAMANI: 'Kintamani',
  AMED: 'Amed', SIDEMEN: 'Sidemen', SANUR: 'Sanur',
  NUSA_DUA: 'Nusa Dua', JIMBARAN: 'Jimbaran', MEDEWI: 'Medewi',
}

export async function POST(req: NextRequest) {
  let payload: Record<string, string>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status, transaction_id } = payload
  if (!order_id || !signature_key) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (!verifyNotificationSignature({ order_id, status_code, gross_amount, signature_key })) {
    console.warn('[midtrans] invalid notification signature for order', order_id)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const booking = await prisma.booking.findUnique({
    where: { bookingRef: order_id },
    include: { experience: true },
  })
  if (!booking) {
    // Unknown order (e.g. dashboard test notification) — acknowledge so Midtrans stops retrying
    return NextResponse.json({ ok: true, note: 'unknown order' })
  }

  // https://docs.midtrans.com/docs/https-notification-webhooks
  const paid = transaction_status === 'settlement' ||
    (transaction_status === 'capture' && fraud_status !== 'challenge')
  const failed = ['deny', 'cancel', 'expire'].includes(transaction_status)

  if (paid && booking.status !== 'CONFIRMED') {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED', paymentId: transaction_id ?? null },
    })
    // Best-effort — email failure must not make Midtrans retry the notification
    await sendBookingConfirmation({
      to: booking.guestEmail,
      guestName: booking.guestName,
      bookingRef: booking.bookingRef,
      experienceTitle: booking.experience.title,
      area: AREA_DISPLAY[booking.experience.area] ?? booking.experience.area,
      meetingPoint: booking.experience.meetingPoint,
      date: booking.date,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      duration: booking.experience.duration,
    })
  } else if (failed && booking.status === 'PENDING') {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED', paymentId: transaction_id ?? null },
    })
  }

  return NextResponse.json({ ok: true })
}
