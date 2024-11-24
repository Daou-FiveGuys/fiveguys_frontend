import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '../prompt-form'
import ChatUtils from './utils/ChatUtils'
import { api, CommonResponse } from '@/app/faq_chatbot/faq_service'
import ReactMarkdown from 'react-markdown'
import apiClient from '@/services/apiClient'
import { FaqResponse } from '@/app/faq_chatbot/faq_response'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useIsMessagesEmpty } from '@/lib/hooks/use-message-is-empty'

export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  buttonType: ButtonType
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}

const FaqButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
  ({ buttonType, activeButton, setActiveButton }, ref) => {
    const isActive = buttonType === activeButton
    const [hasAddedChat, setHasAddedChat] = React.useState(false)
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    useImperativeHandle(ref, () => ({
      handleEnterPress: async (value: string) => {
        if (isActive && value.trim()) {
          ChatUtils.addChat(buttonType, 'user', value.trim())

          await fetchApiResponse(value.trim())

          setActiveButton(buttonType)
        }
      }
    }))

    // FaqButton.tsx
    // ...
    const fetchApiResponse = async (question: string) => {
      try {
        const id = ChatUtils.addChat(
          buttonType,
          'assistant-animation',
          '생각중입니다...'
        )
        await apiClient
          .post<CommonResponse<FaqResponse>>(`/chatbot`, {
            message: question,
            ai_model_id: 0
          })
          .then(res => {
            if (res.data.code == 200 || res.data.code == 404) {
              ChatUtils.editUserType('faq', id, 'assistant-animation-html')
              ChatUtils.editChat(
                'faq',
                id,
                ChatUtils.reactNodeToString(
                  <ReactMarkdown>{`${res.data.data}`}</ReactMarkdown>
                )
              )
              ChatUtils.editIsTyping('faq', true)
            } else {
              ChatUtils.editIsTyping('faq', false)
              throw new Error()
            }
          })
          .catch(err => {})
      } catch (error) {
        console.error('Error fetching FAQ response:', error)
        ChatUtils.addChat(
          buttonType,
          'assistant',
          '요청값을 받는중 오류가 발생했습니다.'
        )
      }
    }
    // ...

    const isMessagesEmpty = useIsMessagesEmpty(buttonType)
    React.useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat && isActive) {
        timeoutRef.current = setTimeout(() => {
          if (isMessagesEmpty) {
            ChatUtils.addChat(
              buttonType,
              'assistant-animation',
              '안녕하세요 뿌리오 FAQ 챗봇입니다. 궁금하신 점이 있으신가요? 🙋🏻'
            )
            setHasAddedChat(true)
          }
        }, 5000)
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [hasAddedChat, isActive])

    return (
      <Button
        className="w-full md:w-28 h-8 mb-2 md:mb-0"
        variant={isActive ? 'default' : 'outline'}
        onClick={() => {
          setActiveButton(buttonType)
        }}
      >
        FAQ
      </Button>
    )
  }
)

export default FaqButton
