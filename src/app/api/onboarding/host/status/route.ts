import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ complete: false, profile: null, profileComplete: false })

  const op = await prisma.operator.findUnique({
    where: { userId: session.user.id },
    select: {
      businessName: true,
      description: true,
      phone: true,
      area: true,
      website: true,
      payoutBank: true,
      payoutAccountNumber: true,
    },
  })

  if (!op) return NextResponse.json({ complete: false, profile: null, profileComplete: false })

  const profileComplete = !!(op.businessName && op.description && op.phone && op.area)
  const bankComplete    = !!(op.payoutBank && op.payoutAccountNumber)
  const complete        = profileComplete && bankComplete

  return NextResponse.json({
    complete,
    profileComplete,
    profile: {
      businessName: op.businessName,
      bio: op.description,
      phone: op.phone,
      area: op.area,
      website: op.website,
    },
  })
}
