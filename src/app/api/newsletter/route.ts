import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletterWelcome } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    // Throttle by IP — subscribing triggers an email send, so it's a spam vector.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const { allowed } = checkRateLimit(`newsletter:${ip}`, 5, 600_000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

    const { email, source } = await req.json()

    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalized } })
    if (!existing) {
      await prisma.newsletterSubscriber.create({
        data: {
          email: normalized,
          source: typeof source === 'string' ? source.slice(0, 50) : 'homepage',
        },
      })
      // Welcome email is best-effort — a send failure must not fail the subscribe
      await sendNewsletterWelcome(normalized)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
