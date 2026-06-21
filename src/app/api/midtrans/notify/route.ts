import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyNotificationSignature } from '@/lib/midtrans'
import { sendBookingConfirmation, sendHostBookingAlert, sendBookingCancellation, sendPaymentPendingEmail, sendEventBookingConfirmation } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

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

  const {
    order_id, status_code, gross_amount, signature_key,
    transaction_status, fraud_status, transaction_id,
    payment_type, va_numbers, permata_va_number, bill_key, biller_code, expiry_time,
  } = payload
  if (!order_id || !signature_key) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (!verifyNotificationSignature({ order_id, status_code, gross_amount, signature_key })) {
    console.warn('[midtrans] invalid notification signature for order', order_id)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const booking = await prisma.booking.findUnique({
    where: { bookingRef: order_id },
    include: {
      experience: {
        include: { operator: { include: { user: { select: { name: true, email: true } } } } },
      },
    },
  })

  // ── EventBooking path ──────────────────────────────────────────────────────
  if (!booking) {
    const evtBooking = await prisma.eventBooking.findUnique({
      where: { bookingRef: order_id },
      include: { event: true },
    })
    if (!evtBooking) {
      return NextResponse.json({ ok: true, note: 'unknown order' })
    }

    const paid    = transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status !== 'challenge')
    const failed  = ['deny', 'cancel', 'expire'].includes(transaction_status)

    if (paid && evtBooking.status !== 'CONFIRMED') {
      await prisma.eventBooking.update({
        where: { id: evtBooking.id },
        data: { status: 'CONFIRMED', paymentId: transaction_id ?? null },
      })
      await Promise.allSettled([
        createNotification({
          userId: evtBooking.userId,
          type: 'payment',
          title: "You're in! Event tickets confirmed 🎉",
          body: `Payment received — see you at ${evtBooking.event.title}!`,
          href: '/profile?tab=bookings',
        }),
        sendEventBookingConfirmation({
          to: evtBooking.guestEmail,
          guestName: evtBooking.guestName,
          bookingRef: evtBooking.bookingRef,
          eventTitle: evtBooking.event.title,
          eventDate: evtBooking.event.date,
          eventLocation: evtBooking.event.location,
          tickets: evtBooking.tickets,
          totalPrice: evtBooking.totalPrice,
        }),
      ])
    } else if (failed && evtBooking.status === 'PENDING') {
      await prisma.eventBooking.update({
        where: { id: evtBooking.id },
        data: { status: 'CANCELLED', paymentId: transaction_id ?? null },
      })
      await createNotification({
        userId: evtBooking.userId,
        type: 'payment',
        title: 'Payment unsuccessful',
        body: `Your payment for ${evtBooking.event.title} ${transaction_status === 'expire' ? 'expired' : 'was not completed'}. You can try again anytime.`,
        href: `/events/${evtBooking.event.slug}`,
      })
    }

    return NextResponse.json({ ok: true })
  }

  // https://docs.midtrans.com/docs/https-notification-webhooks
  const paid    = transaction_status === 'settlement' ||
    (transaction_status === 'capture' && fraud_status !== 'challenge')
  const pending = transaction_status === 'pending'
  const failed  = ['deny', 'cancel', 'expire'].includes(transaction_status)

  if (paid && booking.status !== 'CONFIRMED') {
    // For multi-date bookings, groupRef links all records; otherwise just update the one
    if ((booking as any).groupRef) {
      await prisma.booking.updateMany({
        where: { groupRef: (booking as any).groupRef },
        data: { status: 'CONFIRMED', paymentId: transaction_id ?? null },
      })
    } else {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED', paymentId: transaction_id ?? null },
      })
    }
    await createNotification({
      userId: booking.userId,
      type: 'payment',
      title: 'Booking confirmed 🎉',
      body: `Payment received — you're all set for ${booking.experience.title}.`,
      href: '/profile',
    })
    // Best-effort — email failures must not make Midtrans retry the notification
    const area = AREA_DISPLAY[booking.experience.area] ?? String(booking.experience.area)
    await Promise.all([
      sendBookingConfirmation({
        to: booking.guestEmail,
        guestName: booking.guestName,
        bookingRef: booking.bookingRef,
        experienceTitle: booking.experience.title,
        area,
        meetingPoint: booking.experience.meetingPoint,
        date: booking.date,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        duration: booking.experience.duration,
      }),
      booking.experience.operator?.user
        ? sendHostBookingAlert({
            to: booking.experience.operator.user.email,
            hostName: booking.experience.operator.user.name,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            guestPhone: booking.guestPhone,
            bookingRef: booking.bookingRef,
            experienceTitle: booking.experience.title,
            date: booking.date,
            guests: booking.guests,
            totalPrice: booking.totalPrice,
          })
        : Promise.resolve({ sent: false }),
    ])
  } else if (pending && booking.status === 'PENDING' && !booking.paymentId) {
    // Mark paymentId to prevent duplicate pending emails on Midtrans retries
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentId: transaction_id ?? null },
    })
    // Extract VA details depending on payment type
    let vaBank: string | undefined
    let vaNumber: string | undefined
    if (payment_type === 'bank_transfer') {
      const vaList = va_numbers as unknown as { bank: string; va_number: string }[] | undefined
      if (vaList?.[0]) { vaBank = vaList[0].bank; vaNumber = vaList[0].va_number }
      else if (permata_va_number) { vaBank = 'permata'; vaNumber = permata_va_number }
    } else if (payment_type === 'echannel') {
      vaBank = 'mandiri'; vaNumber = biller_code && bill_key ? `${biller_code} / ${bill_key}` : bill_key
    }
    await sendPaymentPendingEmail({
      to: booking.guestEmail,
      guestName: booking.guestName,
      bookingRef: booking.bookingRef,
      experienceTitle: booking.experience.title,
      date: booking.date,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      paymentType: payment_type ?? 'bank_transfer',
      vaBank,
      vaNumber,
      expiryTime: expiry_time,
    })
  } else if (failed && booking.status === 'PENDING') {
    if ((booking as any).groupRef) {
      await prisma.booking.updateMany({
        where: { groupRef: (booking as any).groupRef },
        data: { status: 'CANCELLED', paymentId: transaction_id ?? null },
      })
    } else {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED', paymentId: transaction_id ?? null },
      })
    }
    const reason = transaction_status === 'expire' ? 'payment_expired'
      : transaction_status === 'deny' ? 'payment_failed'
      : 'cancelled'
    await Promise.all([
      createNotification({
        userId: booking.userId,
        type: 'payment',
        title: 'Payment unsuccessful',
        body: `Your payment for ${booking.experience.title} ${transaction_status === 'expire' ? 'expired' : 'was not completed'}. You can book again anytime.`,
        href: `/experiences/${booking.experience.slug}`,
      }),
      sendBookingCancellation({
        to: booking.guestEmail,
        guestName: booking.guestName,
        bookingRef: booking.bookingRef,
        experienceTitle: booking.experience.title,
        date: booking.date,
        reason,
      }),
    ])
  }

  return NextResponse.json({ ok: true })
}
