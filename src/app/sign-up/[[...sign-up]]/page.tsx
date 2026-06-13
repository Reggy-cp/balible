import SignUpForm from '@/components/SignUpForm'
import Link from 'next/link'

export default function TravelerSignUpPage() {
  return (
    <SignUpForm
      role="TOURIST"
      panelBg="#111111"
      headline="Discover Bali like never before."
      subCopy="Book unique experiences, save your favourites, and connect with the best local hosts in Bali."
      heading="Create your traveler account"
      submitLabel="Create account"
      redirectTo="/"
      switchLink={
        <>
          Want to host?{' '}
          <Link href="/sign-up/host" style={{ color: '#111111', fontWeight: 600, textDecoration: 'none' }}>
            Sign up as a Host →
          </Link>
        </>
      }
    />
  )
}
