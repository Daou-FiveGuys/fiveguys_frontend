import { NextRequest, NextResponse } from 'next/server'
import { getUserRole, isTokenExpired } from './utils/token'

// 경로 매칭 유틸리티 함수
const matchUrl = (request: NextRequest, paths: string[]): boolean => {
  return paths.some(path => request.nextUrl.pathname.startsWith(path))
}

// 미들웨어
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const PUBLIC_PATHS = ['/login', '/signup', '/welcome']
  // const BASE_URL = 'http://hansung-fiveguys.duckdns.org'
  const BASE_URL = 'http://localhost:3000'

  const access_token = request.cookies.get('access_token')
  if (request.nextUrl.pathname === '/' && !access_token) {
    return NextResponse.redirect(new URL(`${BASE_URL}/welcome`, request.url))
  }

  // 공개 경로 요청인지 확인
  if (!access_token) {
    if (!matchUrl(request, PUBLIC_PATHS)) {
      return NextResponse.redirect(new URL(`${BASE_URL}/login`, request.url))
    }
    return NextResponse.next() // 공개 경로는 그대로 진행
  }

  try {
    const isExpired = isTokenExpired(access_token.value)
    const role = getUserRole(access_token.value)

    if (isExpired) {
      // 토큰 만료: `/api/refresh-token`으로 리다이렉트
      return NextResponse.redirect(
        new URL(`${BASE_URL}/api/refresh-token`, request.url)
      )
    }
    if (role === 'ROLE_VISITOR' && !matchUrl(request, ['/verify']))
      return NextResponse.redirect(new URL(`${BASE_URL}/verify`, request.url))
    if (
      role === 'ROLE_USER' &&
      matchUrl(request, ['/login', '/signup', '/verify'])
    )
      return NextResponse.redirect(new URL(`${BASE_URL}/`, request.url))
  } catch (error) {
    console.error('Error decoding token:', error)
    return NextResponse.redirect(new URL(`${BASE_URL}/login`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)'
}
