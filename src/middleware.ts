import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

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
        const protected_ = ['/dashboard', '/profile', '/admin', '/checkout']
        if (protected_.some(p => pathname.startsWith(p))) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/admin/:path*', '/checkout/:path*'],
}
