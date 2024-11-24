import React, { forwardRef, useImperativeHandle, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { clearMessages } from '@/redux/slices/chatSlice'

export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  setActiveButton: (value: ButtonType) => void
}

const ReturnButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
  ({setActiveButton }) => {
    const dispatch = useDispatch()

    return (
      <>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          onClick={()=> {    
            setActiveButton("faq")
            dispatch(
            clearMessages({chatId:'send-message'})
          )
          dispatch(
            clearMessages({chatId:'create-message'})
          )
          dispatch(
            clearMessages({chatId:'create-image-prompt'})
          )
          dispatch(
            clearMessages({chatId:'image-generate'})
          )}}
        >
          Return
        </Button>
      </>
    )
  }
)

export default ReturnButton