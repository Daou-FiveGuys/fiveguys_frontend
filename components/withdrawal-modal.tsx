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

interface WithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  onConfirm
}: WithdrawalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>회원탈퇴</DialogTitle>
          <DialogDescription>
            정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            탈퇴
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
