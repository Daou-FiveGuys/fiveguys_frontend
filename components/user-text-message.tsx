import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'

interface UserTextMessageProps {
  message: string
  onCreatedMessage: (createdMessage: string) => void
}

const createdMessages = [
  "삶이 있는 한 희망은 있다. - 키케로",
  "산다는 것, 그것은 치열한 전투이다. - 로망 로랑",
  "하루에 3시간을 걸으면 7년 후에 지구를 한바퀴 돌 수 있다. - 사무엘 존슨"
]

export function UserTextMessage({ message, onCreatedMessage }: UserTextMessageProps) {
  const randomCreatedMessage = useMemo(() => {
    const msg = createdMessages[Math.floor(Math.random() * createdMessages.length)];
    onCreatedMessage(msg);
    return msg;
  }, [onCreatedMessage]);

  return (
    <div className="bg-blue-100 p-4 rounded-md">
      <p className="font-medium text-black">사용자 메시지:</p>
      <p className="text-black mb-2">{message}</p>
      <p className="text-gray-600 italic mb-4">{randomCreatedMessage}</p>
    </div>
  )
}
