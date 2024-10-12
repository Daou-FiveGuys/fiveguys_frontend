import React from 'react'
import { Button } from '@/components/ui/button'

interface UserTextMessageProps {
  message: string
  onImageGeneration: () => void
}

export function UserTextMessage({ message, onImageGeneration }: UserTextMessageProps) {
  return (
    <div className="bg-blue-100 p-4 rounded-md">
      <p className="font-medium text-black">사용자 메시지:</p>
      <p className="text-black">{message}</p>
      <Button 
        onClick={onImageGeneration} 
        className="mt-2"
      >
        이미지 생성
      </Button>
    </div>
  )
}