import axios from 'axios'
import { refreshAccessToken } from './authService'
import { isTokenExpired } from '@/utils/token'
import { deleteCookie, getCookie, setCookie } from 'cookies-next'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true // 쿠키 전송 허용
})

apiClient.interceptors.request.use(
  async config => {
    if (config.url?.includes('/login') || config.url?.includes('/signup')) {
      return config
    }
    let accessToken = getCookie('access_token')
    console.log(accessToken)
    if (accessToken && isTokenExpired(accessToken)) {
      try {
        accessToken = await refreshAccessToken()
        setCookie('access_token', accessToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60,
          path: '/'
        })
      } catch (error) {
        deleteCookie('access_token')
        console.error('토큰 갱신 실패:', error)
        window.location.href = 'http://localhost:3000/login'
      }
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  error => Promise.reject(error)
)

apiClient.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error)
  }
)

export default apiClient
