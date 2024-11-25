'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmNavigationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function CancelProcessModal({
  isOpen,
  onClose,
  onConfirm
}: ConfirmNavigationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>확인</DialogTitle>
          <DialogDescription>
            정말로 돌아가시겠습니까? 진행 사항은 초기화됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button variant="default" onClick={onConfirm}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
