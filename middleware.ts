import { NextRequest, NextResponse } from 'next/server'
import { decode } from 'js-base64'

// 토큰 만료 여부 확인 함수
function isTokenExpired(exp: string): boolean {
  const currentTime = Math.floor(Date.now() / 1000) // 현재 시간을 초 단위로 계산
  return Number(exp) < currentTime
}

// 경로 매칭 유틸리티 함수
const matchUrl = (request: NextRequest, paths: string[]): boolean => {
  return paths.some(path => request.nextUrl.pathname.startsWith(path))
}

// 미들웨어
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const PUBLIC_PATHS = ['/login', '/signup']
  const BASE_URL = 'http://localhost:3000'

  const access_token = request.cookies.get('access_token')

  // 공개 경로 요청인지 확인
  if (!access_token) {
    if (!matchUrl(request, PUBLIC_PATHS)) {
      return NextResponse.redirect(new URL(`${BASE_URL}/login`, request.url))
    }
    return NextResponse.next() // 공개 경로는 그대로 진행
  }

  try {
    const payload = access_token.value.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload)) // Base64 디코딩
    const isExpired = isTokenExpired(decodedPayload.exp)
    const role = decodedPayload.auth[0].authority

    if (isExpired) {
      // 토큰 만료: `/api/refresh-token`으로 리다이렉트
      return NextResponse.redirect(
        new URL(`${BASE_URL}/api/refresh-token`, request.url)
      )
    }
    if (role === 'ROLE_VISITOR' && !matchUrl(request, ['/verify']))
      return NextResponse.redirect(new URL(`${BASE_URL}/verify`, request.url))
    if (role === 'ROLE_USER' && matchUrl(request, ['/login', 'signup']))
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
