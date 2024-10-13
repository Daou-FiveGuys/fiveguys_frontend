import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import {NextRequest, NextResponse} from "next/server";

export default NextAuth(authConfig).auth

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const session = request.cookies.get('user_session')

  // List of paths that don't require authentication
  const publicPaths = ['/login', '/register']

  // Check if the requested path is public
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (!session && !isPublicPath) {
    // Redirect to login page if there's no session and the path is not public
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Continue with the request if there's a session or if it's a public path
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
