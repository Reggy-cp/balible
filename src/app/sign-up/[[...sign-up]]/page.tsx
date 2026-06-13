import SignUpForm from '@/components/SignUpForm'

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
      switchLink={null}
    />
  )
}
