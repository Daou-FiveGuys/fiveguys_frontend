import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { ImageOption } from '@/redux/slices/imageOptionSlice'
import { clearMessages } from '@/redux/slices/chatSlice'

export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  buttonType: ButtonType
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}

/**
 * 🚨 messageOptionSlice 사용해주세요
 *
 *
 *
 * */
const ImageGenerateButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
  ({ buttonType, activeButton, setActiveButton }, ref) => {
    const isActive = buttonType === activeButton
    const [hasAddedChat, setHasAddedChat] = React.useState(false)
    const [lastUserInput, setLastUserInput] = React.useState<string | null>(
      null
    )
    const message = useSelector((state: RootState) => state.chat[buttonType])
    const imageOption = useSelector((state: RootState) => state.imageOption)
    const dispatch = useDispatch()
    const [openModal, setOpenModal] = React.useState(false)
    const messageOption = useSelector((root: RootState) => root.messageOption)
    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        dispatch(clearMessages({ chatId: 'send-message' }))
        value = value.trim()
        if (value) {
          ChatUtils.addChat(buttonType, 'user', value)
          setLastUserInput(value)
        }
        if (value === '예') {
          setActiveButton('select-image-options')
        }
        /**
         * 🚨 함수 만들고 input 넘겨서 작업해주세요 🚨
         *
         */
      }
    }))

    useEffect(() => {
      if (
        ChatUtils.dispatch &&
        activeButton === 'image-generate'
      ) {
          ChatUtils.addChat(
              buttonType,
              'assistant-animation',
              `마지막으로 이미지 스타일을 지정해보아요! 🧑🏻‍🔬`
          )
          setTimeout(() => {
              setActiveButton('select-image-options')
          }, 1800)
      }
    }, [activeButton])

    const handleGenerateImage2 = (imageOption: ImageOption) => {
      /*setLastUserInput(null)
      handleGenerateImage(
        imageOption,
        messageOption,
        dispatch,
        buttonType
      ).then(r => r)
      setOpenModal(true)*/
    }

    return (
      <div>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={
            messageOption.content === null
              ? 'outline'
              : isActive
                ? 'default'
                : 'outline'
          }
          disabled={messageOption.prompt === null || !isActive}
          onClick={() => setActiveButton('image-generate')}
        >
          이미지 생성
        </Button>
      </div>
    )
  }
)

export default ImageGenerateButton
