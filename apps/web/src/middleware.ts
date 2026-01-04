import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for route protection
 * - Redirects authenticated users from /login and /register to /dashboard
 * - Allows unauthenticated access to public routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user has auth token (httpOnly cookie)
  const hasAuthToken = request.cookies.has('auth_token')

  // Protected Routes: Redirect unauthenticated users to login
  if (!hasAuthToken && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Auth Routes: Redirect authenticated users from login/register to dashboard
  if (hasAuthToken && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow all other requests
  return NextResponse.next()
}

/**
 * Matcher configuration
 * Only run middleware on specific paths
 */
export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
  ],
}
