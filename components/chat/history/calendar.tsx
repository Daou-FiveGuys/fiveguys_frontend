import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface CalendarProps {
  currentDate: Date
  setCurrentDate: (currentDate: Date) => void
  selectedDate: Date
  setSelectedDate: (selectedDate: Date) => void
  dayStates: boolean[]
  setDayStates: (dayStates: boolean[]) => void
}

export default function CalendarComponent({
  currentDate: currentDate,
  setCurrentDate: setCurrentDate,
  selectedDate: selectedDate,
  setSelectedDate: setSelectedDate,
  dayStates: dayStates,
  setDayStates: setDayStates
}: CalendarProps): JSX.Element {
  // 현재 월의 날짜 계산
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  )
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const daysArray = Array.from({ length: 35 }, (_, i) => {
    const day = i - firstDayOfMonth.getDay() + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  // 월 변경 또는 초기 로딩 시 데이터 설정
  // 이전 달로 이동
  const handlePrevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    )
    setCurrentDate(newDate)
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0)
    )
  }

  // 다음 달로 이동
  const handleNextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    )
    setCurrentDate(newDate)
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    ) // 새로운 달의 1일로 설정
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (day: number | null) => {
    if (day) {
      const newSelectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      )

      // 이미 선택된 날짜와 동일하면 API 호출 방지
      if (
        selectedDate &&
        selectedDate.getDate() === newSelectedDate.getDate() &&
        selectedDate.getMonth() === newSelectedDate.getMonth() &&
        selectedDate.getFullYear() === newSelectedDate.getFullYear()
      ) {
        return
      }

      setSelectedDate(newSelectedDate)
    }
  }

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6 gap-6">
      <div className="bg-gray-100 dark:bg-zinc-900 rounded-lg p-6 flex-1">
        {/* 월과 화살표 버튼 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium">
            {currentDate
              .toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long'
              })
              .replace('년 ', '년 ')
              .replace('월', '월')}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeftIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 달력 날짜 */}
        <div className="grid grid-cols-7 gap-4 text-center">
          {/* 요일 헤더 */}
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={index}
              className="font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}

          {/* 날짜 렌더링 */}
          {daysArray.map((day, i) => {
            const isSelected =
              day === selectedDate?.getDate() &&
              currentDate.getMonth() === selectedDate?.getMonth() &&
              currentDate.getFullYear() === selectedDate?.getFullYear()

            return (
              <div
                key={i}
                className={`relative rounded-lg p-2 ${
                  day
                    ? `cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'hover:bg-gray-300 dark:hover:bg-zinc-700'
                      }`
                    : 'cursor-default bg-transparent'
                } ${i % 7 === 0 ? 'text-red-500 dark:text-red-400' : ''}`}
                onClick={day ? () => handleDateClick(day) : undefined}
              >
                {day && (
                  <div className="font-medium flex justify-center items-center space-x-1">
                    <span>{day}</span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        dayStates[day - 1]
                          ? 'bg-blue-500 dark:bg-blue-300'
                          : 'bg-transparent'
                      }`}
                    ></span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
