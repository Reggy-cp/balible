'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Bell, X } from 'lucide-react'

const STORAGE_KEY = 'balible_push_asked'

export default function PushPrompt() {
  const { status } = useSession()
  const [visible, setVisible] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission !== 'default') return
    if (localStorage.getItem(STORAGE_KEY)) return

    // Register SW silently so it's ready
    navigator.serviceWorker.register('/sw.js').catch(() => {})

    // Show banner after 4 s
    const t = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(t)
  }, [status])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed')
    setVisible(false)
  }

  const allow = async () => {
    setSubscribing(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { dismiss(); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      const json = sub.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys }),
      })
      localStorage.setItem(STORAGE_KEY, 'granted')
    } catch {
      // ignore — if it fails, we just hide the banner
    } finally {
      setVisible(false)
      setSubscribing(false)
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed z-50 flex items-start gap-3 p-4 shadow-xl"
      style={{
        bottom: 24, left: '50%', transform: 'translateX(-50%)',
        width: 'min(380px, calc(100vw - 32px))',
        backgroundColor: '#111111', borderRadius: 14,
        fontFamily: 'var(--font-inter)',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }`}</style>

      <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(200,169,126,0.15)' }}>
        <Bell size={15} style={{ color: '#C8A97E' }} />
      </div>

      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>
          Stay updated
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 10 }}>
          Get instant alerts for bookings and messages.
        </p>
        <div className="flex gap-2">
          <button onClick={allow} disabled={subscribing}
            style={{ height: 32, paddingInline: 14, borderRadius: 8, border: 'none', backgroundColor: '#C8A97E', color: 'white', fontSize: 12, fontWeight: 600, cursor: subscribing ? 'default' : 'pointer', opacity: subscribing ? 0.7 : 1 }}>
            {subscribing ? '…' : 'Allow'}
          </button>
          <button onClick={dismiss}
            style={{ height: 32, paddingInline: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>
            Not now
          </button>
        </div>
      </div>

      <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
        <X size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
      </button>
    </div>
  )
}
