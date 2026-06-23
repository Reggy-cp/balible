import SignUpForm from '@/components/SignUpForm'
import Link from 'next/link'

export default function HostSignUpPage() {
  return (
    <SignUpForm
      role="OPERATOR"
      panelBg="#2D4A3E"
      headline="Share your passion with the world."
      subCopy="List your experiences, set your own schedule, and welcome guests from around the world to authentic Bali."
      heading="Create your host account"
      submitLabel="Start hosting"
      redirectTo="/onboarding/host"
      switchLink={
        <>
          Looking to book?{' '}
          <Link href="/sign-up" style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }}>
            Sign up as a Traveler →
          </Link>
        </>
      }
    />
  )
}
