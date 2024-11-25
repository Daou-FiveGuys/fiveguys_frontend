// ChatList.tsx
import React, {useCallback, useMemo, useState} from 'react'
import { Separator } from '@/components/ui/separator'
import { setIsTyping, Message } from '@/redux/slices/chatSlice'
import {useDispatch, useSelector} from 'react-redux'
import MessageItem from './chat/utils/MessageItem'
import { ButtonType } from './prompt-form'
import HistoryPanel from './chat/history/history-panel'
import AmountUsedPanel from './chat/amount-used/amount-used-panel'
import Component from "@/components/image-option-modal";
import HandleGenerateImage from "@/components/chat/image-generate/image-generate-modal";
import {ImageOption, initialState} from "@/redux/slices/imageOptionSlice";
import {RootState} from "@/redux/store";

export const ChatList = ({
  chatId,
  messages,
  setActiveButton
}: {
  chatId: ButtonType
  messages: Message[]
  setActiveButton: (value: ButtonType) => void
}) => {
  const newMessage = messages.filter(
    (m, i) => i == 0 || (i > 0 && messages[i - 1].text) !== m.text
  )
  if (newMessage.length === 0) {
    return null
  }

  const dispatch = useDispatch()

  // useCallback을 사용하여 handleTypingComplete 메모이제이션
  const handleTypingComplete = useCallback(() => {
    dispatch(setIsTyping({ chatId: chatId, isTyping: false }))
  }, [dispatch, chatId])

  const isSerializedReactNode = (
    content: string | React.ReactNode
  ): boolean => {
    return (
      typeof content === 'string' &&
      content.startsWith('<') &&
      content.endsWith('>')
    )
  }
  const [imageOption, setImageOption] = useState<ImageOption>(initialState)
  const messageOption = useSelector((root: RootState) => root.messageOption)
  const [isOpen, setIsOpen] = React.useState(true)
  // 선택 imageOption
  //

  const isHistoryChat = chatId === 'history'
  const isSendMessageChat = chatId === 'send-message'
  const isAmountUsed = chatId === 'amount-used'
  const isImageOption = chatId === 'select-image'
  const isImageGenerate = chatId === 'select-image-options'

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {newMessage.map((message, index) => {
        return (
          <React.Fragment key={message.id}>
            <div className="ml-2">
              <MessageItem
                chatId={chatId}
                message={message}
                onTypingComplete={handleTypingComplete}
              />
            </div>
            {index < messages.length - 1 && <Separator className="my-4" />}
          </React.Fragment>
        )
      })}
      {isHistoryChat && <HistoryPanel />}
      {isAmountUsed && <AmountUsedPanel />}
      {isImageGenerate && (
        <Component
          isOpen={isOpen}
          setImageOption={setImageOption}
          imageOption={imageOption}
          setActiveButton={setActiveButton}
        />
      )}
      {isImageOption && <HandleGenerateImage imageOption={imageOption} messageOption={messageOption} setActiveButton={setActiveButton}/>}
    </div>
  )
}
