// MessageItem.tsx
import React, { useCallback } from 'react'
import HTMLTypingEffect from './HTMLTypingEffect'
import { UserType, updateMessageUserType } from '@/redux/slices/chatSlice'
import { BotCard, UserMessage } from '../../stocks/message'
import { useDispatch } from 'react-redux'
import ChatUtils from './ChatUtils'
import TypingEffect from './TypingEffect'

const isSerializedReactNode = (content: string | React.ReactNode): boolean => {
  return (
    typeof content === 'string' &&
    content.startsWith('<') &&
    content.endsWith('>')
  )
}

interface MessageItemProps {
  message: {
    id: string
    userType: UserType
    text: string
  }
  onTypingComplete?: () => void
  chatId: string
}

const MessageItem: React.FC<MessageItemProps> = React.memo(
  ({ message, onTypingComplete, chatId }) => {
    const dispatch = useDispatch()

    const handleTypingComplete = useCallback(() => {
      if (
        message.userType !== 'assistant-animation-html' &&
        message.userType !== 'assistant-animation'
      ) {
        dispatch(
          updateMessageUserType({
            chatId,
            messageId: message.id,
            userType: 'assistant'
          })
        )
      }
      if (onTypingComplete) {
        onTypingComplete()
      }
    }, [dispatch, chatId, message.id, onTypingComplete])

    const content = message.text

    if (
      isSerializedReactNode(content) &&
      message.userType !== 'assistant-animation-html'
    ) {
      try {
        const reactNode = ChatUtils.stringToReactNode(content as string)
        return (
          <React.Fragment key={message.id}>
            <div className="ml-2">{reactNode}</div>
          </React.Fragment>
        )
      } catch (error) {
        console.error('Failed to deserialize ReactNode:', error)
      }
    }

    if (message.userType === 'assistant-animation-html') {
      console.log(content)
      return (
        <div className="bot-message">
          <BotCard>
            <HTMLTypingEffect
              htmlContent={message.text}
              speed={40}
              onComplete={handleTypingComplete}
            />
          </BotCard>
        </div>
      )
    } else if (message.userType === 'assistant-animation') {
      return (
        <div className="bot-message">
          <BotCard>
            <TypingEffect
              text={message.text}
              speed={40}
              onComplete={handleTypingComplete}
            />
          </BotCard>
        </div>
      )
    } else if (message.userType === 'assistant') {
      return (
        <div className="bot-message">
          <BotCard>{message.text}</BotCard>
        </div>
      )
    } else if (message.userType === 'user') {
      return (
        <div className="user-message">
          <UserMessage>{message.text}</UserMessage>
        </div>
      )
    }
    return <div>{message.text}</div>
  }
)

export default MessageItem
