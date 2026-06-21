'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: '/' })
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#F5F1EB',
      fontFamily: 'var(--font-inter)', color: '#6F675C', fontSize: 14,
    }}>
      Signing out…
    </div>
  )
}
