'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

export async function getSessionUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bookings: { include: { experience: true } },
      reviews: true,
      wishlist: true,
      operator: true,
      notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })
}
