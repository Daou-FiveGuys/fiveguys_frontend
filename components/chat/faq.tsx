import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '../prompt-form'
import ChatUtils from './utils/ChatUtils'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { api } from '@/app/faq_chatbot/faq_service'
import ReactDOMServer from 'react-dom/server'
import ReactMarkdown from 'react-markdown'

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
    const [responseMessage, setResponseMessage] = useState<string>('')

    useImperativeHandle(ref, () => ({
      handleEnterPress: async (value: string) => {
        if (isActive && value.trim()) {
          ChatUtils.addChat(buttonType, 'user', value.trim())

          let res = await fetchApiResponse(value.trim());

          const markdownElement = <ReactMarkdown>{res ? res : "Network Error"}</ReactMarkdown>

          await ChatUtils.addChat(buttonType, 'assistant-animation', ChatUtils.reactNodeToString(markdownElement))
          await console.log(res)
          await console.log(ChatUtils.reactNodeToString(markdownElement))

          setActiveButton(buttonType)
        }
      }
    }))

    // API 요청 함수
    const fetchApiResponse = async (question: string) => {
      try {
        let data = await api.faqChatbotAsk(question);

        if (data) {
          return data
        }
      } catch (error) {
        console.error('Error fetching FAQ response:', error)
        return "응답을 받는 중 오류가 발생했습니다.";
      }
    }

    React.useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat && isActive) {
        timeoutRef.current = setTimeout(() => {
          ChatUtils.addChat(
            buttonType,
            'assistant-animation',
            '안녕하세요 뿌리오 FAQ 챗봇입니다. 궁금하신 점이 있으신가요? 🙋🏻'
          )
          setHasAddedChat(true)
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
