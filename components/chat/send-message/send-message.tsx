import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo
} from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { clearMessages } from '@/redux/slices/chatSlice'

export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  buttonType: ButtonType
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}

const SendMessageButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
  ({ buttonType, activeButton, setActiveButton }, ref) => {
    const isActive = buttonType === activeButton
    const [hasAddedChat, setHasAddedChat] = React.useState(false)
    const [lastUserInput, setLastUserInput] = React.useState<string | null>(
      null
    )
    const content = useSelector((state: RootState) => state.messageOption)
    const image = useSelector((state: RootState) => state.image)
    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        if (isActive && value.trim()) {
          ChatUtils.addChat(buttonType, 'user', value.trim())
          setLastUserInput(value.trim())
        }
      }
    }))

    return (
      <>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={isActive ? 'default' : 'outline'}
          onClick={() => {
            if (content.prompt) {
              ChatUtils.clearChat('image-generate')
              setActiveButton('image-generate')
            } else if (content.content) {
              ChatUtils.clearChat('create-image-prompt')
              ChatUtils.addChat(
                'create-image-prompt',
                'assistant-animation-html',
                `<div>함께 이미지 생성을 위한 프롬프트를 만들어볼까요? 🙌🏻 <ul><li><div><strong><span>직접 입력</strong>은 <strong><span style="color: #34d399;">직접</span></strong>을 입력해주세요</div></li><li><div><strong><span>자동 생성</strong>은 <strong><span style="color: #38bdf8;">자동</span></strong>을 입력해주세요</div></li><li><div><strong><span>추천 생성</strong>은 <strong><span style="color: #fbbf24;">추천</span></strong>을 입력해주세요</div></li></ul></div>`
              )
              setActiveButton('create-image-prompt')
            } else {
              ChatUtils.clearChat('image-generate')
              ChatUtils.clearChat('create-image-prompt')
              setActiveButton('create-message')
            }
          }}
        >
          문자 전송
        </Button>
      </>
    )
  }
)

export default SendMessageButton
