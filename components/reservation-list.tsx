'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import apiClient from '@/services/apiClient'
import { CommonResponse } from '@/app/address/modal/service'
import ReservationItemDetail from './reservation-item-detail'
import { getState, type Reservation, ReservationState, MessageType } from './reservation-types'

export default function ReservationList() {
  const [filterType, setFilterType] = useState('createdAt')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<CommonResponse<Reservation[]>>('/reservation/')
      if (response.data.code === 200 && response.data.data) {
        setReservations(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = sampleData.filter((item) => {
    const itemDate = new Date(filterType === 'createdAt' ? item.messageHistory.createdAt : item.sendTime)
    return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate)
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">예약 메시지 목록</h1>
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={(value) => setFilterType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="필터 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">예약 날짜</SelectItem>
            <SelectItem value="sendTime">발송 날짜</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>시작 날짜</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>종료 날짜</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
            />
          </PopoverContent>
        </Popover>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>메시지 타입</TableHead>
              <TableHead>발신 번호</TableHead>
              <TableHead>컨텐츠</TableHead>
              <TableHead>발송 시간</TableHead>
              <TableHead>예약 상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow 
                key={item.reservationId}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedReservation(item)}
              >
                <TableCell>{item.messageHistory.messageType}</TableCell>
                <TableCell>{item.messageHistory.fromNumber}</TableCell>
                <TableCell>{item.messageHistory.content}</TableCell>
                <TableCell>{format(new Date(item.sendTime), 'yyyy-MM-dd HH:mm')}</TableCell>
                <TableCell>{getState(item.state)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ReservationItemDetail
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        reservation={selectedReservation}
      />
    </div>
  )
}

const sampleData: Reservation[] = [
  {
      reservationId: 1,
      sendTime: "2023-06-01T10:00:00",
      state: ReservationState.NOTYET,
      messageHistory: {
      messageHistoryId: 1,
      sendImage: {
          sendImageId: 1,
          url: "image1.jpg",
      },
      fromNumber: "01012345678",
      messageType: MessageType.SMS,
      subject: "제목 없음",
      content: "본문입니다.",
      createdAt: "2023-05-31T09:00:00",
      contact2s: [],
      messageKey: "MSG_1",
      },
  },
  {
      reservationId: 2,
      sendTime: "2023-06-02T14:00:00",
      state: ReservationState.DONE,
      messageHistory: {
      messageHistoryId: 2,
      sendImage: {
          sendImageId: 2,
          url: "image2.jpg",
      },
      fromNumber: "01087654321",
      messageType: MessageType.MMS,
      subject: "제목 없음",
      content: "본문입니다.",
      createdAt: "2023-06-01T13:00:00",
      contact2s: [],
      messageKey: "MSG_2",
      },
  },
  ];