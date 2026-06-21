'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Heart } from 'lucide-react'

const HOST_KEY = 'balible_saved_hosts'

function getSavedHosts(): string[] {
  try { return JSON.parse(localStorage.getItem(HOST_KEY) ?? '[]') } catch { return [] }
}

export function HostChatButton({ firstName }: { firstName: string }) {
  const openChat = () => window.dispatchEvent(new CustomEvent('balible:open-chat'))
  return (
    <button
      onClick={openChat}
      className="flex items-center gap-2 hover:opacity-90 transition-opacity"
      style={{ height: 44, paddingInline: 22, borderRadius: 22, backgroundColor: 'white', color: '#111111', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', flexShrink: 0 }}
    >
      <MessageCircle size={15} /> Chat with {firstName}
    </button>
  )
}

export function SaveHostButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getSavedHosts().includes(slug))
  }, [slug])

  const toggle = () => {
    const next = !saved
    setSaved(next)
    const list = getSavedHosts()
    const updated = next ? [...list, slug] : list.filter(s => s !== slug)
    localStorage.setItem(HOST_KEY, JSON.stringify(updated))
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 hover:opacity-90 transition-opacity"
      style={{ height: 44, paddingInline: 20, borderRadius: 22, border: '1.5px solid rgba(255,255,255,0.4)', backgroundColor: 'transparent', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
    >
      <Heart size={15} fill={saved ? '#ef4444' : 'none'} color={saved ? '#ef4444' : 'white'} />
      {saved ? 'Saved' : 'Save host'}
    </button>
  )
}

export function AskKalaButton({ firstName }: { firstName: string }) {
  const openChat = () => window.dispatchEvent(new CustomEvent('balible:open-chat'))
  return (
    <button
      onClick={openChat}
      className="w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      style={{ height: 40, borderRadius: 10, border: '1.5px solid #E8E4DE', fontSize: 13, fontWeight: 600, color: '#111111', backgroundColor: 'white', cursor: 'pointer' }}
    >
      ✦ Ask Kala about {firstName}
    </button>
  )
}
