import { Button } from '@/components/ui/button'
import { ButtonType } from "@/components/prompt-form"
import React, { useImperativeHandle } from "react"
import { forwardRef } from "react"
import ChatUtils from "../utils/ChatUtils"
import { useIsMessagesEmpty } from "@/lib/hooks/use-message-is-empty"

export interface CustomButtonHandle {
    handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
    buttonType: ButtonType
    activeButton: ButtonType
    setActiveButton: (value: ButtonType) => void
  }

const AmountUsedButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
({ buttonType, activeButton, setActiveButton }, ref) => {
    const isActive = buttonType === activeButton
    const [hasAddedChat, setHasAddedChat] = React.useState(false)
    useImperativeHandle(ref, () => ({
        handleEnterPress: (value: string) => {
          if (isActive && value.trim()) {
            ChatUtils.addChat(buttonType, 'user', value.trim())
          }
        }
      }))

      const isMessagesEmpty = useIsMessagesEmpty(buttonType)
      React.useEffect(() => {
        if (ChatUtils.dispatch && !hasAddedChat) {
          if (isMessagesEmpty) {
            ChatUtils.addChat(
              buttonType,
              'assistant-animation',
              '원하는 날짜의 사용량을 조회해보세요! 🗓️'
            )
          }
        }
      }, [hasAddedChat])

    return (
        <Button
        className="w-full md:w-28 h-8 mb-2 md:mb-0"
        variant={isActive ? 'default' : 'outline'}
        onClick={() => setActiveButton(buttonType)}
      >
        사용량 조회
      </Button>
    )
})

export default AmountUsedButton