import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState
} from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { handleCreateMessage } from './handle-create-message'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import MessageOptionUtils from '../utils/MessageOptionUtils'
import CancelProcessModal from '../cancel-process-modal'
export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  buttonType: ButtonType
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}

export type CreateMessageProcessType =
  | 'welcome'
  | 'message-input'
  | 'message-generate'
  | 'edit'

const CreateMessageButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
  ({ buttonType, activeButton, setActiveButton }, ref) => {
    const isActive = buttonType === activeButton
    const [hasAddedChat, setHasAddedChat] = React.useState(false)
    const [lastUserInput, setLastUserInput] = React.useState<string | null>(
      null
    )
    const [currentProcess, setCurrentProcess] =
      useState<CreateMessageProcessType>('welcome')
    const messageOption = useSelector((state: RootState) => state.messageOption)
    const messages = useSelector(
      (state: RootState) => state.chat[buttonType].messages
    )
    const [isModalOpen, setIsModalOpen] = useState(false)

    React.useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat && messages.length === 0) {
        setHasAddedChat(true)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>문자 전송을 도와드릴게요! 우선 전송할 내용을 정해볼까요? 🧐 <div><strong><span>직접 작성</strong>은 <strong><span style="color: #38bdf8;">직접</span></strong>, <strong>자동 생성</strong>은 <strong><span style="color: #34d399;">자동</span></strong>을 입력해주세요.</div></div>`
        )
      }
    }, [isActive, hasAddedChat, messages])

    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        value = value.trim()
        if (value) {
          ChatUtils.addChat(buttonType, 'user', value)
          setLastUserInput(value)
        }

        setTimeout(() => {
          handleCreateMessage(
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
      setActiveButton('create-message')
      ChatUtils.addChat(
        buttonType,
        'assistant-animation-html',
        `<div>문자 전송을 도와드릴게요! 우선 전송할 내용을 정해볼까요? 🧐 <div><strong><span>직접 작성</strong>은 <strong><span style="color: #38bdf8;">직접</span></strong>, <strong>자동 생성</strong>은 <strong><span style="color: #34d399;">자동</span></strong>을 입력해주세요.</div></div>`
      )
    }

    const handleCancel = () => {
      setIsModalOpen(false)
    }

    return (
      <>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={isActive ? 'default' : 'outline'}
          onClick={handleButtonClick}
        >
          문자 생성
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
  }
)

export default CreateMessageButton
