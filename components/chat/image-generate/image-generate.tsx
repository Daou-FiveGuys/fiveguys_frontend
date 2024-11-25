import React, { forwardRef, useImperativeHandle, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { handleGenerateImage, handleLoadingImage } from './image-generate-modal'
import {
  ImageOption,
  initialState,
  setImageOption
} from '@/redux/slices/imageOptionSlice'
import { clearMessages } from '@/redux/slices/chatSlice'
import { setMessage } from '@/redux/slices/messageOptionSlice'
import Component from '@/components/image-option-modal'
import { setImageData } from '@/redux/slices/imageSlice'

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
        ChatUtils.addChat(
          'send-message',
          'assistant-animation',
          '홍보 메시지를 만들어보세요! 뒤에 "직접입력"하거나 "자동생성"을 요청할 수 있습니다.'
        )
        value = value.trim()
        if (value) {
          ChatUtils.addChat(buttonType, 'user', value)
          setLastUserInput(value)
        }
        /**
         * 🚨 함수 만들고 input 넘겨서 작업해주세요 🚨
         *
         */
        setTimeout(() => {}, 100)
      }
    }))

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
      setLastUserInput(null)
      handleGenerateImage(
        imageOption,
        messageOption,
        dispatch,
        buttonType
      ).then(r => r)
        setOpenModal(true)
    }

    return (
      <div>
        {lastUserInput === '예' && (
          <Component
            isOpen={true}
            onClose={handleGenerateImage2}
            imageOption={initialState}
            dispatch={dispatch}
          />
        )}
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={
            messageOption.content !== null
              ? 'outline'
              : isActive
                ? 'default'
                : 'outline'
          }
          disabled={messageOption.prompt !== null}
          onClick={() => setActiveButton('image-generate')}
        >
          이미지 생성
        </Button>
      </div>
    )
  }
)

export default ImageGenerateButton
