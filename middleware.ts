import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/admin(.*)',
  '/checkout(.*)',
  '/onboarding(.*)',
])

const isHostRoute   = createRouteMatcher(['/dashboard(.*)'])
const isAdminRoute  = createRouteMatcher(['/admin(.*)'])
const isOnboarding  = createRouteMatcher(['/onboarding', '/onboarding/(.*)'])
const isPublicAuth  = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Already signed in — skip sign-in/sign-up pages
  if (userId && isPublicAuth(req)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Require authentication for protected routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // Role-based checks (only when signed in)
  if (userId) {
    let role: string | undefined
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      role = user.publicMetadata?.role as string | undefined
    } catch {
      role = undefined
    }

    // No role set yet → redirect to onboarding (but not if already going there)
    if (!role && !isOnboarding(req) && isProtectedRoute(req)) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    // Dashboard requires host or admin role
    if (isHostRoute(req) && role !== 'host' && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Admin requires admin role
    if (isAdminRoute(req) && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
