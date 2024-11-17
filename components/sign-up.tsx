"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, getDaysInMonth } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from 'next/navigation'

export default function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [birthDate, setBirthDate] = useState<Date>()
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const today = new Date()
  const [calendarYear1, setCalendarYear1] = useState(today.getFullYear())
  const [calendarMonth1, setCalendarMonth1] = useState(today.getMonth() + 1)
  const [calendarDay1, setCalendarDay1] = useState(today.getDate())

  useEffect(() => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const hasNumber = /\d/.test(password)

    if (password && (!hasUpperCase || !hasSpecialChar || !hasNumber)) {
      setPasswordError("비밀번호는 대문자, 특수문자, 숫자를 각각 1개 이상 포함해야 합니다.")
    } else {
      setPasswordError("")
    }
  }, [password])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !birthDate || !phone || !agreeTerms) {
      setError("모든 필드를 채우고 약관에 동의해주세요.")
      return
    }

    if (password.length < 8 || passwordError) {
      setError("올바른 비밀번호를 입력해주세요.")
      return
    }

    if (!isPhoneVerified) {
      setError("휴대폰 번호가 인증되지 않았습니다.")
      return
    }

    // 회원가입 성공 시 팝업 메시지 표시 및 로그인 페이지로 이동
    alert("회원가입을 환영합니다.")
    router.push('/login')
  }

  const handlePhoneVerification = () => {
    setShowVerificationInput(true)
    alert("인증번호가 발송되었습니다. (실제로는 발송되지 않습니다)")
  }

  const handleVerificationCodeSubmit = () => {
    if (verificationCode === "qwer1234") {
      setIsPhoneVerified(true)
      alert("인증이 완료되었습니다.")
    } else {
      alert("잘못된 인증번호입니다.")
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(new Date(calendarYear1, calendarMonth1 - 1))
    const firstDayOfMonth = new Date(calendarYear1, calendarMonth1 - 1, 1).getDay()
    const days = []

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <Button
          key={i}
          variant="ghost"
          className="p-2 w-8 h-8 rounded-full"
          onClick={() => {
            setBirthDate(new Date(calendarYear1, calendarMonth1 - 1, i))
            setCalendarDay1(i)
          }}
        >
          {i}
        </Button>
      )
    }

    return days
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
              onChange={(e) => setName(e.target.value)}
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
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          </div>
          <div className="space-y-2">
            <Label>생년월일</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${!birthDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthDate ? format(birthDate, "PPP") : <span>생년월일을 선택하세요</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex items-center justify-between p-2">
                  <Button
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => setCalendarMonth1((prev) => (prev === 1 ? 12 : prev - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex space-x-1">
                    <Select
                      value={calendarYear1.toString()}
                      onValueChange={(value) => setCalendarYear1(parseInt(value))}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue>{calendarYear1}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 125 }, (_, i) => (
                          <SelectItem key={i} value={(2024 - i).toString()}>
                            {2024 - i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={calendarMonth1.toString()}
                      onValueChange={(value) => setCalendarMonth1(parseInt(value))}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue>{calendarMonth1}월</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {i + 1}월
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => setCalendarMonth1((prev) => (prev === 12 ? 1 : prev + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 p-2">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium">
                      {day}
                    </div>
                  ))}
                  {renderCalendar()}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">휴대폰 번호</Label>
            <div className="flex space-x-2">
              <Input
                id="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Button type="button" onClick={handlePhoneVerification} disabled={isPhoneVerified}>
                {isPhoneVerified ? "인증완료" : "인증하기"}
              </Button>
            </div>
          </div>
          {showVerificationInput && !isPhoneVerified && (
            <div className="space-y-2">
              <Label htmlFor="verificationCode">인증번호</Label>
              <div className="flex space-x-2">
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="인증번호 입력"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
                <Button type="button" onClick={handleVerificationCodeSubmit}>
                  확인
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(checked) => setAgreeTerms(checked as boolean)} />
            <Label htmlFor="terms" className="text-sm">
              <a href="/terms" className="text-primary hover:underline">이용약관</a>에 동의합니다
            </Label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">가입하기</Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          이미 계정이 있으신가요? <a href="/login" className="text-primary hover:underline">로그인</a>
        </p>
      </CardFooter>
    </Card>
  )
}