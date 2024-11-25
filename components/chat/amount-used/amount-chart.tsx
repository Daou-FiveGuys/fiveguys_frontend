'use client'

import React, { useState, useEffect } from 'react'
import { format, subDays, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, isSameMonth, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Line, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api, AmountUsed, DailyAmount } from './service'

const AmountChart: React.FC = () => {
  const [amountUsed, setAmountUsed] = useState<AmountUsed | undefined>()
  const [weeklyData, setWeeklyData] = useState<DailyAmount[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'))
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))

  useEffect(() => {
    api.readAmountUsed(setAmountUsed)
  }, [])

  useEffect(() => {
    if (amountUsed) {
      const weekData = Array.from({ length: 7 }, (_, i) => {
        const date = format(addDays(currentWeekStart, i), 'yyyy-MM-dd')
        return amountUsed.dailyAmounts.find(day => day.date === date) || {
          dailyAmountId: 0,
          msgScnt: 0,
          msgGcnt: 0,
          imgScnt: 0,
          imgGcnt: 0,
          date
        }
      })
      setWeeklyData(weekData)
    }
  }, [amountUsed, currentWeekStart])

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    setCurrentWeekStart(startOfWeek(new Date(value), { weekStartsOn: 1 }))
  }

  const handlePreviousWeek = () => {
    const newWeekStart = subDays(currentWeekStart, 7)
    if (isSameMonth(newWeekStart, new Date(selectedMonth))) {
      setCurrentWeekStart(newWeekStart)
    } else {
      const prevMonth = addDays(startOfMonth(new Date(selectedMonth)), -1)
      setSelectedMonth(format(prevMonth, 'yyyy-MM'))
      setCurrentWeekStart(startOfWeek(endOfMonth(prevMonth), { weekStartsOn: 1 }))
    }
  }

  const handleNextWeek = () => {
    const newWeekStart = addDays(currentWeekStart, 7)
    if (isSameMonth(newWeekStart, new Date(selectedMonth))) {
      setCurrentWeekStart(newWeekStart)
    } else {
      const nextMonth = addDays(endOfMonth(new Date(selectedMonth)), 1)
      setSelectedMonth(format(nextMonth, 'yyyy-MM'))
      setCurrentWeekStart(startOfWeek(startOfMonth(nextMonth), { weekStartsOn: 1 }))
    }
  }

  const getMonthOptions = () => {
    const months = []
    let currentDate = new Date()
    for (let i = 0; i < 4; i++) {
      months.push(format(currentDate, 'yyyy-MM'))
      currentDate = subMonths(currentDate, 1)
    }
    return months
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>주간 서비스 사용량</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="월 선택" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map(month => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month), 'yyyy년 MM월', { locale: ko })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          {format(currentWeekStart, 'yyyy년 MM월 dd일', { locale: ko })} - {format(addDays(currentWeekStart, 6), 'yyyy년 MM월 dd일', { locale: ko })}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'MM/dd', { locale: ko })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => format(new Date(value), 'yyyy년 MM월 dd일', { locale: ko })}
            />
            <Legend />
            <Area type="monotone" dataKey="msgGcnt" name="문자 생성" fill="#FFE5E5" stroke="#FF9999" />
            <Line type="monotone" dataKey="msgScnt" name="문자 발신" stroke="#CC0000" />
            <Area type="monotone" dataKey="imgGcnt" name="이미지 생성" fill="#E5F2FF" stroke="#99CCFF" />
            <Line type="monotone" dataKey="imgScnt" name="이미지 발신" stroke="#0033CC" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default AmountChart

