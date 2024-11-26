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
        setTimeout(() => {}, 100)
      }
    }))
    const messages = useSelector(
      (state: RootState) => state.chat[buttonType].messages
    )
    React.useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat && messages.length === 0) {
        setHasAddedChat(true)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          '이미지를 생성하시겠습니까?(예, 아니오)'
        )
      }
    }, [isActive, hasAddedChat, messages])

    useEffect(() => {
      if (
        ChatUtils.dispatch &&
        !hasAddedChat &&
        activeButton === 'image-generate'
      ) {
        ChatUtils.addChat(
          buttonType,
          'assistant-animation',
          '이미지를 생성하시겠습니까?(예, 아니오)'
        )
        setHasAddedChat(true)
      }
    }, [hasAddedChat, buttonType, activeButton, ChatUtils.dispatch])

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
          disabled={messageOption.prompt === null}
          onClick={() => setActiveButton('image-generate')}
        >
          이미지 생성
        </Button>
      </div>
    )
  }
)

export default ImageGenerateButton
