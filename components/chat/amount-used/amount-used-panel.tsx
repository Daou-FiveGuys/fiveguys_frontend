import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { CSSTransition } from 'react-transition-group'
import AmountChart from './amount-chart'
import { AmountUsedCard } from './amount-used-card'
import { Separator } from '@radix-ui/react-separator'

export interface SentMessages {
  id: number
  title: string
  content: string
  image: string
  date: Date
}

export default function AmountUsedPanel() {
  const [visible, setVisible] = useState(false)
  const isTyping = useSelector(
    (state: RootState) => state.chat['amount-used']?.isTyping ?? false
  ) // 안전한 접근
  const nodeRef = useRef(null) // DOM 노드를 참조할 ref 생성

  useEffect(() => {
    if (!isTyping) {
      const timeout = setTimeout(() => {
        setVisible(true)
      }, 60)

      return () => clearTimeout(timeout) // 컴포넌트 언마운트 시 타이머 정리
    } else {
      setVisible(false)
    }
  }, [isTyping])

  return (
    <CSSTransition
      in={visible}
      timeout={1000}
      classNames="fade"
      unmountOnExit
      nodeRef={nodeRef} // nodeRef 전달
    >
      <div ref={nodeRef} className="flex-col items-center justify-center mb-4">
        <Separator className="my-4" />
        {/* TODO: 그래프 추가 */}
        <AmountChart />
        {/* TODO: 전체 정보 */}
        <Separator className="my-4" />
        <AmountUsedCard />
      </div>
    </CSSTransition>
  )
}
