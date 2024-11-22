'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useEffect, useState } from 'react'
import { Message, Session } from '@/lib/types'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
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
  const messages = useSelector((state: RootState) =>
    state.chat[activeButton] ? state.chat[activeButton].messages : []
  )

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottomWithAnimation() // 애니메이션 스크롤 호출
    }
  }, [messages.length]) // 메시지 길이가 변경될 때 호출

  const scrollToBottomWithAnimation = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth' // 부드러운 스크롤 애니메이션
      })
    }
  }

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className={cn('pb-[250px] pt-4 md:pt-10', className)}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList chatId={activeButton} messages={messages} />
        ) : (
          <EmptyScreen />
        )}
        <div className="w-full h-px" ref={visibilityRef} />
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
