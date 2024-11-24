import React, { forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import CreateMessage from './create-message'

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
    const [lastUserInput, setLastUserInput] = React.useState<string | null>(null)
    const message = useSelector((state: RootState) => state.chat[buttonType])

    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        if (isActive && value.trim()) {
          ChatUtils.addChat(buttonType, 'user', value.trim())
          setLastUserInput(value.trim())
        }
      }
    }))

    // useEffect(() => {
    //   if (ChatUtils.dispatch && !hasAddedChat) {
    //     if(buttonType === 'send-message'){
    //       ChatUtils.addChat(
    //         buttonType,
    //         'assistant-animation',
    //         '홍보 메시지를 만들어보세요! 뒤에 "직접입력"하거나 "자동생성"을 요청할 수 있습니다.'
    //       )
    //     }
    //     setHasAddedChat(true)
    //   }
    // }, [buttonType])

    const [first, setFirst] = React.useState(true);
    React.useMemo(() => {
      if (ChatUtils.dispatch && !hasAddedChat && isActive && first) {
                  setFirst(false)
          setHasAddedChat(true)
          ChatUtils.addChat(
            buttonType,
            'assistant-animation',
            '안녕하세요 뿌리오 FAQ 챗봇입니다. 궁금하신 점이 있으신가요? 🙋🏻'
          )
      }
    }, [isActive])

    return (
      <>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={isActive ? 'default' : 'outline'}
          onClick={() => setActiveButton(buttonType)}
        >
          메시지 전송
        </Button>
        <CreateMessage buttonType={'send-message'} lastUserInput={lastUserInput} />
      </>
    )
  }
)

export default SendMessageButton