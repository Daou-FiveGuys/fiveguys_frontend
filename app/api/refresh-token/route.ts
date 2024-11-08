import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// 상수 BASE_URL 설정
const BASE_URL = 'http://localhost:3000'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const access_token = request.cookies.get('access_token')

  // 토큰이 없을 경우 "/login"으로 리다이렉션
  if (!access_token) {
    const res = NextResponse.redirect(new URL(`${BASE_URL}/login`))
    res.cookies.delete('access_token') // 쿠키 삭제
    return res
  }

  try {
    // 토큰 리프레시 요청
    const response = await axios.get(
      'http://localhost:8080/api/v1/oauth/refresh-token',
      {
        params: {
          accessToken: `${access_token.value}`
        },
        withCredentials: true
      }
    )

    // 리프레시 성공
    if (response.data.code === 200) {
      const newAccessToken = response.data.data.accessToken

      // "/" 경로로 리다이렉션 및 쿠키 설정
      const res = NextResponse.redirect(new URL(`${BASE_URL}/`))
      res.cookies.set('access_token', newAccessToken, {
        httpOnly: false, // 클라이언트 접근 가능
        secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서 HTTPS만 허용
        maxAge: 60 * 60, // 1시간
        path: '/' // 전체 경로에 적용
      })
      return res
    }

    // 리프레시 실패 시 "/login"으로 리다이렉션
    const res = NextResponse.redirect(new URL(`${BASE_URL}/login`))
    res.cookies.delete('access_token') // 쿠키 삭제
    return res
  } catch (error) {
    console.error('Error refreshing token:', error)
    const res = NextResponse.redirect(new URL(`${BASE_URL}/login`))
    res.cookies.delete('access_token') // 쿠키 삭제
    return res
  }
}
