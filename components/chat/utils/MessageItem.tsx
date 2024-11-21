import React from 'react'
import TypingEffect from './TypingEffect'
import { UserType, updateMessageUserType } from '@/redux/slices/chatSlice'
import { BotCard, UserMessage } from '../../stocks/message'
import { useDispatch } from 'react-redux'

interface MessageItemProps {
  message: {
    id: string
    userType: UserType
    text: string
  }
  onTypingComplete?: () => void
  chatId: string
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onTypingComplete,
  chatId
}) => {
  const dispatch = useDispatch()

  const handleTypingComplete = () => {
    dispatch(
      updateMessageUserType({
        chatId,
        messageId: message.id,
        userType: 'assistant'
      })
    )
    if (onTypingComplete) {
      onTypingComplete()
    }
  }

  if (message.userType === 'assistant-animation') {
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

export default MessageItem
