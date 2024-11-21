import { Separator } from '@/components/ui/separator'
import React from 'react'
import { setIsTyping, Message } from '@/redux/slices/chatSlice'
import { useDispatch } from 'react-redux'
import MessageItem from './chat/utils/MessageItem'
import { ButtonType } from './prompt-form'

export const ChatList = ({
  chatId,
  messages
}: {
  chatId: ButtonType
  messages: Message[]
}) => {
  if (messages.length === 0) {
    return null
  }

  const dispatch = useDispatch()

  const handleTypingComplete = () => {
    dispatch(setIsTyping({ chatId: chatId, isTyping: false }))
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={message.id} className="ml-2">
          <MessageItem
            chatId={chatId}
            message={message}
            onTypingComplete={handleTypingComplete}
          />
          {index < messages.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  )
}
