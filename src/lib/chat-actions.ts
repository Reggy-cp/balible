'use server'

import { prisma } from './prisma'
import { getSessionUser } from '@/lib/user'

export type ChatMessage = {
  id: string
  content: string
  senderId: string
  senderName: string
  senderImage: string | null
  isOwn: boolean
  createdAt: Date
  read: boolean
}

export type ConversationSummary = {
  id: string
  otherName: string
  otherImage: string | null
  lastMessage: string
  lastMessageAt: Date
  unreadCount: number
}

// ── Shared: send a message ────────────────────────────────────────────────────

export async function sendMessageAction(
  conversationId: string,
  content: string,
): Promise<{ ok: boolean }> {
  const user = await getSessionUser()
  if (!user || !content.trim()) return { ok: false }

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { operator: { select: { userId: true } } },
  })
  if (!conv) return { ok: false }
  if (conv.userId !== user.id && conv.operator.userId !== user.id) return { ok: false }

  await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId: user.id, content: content.trim() },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ])
  return { ok: true }
}

// ── Shared: get messages ──────────────────────────────────────────────────────

export async function getMessagesAction(
  conversationId: string,
): Promise<ChatMessage[] | null> {
  const user = await getSessionUser()
  if (!user) return null

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { operator: { select: { userId: true } } },
  })
  if (!conv) return null
  if (conv.userId !== user.id && conv.operator.userId !== user.id) return null

  // Mark incoming messages as read
  await prisma.message.updateMany({
    where: { conversationId, read: false, NOT: { senderId: user.id } },
    data: { read: true },
  })

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return messages.map(m => ({
    id: m.id,
    content: m.content,
    senderId: m.senderId,
    senderName: m.sender.name ?? 'User',
    senderImage: m.sender.image,
    isOwn: m.senderId === user.id,
    createdAt: m.createdAt,
    read: m.read,
  }))
}

// ── Customer: open or create conversation with a host ─────────────────────────

export async function getOrCreateConversationAction(
  operatorId: string,
): Promise<{ ok: boolean; conversationId?: string }> {
  const user = await getSessionUser()
  if (!user) return { ok: false }

  const conv = await prisma.conversation.upsert({
    where: { userId_operatorId: { userId: user.id, operatorId } },
    create: { userId: user.id, operatorId },
    update: {},
  })
  return { ok: true, conversationId: conv.id }
}

// ── Customer: list own conversations ─────────────────────────────────────────

export async function listUserConversationsAction(): Promise<ConversationSummary[] | null> {
  const user = await getSessionUser()
  if (!user) return null

  const convs = await prisma.conversation.findMany({
    where: { userId: user.id },
    include: {
      operator: { select: { businessName: true, avatar: true, user: { select: { name: true, image: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true } },
      _count: { select: { messages: { where: { read: false, NOT: { senderId: user.id } } } } },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  return convs.map(c => ({
    id: c.id,
    otherName: c.operator.businessName || c.operator.user.name || 'Host',
    otherImage: c.operator.avatar || c.operator.user.image,
    lastMessage: c.messages[0]?.content ?? '',
    lastMessageAt: c.lastMessageAt,
    unreadCount: c._count.messages,
  }))
}

// ── Host: list conversations ──────────────────────────────────────────────────

export async function listHostConversationsAction(): Promise<ConversationSummary[] | null> {
  const user = await getSessionUser()
  if (!user) return null

  const op = await prisma.operator.findUnique({ where: { userId: user.id } })
  if (!op) return null

  const convs = await prisma.conversation.findMany({
    where: { operatorId: op.id },
    include: {
      user: { select: { name: true, image: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true } },
      _count: { select: { messages: { where: { read: false, NOT: { senderId: user.id } } } } },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  return convs.map(c => ({
    id: c.id,
    otherName: c.user.name ?? 'Guest',
    otherImage: c.user.image,
    lastMessage: c.messages[0]?.content ?? '',
    lastMessageAt: c.lastMessageAt,
    unreadCount: c._count.messages,
  }))
}

// ── Host: total unread count (for badge) ─────────────────────────────────────

export async function getHostUnreadCountAction(): Promise<number> {
  const user = await getSessionUser()
  if (!user) return 0

  const op = await prisma.operator.findUnique({ where: { userId: user.id } })
  if (!op) return 0

  return prisma.message.count({
    where: { conversation: { operatorId: op.id }, read: false, NOT: { senderId: user.id } },
  })
}
