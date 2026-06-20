'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import SignUpForm from '@/components/SignUpForm'

function TravelerSignUpInner() {
  const params = useSearchParams()
  const redirectTo = params.get('callbackUrl') || '/'
  return (
    <SignUpForm
      role="TOURIST"
      panelBg="#111111"
      headline="Discover Bali like never before."
      subCopy="Book unique experiences, save your favourites, and connect with the best local hosts in Bali."
      heading="Create your traveler account"
      submitLabel="Create account"
      redirectTo={redirectTo}
      switchLink={null}
    />
  )
}

export default function TravelerSignUpPage() {
  return (
    <Suspense>
      <TravelerSignUpInner />
    </Suspense>
  )
}
