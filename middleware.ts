import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextRequest, NextResponse } from 'next/server'
import { access } from 'fs'
import axios from 'axios'
import { setCookie } from 'cookies-next'
import { decode } from 'js-base64'
import next from 'next'

export default NextAuth(authConfig).auth

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // List of paths that don't require authentication
  const publicPaths = ['/login', '/signup']

  // Check if the requested path is public
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // TODO 액세스 토큰 검증 로직 구현 or 액세스 토큰 검증 api 추가

  const access_token = request.cookies.get('access_token')
  if (access_token && !request.url.includes('/verify')) {
    try {
      const payload = access_token.value.split('.')[1]
      const decodedPayload = decode(payload)
      const payloadObject = JSON.parse(decodedPayload)

      if (payloadObject.auth[0].authority === 'ROLE_VISITOR') {
        return NextResponse.redirect(new URL('/verify', request.url))
      }
    } catch (err) {
      console.log(err)
    }
  } else if (access_token && request.url.includes('/verify')) {
    const payload = access_token.value.split('.')[1]
    const decodedPayload = decode(payload)
    const payloadObject = JSON.parse(decodedPayload)
    if (payloadObject.auth[0].authority === 'ROLE_USER') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (access_token && request.url.includes('login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!access_token && !isPublicPath) {
    // Redirect to login page if there's no session and the path is not public
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Continue with the request if there's a session or if it's a public path
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)'
}
