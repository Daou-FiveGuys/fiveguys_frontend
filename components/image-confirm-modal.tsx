import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ModalProps {
  onConfirm: () => void
}

const ImageProcessingRequestSuccessModal: React.FC<ModalProps> = ({
  onConfirm
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onConfirm() // 5초 후 onConfirm 함수 호출로 모달 닫기
    }, 3000)

    return () => clearTimeout(timer) // 컴포넌트가 언마운트되면 타이머 정리
  }, [onConfirm])

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="mb-4 text-foreground">
            작업이 완료되면 알려 드릴게요! 다른 작업 진행하셔도 됩니다.
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

export default ImageProcessingRequestSuccessModal
