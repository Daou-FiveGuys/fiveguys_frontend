import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { CSSTransition } from 'react-transition-group'
import AmountChart from './amount-chart'
import { AmountUsedCard } from './amount-used-card'

export interface SentMessages {
  id: number
  title: string
  content: string
  image: string
  date: Date
}

export default function AmountUsedPanel() {
  const [visiable, setVisiable] = useState(false)
  const isTyping = useSelector((state: RootState) => state.chat['amount-used'].isTyping)

  useEffect(() => {
    if (!isTyping) {
      setTimeout(() => {
        setVisiable(true)
      }, 60)
    }
  }, [isTyping])

  return (
    <CSSTransition in={visiable} timeout={1000} classNames="fade" unmountOnExit>
      <div className="flex-col items-center justify-center mb-4">
        {/* TODO: 그래프 추가 */}
        <AmountChart/>
        {/* TODO: 전체 정보 */}
        <AmountUsedCard/>
      </div>
    </CSSTransition>
  )
}