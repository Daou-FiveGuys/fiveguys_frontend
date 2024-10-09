"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToastProvider } from "@/components/ui/use-toast"

// 더미 사용자 데이터
const dummyUser = {
  name: "홍길동",
  email: "hong@example.com",
  phone: "010-1234-5678",
  balance: 50000,
  tokens: 100,
  smsCount: {
    short: 500,
    long: 250,
    photo: 100
  }
}

export default function AccountManagementForm() {
  const [user, setUser] = useState(dummyUser)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const toastMessage = {
    title: "프로필 업데이트",
    description: "프로필이 성공적으로 업데이트되었습니다.",
  };
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    // 여기에 프로필 업데이트 로직을 구현하세요
    console.log("프로필 업데이트:", user)
    ToastProvider(toastMessage); 
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      ToastProvider({
        title: "비밀번호 변경 실패",
        description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
      })
      return
    }
    // 여기에 비밀번호 변경 로직을 구현하세요
    console.log("비밀번호 변경:", newPassword)
    ToastProvider({
      title: "비밀번호 변경",
      description: "비밀번호가 성공적으로 변경되었습니다.",
    })
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">계정 관리</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">프로필 정보</TabsTrigger>
          <TabsTrigger value="balance">충전금 및 토큰</TabsTrigger>
          <TabsTrigger value="password">비밀번호 변경</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>
                개인 정보를 확인하고 수정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={user.phone}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" onClick={handleUpdateProfile}>프로필 업데이트</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>충전금 및 토큰</CardTitle>
              <CardDescription>
                현재 충전금과 토큰 정보를 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>충전금:</span>
                  <span className="font-bold">{user.balance.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>토큰 개수:</span>
                  <span className="font-bold">{user.tokens.toLocaleString()}개</span>
                </div>
                <div className="mt-6">
                  <h3 className="font-bold mb-2">발송 문자 건수</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>단문 발송 시:</span>
                      <span>{user.smsCount.short.toLocaleString()}건</span>
                    </div>
                    <div className="flex justify-between">
                      <span>장문 발송 시:</span>
                      <span>{user.smsCount.long.toLocaleString()}건</span>
                    </div>
                    <div className="flex justify-between">
                      <span>포토 발송 시:</span>
                      <span>{user.smsCount.photo.toLocaleString()}건</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>충전하기</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>
                새로운 비밀번호를 입력하여 변경할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="new-password">새 비밀번호</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="confirm-password">비밀번호 확인</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" onClick={handleChangePassword}>비밀번호 변경</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}