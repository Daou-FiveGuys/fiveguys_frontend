'use client'

import React, { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// 샘플 데이터
const sampleData = [
  {
    id: 1,
    sendImage: 'image1.jpg',
    fromNumber: '01012345678',
    content: '본문입니다.',
    sendTime: '2023-06-01T10:00:00',
    reservationState: 'NOTYET',
    messageType: 'SMS',
    createdAt: '2023-05-31T09:00:00',
  },
  {
    id: 2,
    sendImage: 'image2.jpg',
    fromNumber: '01087654321',
    content: '본문입니다.',
    sendTime: '2023-06-02T14:00:00',
    reservationState: 'DONE',
    messageType: 'MMS',
    createdAt: '2023-06-01T13:00:00',
  },
  // 더 많은 샘플 데이터...
]

function getState(state: String): String {
    switch(state) {
        case "DIRECT": return "전송 완료"
        case "NOTYET": return "전송 대기"
        case "DONE": return "전송 완료"
        case "CANCEL": return "예약 취소"
    }
    return "NONE"
}

export default function ReservationList() {
  const [filterType, setFilterType] = useState('createdAt')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const startDateRef = useRef<HTMLButtonElement>(null)
  const endDateRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (startDateRef.current) {
      startDateRef.current.focus()
    }
  }, [])

  // API 영역
  // const fetchReservations = async (filterType, startDate, endDate) => {
  //   const response = await fetch(`/api/reservations?filterType=${filterType}&startDate=${startDate}&endDate=${endDate}`)
  //   const data = await response.json()
  //   return data
  // }

  const filteredData = sampleData.filter((item) => {
    const itemDate = new Date(filterType === 'createdAt' ? item.createdAt : item.sendTime)
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
              ref={startDateRef}
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
              ref={endDateRef}
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>메시지 타입</TableHead>
            <TableHead>발신 번호</TableHead>
            <TableHead>컨텐츠</TableHead>
            <TableHead>발송 시간</TableHead>
            <TableHead>예약 상태</TableHead>
            <TableHead>이미지</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.messageType}</TableCell>
              <TableCell>{item.fromNumber}</TableCell>
              <TableCell>{item.content}</TableCell>
              <TableCell>{format(new Date(item.sendTime), 'yyyy-MM-dd HH:mm')}</TableCell>
              <TableCell>{getState(item.reservationState)}</TableCell>
              <TableCell>{item.sendImage}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}