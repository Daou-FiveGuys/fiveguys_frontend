// ChatList.tsx
import React, { useCallback, useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { setIsTyping, Message } from '@/redux/slices/chatSlice'
import { useDispatch } from 'react-redux'
import MessageItem from './chat/utils/MessageItem'
import { ButtonType } from './prompt-form'
import ChatUtils from './chat/utils/ChatUtils'
import CalendarComponent from './chat/history/calendar'
import { MessageHistory } from './chat/history/message-history'
import HistoryPanel from './chat/history/history-panel'
import SendMessagePanel from './chat/send-message/send-message-panel'
import { BotCard } from './stocks'
import AddressBookModal from '@/app/address/modal/select-contact-modal'

export const ChatList = ({
  chatId,
  messages
}: {
  chatId: ButtonType
  messages: Message[]
}) => {
  const newMessage = messages.filter(
    (m, i) => i == 0 || (i > 0 && messages[i - 1].text) !== m.text
  )
  if (newMessage.length === 0) {
    return null
  }

  const dispatch = useDispatch()

  // useCallback을 사용하여 handleTypingComplete 메모이제이션
  const handleTypingComplete = useCallback(() => {
    dispatch(setIsTyping({ chatId: chatId, isTyping: false }))
  }, [dispatch, chatId])

  const isSerializedReactNode = (
    content: string | React.ReactNode
  ): boolean => {
    return (
      typeof content === 'string' &&
      content.startsWith('<') &&
      content.endsWith('>')
    )
  }

  const isHistoryChat = chatId === 'history'
  const isSendMessageChat = chatId === 'send-message'

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {newMessage.map((message, index) => {
        return (
          <React.Fragment key={message.id}>
            <div className="ml-2">
              <MessageItem
                chatId={chatId}
                message={message}
                onTypingComplete={handleTypingComplete}
              />
            </div>
            {index < messages.length - 1 && <Separator className="my-4" />}
          </React.Fragment>
        )
      })}
      {isHistoryChat && <HistoryPanel />}
    </div>
  )
}
