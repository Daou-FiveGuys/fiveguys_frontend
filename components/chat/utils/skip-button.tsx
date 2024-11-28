import React, { useState, useEffect } from 'react'
import { ButtonType } from '@/components/prompt-form'
import { Button } from '@/components/ui/button'
import ChatUtils from './ChatUtils'
import { ChatState, Message } from '@/redux/slices/chatSlice'

export default function SkipButton({
  messages,
  activeButton,
  chatState
}: {
  messages: Message[]
  activeButton: ButtonType
  chatState: ChatState
}) {
  const activeButtonsToCheck = [
    'create-message',
    'create-image-prompt',
    'image-generate',
    'select-image',
    'select-image-options'
  ]

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const shouldShow = activeButtonsToCheck.includes(activeButton)
      ? activeButtonsToCheck.some(button => chatState[button]?.isTyping)
      : chatState[activeButton]?.isTyping

    if (shouldShow) {
      setIsVisible(true) // 조건을 만족하면 버튼을 표시
    } else {
      setIsVisible(false) // 조건을 만족하지 않으면 버튼을 숨김
    }
  }, [activeButton, chatState])

  const handleCancelAnimation = () => {
    ChatUtils.editIsTyping(activeButton, false)
    messages.forEach(message => {
      if (
        message.userType === 'assistant-animation-html' ||
        message.userType === 'assistant-animation'
      ) {
        ChatUtils.editUserType(activeButton, message.id, 'assistant')
      }
    })
  }

  return (
    <div
      className={`flex items-center space-x-2 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        animation: 'float 3s infinite ease-in-out'
      }}
    >
      <Button
        value="default"
        className="rounded-3xl bg-zinc-800 hover:bg-zinc-700 flex items-center space-x-2 transition-opacity duration-500"
        onClick={handleCancelAnimation}
      >
        <div className="ps-1 pb-1">
          <span
            className="text-2xl inline-block"
            style={{ transform: 'scaleX(-1) rotate(90deg)' }}
          >
            🔥
          </span>
        </div>
        <div className="pe-1 ps-1 pb-4">
          <span
            className="text-3xl inline-block transform"
            style={{ transform: 'scaleX(-1)' }}
          >
            🏎️
          </span>
        </div>
      </Button>
    </div>
  )
}
