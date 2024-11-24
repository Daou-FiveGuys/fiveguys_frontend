import React from 'react'
import { Button } from '@/components/ui/button'

interface CalendarProps {
  currentDate: Date
  setCurrentDate: (currentDate: Date) => void
  selectedDate: Date | null
  setSelectedDate: (selectedDate: Date | null) => void
  dayStates: boolean[]
  setDayStates: (dayStates: boolean[]) => void
}

export default function CalendarComponent({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  dayStates,
  setDayStates
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

  // 이전 달로 이동
  const handlePrevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    )
    setCurrentDate(newDate)
    setSelectedDate(null) // 선택된 날짜 해제
    setDayStates([])
  }

  // 다음 달로 이동
  const handleNextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    )
    setCurrentDate(newDate)
    setSelectedDate(null) // 선택된 날짜 해제
    setDayStates([])
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (day: number | null) => {
    if (day) {
      const newSelectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      )

      // 같은 날짜를 선택한 경우 해제
      if (
        selectedDate &&
        selectedDate.getDate() === newSelectedDate.getDate() &&
        selectedDate.getMonth() === newSelectedDate.getMonth() &&
        selectedDate.getFullYear() === newSelectedDate.getFullYear()
      ) {
        setSelectedDate(null) // 선택 해제
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
              day &&
              selectedDate &&
              day === selectedDate.getDate() &&
              currentDate.getMonth() === selectedDate.getMonth() &&
              currentDate.getFullYear() === selectedDate.getFullYear()

            return (
              <div
                key={i}
                className={`relative flex flex-col items-center justify-center rounded-lg p-2 ${
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
                  <>
                    <div className="font-medium">{day}</div>
                    <div
                      className={`mt-1 w-full h-1 rounded-full ${
                        dayStates[day - 1]
                          ? 'bg-blue-500 dark:bg-blue-300'
                          : 'bg-transparent'
                      }`}
                    ></div>
                  </>
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
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}
