import { Separator } from '@/components/ui/separator'
import React from 'react'
import { ChatMessage } from '@/redux/slices/chatSlice'

export const stringToReactNode = (htmlString: string): React.ReactNode => {
  return <div dangerouslySetInnerHTML={{ __html: htmlString }} />
}

export interface ChatList {
  messages: ChatMessage[]
}

export function ChatList({ messages }: ChatList) {
  if (messages.length === 0) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={message.id} className="ml-2">
          {stringToReactNode(message.display)}
          {index < messages.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  )
}
