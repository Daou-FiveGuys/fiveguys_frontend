import React, { forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import { useDispatch } from 'react-redux'
import { clearMessages } from '@/redux/slices/chatSlice'

export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  setActiveButton: (value: ButtonType) => void
}

const ReturnButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
  ({ setActiveButton }, ref) => {
    const dispatch = useDispatch()

    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        if (value.trim()) {
          setActiveButton('faq')
          dispatch(clearMessages({ chatId: 'send-message' }))
          dispatch(clearMessages({ chatId: 'create-message' }))
          dispatch(clearMessages({ chatId: 'create-image-prompt' }))
          dispatch(clearMessages({ chatId: 'image-generate' }))
        }
      }
    }))

    return (
      <Button
        className="w-full md:w-28 h-8 mb-2 md:mb-0"
        variant="outline"
        onClick={() => {
          setActiveButton('faq')
        }}
      >
        돌아가기
      </Button>
    )
  }
)

export default ReturnButton
