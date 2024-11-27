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
import MessageCardModal from '../history/message-card-modal'
import AddressBookModal from '@/app/address/modal/select-contact-modal'
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
  | 'send'

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
    const [isSendModalOpen, setIsSendModalOpen] = useState(false)

    React.useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat && messages.length === 0) {
        setHasAddedChat(true)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>문자 전송을 도와드릴게요! 우선 전송할 내용을 정해볼까요? 🧐 <ul><li><div><strong><span>직접 입력</strong>은 <strong><span style="color: #34d399;">직접</span></strong>을 입력해주세요</div></li><li><div><strong><span>자동 생성</strong>은 <strong><span style="color: #38bdf8;">자동</span></strong>을 입력해주세요</div></li></ul></div>`
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
            setCurrentProcess,
            setIsSendModalOpen
          )
        }, 100)
      }
    }))

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

      setCurrentProcess('welcome')
      setHasAddedChat(false)
      ChatUtils.addChat(
        buttonType,
        'assistant-animation-html',
        `<div>문자 전송을 도와드릴게요! 우선 전송할 내용을 정해볼까요? 🧐 <ul><li><div><strong><span>직접 입력</strong>은 <strong><span style="color: #34d399;">직접</span></strong>을 입력해주세요</div></li><li><div><strong><span>자동 생성</strong>은 <strong><span style="color: #38bdf8;">자동</span></strong>을 입력해주세요</div></li></ul></div>`
      )
    }

    const handleCancel = () => {
      setIsModalOpen(false)
    }
    const handleSendCancel = () => {
      setIsSendModalOpen(false)
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
        {isSendModalOpen && (
          <AddressBookModal
          file={null}
          onClose={handleSendCancel}
          method={"image"}
        />
        )}
      </>
    )
  }
)

export default CreateMessageButton
