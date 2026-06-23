import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessName, description, phone, area, website } = await req.json()
  if (!businessName?.trim() || !description?.trim())
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: 'OPERATOR' },
  })

  const operator = await prisma.operator.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      businessName: businessName.trim(),
      description: description.trim(),
      phone: phone?.trim() || null,
      area: area?.trim() || null,
      website: website?.trim() || null,
    },
    update: {
      businessName: businessName.trim(),
      description: description.trim(),
      phone: phone?.trim() || null,
      area: area?.trim() || null,
      website: website?.trim() || null,
    },
  })

  return NextResponse.json({ operatorId: operator.id })
}
