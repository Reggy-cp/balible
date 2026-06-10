'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2 } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'What experience is best for couples?',
  'What should I do in Ubud?',
  'Best budget-friendly activities?',
  'How does booking work?',
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm" style={{ backgroundColor: '#F5F1EB', width: 'fit-content' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', backgroundColor: '#C8A97E', display: 'block',
          animation: `dot-bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`@keyframes dot-bounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-4px);opacity:1} }`}</style>
    </div>
  )
}

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ backgroundColor: '#C8A97E' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>K</span>
        </div>
      )}
      <div
        style={{
          maxWidth: '78%', padding: '10px 14px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          backgroundColor: isUser ? '#111111' : '#F5F1EB',
          color: isUser ? 'white' : '#111111',
          fontSize: 14, lineHeight: 1.55, fontFamily: 'var(--font-inter)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {msg.content}
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('balible:open-chat', handler)
    return () => window.removeEventListener('balible:open-chat', handler)
  }, [])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    setError('')

    const updated: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(updated)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })

      if (!res.ok) throw new Error('Service unavailable')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let reply = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        reply += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: reply }
          return next
        })
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <>
      {/* ── DESKTOP FLOATING BUTTON ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="hidden lg:flex fixed items-center gap-3 hover:scale-105 active:scale-95 transition-transform"
          style={{
            bottom: 28, right: 28, zIndex: 901,
            height: 54, padding: '0 22px 0 10px',
            backgroundColor: '#111111', borderRadius: 999,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(0,0,0,0.22)',
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#C8A97E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>K</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'white', margin: 0, lineHeight: 1.3 }}>Chat with Kala</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.2 }}>AI experience guide</p>
          </div>
        </button>
      )}

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div
          style={{
            position: 'fixed', bottom: 80, right: 16, zIndex: 900,
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(520px, calc(100vh - 160px))',
            backgroundColor: 'white', borderRadius: 20,
            boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
            border: '1px solid #E8E4DE',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            fontFamily: 'var(--font-inter)',
          }}
          className="lg:bottom-[100px] lg:right-7"
        >
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8E4DE', backgroundColor: '#111111', flexShrink: 0 }}>
            <div className="flex items-center gap-2.5">
              <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#C8A97E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>K</span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: 0 }}>Kala</p>
                <p style={{ fontSize: 11, color: '#9E9A94', margin: 0 }}>Balible AI · usually replies instantly</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={16} color="#9E9A94" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto" style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isEmpty && (
              <div style={{ textAlign: 'center', paddingTop: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#C8A97E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <span style={{ fontSize: 22 }}>🌴</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111111', marginBottom: 4 }}>Hi! I&apos;m Kala</p>
                <p style={{ fontSize: 13, color: '#6F675C', marginBottom: 20, lineHeight: 1.5 }}>
                  Your Bali experience guide. Ask me anything about activities, bookings, or travel tips.
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      style={{
                        padding: '8px 14px', borderRadius: 12, fontSize: 13, cursor: 'pointer', textAlign: 'left',
                        backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE', color: '#111111',
                        fontFamily: 'var(--font-inter)', transition: 'background-color 0.15s',
                      }}
                      className="hover:bg-stone-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ backgroundColor: '#C8A97E' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>K</span>
                </div>
                <TypingDots />
              </div>
            )}
            {error && (
              <p style={{ fontSize: 12, color: '#B66A45', textAlign: 'center' }}>{error}</p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #E8E4DE', flexShrink: 0, backgroundColor: 'white' }}>
            <div className="flex items-center gap-2" style={{ border: '1px solid #E8E4DE', borderRadius: 12, padding: '6px 6px 6px 14px', backgroundColor: '#FAFAF9' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                placeholder="Ask about experiences, Bali tips…"
                disabled={loading}
                style={{
                  flex: 1, border: 'none', outline: 'none', fontSize: 14,
                  color: '#111111', backgroundColor: 'transparent',
                  fontFamily: 'var(--font-inter)',
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                style={{
                  width: 34, height: 34, borderRadius: 9, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                  backgroundColor: input.trim() && !loading ? '#111111' : '#E8E4DE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background-color 0.15s', flexShrink: 0,
                }}
              >
                {loading
                  ? <Loader2 size={15} color="#9E9A94" style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send size={15} color={input.trim() ? 'white' : '#9E9A94'} />
                }
              </button>
            </div>
            <p style={{ fontSize: 10, color: '#9E9A94', textAlign: 'center', marginTop: 6 }}>
              Powered by Claude AI
            </p>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
