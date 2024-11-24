'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RootState } from '@/redux/store'
import { setText } from '@/redux/slices/createTextSlice'
import ChatUtils from '@/components/chat/utils/ChatUtils'
import { ButtonType } from '@/components/prompt-form'

interface ImagePromptingProps {
  isOpen: boolean
  onClose: () => void
  buttonType: ButtonType
}

export default function ImagePrompting({ isOpen, onClose, buttonType }: ImagePromptingProps) {
  const dispatch = useDispatch()
  const text = useSelector((state: RootState) => state.createText.text)
  const [localText, setLocalText] = useState(text)

  useEffect(() => {
    setLocalText(text)
  }, [text])

  useEffect(() => {
    if (isOpen) {
      const messageId = ChatUtils.addChat(buttonType, 'user', text)
      return () => {
        ChatUtils.deleteChat(buttonType, messageId)
      }
    }
  }, [isOpen, buttonType, text])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalText(e.target.value)
  }

  const handleConfirm = () => {
    dispatch(setText({ text: localText }))
    ChatUtils.editChat(buttonType, 'user', localText)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이미지 프롬프트 생성</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={localText}
            onChange={handleInputChange}
            placeholder="프롬프트를 입력하세요"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline">버튼 1</Button>
            <Button variant="outline">버튼 2</Button>
            <Button variant="outline">버튼 3</Button>
            <Button variant="outline">버튼 4</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleConfirm}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

