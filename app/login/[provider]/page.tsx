'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { setCookie } from 'cookies-next'

interface CallBackProps {
  params: { provider: string }
  searchParams: {
    code?: string
    state?: string
  }
}

export default function CallBack({ params, searchParams }: CallBackProps) {
  const provider = params.provider
  const code = searchParams.code
  const state = searchParams.state
  const router = useRouter()
  const isCalled = useRef(false) // useRef to track if the call has been made

  useEffect(() => {
    if (isCalled.current) return // Return if already called

    let query: string
    switch (provider) {
      case 'naver':
        query = `code=${code}&state=${state}`
        break

      case 'google':
        query = `code=${code}`
        break

      default:
        query = ``
        break
    }

    const getAccessToken = async () => {
      try {
        const response = await axios.get(
          `http://hansung-fiveguys.duckdns.org:8080/api/v1/oauth/${provider}?${query}`,
          { withCredentials: true }
        )
        const { access_token } = response.data.data.accessToken
        if (response.data.code === 200) {
          setCookie('access_token', access_token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 30,
            path: '/'
          })
          router.push('/')
        } else {
          console.error('Error response:', response.data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    getAccessToken()
    isCalled.current = true // Set the ref to true to prevent further calls
  }, [provider, code, state, router])

  return (
    <div className="flex items-center justify-center h-screen">로그인 중</div>
  )
}
