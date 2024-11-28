'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import apiClient from '@/services/apiClient'

interface CancelReservationProps {
    messageHistoryId: number
    onCancelSuccess: () => void
    onClose: () => void  // Add onClose prop
}

export function CancelReservation({ 
  messageHistoryId,
  onCancelSuccess,
  onClose  // Destructure onClose
}: CancelReservationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)  // Add state to control AlertDialog

  const handleCancel = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.post(`ppurio/cancel/${messageHistoryId}`)
      
      if (response.data.code === 200) {
        onCancelSuccess()  // Add parentheses to call the function
        onClose()  // Close the detail dialog
        setIsOpen(false)  // Close the alert dialog
      } else {
        throw new Error('예약 취소에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          예약 취소하기
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>예약을 취소하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            이 작업은 되돌릴 수 없습니다. 예약된 메시지가 영구적으로 취소됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "취소 중..." : "예약 취소"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

