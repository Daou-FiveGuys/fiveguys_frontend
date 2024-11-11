'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, getDaysInMonth } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { redirect, useRouter } from 'next/navigation'
import axios from 'axios'
import { setCookie } from 'cookies-next'

export default function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [isEnterConfirmPassword, setIsEnterConfirmPassword] = useState(false)

  useEffect(() => {
    if (
      isEnterConfirmPassword &&
      password.length != 0 &&
      password != confirmPassword
    ) {
      setError('비밀번호가 일치하지 않습니다.')
    } else {
      setError('')
    }
  }, [isEnterConfirmPassword, password, confirmPassword])

  useEffect(() => {
    if (confirmPassword.length != 0) {
      setIsEnterConfirmPassword(true)
    } else {
      setIsEnterConfirmPassword(false)
    }
  }, [confirmPassword])

  useEffect(() => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const hasNumber = /\d/.test(password)

    if (password && (!hasUpperCase || !hasSpecialChar || !hasNumber)) {
      setError(
        '비밀번호는 대문자, 특수문자, 숫자를 각각 1개 이상 포함해야 합니다.'
      )
    } else {
      setError('')
    }
  }, [password])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword || !agreeTerms) {
      setError('모든 필드를 채우고 약관에 동의해주세요.')
      return
    }

    if (password.length < 8 || error) {
      setError('올바른 비밀번호를 입력해주세요.')
      return
    }

    if (password != confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
    }

    const trySignup = async () => {
      await axios
        .post(
          `http://hansung-fiveguys.duckdns.org:8080/api/v1/user/signup`,
          {
            name: `${name}`,
            email: `${email}`,
            password: `${password}`,
            confirmPassword: `${confirmPassword}`
          },
          { withCredentials: true }
        )
        .then(res => {
          if (res.data.code === 500) {
            setError('이미 가입된 이메일입니다.')
          } else if (res.data.code === 200) {
            const accessToken = res.data.data.accessToken
            if (accessToken) {
              setCookie('access_token', accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60,
                path: '/'
              })
            }
            redirect('http://hansung-fiveguys.duckdns.org')
          } else {
            setError('오류가 발생했습니다.')
          }
        })
        .catch(err => {
          setError('오류가 발생했습니다.')
        })
    }
    trySignup()
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription>새 계정을 만들어 시작하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 확인</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={checked => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              <a href="/terms" className="text-primary hover:underline">
                이용약관
              </a>
              에 동의합니다
            </Label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            가입하기
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-primary hover:underline">
            로그인
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
