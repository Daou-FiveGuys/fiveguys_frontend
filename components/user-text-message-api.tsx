'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface UserTextMessageApiProps {
  message: string
  onResult: (result: string | null, error: string | null) => void
}

export function UserTextMessageApi({ message, onResult }: UserTextMessageApiProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCreatedMessage = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts')
        const createdMessage = response.data[0].body
        onResult(createdMessage, null)
      } catch (err) {
        console.error('Error fetching created message:', err)
        onResult(null, '메시지 생성에 실패했습니다. 다시 시도해 주세요.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCreatedMessage()
  }, [message, onResult])

  return null // This component doesn't render anything
}