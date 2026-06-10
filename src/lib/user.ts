'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getOrCreateNeonUser() {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email =
    clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@balible.app`
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    email.split('@')[0]
  const image = clerkUser.imageUrl || null

  try {
    return await prisma.user.upsert({
      where: { clerkId: userId },
      update: { name, image },
      create: { clerkId: userId, name, email, image },
    })
  } catch {
    // Email already exists (pre-seeded user) — link it to Clerk
    try {
      return await prisma.user.update({
        where: { email },
        data: { clerkId: userId, name, image },
      })
    } catch {
      return null
    }
  }
}
