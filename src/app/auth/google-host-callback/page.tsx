'use client'

import { useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { upgradeToOperatorAction } from '@/lib/actions'

function GoogleHostCallbackInner() {
  const { update } = useSession()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'

  useEffect(() => {
    async function run() {
      await upgradeToOperatorAction()
      await update()  // re-mints JWT with trigger='update' so role becomes OPERATOR
      router.push(next)
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F1EB', fontFamily: 'var(--font-inter)' }}>
      <p style={{ fontSize: 14, color: '#6F675C' }}>Setting up your host account…</p>
    </div>
  )
}

export default function GoogleHostCallback() {
  return (
    <Suspense>
      <GoogleHostCallbackInner />
    </Suspense>
  )
}
