'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Bell, CalendarCheck, CreditCard, Info, MessageCircle } from 'lucide-react'
import { getMyNotifications, markMyNotificationsRead, type NotificationRow } from '@/lib/notification-actions'

const TYPE_ICON: Record<string, typeof Bell> = {
  booking: CalendarCheck,
  payment: CreditCard,
  message: MessageCircle,
  info: Info,
}

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}

export default function NotificationBell() {
  const { status } = useSession()
  const isSignedIn = status === 'authenticated'
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationRow[]>([])
  const [unread, setUnread] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => {
    getMyNotifications()
      .then(({ notifications, unread }) => { setItems(notifications); setUnread(unread); setLoaded(true) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isSignedIn) return
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [isSignedIn, refresh])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!isSignedIn) return null

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      setUnread(0) // optimistic — items keep their read flags for styling until next refresh
      markMyNotificationsRead().catch(() => {})
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggle}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-stone-50 transition-colors"
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
      >
        <Bell size={18} style={{ color: '#111111' }} />
        {unread > 0 && (
          <span
            className="absolute flex items-center justify-center"
            style={{
              top: 4, right: 2, minWidth: 16, height: 16, padding: '0 4px',
              borderRadius: 8, backgroundColor: '#C0504D', color: 'white',
              fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-inter)',
            }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            fixed left-4 right-4 top-16
            sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[340px]
            bg-white rounded-2xl shadow-xl overflow-hidden
          "
          style={{ border: '1px solid #E8E4DE', zIndex: 200 }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #F5F1EB' }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 700, color: '#111111' }}>Notifications</p>
            <button
              onClick={() => setOpen(false)}
              className="sm:hidden flex items-center justify-center w-7 h-7 rounded-full hover:bg-stone-100 transition-colors"
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              aria-label="Close notifications"
            >
              <span style={{ fontSize: 16, color: '#6F675C', lineHeight: 1 }}>×</span>
            </button>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {!loaded ? (
              <p className="px-4 py-6 text-center" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>Loading…</p>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={22} style={{ color: '#E8E4DE', margin: '0 auto 8px' }} />
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>
                  No notifications yet — book an experience and updates will show up here.
                </p>
              </div>
            ) : (
              items.map(n => {
                const Icon = TYPE_ICON[n.type] ?? Info
                const inner = (
                  <div className="flex gap-3 px-4 py-3 hover:bg-stone-50 transition-colors" style={{ backgroundColor: n.read ? 'white' : '#FBF8F3' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F1EB' }}>
                      <Icon size={14} style={{ color: '#C8A97E' }} />
                    </div>
                    <div className="min-w-0">
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{n.title}</p>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', lineHeight: 1.5 }}>{n.body}</p>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#9E9A94', marginTop: 2 }}>{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                )
                return n.href ? (
                  <a key={n.id} href={n.href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</a>
                ) : (
                  <div key={n.id}>{inner}</div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
