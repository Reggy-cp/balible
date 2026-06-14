import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { payoutBank, payoutAccountNumber, payoutAccountName } = await req.json()

  await prisma.operator.update({
    where: { userId: session.user.id },
    data: {
      payoutBank: payoutBank?.trim() || null,
      payoutAccountNumber: payoutAccountNumber?.trim() || null,
      payoutAccountName: payoutAccountName?.trim() || null,
    },
  })

  return NextResponse.json({ ok: true })
}
