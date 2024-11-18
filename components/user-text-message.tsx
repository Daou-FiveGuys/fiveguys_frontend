import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { UserTextMessageApi } from './user-text-message-api'

interface UserTextMessageProps {
  message: string
  onCreatedMessage: (createdMessage: string) => void
  onCommunicationStatus: (success: boolean) => void
}

export function UserTextMessage({ message, onCreatedMessage, onCommunicationStatus }: UserTextMessageProps) {
  const [createdMessage, setCreatedMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCreatedMessage = async () => {
      try {
        const result = await UserTextMessageApi(message)
        if (result.isValid) {
          setCreatedMessage(result.text)
          onCreatedMessage(result.text)
          onCommunicationStatus(true)
        } else {
          setError(typeof result.error === 'string' ? result.error : '알 수 없는 오류가 발생했습니다.')
          onCommunicationStatus(false)
        }
      } catch (error) {
        setError('통신 중 오류가 발생했습니다.')
        onCommunicationStatus(false)
      }
    }

    fetchCreatedMessage()
  }, [message, onCreatedMessage, onCommunicationStatus])

  return (
    <div className="bg-blue-100 p-4 rounded-md">
      <p className="font-medium text-black">사용자 메시지:</p>
      <p className="text-black mb-2">{message}</p>
      {error ? (
        <p className="text-red-500 mb-4">에러: {error}</p>
      ) : createdMessage ? (
        <p className="text-gray-600 italic mb-4">{createdMessage}</p>
      ) : (
        <p className="text-gray-400 mb-4">메시지 생성 중...</p>
      )}
    </div>
  )
}