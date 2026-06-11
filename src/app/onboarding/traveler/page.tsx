import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function OnboardingTravelerPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const existing = user.publicMetadata?.role as string | undefined

  if (!existing) {
    await client.users.updateUser(userId, { publicMetadata: { role: 'customer' } })
  }

  redirect('/')
}
