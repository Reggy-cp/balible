import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl
    const host = req.headers.get('host') ?? ''
    const isHostSubdomain = host.startsWith('host.')

    // host.balible.com root → redirect to /dashboard
    if (isHostSubdomain && pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Dashboard requires OPERATOR or ADMIN role
    if (pathname.startsWith('/dashboard') && token?.role !== 'OPERATOR' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Admin requires ADMIN role
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl
        const host = req.headers.get('host') ?? ''
        const isHostSubdomain = host.startsWith('host.')

        // Require auth on host.balible.com root (middleware will redirect to /dashboard)
        if (isHostSubdomain && pathname === '/') return !!token

        const protected_ = ['/dashboard', '/profile', '/admin', '/checkout']
        if (protected_.some(p => pathname.startsWith(p))) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/', '/dashboard/:path*', '/profile/:path*', '/admin/:path*', '/checkout/:path*'],
}
