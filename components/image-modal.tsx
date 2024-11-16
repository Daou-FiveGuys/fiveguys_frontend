import React from 'react'
import ReactDOM from 'react-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ModalProps {
  imageUrl: string
  onConfirm: () => void
  onCancel: () => void
}

const ImageModal: React.FC<ModalProps> = ({
  imageUrl,
  onConfirm,
  onCancel
}) => {
  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <img
            src={imageUrl}
            alt="Modal Image"
            className="mb-4 w-full h-auto object-cover"
          />
          <div className="flex justify-center space-x-2">
            <Button onClick={onCancel} variant="outline" className="w-full">
              취소
            </Button>
            <Button onClick={onConfirm} className="w-full">
              적용
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

export default ImageModal
