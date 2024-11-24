'use client'

import { useState } from 'react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'

interface ImagePreviewModalProps {
  imageUrl: string
  isOpen: boolean
  onClose: (isEdit: boolean) => void
}

export default function ImagePreviewModal({
  imageUrl,
  isOpen,
  onClose
}: ImagePreviewModalProps) {
  const [isOpenDialog, setIsOpenDialog] = useState(isOpen)

  const handleEditClick = () => {
    setIsOpenDialog(false)
    onClose(true)
  }

  const handleNoClick = () => {
    setIsOpenDialog(false)
    onClose(false)
  }

  return (
    <Dialog open={isOpenDialog} onOpenChange={handleNoClick}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="pb-4">
            이미지 편집 모달
          </DialogTitle>
        </DialogHeader>
          <div className="aspect-square relative overflow-hidden rounded-lg p-1"
            onClick={handleEditClick}
            >
            <Image
                src={imageUrl}
                alt="Image preview"
                fill
                style={{objectFit: 'cover'}}
                className="rounded-t-2xl"
            />
          </div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-center">
              이미지 편집창으로 넘어가시겠습니까?
            </h2>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditClick}>
              예
            </Button>
            <Button onClick={handleNoClick}>
              아니오
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
)
}
