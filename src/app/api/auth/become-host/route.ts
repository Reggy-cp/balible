import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken, encode } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/dashboard'

  const isProd = process.env.NODE_ENV === 'production'
  const cookieName = isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
  const secret = process.env.NEXTAUTH_SECRET!

  // Read the current JWT from the incoming cookie
  const token = await getToken({ req: request, secret })

  if (token?.id) {
    // Upgrade role in DB (only if currently TOURIST)
    await prisma.user.updateMany({
      where: { id: token.id as string, role: 'TOURIST' },
      data: { role: 'OPERATOR' },
    })

    // Re-encode the JWT with the updated role so the cookie is authoritative
    const newToken = { ...token, role: 'OPERATOR' }
    const encoded = await encode({ token: newToken, secret })

    const destination = new URL(next, request.url)
    const response = NextResponse.redirect(destination)

    response.cookies.set(cookieName, encoded, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: isProd,
      domain: isProd ? '.balible.com' : undefined,
      // Preserve the original expiry (maxAge from the decoded token's exp)
      maxAge: token.exp ? Math.floor((token.exp as number) - Date.now() / 1000) : 60 * 60 * 24 * 30,
    })

    return response
  }

  // No session — send to sign-in
  return NextResponse.redirect(new URL('/sign-in', request.url))
}
