import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const home = new URL('/', request.url)
  const response = NextResponse.redirect(home)

  const isProd = process.env.NODE_ENV === 'production'
  const sessionCookie = isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token'

  // Clear the session cookie with the same options it was set with
  response.cookies.set(sessionCookie, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProd,
    domain: isProd ? '.balible.com' : undefined,
    maxAge: 0,
  })

  // Also clear any other next-auth cookies
  for (const name of ['next-auth.csrf-token', '__Host-next-auth.csrf-token', 'next-auth.callback-url', '__Secure-next-auth.callback-url']) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 })
  }

  return response
}
