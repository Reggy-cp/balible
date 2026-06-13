'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function setRole(role: 'customer' | 'host') {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/sign-in')

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: role === 'host' ? 'OPERATOR' : 'TOURIST' },
  })

  redirect(role === 'host' ? '/dashboard' : '/')
}
