import { Resend } from 'resend'

// Without RESEND_API_KEY all senders no-op so subscribe/booking flows never break.
// Until a domain is verified in Resend, EMAIL_FROM must stay on onboarding@resend.dev
// and delivery only works to the Resend account owner's address (test mode).
const FROM = process.env.EMAIL_FROM ?? 'Balible <hello@balible.com>'

// Absolute base URL for assets in emails (logo, links). Emails can't use relative paths.
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://balible.com'

let resend: Resend | null = null
function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

const BRAND = {
  bg: '#F5F1EB',
  card: '#FFFFFF',
  border: '#E8E4DE',
  ink: '#111111',
  muted: '#6F675C',
  gold: '#C8A97E',
}

function layout(body: string) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
        <tr><td style="background-color:${BRAND.ink};padding:20px 32px;">
          <a href="${SITE_URL}" style="text-decoration:none;">
            <img src="${SITE_URL}/logo-light.png" alt="Balible" height="28" style="height:28px;width:auto;display:block;border:0;" />
          </a>
        </td></tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.6;">
            Curated experiences in the island of Bali.<br/>
            Questions? Reply to this email or write to hello@balible.com.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendVerificationEmail(to: string, token: string): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping verification email to', to)
    return { sent: false }
  }
  const appUrl = process.env.NEXTAUTH_URL ?? 'https://balible.com'
  const verifyUrl = `${appUrl}/verify-email?token=${token}`
  try {
    await client.emails.send({
      from: FROM,
      to,
      subject: 'Verify your Balible account',
      html: layout(`
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">Verify your email</h1>
        <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Thanks for joining Balible! Click the button below to verify your email address and activate your account.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 28px;background-color:${BRAND.ink};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
          Verify my email →
        </a>
        <p style="margin:28px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
          This link expires in 24 hours. If you didn't create a Balible account, you can safely ignore this email.
        </p>
        <p style="margin:16px 0 0;font-size:12px;color:#9E9A94;line-height:1.6;word-break:break-all;">
          Can't click? Copy this link: ${verifyUrl}
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] verification email failed:', err)
    return { sent: false }
  }
}

export async function sendNewsletterWelcome(to: string): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping newsletter welcome to', to)
    return { sent: false }
  }
  try {
    await client.emails.send({
      from: FROM,
      to,
      subject: 'Welcome to Balible — you’re on the list',
      html: layout(`
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">You’re on the list</h1>
        <p style="margin:0 0 16px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Thanks for subscribing. You’ll be the first to hear when new experiences go live
          across Bali — from hidden pottery studios in Ubud to sunrise treks on Kintamani.
        </p>
        <a href="https://balible.com/search" style="display:inline-block;padding:12px 24px;background-color:${BRAND.gold};color:${BRAND.ink};font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">
          Browse experiences
        </a>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] newsletter welcome failed:', err)
    return { sent: false }
  }
}

export type HostBookingAlertInput = {
  to: string
  hostName: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  bookingRef: string
  experienceTitle: string
  date: Date
  guests: number
  totalPrice: number
}

export async function sendHostBookingAlert(input: HostBookingAlertInput): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping host alert to', input.to)
    return { sent: false }
  }
  const dateStr = input.date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Makassar',
  })
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:7px 0;font-size:13px;color:${BRAND.muted};width:120px;vertical-align:top;">${label}</td>
      <td style="padding:7px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${value}</td>
    </tr>`
  try {
    await client.emails.send({
      from: FROM,
      to: input.to,
      subject: `New booking — ${input.experienceTitle} on ${dateStr}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;">NEW BOOKING</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">${input.experienceTitle}</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${input.hostName}, you have a new confirmed booking. Here are the guest details.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};margin-bottom:20px;">
          ${row('Booking ref', input.bookingRef)}
          ${row('Date', `${dateStr} (Bali time)`)}
          ${row('Guests', String(input.guests))}
          ${row('Guest name', input.guestName)}
          ${row('Guest email', input.guestEmail)}
          ${input.guestPhone ? row('Guest phone', input.guestPhone) : ''}
          ${row('Amount', `IDR ${input.totalPrice.toLocaleString('id-ID')}`)}
        </table>
        <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          Please be ready to host on the above date. If you have any questions about
          this booking, contact us at hello@balible.com.
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] host booking alert failed:', err)
    return { sent: false }
  }
}

