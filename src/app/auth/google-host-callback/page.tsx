import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function GoogleHostCallback({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  const session = await getServerSession(authOptions)
  const next = searchParams.next ?? '/dashboard'

  if (session?.user?.id) {
    // Only upgrade TOURIST → OPERATOR; never demote an existing ADMIN/OPERATOR
    await prisma.user.updateMany({
      where: { id: session.user.id, role: 'TOURIST' },
      data: { role: 'OPERATOR' },
    })
  }

  redirect(next)
}
