import { useEffect, useState } from 'react'
import CalendarComponent from './calendar'
import { MessageHistory } from './message-history'
import { Separator } from '@/components/ui/separator'
import apiClient from '@/services/apiClient'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

export interface SentMessages {
  id: number
  title: string
  content: string
  image: string
  date: Date
}

export default function HistoryPanel() {
  const [currentDate, setCurrentDate] = useState(new Date()) // 현재 날짜
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0)
  )
  const [dayStates, setDayStates] = useState<boolean[]>([]) // 각 날짜의 상태
  const [sentMessages, setSentMessages] = useState<SentMessages[]>([])
  const [visiable, setVisiable] = useState(false)
  const isTyping = useSelector(
    (state: RootState) => state.chat['history'].isTyping
  )

  useEffect(() => {
    if (!isTyping) {
      setTimeout(() => {
        setVisiable(true)
      }, 60)
    }
  }, [isTyping])

  useEffect(() => {
    if (
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getDate() != selectedDate.getDate()
    )
      fetchMessageHistory()
    else if (currentDate.getMonth() !== selectedDate.getMonth())
      fetchDayStates()
    /**
     * 추후 제거
     */
    setDayStates(generateDummyDayStates()) // 더미 데이터 사용
  }, [selectedDate])

  const fetchDayStates = async () => {
    try {
      await apiClient
        .post('주소', { headers: { date: selectedDate } })
        .then(res => {})
        .catch(err => {})
    } catch (error) {
      console.error('Error fetching day states:', error)
    }
  }

  const fetchMessageHistory = async () => {
    try {
      await apiClient
        .post('주소', { headers: { date: selectedDate } })
        .then(res => {})
        .catch(err => {})
    } catch (error) {
      console.error('Error fetching month states:', error)
    }
  }

  /**
   * 나중에 삭제
   */
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  // 더미 데이터 생성
  const generateDummyDayStates = () => {
    return Array.from({ length: daysInMonth }, () =>
      Math.random() > 0.5 ? true : false
    )
  }
  /**
   *
   */

  return (
    visiable && (
      <div className="flex-col items-center justify-center mb-4">
        <Separator className="my-4" />
        <CalendarComponent
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dayStates={dayStates}
          setDayStates={setDayStates}
        />
        <Separator className="my-4" />
        <MessageHistory sentMessages={sentMessages} />
      </div>
    )
  )
}
