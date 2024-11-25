import { useEffect, useRef, useState } from 'react'
import CalendarComponent from '../history/calendar'
import { MessageHistory } from '../history/message-history'
import { Separator } from '@/components/ui/separator'
import apiClient from '@/services/apiClient'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CSSTransition } from 'react-transition-group'

export interface SentMessages {
  id: number
  title: string
  content: string
  image: string
  date: Date
}

export default function AmountUsedPanel() {
    const [currentDate, setCurrentDate] = useState(new Date()) // 현재 날짜
  const [selectedDate, setSelectedDate] = useState<Date | null>(null) // 선택된 날짜를 null로 초기화
  const [dayStates, setDayStates] = useState<boolean[]>([]) // 각 날짜의 상태
  const [sentMessages, setSentMessages] = useState<SentMessages[]>([])
  const [visiable, setVisiable] = useState(false)
  const isTyping = useSelector((state: RootState) => state.chat['amount-used'].isTyping)
  const previousDate = useRef<Date | null>(null) // 이전 날짜 상태 저장

  useEffect(() => {
    if (!isTyping) {
      setTimeout(() => {
        setVisiable(true)
      }, 60)
    }
  }, [isTyping])

  // currentDate 변경 시 fetchDayStates 호출
  useEffect(() => {
    fetchDayStates()
  }, [currentDate])

  // selectedDate 변경 시 fetchMessageHistory 호출
  useEffect(() => {
    if (selectedDate) {
      fetchAmountUsed()
    } else {
      setSentMessages([]) // 날짜 선택이 해제되면 메시지 목록 초기화
    }
  }, [selectedDate])

  const fetchDayStates = async () => {
    try {
      const formattedDate = format(currentDate, 'yyyy-MM-dd', { locale: ko })
      const res = await apiClient.get(`/messageHistory/month/${formattedDate}`)
      if (res.data.code === 200) {
        const newDaystate = res.data.data.slice(1)
        setDayStates(newDaystate)
      } else {
        throw new Error('Failed to fetch day states')
      }
    } catch (error) {
      console.error('Error fetching month states:', error)
    }
  }

  const fetchAmountUsed = async () => {
    if (!selectedDate) return // 날짜가 선택되지 않은 경우 함수 종료

    try {
      if (!dayStates[selectedDate.getDate() - 1]) {
        setSentMessages([])
        return
      }
      const formattedDate = format(selectedDate, 'yyyy-MM-dd', { locale: ko })
      const res = await apiClient.get(`/messageHistory/date/${formattedDate}`)
      if (res.data.code === 200) {
        const messages = res.data.data
        const newMessages: SentMessages[] = messages.map(
          (message: any, index: number) => ({
            id: index,
            title: message.subject as string,
            content: message.content as string,
            date: new Date(message.createdAt),
            image: message.sendImage === null ? null : message.sendImage.url
          })
        )
        setSentMessages(newMessages)
      } else {
        throw new Error('Failed to fetch message history')
      }
    } catch (error) {
      console.error('Error fetching message history:', error)
    }
  }

  return (
    <CSSTransition in={visiable} timeout={1000} classNames="fade" unmountOnExit>
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
        {/* <MessageHistory sentMessages={sentMessages} /> */}
      </div>
    </CSSTransition>
  )
}