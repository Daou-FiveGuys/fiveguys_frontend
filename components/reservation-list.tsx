'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ReservationItemDetail from './reservation-item-detail';
import { getState, MessageType, ReservationState, type Reservation } from './reservation-types';
import { CommonResponse } from './chat/amount-used/service';
import apiClient from '@/services/apiClient';

export const fetchReservations = async (): Promise<Reservation[] | null> => {
  try {
    const response = await apiClient.get<CommonResponse<Reservation[]>>("/reservation/");
    if (response.data.code === 200 && response.data.data) {
      return response.data.data;
    }
    console.error("Failed to fetch reservations: Invalid response code or missing data.");
    return null;
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return null;
  }
};

export default function ReservationList() {
  const [filterType, setFilterType] = useState('createdAt');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // State to force re-fetch reservations
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchReservationsData();
  }, [refresh]); // Trigger useEffect whenever `refresh` changes

  const fetchReservationsData = async () => {
    setLoading(true);
    const data = await fetchReservations();
    if (data) {
      setReservations(data);
    }
    setLoading(false);
  };

  const triggerRefresh = () => setRefresh((prev) => !prev); // Toggles `refresh` to trigger `useEffect`

  const filteredData = reservations.filter((item) => {
    const itemDate = new Date(filterType === 'createdAt' ? item.messageHistory.createdAt : item.sendTime);
    return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
  });

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
              variant="outline"
              className={cn('w-[280px] justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'PPP') : <span>시작 날짜</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-[280px] justify-start text-left font-normal', !endDate && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'PPP') : <span>종료 날짜</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
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
        fetchReservations={triggerRefresh} // Pass refresh trigger function to the detail component
      />
    </div>
  );
}