'use client'
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@nextui-org/button'
import { Card, CardHeader } from '@nextui-org/card'
import axios from 'axios'
import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import { decode } from 'js-base64'
import { redirect, useRouter } from 'next/navigation'
import { NextRequest } from 'next/server'
import { useEffect, useState } from 'react'

export default function EmailVerify() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [timer, setTimer] = useState(0)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const access_token = getCookie('access_token')
  const handleVerifyCode = () => {
    axios
      .post(
        `http://hansung-fiveguys.duckdns.org:8080/api/v1/email`,
        { code: `${code}` },
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          },
          withCredentials: true
        }
      )
      .then(res => {
        if (res.data.code === 200) {
          deleteCookie('access_token')
          const access_token = res.data.data.accessToken
          setCookie('access_token', access_token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 30,
            path: '/'
          })
          router.push('/')
        } else {
          setError('다시 시도 해주세요.')
        }
      })
      .catch(err => {
        setError('오류가 발생했습니다.')
      })
  }

  const handleSendEmail = () => {
    if (!isSent) setIsSent(true)

    if (!isButtonDisabled) {
      axios.get(`http://hansung-fiveguys.duckdns.org:8080/api/v1/email`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        },
        withCredentials: true
      })
      setIsButtonDisabled(true)
      setTimer(180)

      const countdown = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdown)
            setIsButtonDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  useEffect(() => {
    if (timer === 0) {
      setIsButtonDisabled(false)
    }
  }, [timer])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="block">
        <CardTitle className="ml-3 mb-2 text-4xl font-bold">
          이메일 인증
        </CardTitle>
        <CardDescription className="ml-3">
          이메일 인증을 통해 회원가입을 완료하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input
            className="flex-1 h-12"
            id="code"
            placeholder="인증 번호를 입력하세요."
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            maxLength={6}
          ></Input>
          <Button
            onClick={handleSendEmail}
            disabled={isButtonDisabled}
            className={`h-12 min-w-[80px] px-4 font-semibold text-white rounded-md transition-all duration-200 
              ${isButtonDisabled ? 'bg-black cursor-not-allowed' : 'bg-white hover:bg-gray-300'}
              ${isButtonDisabled ? 'text-white' : 'text-black'}`}
          >
            {isButtonDisabled
              ? `${Math.floor(timer / 60)}:${('0' + (timer % 60)).slice(-2)}`
              : !isSent
                ? '전송'
                : '재전송'}
          </Button>
        </div>

        <div className="my-4" />
        {error ? (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : (
          <p className="text-sm text-gray-300 font-regular mt-2">
            인증번호는{' '}
            <span className="text-white-600 font-bold">5분 동안</span>{' '}
            유효합니다.
          </p>
        )}
        <div className="my-2" />
        <Button
          onClick={handleVerifyCode}
          disabled={!isButtonDisabled}
          className={`h-12 w-full font-semibold bg-black text-white rounded-md transition-all duration-200
            `}
        >
          인증
        </Button>
      </CardContent>
    </Card>
  )
}
