'use client'

import { useEffect, useRef } from 'react'

export default function SignOutPage() {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then(r => r.json())
      .then(({ csrfToken }: { csrfToken: string }) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'csrfToken'
        input.value = csrfToken
        formRef.current?.appendChild(input)
        formRef.current?.submit()
      })
      .catch(() => { window.location.replace('/') })
  }, [])

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: '#F5F1EB',
        fontFamily: 'var(--font-inter)', color: '#6F675C', fontSize: 14,
      }}>
        Signing out…
      </div>
      <form ref={formRef} method="POST" action="/api/auth/signout" style={{ display: 'none' }}>
        <input type="hidden" name="callbackUrl" value="/" />
      </form>
    </>
  )
}
