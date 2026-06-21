import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const home = new URL('/', request.url)
  const response = NextResponse.redirect(home)

  const isProd = process.env.NODE_ENV === 'production'
  const sessionCookie = isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token'

  // Delete cookie WITH domain (for sessions set after domain config was added)
  if (isProd) {
    response.headers.append(
      'Set-Cookie',
      `${sessionCookie}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax; Domain=.balible.com`
    )
  }

  // Delete cookie WITHOUT domain (for older sessions set before domain config, or exact-host cookies)
  response.headers.append(
    'Set-Cookie',
    `${sessionCookie}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; ${isProd ? 'Secure; ' : ''}SameSite=Lax`
  )

  // Also clear CSRF and callback cookies
  for (const [name, attrs] of [
    ['next-auth.csrf-token', ''],
    ['__Host-next-auth.csrf-token', 'Secure; '],
    ['next-auth.callback-url', ''],
    ['__Secure-next-auth.callback-url', 'Secure; '],
  ] as const) {
    response.headers.append(
      'Set-Cookie',
      `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; ${attrs}SameSite=Lax`
    )
  }

  return response
}