export type BookingCancellationInput = {
  to: string
  guestName: string
  bookingRef: string
  experienceTitle: string
  date: Date
  reason: 'payment_failed' | 'payment_expired' | 'cancelled'
}

export async function sendBookingCancellation(input: BookingCancellationInput): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping cancellation email to', input.to)
    return { sent: false }
  }
  const dateStr = input.date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Makassar',
  })
  const reasonText = input.reason === 'payment_expired'
    ? 'Your payment window expired before we received payment.'
    : input.reason === 'payment_failed'
    ? 'Your payment was not completed successfully.'
    : 'This booking has been cancelled.'
  try {
    await client.emails.send({
      from: FROM,
      to: input.to,
      subject: `Booking cancelled — ${input.experienceTitle}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:#B66A45;font-weight:600;">BOOKING CANCELLED</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">${input.experienceTitle}</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${input.guestName}, ${reasonText}
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};margin-bottom:20px;">
          <tr>
            <td style="padding:8px 0;font-size:13px;color:${BRAND.muted};width:140px;">Booking ref</td>
            <td style="padding:8px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${input.bookingRef}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:${BRAND.muted};">Date</td>
            <td style="padding:8px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${dateStr}</td>
          </tr>
        </table>
        <p style="margin:0 0 20px;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          No charge has been made. You can book this experience again anytime.
        </p>
        <a href="https://balible.com/search" style="display:inline-block;padding:12px 24px;background-color:${BRAND.gold};color:${BRAND.ink};font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
          Browse experiences
        </a>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] booking cancellation email failed:', err)
    return { sent: false }
  }
}

export type ReviewRequestInput = {
  to: string
  guestName: string
  bookingRef: string
  experienceTitle: string
  experienceSlug: string
}

export async function sendReviewRequest(input: ReviewRequestInput): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping review request to', input.to)
    return { sent: false }
  }
  const appUrl = process.env.NEXTAUTH_URL ?? 'https://balible.com'
  const reviewUrl = `${appUrl}/experiences/${input.experienceSlug}#review`
  try {
    await client.emails.send({
      from: FROM,
      to: input.to,
      subject: `How was ${input.experienceTitle}?`,
      html: layout(`
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">We hope you loved it</h1>
        <p style="margin:0 0 16px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${input.guestName}, we hope your experience at <strong style="color:${BRAND.ink};">${input.experienceTitle}</strong> was everything you imagined.
          Your review helps other travellers find the best of Bali and supports the local hosts who make it possible.
        </p>
        <a href="${reviewUrl}" style="display:inline-block;padding:14px 28px;background-color:${BRAND.gold};color:${BRAND.ink};font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
          Leave a review →
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#9E9A94;line-height:1.6;">
          Booking ref: ${input.bookingRef}
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] review request email failed:', err)
    return { sent: false }
  }
}

export type PaymentPendingInput = {
  to: string
  guestName: string
  bookingRef: string
  experienceTitle: string
  date: Date
  guests: number
  totalPrice: number
  paymentType: string
  vaBank?: string
  vaNumber?: string
  expiryTime?: string
}

export async function sendPaymentPendingEmail(input: PaymentPendingInput): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping payment pending email to', input.to)
    return { sent: false }
  }
  const dateStr = input.date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Makassar',
  })
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:${BRAND.muted};width:160px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${value}</td>
    </tr>`

  const bankName = (input.vaBank ?? '').toUpperCase()
  const vaBlock = input.vaNumber ? `
    <div style="margin:20px 0;padding:16px 20px;background-color:#FEF9EC;border-radius:10px;border:1px solid #E8D4B8;">
      <p style="margin:0 0 4px;font-size:12px;color:${BRAND.muted};font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">${bankName ? bankName + ' Virtual Account' : 'Virtual Account'}</p>
      <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.ink};letter-spacing:0.1em;">${input.vaNumber}</p>
      ${input.expiryTime ? `<p style="margin:8px 0 0;font-size:12px;color:${BRAND.muted};">Pay before: ${input.expiryTime} (WIB)</p>` : ''}
    </div>` : ''

  try {
    await client.emails.send({
      from: FROM,
      to: input.to,
      subject: `Complete your payment — ${input.experienceTitle}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;">PAYMENT INSTRUCTIONS</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">${input.experienceTitle}</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${input.guestName}, your spot is held! Complete your transfer below to confirm your booking.
          We will send a confirmation email as soon as payment is received.
        </p>
        ${vaBlock}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};margin-bottom:20px;">
          ${row('Booking ref', input.bookingRef)}
          ${row('Experience', input.experienceTitle)}
          ${row('Date', `${dateStr} (Bali time)`)}
          ${row('Guests', String(input.guests))}
          ${row('Amount due', `IDR ${input.totalPrice.toLocaleString('id-ID')}`)}
        </table>
        <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          Transfer the exact amount shown above. Your booking will be confirmed automatically
          once payment is verified — no action needed on your end.
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] payment pending email failed:', err)
    return { sent: false }
  }
}

export type BookingConfirmationInput = {
  to: string
  guestName: string
  bookingRef: string
  experienceTitle: string
  area: string
  meetingPoint: string
  date: Date
  guests: number
  totalPrice: number
  duration: string
}

export async function sendBookingConfirmation(input: BookingConfirmationInput): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping booking confirmation to', input.to)
    return { sent: false }
  }
  const dateStr = input.date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Makassar',
  })
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:${BRAND.muted};width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${value}</td>
    </tr>`
  try {
    await client.emails.send({
      from: FROM,
      to: input.to,
      subject: `Booking confirmed — ${input.experienceTitle}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;">BOOKING CONFIRMED</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">${input.experienceTitle}</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${input.guestName}, your spot is secured. Here are your booking details —
          keep this email handy on the day.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};margin-bottom:20px;">
          ${row('Booking ref', input.bookingRef)}
          ${row('Date', `${dateStr} (Bali time)`)}
          ${row('Duration', input.duration)}
          ${row('Guests', String(input.guests))}
          ${row('Area', input.area)}
          ${row('Meeting point', input.meetingPoint)}
          ${row('Total paid', `IDR ${input.totalPrice.toLocaleString('id-ID')}`)}
        </table>
        <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          Need to change or cancel? Most experiences offer free cancellation up to 24 hours
          before the start time — just reply to this email with your booking reference.
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] booking confirmation failed:', err)
    return { sent: false }
  }
}

// ── Activity reminder (1 hour before) ─────────────────────────────────────────

export type ActivityReminderInput = {
  to: string
  name: string
  experienceTitle: string
  experienceSlug: string
  date: string
  time: string
  meetingPoint: string
  bookingRef: string
  isHost?: boolean
}

export async function sendActivityReminder(input: ActivityReminderInput): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping activity reminder to', input.to)
    return { sent: false }
  }
  try {
    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#6F675C;width:130px;vertical-align:top;">${label}</td>
        <td style="padding:10px 0;font-size:13px;color:#111111;font-weight:500;">${value}</td>
      </tr>`
    const greeting = input.isHost
      ? `Hi ${input.name}, your guest will arrive in about 1 hour for the experience below.`
      : `Hi ${input.name}, your experience starts in about 1 hour — here's a quick reminder.`
    await client.emails.send({
      from: FROM,
      to: input.to,
      subject: `Reminder: ${input.experienceTitle} starts in 1 hour`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;">⏰ STARTING IN 1 HOUR</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">${input.experienceTitle}</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">${greeting}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};margin-bottom:20px;">
          ${row('Date', input.date)}
          ${row('Time', `${input.time} (Bali time)`)}
          ${row('Meeting point', input.meetingPoint)}
          ${row('Booking ref', input.bookingRef)}
        </table>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input.meetingPoint + ', Bali')}"
          style="display:inline-block;padding:12px 24px;background-color:${BRAND.ink};color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:16px;">
          📍 Open in Google Maps
        </a>
        <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          ${input.isHost ? 'Questions? Reply to this email.' : 'Have a wonderful experience!'}
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] activity reminder failed:', err)
    return { sent: false }
  }
}

// ── New message notification ──────────────────────────────────────────────────

export async function sendNewMessageEmail({
  to, recipientName, senderName, preview, replyUrl,
}: {
  to: string
  recipientName: string
  senderName: string
  preview: string
  replyUrl: string
}): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping new message email to', to)
    return { sent: false }
  }
  const safe = preview.length > 120 ? preview.slice(0, 120) + '…' : preview
  try {
    await client.emails.send({
      from: FROM,
      to,
      subject: `New message from ${senderName} — Balible`,
      html: layout(`
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">New message</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${recipientName}, <strong style="color:${BRAND.ink};">${senderName}</strong> sent you a message on Balible.
        </p>
        <div style="margin:0 0 24px;padding:16px 20px;background-color:#F5F1EB;border-left:3px solid ${BRAND.gold};border-radius:6px;">
          <p style="margin:0;font-size:14px;color:${BRAND.ink};line-height:1.7;font-style:italic;">"${safe}"</p>
        </div>
        <a href="${replyUrl}" style="display:inline-block;padding:14px 28px;background-color:${BRAND.ink};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
          Reply →
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#9E9A94;line-height:1.6;">
          You're receiving this because someone messaged you on Balible.
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] new message notification failed:', err)
    return { sent: false }
  }
}

// ── Booking cancellation & refund ─────────────────────────────────────────────

export type CancellationEmailInput = {
  to: string
  guestName: string
  bookingRef: string
  experienceTitle: string
  date: string
  dateLabel?: string
  guestsLabel?: string
  guests: number
  totalPaid: number
}

export async function sendCustomerCancellationEmail(input: CancellationEmailInput): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping cancellation email to', input.to)
    return { sent: false }
  }
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:${BRAND.muted};width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${value}</td>
    </tr>`
  try {
    await client.emails.send({
      from: FROM,
      to: input.to,
      subject: `Booking cancelled — ${input.experienceTitle}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:#B66A45;font-weight:600;">BOOKING CANCELLED</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">Your booking has been cancelled</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${input.guestName}, we've received your cancellation request. Your refund will be reviewed and processed within <strong style="color:${BRAND.ink};">3–5 business days</strong>.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};margin-bottom:24px;">
          ${row('Booking ref', input.bookingRef)}
          ${row('Listing', input.experienceTitle)}
          ${row(input.dateLabel ?? 'Date', input.date)}
          ${row(input.guestsLabel ?? 'Guests', String(input.guests))}
          ${row('Refund amount', `IDR ${input.totalPaid.toLocaleString('id-ID')}`)}
        </table>
        <div style="padding:16px 20px;background-color:#FEF9EC;border-radius:10px;border:1px solid #E8D4B8;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:13px;color:${BRAND.ink};font-weight:600;">What happens next?</p>
          <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.75;">
            Our team will process your refund within 3–5 business days. Once processed, it may take a further 3–7 business days to appear on your original payment method depending on your bank.
          </p>
        </div>
        <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          Questions? Reply to this email or contact us at hello@balible.com and quote your booking reference.
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] customer cancellation email failed:', err)
    return { sent: false }
  }
}

export async function sendAdminRefundAlert(input: CancellationEmailInput & { guestEmail: string }): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping admin refund alert')
    return { sent: false }
  }
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:${BRAND.muted};width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${value}</td>
    </tr>`
  try {
    await client.emails.send({
      from: FROM,
      to: 'hello@balible.com',
      subject: `[Refund Required] ${input.bookingRef} — ${input.experienceTitle}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:#B66A45;font-weight:600;">⚠️ MANUAL REFUND REQUIRED</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">Booking Cancelled — Refund Needed</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          A guest has cancelled their booking. Please process the refund via the Midtrans dashboard or bank transfer within 3 business days.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};margin-bottom:24px;">
          ${row('Booking ref', input.bookingRef)}
          ${row('Listing', input.experienceTitle)}
          ${row(input.dateLabel ?? 'Date', input.date)}
          ${row(input.guestsLabel ?? 'Guests', String(input.guests))}
          ${row('Guest name', input.guestName)}
          ${row('Guest email', input.guestEmail)}
          ${row('Refund amount', `IDR ${input.totalPaid.toLocaleString('id-ID')}`)}
        </table>
        <a href="https://dashboard.midtrans.com" style="display:inline-block;padding:12px 24px;background-color:${BRAND.ink};color:white;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
          Open Midtrans Dashboard →
        </a>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] admin refund alert failed:', err)
    return { sent: false }
  }
}

// ── Host contact support ───────────────────────────────────────────────────────

export async function sendContactSupportEmail({
  fromName, fromEmail, subject, message,
}: {
  fromName: string
  fromEmail: string
  subject: string
  message: string
}): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping contact support email')
    return { sent: false }
  }
  try {
    await client.emails.send({
      from: FROM,
      to: 'hello@balible.com',
      replyTo: fromEmail,
      subject: `[Host Support] ${subject} — ${fromName}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;">HOST SUPPORT REQUEST</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">${subject}</h1>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};margin-bottom:20px;">
          <tr>
            <td style="padding:8px 0;font-size:13px;color:${BRAND.muted};width:100px;">From</td>
            <td style="padding:8px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${fromName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:${BRAND.muted};">Email</td>
            <td style="padding:8px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${fromEmail}</td>
          </tr>
        </table>
        <p style="margin:0 0 8px;font-size:13px;color:${BRAND.muted};font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
        <div style="padding:16px 20px;background-color:#F5F1EB;border-radius:10px;border:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:14px;color:${BRAND.ink};line-height:1.75;white-space:pre-wrap;">${message}</p>
        </div>
        <p style="margin:20px 0 0;font-size:12px;color:#9E9A94;">Reply directly to this email to respond to ${fromName}.</p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] contact support email failed:', err)
    return { sent: false }
  }
}

// ── Password reset ─────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail({ to, name, token }: { to: string; name: string; token: string }): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping password reset email to', to)
    return { sent: false }
  }
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`
  try {
    await client.emails.send({
      from: FROM,
      to,
      subject: 'Reset your Balible password',
      html: layout(`
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">Reset your password</h1>
        <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${name}, we received a request to reset the password for your Balible account.
          Click the button below to choose a new password.
        </p>
        <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background-color:${BRAND.ink};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
          Reset my password →
        </a>
        <p style="margin:28px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
          This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password won't change.
        </p>
        <p style="margin:16px 0 0;font-size:12px;color:#9E9A94;line-height:1.6;word-break:break-all;">
          Can't click? Copy this link: ${resetUrl}
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] password reset email failed:', err)
    return { sent: false }
  }
}

// ── Review request ─────────────────────────────────────────────────────────────

export async function sendReviewRequestEmail({
  to,
  guestName,
  experienceTitle,
  isRental,
}: {
  to: string
  guestName: string
  experienceTitle: string
  isRental: boolean
}): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping review request email to', to)
    return { sent: false }
  }
  const reviewUrl = `${SITE_URL}/profile?tab=bookings`
  const noun = isRental ? 'rental' : 'experience'
  try {
    await client.emails.send({
      from: FROM,
      to,
      subject: `How was ${isRental ? 'your rental' : 'it'}? Leave a review for ${experienceTitle}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">YOUR REVIEW MATTERS</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">How was your ${noun}?</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${guestName}, we hope you enjoyed <strong style="color:${BRAND.ink};">${experienceTitle}</strong>!
          Taking a minute to share your experience helps other travelers in Bali find great local ${noun}s.
        </p>
        <a href="${reviewUrl}" style="display:inline-block;padding:14px 28px;background-color:${BRAND.ink};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
          Write a review →
        </a>
        <p style="margin:24px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          It only takes 2 minutes. Your honest feedback makes a real difference for the host and future guests.
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] review request email failed:', err)
    return { sent: false }
  }
}

// ── Event booking confirmation ─────────────────────────────────────────────────

export type EventBookingConfirmationInput = {
  to: string
  guestName: string
  bookingRef: string
  eventTitle: string
  eventDate: Date
  eventLocation: string
  tickets: number
  totalPrice: number
}

export async function sendEventBookingConfirmation(input: EventBookingConfirmationInput): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) return { sent: false }
  const { to, guestName, bookingRef, eventTitle, eventDate, eventLocation, tickets, totalPrice } = input
  const TZ = 'Asia/Makassar'
  const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: TZ })
  const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ })
  try {
    await client.emails.send({
      from: FROM,
      to,
      subject: `You're in! Tickets confirmed for ${eventTitle}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">BOOKING CONFIRMED</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:${BRAND.ink};">You're going to ${eventTitle}!</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${guestName}, your tickets are confirmed. We can't wait to see you there!
        </p>
        <div style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};width:120px;">Booking ref</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${bookingRef.slice(0,8).toUpperCase()}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Date</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${dateStr}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Time</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${timeStr}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Location</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${eventLocation}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Tickets</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${tickets} ticket${tickets > 1 ? 's' : ''}</td></tr>
            <tr style="border-top:1px solid ${BRAND.border};"><td style="padding:10px 0 0;font-size:14px;color:${BRAND.ink};font-weight:700;">Total paid</td><td style="padding:10px 0 0;font-size:14px;color:${BRAND.ink};font-weight:700;">IDR ${totalPrice.toLocaleString('id-ID')}</td></tr>
          </table>
        </div>
        <a href="${SITE_URL}/profile?tab=bookings" style="display:inline-block;padding:14px 28px;background-color:${BRAND.ink};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
          View booking →
        </a>
        <p style="margin:24px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          Questions? Reply to this email or contact us at hello@balible.com
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] event booking confirmation failed:', err)
    return { sent: false }
  }
}

// ── Event booking cancellation (admin-initiated) ───────────────────────────────

export async function sendEventBookingCancellationEmail(input: {
  to: string
  guestName: string
  bookingRef: string
  eventTitle: string
  eventDate: Date
  tickets: number
  totalPaid: number
}): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) return { sent: false }
  const { to, guestName, bookingRef, eventTitle, eventDate, tickets, totalPaid } = input
  const TZ = 'Asia/Makassar'
  const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: TZ })
  try {
    await client.emails.send({
      from: FROM,
      to,
      subject: `Your tickets for ${eventTitle} have been cancelled`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:#B66A45;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">BOOKING CANCELLED</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">Your event tickets have been cancelled</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${guestName}, your tickets for <strong style="color:${BRAND.ink};">${eventTitle}</strong> have been cancelled by our team.
          If you paid for these tickets, your refund will be processed within <strong style="color:${BRAND.ink};">3–5 business days</strong>.
        </p>
        <div style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};width:120px;">Booking ref</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${bookingRef.slice(0,8).toUpperCase()}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Event</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${eventTitle}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Date</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${dateStr}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Tickets</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${tickets} ticket${tickets > 1 ? 's' : ''}</td></tr>
            ${totalPaid > 0 ? `<tr style="border-top:1px solid ${BRAND.border};"><td style="padding:10px 0 0;font-size:14px;color:${BRAND.ink};font-weight:700;">Refund amount</td><td style="padding:10px 0 0;font-size:14px;color:${BRAND.ink};font-weight:700;">IDR ${totalPaid.toLocaleString('id-ID')}</td></tr>` : ''}
          </table>
        </div>
        ${totalPaid > 0 ? `
        <div style="padding:16px 20px;background-color:#FEF9EC;border-radius:10px;border:1px solid #E8D4B8;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:13px;color:${BRAND.ink};font-weight:600;">What happens next?</p>
          <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.75;">
            Your refund will be processed within 3–5 business days. It may take a further 3–7 business days to appear on your original payment method depending on your bank.
          </p>
        </div>` : ''}
        <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          Questions? Reply to this email or contact us at hello@balible.com and quote your booking reference.
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] event booking cancellation email failed:', err)
    return { sent: false }
  }
}

export async function sendHostEventAlert(input: {
  to: string
  hostName: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  bookingRef: string
  eventTitle: string
  eventDate: Date
  eventLocation: string
  tickets: number
  totalPrice: number
}): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) return { sent: false }
  const TZ = 'Asia/Makassar'
  const dateStr = input.eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: TZ })
  const timeStr = input.eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ })
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:7px 0;font-size:13px;color:${BRAND.muted};width:130px;vertical-align:top;">${label}</td>
      <td style="padding:7px 0;font-size:14px;color:${BRAND.ink};font-weight:600;">${value}</td>
    </tr>`
  try {
    await client.emails.send({
      from: FROM,
      to: input.to,
      subject: `New ticket sale — ${input.eventTitle} (${input.tickets} ticket${input.tickets > 1 ? 's' : ''})`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">New ticket sale</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">${input.eventTitle}</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          Hi ${input.hostName}, someone just bought tickets for your event. Here are the details.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};margin-bottom:20px;">
          ${row('Booking ref', input.bookingRef.slice(0, 8).toUpperCase())}
          ${row('Date', `${dateStr} · ${timeStr} WITA`)}
          ${row('Location', input.eventLocation)}
          ${row('Tickets', `${input.tickets} ticket${input.tickets > 1 ? 's' : ''}`)}
          ${row('Guest name', input.guestName)}
          ${row('Guest email', input.guestEmail)}
          ${input.guestPhone ? row('Guest phone', input.guestPhone) : ''}
          ${input.totalPrice > 0 ? row('Amount received', `IDR ${input.totalPrice.toLocaleString('id-ID')}`) : ''}
        </table>
        <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.7;">
          Questions? Contact us at hello@balible.com.
        </p>
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] host event alert failed:', err)
    return { sent: false }
  }
}

export async function sendAdminEventCancellationAlert(input: {
  bookingRef: string
  guestName: string
  guestEmail: string
  guestPhone: string
  eventTitle: string
  eventDate: Date
  tickets: number
  totalPaid: number
}): Promise<{ sent: boolean }> {
  const client = getClient()
  if (!client) return { sent: false }
  const { bookingRef, guestName, guestEmail, guestPhone, eventTitle, eventDate, tickets, totalPaid } = input
  const TZ = 'Asia/Makassar'
  const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: TZ })
  try {
    await client.emails.send({
      from: FROM,
      to: 'hello@balible.com',
      subject: `[Event Cancelled] ${bookingRef.slice(0,8).toUpperCase()} — ${eventTitle}`,
      html: layout(`
        <p style="margin:0 0 4px;font-size:13px;color:#B66A45;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">⚠️ EVENT BOOKING CANCELLED</p>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${BRAND.ink};">Event Booking Cancelled${totalPaid > 0 ? ' — Refund Required' : ''}</h1>
        <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};line-height:1.7;">
          An event booking has been cancelled by admin.${totalPaid > 0 ? ' Please process the refund via the Midtrans dashboard within 3 business days.' : ''}
        </p>
        <div style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};width:130px;">Booking ref</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${bookingRef.slice(0,8).toUpperCase()}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Event</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${eventTitle}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Event date</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${dateStr}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Tickets</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${tickets} ticket${tickets > 1 ? 's' : ''}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Guest</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${guestName}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Email</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${guestEmail}</td></tr>
            ${guestPhone ? `<tr><td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Phone</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${guestPhone}</td></tr>` : ''}
            ${totalPaid > 0 ? `<tr style="border-top:1px solid ${BRAND.border};"><td style="padding:10px 0 0;font-size:14px;color:${BRAND.ink};font-weight:700;">Refund amount</td><td style="padding:10px 0 0;font-size:14px;color:${BRAND.ink};font-weight:700;">IDR ${totalPaid.toLocaleString('id-ID')}</td></tr>` : ''}
          </table>
        </div>
        ${totalPaid > 0 ? `<a href="https://dashboard.midtrans.com" style="display:inline-block;padding:12px 24px;background-color:${BRAND.ink};color:white;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">Open Midtrans Dashboard →</a>` : ''}
      `),
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] admin event cancellation alert failed:', err)
    return { sent: false }
  }
}
