import { cookies } from 'next/headers'

// Server component — reads real CSRF token from request, no client-side JS fetch
export default async function SignOutPage() {
  const cookieStore = cookies()

  // NextAuth uses __Host-next-auth.csrf-token in production (Secure + no Domain)
  const csrfCookieName = process.env.NODE_ENV === 'production'
    ? '__Host-next-auth.csrf-token'
    : 'next-auth.csrf-token'

  // Cookie value is "token|hmac" — split to get just the token for the form field
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
      <form id="sf" method="POST" action="/api/auth/signout" style={{ display: 'none' }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="callbackUrl" value="/" />
      </form>
      {/* Inline script fires before React hydration — no async fetch, no race condition */}
      <script dangerouslySetInnerHTML={{ __html: 'document.getElementById("sf").submit()' }} />
    </>
  )
}
