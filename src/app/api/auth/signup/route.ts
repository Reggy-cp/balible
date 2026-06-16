import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  const ip = headers().get('x-forwarded-for') ?? 'unknown'
  const { allowed } = checkRateLimit(`signup:${ip}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please try again in a minute.' }, { status: 429 })
  }

  const { name, email, password, role } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role === 'OPERATOR' ? 'OPERATOR' : 'TOURIST',
    },
  })

  // Generate verification token and send email (non-blocking)
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })
  sendVerificationEmail(email, token).catch(err =>
    console.error('[signup] failed to send verification email:', err)
  )

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
