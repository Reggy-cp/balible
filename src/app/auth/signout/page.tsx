import { cookies } from 'next/headers'

// Server component — reads CSRF from request, auto-submits form to NextAuth signout.
// After NextAuth redirects, /api/auth/logout also fires to ensure the cookie is deleted
// regardless of whether it was originally set with or without a Domain attribute.
export default async function SignOutPage() {
  const cookieStore = cookies()

  const csrfCookieName = process.env.NODE_ENV === 'production'
    ? '__Host-next-auth.csrf-token'
    : 'next-auth.csrf-token'

  const rawCsrf = cookieStore.get(csrfCookieName)?.value ?? ''
  const csrfToken = rawCsrf.split('|')[0]

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: '#F5F1EB',
        fontFamily: 'var(--font-inter)', color: '#6F675C', fontSize: 14,
      }}>
        Signing out…
      </div>
      {/*
        callbackUrl points to our custom logout route which deletes the session cookie
        with both Domain and no-Domain variants — covering sessions set under either config.
      */}
      <form id="sf" method="POST" action="/api/auth/signout" style={{ display: 'none' }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="callbackUrl" value="/api/auth/logout" />
      </form>
      <script dangerouslySetInnerHTML={{ __html: 'document.getElementById("sf").submit()' }} />
    </>
  )
}
