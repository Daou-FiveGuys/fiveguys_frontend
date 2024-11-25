'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useEffect, useState, useRef } from 'react'
import { Message, Session } from '@/lib/types'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { ButtonType } from './prompt-form'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className }: ChatProps) {
  const [input, setInput] = useState<string>('')
  const [activeButton, setActiveButton] = useState<ButtonType>('faq')
  const messages = useSelector((state: RootState) => {
    if (
      activeButton === 'create-message' ||
      activeButton === 'create-image-prompt' ||
      activeButton === 'image-generate' ||
        activeButton === 'select-image'
    ) {
      // 조건에 맞는 상태의 메시지 배열을 병합
      return [
        ...(state.chat['create-message']?.messages || []),
        ...(state.chat['create-image-prompt']?.messages || []),
        ...(state.chat['image-generate']?.messages || [])
      ]
    } else {
      // 조건이 맞지 않을 경우, 선택된 버튼의 상태를 반환
      return state.chat[activeButton]?.messages || []
    }
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const isUserScrollingRef = useRef(false) // 사용자 스크롤 상태 레퍼런스

  const [isAtBottom, setIsAtBottom] = useState(true)
  const isAtBottomRef = useRef(true) // 스크롤 최하단 상태 레퍼런스

  const scrollTimeoutRef = useRef<number | null>(null) // 스크롤 타임아웃 레퍼런스

  const easeCustom = (progress: number) => {
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
  }
  const scrollToBottomWithAnimation = () => {
    if (
      !scrollRef.current ||
      !isAtBottomRef.current ||
      isUserScrollingRef.current
    ) {
      return
    }

    const start = scrollRef.current.scrollTop
    const end = scrollRef.current.scrollHeight
    const duration = 1000 // animation duration (ms)
    const startTime = performance.now()

    const animateScroll = (currentTime: number) => {
      if (!scrollRef.current) return

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1) // Progress (0 to 1)
      const easeCustomProgress = easeCustom(progress)

      scrollRef.current.scrollTop = start + (end - start) * easeCustomProgress

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }

    requestAnimationFrame(animateScroll)
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current

    // 현재 스크롤이 하단에 있는지 확인
    const isAtBottomNow = scrollHeight - scrollTop <= clientHeight + 5
    setIsAtBottom(isAtBottomNow)
    isAtBottomRef.current = isAtBottomNow // 레퍼런스 업데이트

    // 사용자가 스크롤 중임을 표시
    setIsUserScrolling(true)
    isUserScrollingRef.current = true // 레퍼런스 업데이트

    // 이전 타임아웃 클리어
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current)
    }

    // 스크롤 중단 후 200ms 뒤에 isUserScrolling을 false로 설정
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsUserScrolling(false)
      isUserScrollingRef.current = false // 레퍼런스 업데이트
    }, 200)
  }

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!scrollRef.current) return

      // 레퍼런스 값을 사용하여 조건 확인
      if (isAtBottomRef.current && !isUserScrollingRef.current) {
        scrollToBottomWithAnimation()
      }
    })

    if (messagesContainerRef.current) {
      observer.observe(messagesContainerRef.current)
    }

    return () => {
      if (messagesContainerRef.current) {
        observer.unobserve(messagesContainerRef.current)
      }
    }
  }, []) // 빈 배열로 의존성 제거

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className={cn('pb-[250px] pt-4 md:pt-10', className)}
        ref={messagesContainerRef}
      >
        {messages.length ? (
          <ChatList chatId={activeButton} messages={messages} />
        ) : (
          <EmptyScreen />
        )}
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottomWithAnimation}
        activeButton={activeButton}
        setActiveButton={setActiveButton}
      />
    </div>
  )
}
