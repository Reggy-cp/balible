import { Resend } from 'resend'

// Without RESEND_API_KEY all senders no-op so subscribe/booking flows never break.
// Until a domain is verified in Resend, EMAIL_FROM must stay on onboarding@resend.dev
// and delivery only works to the Resend account owner's address (test mode).
const FROM = process.env.EMAIL_FROM ?? 'Balible <onboarding@resend.dev>'

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
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:#ffffff;letter-spacing:0.05em;">BALIBLE</span>
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
        <a href="https://balible.vercel.app/search" style="display:inline-block;padding:12px 24px;background-color:${BRAND.gold};color:${BRAND.ink};font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">
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
