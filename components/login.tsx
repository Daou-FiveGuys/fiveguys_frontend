"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.")
      return
    }

    try {
      if (email === "qwer1234@gmail.com" && password === "Qwer1234@") {
        console.log("로그인 성공")
        // 로그인 성공 시 홈페이지로 리다이렉션
        router.push('/')
      } else {
        throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.")
      }
    } catch (err) {
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.")
    }
  }

  const handleSocialLogin = async (provider: string) => {
    try {
      console.log(`${provider} 로그인 시도`)
      // 실제 구현에서는 이 부분에 소셜 로그인 로직을 추가해야 합니다.
      // 예시로 알림창을 띄우고 홈페이지로 리다이렉션하겠습니다.
      alert(`${provider} 로그인 성공!`)
      router.push('/')
    } catch (err) {
      setError(`${provider} 로그인에 실패했습니다. 다시 시도해주세요.`)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">로그인</CardTitle>
        <CardDescription>계정에 로그인하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
          <Button type="submit" className="w-full">로그인</Button>
        </form>

        <div className="mt-4 text-center">
          <a href="/forgot-credentials" className="text-sm text-primary hover:underline">
            아이디/비밀번호 찾기
          </a>
        </div>

        <div className="mt-6">
          <Separator className="my-4" />
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin("Google")}
            >
              Google로 로그인
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin("Naver")}
            >
              Naver로 로그인
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          계정이 없으신가요? <a href="/signup" className="text-primary hover:underline">회원가입</a>
        </p>
      </CardFooter>
    </Card>
  )
}