'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import apiClient from '@/services/apiClient'
import { setCookie } from 'cookies-next'
import {Progress} from "@/components/ui/progress";

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
  const [progress, setProgress] = useState(0)
  const [showRedirect, setShowRedirect] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  useEffect(() => {
    const duration = 7000 // 7초
    const interval = 50 // 업데이트 간격 (ms)
    const steps = duration / interval
    const increment = 100 / steps

    const timer = setInterval(() => {
      setProgress(prev => {
        let next = Math.min(prev + increment, 99)
        if (isRedirecting) {
          next = 100
          clearInterval(timer)
          setShowRedirect(true)
          setTimeout(() => {
            router.push('/') // 리다이렉트할 경로
          }, 1000)
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [router, isRedirecting])

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
      await apiClient
        .get(`/oauth/${provider}?${query}`, {
          withCredentials: true
        })
        .then(res => {
          const access_token = res.data.data.accessToken
          if (res.data.code === 200) {
            setCookie('access_token', access_token, {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 60 * 60,
              path: '/'
            })
            setIsRedirecting(true)
          } else {
            console.error('Error response:', res.data)
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
    getAccessToken()
    isCalled.current = true // Set the ref to true to prevent further calls
  }, [provider, code, state, router])

  return (
      <div
          className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-1">
            <span
                className="text-2xl font-medium bg-gradient-to-b from-[#9333ea] to-[#c084fc] bg-clip-text text-transparent animate-gradient-text"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #9333ea 0%, #a852fd 25%, #c084fc 50%, #a852fd 75%, #9333ea 100%)',
                }}
            >
              로그인
            </span>
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                    <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full dot-bounce"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                        }}
                    />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Progress
                  value={progress}
                  className="h-2 transition-all duration-300"
              />
              <div
                  className="text-sm bg-gradient-to-b from-[#9333ea] to-[#c084fc] bg-clip-text text-transparent animate-gradient-text"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #9333ea 0%, #a852fd 25%, #c084fc 50%, #a852fd 75%, #9333ea 100%)',
                  }}
              >
                {progress.toFixed(0)}%
              </div>
            </div>

            {showRedirect && (
                <div
                    className="animate-fade-in bg-gradient-to-b from-[#9333ea] to-[#c084fc] bg-clip-text text-transparent animate-gradient-text"
                    style={{
                      backgroundImage: 'linear-gradient(180deg, #9333ea 0%, #9333ea 45%, #c084fc 50%, #9333ea 55%, #9333ea 100%)',
                    }}
                >
                  리다이렉팅하는 중...
                </div>
            )}
          </div>
        </div>
      </div>
  )
}
