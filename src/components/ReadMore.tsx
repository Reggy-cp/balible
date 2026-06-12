'use client'

import { useState } from 'react'

export default function ReadMore({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.7 }}
        className={expanded ? '' : 'line-clamp-2'}>
        {text}
      </p>
      <button
        onClick={() => setExpanded(e => !e)}
        className="mt-1 hover:opacity-70 transition-opacity"
        style={{ background: 'none', border: 'none', fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', cursor: 'pointer', padding: 0 }}
      >
        {expanded ? 'Show less ↑' : 'Read more →'}
      </button>
    </>
  )
}
