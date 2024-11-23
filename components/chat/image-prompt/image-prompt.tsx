'use client'

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import ImagePrompting from './image-prompting'
import ChatUtils from '@/components/chat/utils/ChatUtils'
import { ButtonType } from '@/components/prompt-form'

export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  buttonType: ButtonType
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}

const ImagePromptButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
  ({ buttonType, activeButton, setActiveButton }, ref) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [hasAddedChat, setHasAddedChat] = useState(false)
    const isActive = buttonType === activeButton

    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        if (isActive && value.trim()) {
          ChatUtils.addChat(buttonType, 'user', value.trim())
          handleClick()
        }
      }
    }))

    useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat) {
        ChatUtils.addChat(
          buttonType,
          'assistant-animation',
          '이미지 프롬프트를 생성해보세요!'
        )
        setHasAddedChat(true)
      }
    }, [hasAddedChat, buttonType])

    const handleClick = () => {
      setIsLoading(true)
      ChatUtils.addChat(buttonType, 'assistant-animation', "프롬프트 생성 중...")
      setTimeout(() => {
        setIsLoading(false)
        setIsModalOpen(true)
      }, 1000)
    }

    return (
      <>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={isActive ? 'default' : 'outline'}
          onClick={() => {
            setActiveButton(buttonType)
            if (isActive) handleClick()
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            '이미지 프롬프트 생성'
          )}
        </Button>
        <ImagePrompting buttonType={buttonType} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }
)

export default ImagePromptButton

