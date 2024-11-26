import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useState
} from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { clearMessages } from '@/redux/slices/chatSlice'
import { handleCreateImagePrompt } from './handle-create-image-prompt'
import MessageOptionUtils from '../utils/MessageOptionUtils'
import CancelProcessModal from '../cancel-process-modal'

export type CreateImagePromptProcessType =
  | 'welcome'
  | 'prompt-input'
  | 'prompt-generate'
  | 'edit'

export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  buttonType: ButtonType
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}

const CreateImagePromptButton = forwardRef<
  CustomButtonHandle,
  CustomButtonProps
>(({ buttonType, activeButton, setActiveButton }, ref) => {
  const isActive = buttonType === activeButton
  const [lastUserInput, setLastUserInput] = React.useState<string | null>(null)
  const [hasAddedChat, setHasAddedChat] = React.useState(false)
  const [currentProcess, setCurrentProcess] =
    useState<CreateImagePromptProcessType>('welcome')
  const messageOption = useSelector((state: RootState) => state.messageOption)
  const isTyping = useSelector(
    (state: RootState) => state.chat['create-message'].isTyping
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  React.useEffect(() => {
    if (ChatUtils.dispatch && isActive && !hasAddedChat && !isTyping) {
      setHasAddedChat(true)
      ChatUtils.addChat(
        buttonType,
        'assistant-animation-html',
        `<div>함께 이미지 생성을 위한 프롬프트를 만들어볼까요? 🙌🏻 <ul><li><div><strong><span>직접 입력</strong>은 <strong><span style="color: #34d399;">직접</span></strong>을 입력해주세요</div></li><li><div><strong><span>자동 생성</strong>은 <strong><span style="color: #38bdf8;">자동</span></strong>을 입력해주세요</div></li></ul></div>`
      )
    }
  }, [isActive, hasAddedChat, isTyping])

  useImperativeHandle(ref, () => ({
    handleEnterPress: (value: string) => {
      if (isActive && value.trim()) {
        ChatUtils.addChat(buttonType, 'user', value.trim())
        setLastUserInput(value.trim())
      }
      setTimeout(() => {
        handleCreateImagePrompt(
          value,
          setActiveButton,
          messageOption,
          currentProcess,
          setCurrentProcess
        )
      }, 100)
    }
  }))

  useEffect(() => {
    setCurrentProcess('welcome')
    setHasAddedChat(false)
  }, [activeButton])

  const handleButtonClick = () => {
    setIsModalOpen(true)
  }

  const handleConfirm = () => {
    setIsModalOpen(false)
    MessageOptionUtils.addContent('')
    MessageOptionUtils.addPrompt('')
    ChatUtils.clearChat(buttonType)
    ChatUtils.clearChat('create-image-prompt')
    setActiveButton(buttonType)
    ChatUtils.addChat(
      buttonType,
      'assistant-animation-html',
      `<div>함께 이미지 생성을 위한 프롬프트를 만들어볼까요? 🙌🏻 <ul><li><div><strong><span>직접 입력</strong>은 <strong><span style="color: #34d399;">직접</span></strong>을 입력해주세요</div></li><li><div><strong><span>자동 생성</strong>은 <strong><span style="color: #38bdf8;">자동</span></strong>을 입력해주세요</div></li></ul></div>`
    )
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button
        className="w-full md:w-28 h-8 mb-2 md:mb-0"
        variant={
          messageOption.content === null
            ? 'outline'
            : isActive
              ? 'default'
              : 'outline'
        }
        disabled={
          messageOption.content === null || activeButton === 'create-message'
        }
        onClick={handleButtonClick}
      >
        프롬프트 생성
      </Button>
      {isModalOpen && (
        <CancelProcessModal
          isOpen={isModalOpen}
          onClose={handleCancel}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
})

export default CreateImagePromptButton
