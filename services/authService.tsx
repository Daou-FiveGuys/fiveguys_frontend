import axios from 'axios'
import { getCookie } from '@/utils/cookies' // 쿠키에서 값 읽는 유틸리티

export async function refreshAccessToken(): Promise<string> {
  try {
    // 쿠키에서 만료된 accessToken 가져오기
    const expiredAccessToken = getCookie('access_token')
    if (!expiredAccessToken) {
      throw new Error('Access Token이 쿠키에 없습니다.')
    }

    // Refresh Token API 요청
    const response = await axios.get(
      'https://localhost:8080/api/v1/oauth/refresh-token',
      {
        withCredentials: true, // HttpOnly 쿠키 전송
        headers: {
          Authorization: `Bearer ${expiredAccessToken}` // 만료된 accessToken 포함
        }
      }
    )

    return response.data.data.accessToken
  } catch (error) {
    console.error('토큰 갱신 실패:', error)
    throw new Error('토큰 갱신 실패') // 실패 시 예외 발생
  }
}
