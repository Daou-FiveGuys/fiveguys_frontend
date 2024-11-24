'use client'

import React from 'react'
import ReactDOM from 'react-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ModalProps {
  onLinkSend: () => void
  onImageSend: () => void
  onClose: () => void
}

const CustomImageModal: React.FC<ModalProps> = ({
  onLinkSend,
  onImageSend,
  onClose
}) => {
  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="mb-6 text-foreground text-center text-lg font-medium">
            작업을 완료한 이미지를 보낼 방법을 선택하세요.
          </p>
          <div className="flex justify-between space-x-4">
            <Button onClick={onLinkSend} variant="outline" className="flex-1">
              링크로 보내기
            </Button>
            <Button onClick={onImageSend} variant="outline" className="flex-1">
              사진으로 보내기
            </Button>
          </div>
          <p className="mt-6 text-center text-sm text-red-600">
            사진으로 보내면 열화가 있을 수 있습니다.
          </p>
          <div className="flex justify-end mt-4">
            <Button variant="ghost" onClick={onClose}>
              닫기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return typeof window !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : null
}

export default CustomImageModal
