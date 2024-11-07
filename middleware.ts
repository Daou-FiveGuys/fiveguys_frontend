import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextRequest, NextResponse } from 'next/server'
import { access } from 'fs'
import axios from 'axios'
import { getCookie, getCookies, setCookie } from 'cookies-next'
import { decode } from 'js-base64'
import next from 'next'

function isTokenExpired(exp: string) {
  const currentTime = Math.floor(Date.now() / 1000) // 현재 시간 (초)
  return Number(exp) < currentTime // 만료 시간과 비교
}

const matchUrl = (request: NextRequest, paths: string[]) => {
  return paths.some(path => request.nextUrl.pathname.startsWith(path))
}

export default NextAuth(authConfig).auth
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const PUBLIC_PATHS = ['/login', '/signup']
  const ROLE_USER_NOT_ACCEESSABLE_PATHS = ['/verify', '/signup', '/login']
  const ROLE_VISITOR_ACCESSABLE_PATHS = ['/verify']
  // Check if the requested path is public
  const isPublicPath = matchUrl(request, PUBLIC_PATHS)

  const access_token = request.cookies.get('access_token')
  try {
    if (access_token) {
      // 토큰 검증
      const payload = access_token.value.split('.')[1]
      const decodedPayload = decode(payload)
      const jsonObject = JSON.parse(decodedPayload)
      const role = jsonObject.auth[0].authority
      const isExpired = isTokenExpired(jsonObject.exp)
      if (isExpired) {
        await axios
          .get(
            'http://hansung-fiveguys.duckdns.org:8080/api/v1/oauth/refresh-token',
            {
              headers: {
                Authorization: `Bearer ${access_token}`
              },
              withCredentials: true
            }
          )
          .then(res => {
            if (res.data.code === 200) {
              setCookie('access_token', '', { maxAge: -1 })
              setCookie('access_token', access_token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60,
                path: '/'
              })
              return NextResponse.redirect('/')
            }
            return NextResponse.redirect('/login')
          })
          .catch(err => {
            setCookie('access_token', '', { maxAge: -1 })
            return NextResponse.redirect('/login')
          })
      } else {
        // mathurl : 해당되면 true
        if (
          role === 'ROLE_USER' &&
          matchUrl(request, ROLE_USER_NOT_ACCEESSABLE_PATHS)
        ) {
          return NextResponse.redirect(new URL('/', request.url))
        } else if (
          role === 'ROLE_VISITOR' &&
          !matchUrl(request, ROLE_VISITOR_ACCESSABLE_PATHS)
        ) {
          return NextResponse.redirect(new URL('verify', request.url))
        }
      }
    }
    if (!access_token && !isPublicPath) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch (err) {
    console.log(err)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Continue with the request if there's a session or if it's a public path
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)'
}
