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
        message.userType === 'assistant-animation-html' ||
        message.userType === 'assistant-animation'
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
    }, [dispatch, chatId, message.id, onTypingComplete, message.userType])

    const content = message.text

    if (
      isSerializedReactNode(content) &&
      message.userType !== 'assistant-animation-html' &&
      message.userType !== 'assistant' // 'assistant' 타입 제외
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
        return (
          <React.Fragment key={message.id}>
            <div className="ml-2">{message.text}</div> {/* 대체 콘텐츠 */}
          </React.Fragment>
        )
      }
    }

    if (message.userType === 'assistant-animation-html') {
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
      // HTML 콘텐츠 처리
      const processedHtml = ChatUtils.processHtmlContent(message.text)

      return (
        <div className="bot-message">
          <BotCard>
            <div
              className="relative mx-auto max-w-2xl prose dark:prose-dark"
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          </BotCard>
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.userType === nextProps.message.userType &&
      prevProps.message.text === nextProps.message.text &&
      prevProps.chatId === nextProps.chatId
    )
  }
)

export default MessageItem
