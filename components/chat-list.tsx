import { Separator } from '@/components/ui/separator'
import React from 'react'
import { setIsTyping, Message } from '@/redux/slices/chatSlice'
import { useDispatch } from 'react-redux'
import MessageItem from './chat/utils/MessageItem'
import { ButtonType } from './prompt-form'
import ChatUtils from './chat/utils/ChatUtils'
import CalendarComponent from './chat/history/calendar'
import { MessageHistory } from './chat/history/message-history'
import HistoryPanel from './chat/history/history-panel'
import SendMessagePanel from './chat/send-message/send-message-panel'
import AddressBookModal from '@/app/address/modal/select-contact-modal';

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

  const isSerializedReactNode = (
    content: string | React.ReactNode
  ): boolean => {
    return (
      typeof content === 'string' &&
      content.startsWith('<') &&
      content.endsWith('>')
    )
  }
  React.useEffect(() => {
    console.log('activeButton updated:', chatId)
  }, [chatId])

  const isHistoryChat = chatId === 'history'
  const isSendMessageChat = chatId === 'send-message'
  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => {
        const content = message.text

        if (isSerializedReactNode(content)) {
          try {
            const reactNode = ChatUtils.stringToReactNode(content as string)
            return (
              <React.Fragment key={message.id}>
                <div className="ml-2">{reactNode}</div>
                {index < messages.length - 1 && <Separator className="my-4" />}
              </React.Fragment>
            )
          } catch (error) {
            console.error('Failed to deserialize ReactNode:', error)
          }
        }

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
      {/* {isSendMessageChat && <AddressBookModal/>} */}
    </div>
  )
}
