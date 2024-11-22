'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { format } from 'date-fns'

interface MessageCardProps {
  message: {
    date: string
    image: string
    preview: string
    content: string
  }
  isSelected: boolean
  onSelect: () => void
}

export function MessageCard({
  message,
  isSelected,
  onSelect
}: MessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const date = new Date(message.date)

  return (
    <Card
      className={`w-[300px] transition-all duration-300 ease-in-out cursor-pointer ${
        isSelected ? 'scale-105 shadow-lg' : ''
      }`}
      onClick={() => {
        setIsExpanded(!isExpanded)
        onSelect()
      }}
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {format(date, 'yyyy년 MM월 dd일 HH:mm')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-square relative mb-4">
          <Image
            src={message.image}
            alt="Message image"
            width={200}
            height={200}
            className="rounded-md"
          />
        </div>
        <p className="text-sm text-gray-500">
          {isExpanded ? message.content : message.preview}
        </p>
      </CardContent>
    </Card>
  )
}
