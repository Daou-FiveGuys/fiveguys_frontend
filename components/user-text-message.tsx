'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserTextMessageApi } from './user-text-message-api'

interface UserTextMessageProps {
  message: string
  onCreatedMessage: (createdMessage: string) => void
}

export function UserTextMessage({ message, onCreatedMessage }: UserTextMessageProps) {
  const [randomCreatedMessage, setRandomCreatedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleApiResult = (result: string | null, apiError: string | null) => {
    if (result) {
      setRandomCreatedMessage(result)
      onCreatedMessage(result)
      setError(null)
    } else if (apiError) {
      setError(apiError)
      setRandomCreatedMessage(null)
    }
    setIsLoading(false)
  }

  return (
    <div className="bg-blue-100 p-4 rounded-md">
      <UserTextMessageApi 
        message={message} 
        onResult={handleApiResult} 
      />
      <p className="font-medium text-black">사용자 메시지:</p>
      <p className="text-black mb-2">{message}</p>
      {isLoading ? (
        <p className="text-gray-600 mb-4">메시지를 생성 중입니다...</p>
      ) : randomCreatedMessage ? (
        <p className="text-gray-600 italic mb-4">{randomCreatedMessage}</p>
      ) : error ? (
        <p className="text-red-500 mb-4">{error}</p>
      ) : (
        <p className="text-gray-600 mb-4">메시지가 생성되지 않았습니다.</p>
      )}
    </div>
  )
}