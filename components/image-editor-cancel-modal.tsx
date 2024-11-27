import React, { ReactNode } from 'react'
import { Card } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Button } from './ui/button'

interface DialogProps {
  onConfirm: () => void
  onCancel: () => void
}

export const ImageEditorCancelDialog: React.FC<DialogProps> = ({
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>이미지 편집을 취소하시겠습니까?</DialogTitle>
          <DialogDescription>변경 사항은 저장되지 않습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            나가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
