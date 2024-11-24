import React, { forwardRef, useImperativeHandle, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import CreateMessage from '@/components/chat/send-message/create-message'
import { setText, clearText } from '@/redux/slices/createTextSlice'
import {setImageOption} from '@/redux/slices/imageOptionSlice'
import { clearMessages, deleteMessage } from '@/redux/slices/chatSlice'

export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  buttonType: ButtonType
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}

const CreateMessageButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
  ({ buttonType, activeButton, setActiveButton }, ref) => {
    
    const isActive = buttonType === activeButton
    const [hasAddedChat, setHasAddedChat] = React.useState(false)
    const [lastUserInput, setLastUserInput] = React.useState<string | null>(null)
    const message = useSelector((state: RootState) => state.chat[buttonType])
    const message2 = useSelector((state: RootState) => state.createText)
    const imageOption = useSelector((state: RootState) => state.imageOption)
    const dispatch = useDispatch()
    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        //ChatUtils.clearChat('send-message')
         dispatch(
          clearMessages({chatId:'send-message'})
        )
        dispatch(
          clearMessages({chatId:'create-image-prompt'})
        )
        setText({text:''})
        setImageOption(
          {
            imageStyle: 'mix',
            width: 256,
            height: 256,
            guidanceScale: 3.5,
            seed: -1,
            numInferenceSteps: 28
          }
        );
        if (value.trim()) {
          ChatUtils.addChat(buttonType, 'user', value.trim())
          setLastUserInput(value.trim())
        }
      }
    }))

    useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat) {
        ChatUtils.addChat(
          buttonType,
          'assistant-animation',
          '홍보 메시지를 만들어보세요! 뒤에 "직접입력"하거나 "자동생성"을 요청할 수 있습니다.'
        )
        setHasAddedChat(true)
      }
    }, [hasAddedChat, buttonType])

    return (
      <>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={isActive ? 'default' : 'outline'}
          onClick={() => setActiveButton('create-message')}
        >
          문자 생성
        </Button>
        <CreateMessage buttonType={'create-message'} lastUserInput={lastUserInput} />
      </>
    )
  }
)

export default CreateMessageButton