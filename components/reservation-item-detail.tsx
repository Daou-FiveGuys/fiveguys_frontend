'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ImageIcon } from 'lucide-react'
import { getState, type Reservation } from "./reservation-types"
import { CancelReservation } from "./reservation-cancel"

interface ReservationItemDetailProps {
  isOpen: boolean
  onClose: () => void
  fetchReservations: () => void
  reservation: Reservation | null
}

export default function ReservationItemDetail({
  isOpen,
  onClose,
  fetchReservations,
  reservation
}: ReservationItemDetailProps) {
  if (!reservation) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>예약 상세 정보</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold">예약 정보</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">예약 시간</p>
                <p className="font-medium">
                  {format(new Date(reservation.sendTime), 'yyyy-MM-dd HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">예약 상태</p>
                <p className="font-medium">{getState(reservation.state)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">메시지 타입</p>
                <p className="font-medium">{reservation.messageHistory.messageType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">발신 번호</p>
                <p className="font-medium">{reservation.messageHistory.fromNumber}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="text-lg font-semibold">메시지 내용</h3>
            <div className="p-4 border rounded-lg">
              <p className="whitespace-pre-wrap">{reservation.messageHistory.content}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="text-lg font-semibold">첨부 이미지</h3>
            {reservation.messageHistory.sendImage ? (
              <div className="relative aspect-video">
                <img
                  src={reservation.messageHistory.sendImage.url}
                  alt="첨부된 이미지"
                  className="object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-8 h-8" />
                  <p>첨부된 이미지가 없습니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <CancelReservation
          messageHistoryId={reservation.messageHistory.messageHistoryId} 
          onCancelSuccess={fetchReservations}
          onClose={onClose}  // Pass onClose to CancelReservation
        />
      </DialogContent>
    </Dialog>
  )
}

