'use server'

import { prisma } from './prisma'
import { getSessionUser } from './user'

export type NotificationRow = {
  id: string
  type: string
  title: string
  body: string
  href: string | null
  read: boolean
  createdAt: string
}

export async function getMyNotifications(): Promise<{ notifications: NotificationRow[]; unread: number }> {
  try {
    const user = await getSessionUser()
    if (!user) return { notifications: [], unread: 0 }
    const [rows, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
    ])
    return {
      notifications: rows.map(n => ({
        id: n.id, type: n.type, title: n.title, body: n.body,
        href: n.href, read: n.read, createdAt: n.createdAt.toISOString(),
      })),
      unread,
    }
  } catch {
    return { notifications: [], unread: 0 }
  }
}

export async function markMyNotificationsRead(): Promise<{ ok: boolean }> {
  try {
    const user = await getSessionUser()
    if (!user) return { ok: false }
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
