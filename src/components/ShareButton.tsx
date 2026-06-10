'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Link2, Check } from 'lucide-react'

export default function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getUrl = () => `${window.location.origin}/experiences/${slug}`
  const getText = () => `Check out ${title} on Balible`

  const openShare = (platform: string) => {
    const url = encodeURIComponent(getUrl())
    const text = encodeURIComponent(getText())
    const links: Record<string, string> = {
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    }
    window.open(links[platform], '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(getUrl())
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 1500)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Share"
        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
        style={{ border: 'none', cursor: 'pointer', flexShrink: 0 }}
      >
        <Share2 size={14} color="#6F675C" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 bg-white rounded-xl shadow-xl z-50 py-2"
          style={{ width: 200, border: '1px solid #F0EDE8' }}
        >
          <button
            onClick={() => openShare('whatsapp')}
            className="flex items-center gap-3 w-full px-4 hover:bg-[#FAF8F5] text-left"
            style={{ paddingTop: 10, paddingBottom: 10 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>WhatsApp</span>
          </button>

          <button
            onClick={() => openShare('twitter')}
            className="flex items-center gap-3 w-full px-4 hover:bg-[#FAF8F5] text-left"
            style={{ paddingTop: 10, paddingBottom: 10 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857L1.254 2.25H8.08l4.259 5.629 5.905-5.629Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>X / Twitter</span>
          </button>

          <button
            onClick={() => openShare('facebook')}
            className="flex items-center gap-3 w-full px-4 hover:bg-[#FAF8F5] text-left"
            style={{ paddingTop: 10, paddingBottom: 10 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>Facebook</span>
          </button>

          <div style={{ height: 1, background: '#F0EDE8', margin: '4px 16px' }} />

          <button
            onClick={copyLink}
            className="flex items-center gap-3 w-full px-4 hover:bg-[#FAF8F5] text-left"
            style={{ paddingTop: 10, paddingBottom: 10 }}
          >
            {copied
              ? <Check size={18} color="#4CAF50" />
              : <Link2 size={18} color="#6F675C" />
            }
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: copied ? '#4CAF50' : '#111111' }}>
              {copied ? 'Link copied!' : 'Copy link'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
