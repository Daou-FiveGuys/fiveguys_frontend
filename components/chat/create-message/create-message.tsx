import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import CreatingMessage from './creating-message'

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
    const [hasAddedChat, setHasAddedChat] = useState(false)
    const [lastUserInput, setLastUserInput] = useState<string | null>(null)
    const [showCreatingMessage, setShowCreatingMessage] = useState(false)
    const message = useSelector((state: RootState) => state.chat[buttonType])
    const dispatch = useDispatch()
    const text = useSelector((state: RootState) => state.createText.text)
    const [localText, setLocalText] = useState(text)

    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        if (!isActive) {
          ChatUtils.addChat(buttonType, 'user', value.trim())
          setLastUserInput(value.trim())
          setShowCreatingMessage(true)
        }
      }
    }))

    useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat) {
        if (buttonType === 'create-message') {
          ChatUtils.addChat(
            buttonType,
            'assistant-animation',
            '홍보 메시지를 만들어보세요! "직접 입력"하거나 "자동 생성"을 요청할 수 있습니다.'
          )
          setHasAddedChat(true)
        }
      }
    }, [hasAddedChat, buttonType, ChatUtils.dispatch])

    useEffect(() => {
      if (lastUserInput) {
        setShowCreatingMessage(true)
      }
    }, [lastUserInput])

    const handleButtonClick = () => {
      setActiveButton(buttonType)
      setShowCreatingMessage(true)
      
      if (buttonType === 'create-message' && activeButton === 'send-message') {
        setActiveButton('create-message')
        console.log('메시지 생성 시작')
        ChatUtils.addChat(buttonType, 'assistant', '메시지를 생성 중입니다...')
        setLastUserInput('메시지 생성 요청')
      }
    }

    return (
      <>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={!isActive ? 'default' : 'outline'}
          onClick={handleButtonClick}
        >
          메시지 생성
        </Button>
        {showCreatingMessage && (
          <CreatingMessage buttonType={buttonType} lastUserInput={lastUserInput} setActiveButton={setActiveButton}/>
        )}
      </>
    )
  }
)
//문자생성 버튼: creatingMessage 실행 및 'create-message'채팅내역 제거. -> 제거 안됨. 수정 필요.

export default CreateMessageButton

