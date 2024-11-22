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

import { redirect, useRouter } from 'next/navigation'
import apiClient from '@/services/apiClient'
import { Separator } from '@radix-ui/react-dropdown-menu'
import WithdrawalModal from './withdrawal-modal'
import { deleteCookie } from '@/utils/cookies'
import ConfirmModal from './edit-info-confirm-modal'

export default function MyPageForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isEnterConfirmPassword, setIsEnterConfirmPassword] = useState(false)

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [withdrawlModalOpen, setWithdrawlModalOpen] = useState(false)
  const [withdrawl, setWithdrawl] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    apiClient
      .get('/user/get')
      .then(res => {
        if (res.data.code === 200) {
          setName(res.data.data.name)
          setEmail(res.data.data.email)
        }
      })
      .catch(err => {})
  }, [])

  useEffect(() => {
    if (withdrawl) {
      apiClient
        .delete('/user/delete', {
          headers: {
            email: email, // 이메일
            password: password // 비밀번호
          }
        })
        .then(res => {
          if (res.data.code === 200) {
            setMessage('회원탈퇴가 정상 처리 되었습니다.')
            setConfirmModalOpen(true)
            setTimeout(() => {
              deleteCookie('access_token')
              router.push('/')
            }, 3000)
          } else if (res.data.code === 401) {
            setMessage('비밀번호가 일치하지 않습니다.')
          } else {
            throw Error('오류가 발생했습니다.')
          }
        })
        .catch(err => {
          setError('오류가 발생하였습니다.')
        })
    }
  }, [withdrawl])

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

    if (password.length < 8 || error) {
      setError('올바른 비밀번호를 입력해주세요.')
      return
    }

    if (password != confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
    }

    apiClient
      .patch(`/user/edit`, {
        name: `${name}`,
        email: `${email}`,
        password: `${password}`,
        confirmPassword: `${confirmPassword}`
      })
      .then(res => {
        if (res.data.code === 200) {
          setMessage('회원정보가 정상적으로 수정되었습니다.')
          setConfirmModalOpen(true)
        } else {
          throw Error('오류가 발생했습니다.')
        }
      })
      .catch(err => {
        setError('오류가 발생했습니다.')
      })
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">마이페이지</CardTitle>
        <CardDescription>회원 정보</CardDescription>
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
              disabled={true}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              disabled={true}
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
          {!error && <Separator className="py-2" />}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            회원정보수정
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <a
          href="#"
          onClick={e => {
            e.preventDefault()
            if (password.length < 8 || error) {
              setError('올바른 비밀번호를 입력해주세요.')
              return
            }
            if (password != confirmPassword) {
              setError('비밀번호가 일치하지 않습니다.')
              return
            }
            setWithdrawlModalOpen(true)
          }}
          className="hover:underline text-sm text-gray-500"
        >
          회원탈퇴
        </a>
      </CardFooter>
      <WithdrawalModal
        isOpen={withdrawlModalOpen}
        onClose={() => {
          setWithdrawl(false)
          setWithdrawlModalOpen(false)
        }}
        onConfirm={() => {
          setWithdrawl(true)
          setWithdrawlModalOpen(false)
        }}
      />
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false)
        }}
        message={message}
      />
    </Card>
  )
}
