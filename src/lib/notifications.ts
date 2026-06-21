import { prisma } from './prisma'
import { sendPushToUser } from './push'

// Server-only helper. Deliberately NOT a 'use server' action — notifications
// are created by trusted server code (booking actions, payment webhook), never
// directly from the client.
export type NotificationType = 'booking' | 'payment' | 'info'

export async function createNotification(input: {
  userId: string
  type: NotificationType
  title: string
  body: string
  href?: string
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        href: input.href ?? null,
      },
    })
    // Best-effort push — doesn't block and won't throw
    sendPushToUser(input.userId, { title: input.title, body: input.body, href: input.href }).catch(() => {})
  } catch (err) {
    // Best-effort: a notification failure must never break the calling flow
    console.error('[notifications] create failed:', err)
  }
}
