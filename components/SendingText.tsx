import React from 'react'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ReusableModalProps {
  onClose: () => void
}

export default function SendingText({ onClose }: ReusableModalProps) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>공지사항</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="닫기">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p>안녕하세요, 여러분!</p>
          <p className="mt-2">이것은 하드코딩된 모달 내용입니다. 이 모달은 중요한 공지사항을 전달하는 데 사용됩니다.</p>
          <ul className="list-disc pl-5 mt-2">
            <li>첫 번째 공지사항</li>
            <li>두 번째 공지사항</li>
            <li>세 번째 공지사항</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onClose}>확인</Button>
        </CardFooter>
      </Card>
    </div>
  )
}