'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function setRole(role: 'customer' | 'host') {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const client = await clerkClient()
  await client.users.updateUser(userId, {
    publicMetadata: { role },
  })

  redirect(role === 'host' ? '/dashboard' : '/')
}
