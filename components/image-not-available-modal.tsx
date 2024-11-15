import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ModalProps {
  onConfirm: () => void
}

const ImageNotAvailableModal: React.FC<ModalProps> = ({ onConfirm }) => {
  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="mb-4 text-foreground">
            다른 요청이 처리중입니다. 잠시 뒤에 시도하세요
          </p>
          <div className="flex justify-end space-x-2">
            <Button onClick={onConfirm}>확인</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return typeof window !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : null
}

export default ImageNotAvailableModal
