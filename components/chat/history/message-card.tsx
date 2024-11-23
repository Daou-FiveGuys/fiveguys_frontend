'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { SentMessages } from './history-panel'

interface MessageCardProps {
  message: SentMessages
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
      <CardContent className="flex flex-col items-center">
        <div className="flex justify-center mb-4 w-full">
          <img
            src={
              message.image === 'null'
                ? 'https://www.freeiconspng.com/img/23485'
                : message.image
            }
            alt="Message image"
            className="rounded-md w-full h-[250] object-cover"
          />
        </div>
        <p className="text-sm text-gray-500 text-left w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {message.title}
        </p>
      </CardContent>
    </Card>
  )
}
