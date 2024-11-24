import React, { forwardRef, useImperativeHandle, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import CreateMessage from '@/components/chat/send-message/create-message'
import { setText } from '@/redux/slices/createTextSlice'
import CreateImagePrompt from './createimageprompt'
import { setImageOption } from '@/redux/slices/imageOptionSlice'

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
    const isActive = buttonType === activeButton
    const [hasAddedChat, setHasAddedChat] = React.useState(false)
    const [lastUserInput, setLastUserInput] = React.useState<string | null>(null)
    const message = useSelector((state: RootState) => state.chat[buttonType])
    const imageOption = useSelector((state: RootState) => state.imageOption)

    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        ChatUtils.clearChat('send-message')
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
        console.log(imageOption.imageStyle)
        if (isActive && value.trim()) {
          ChatUtils.addChat(buttonType, 'user', value.trim())
          setLastUserInput(value.trim())
        }
      }
    }))

    useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat) {
        ChatUtils.addChat(
          buttonType,
          'assistant',
          '이미지를 생성하는 중입니다.'
        )
        setHasAddedChat(true)
      }
    }, [hasAddedChat, buttonType])

    return (
      <>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={isActive ? 'default' : 'outline'}
          onClick={() => setActiveButton('create-image-prompt')}
        >
          프롬프트 생성
        </Button>
        <CreateImagePrompt buttonType={'create-image-prompt'} lastUserInput={lastUserInput} />
      </>
    )
  }
)

export default ImagePromptButton