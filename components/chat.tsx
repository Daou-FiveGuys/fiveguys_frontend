'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState, useActions } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TokenInfo } from '@/components/token-info'
import { nanoid } from 'nanoid'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useUIState()
  const [aiState] = useAIState()
  const { submitUserMessage } = useActions()

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()


  return (
    <div className="flex items-center justify-center m-auto">
      <div className="w-[33vw] h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gray-700 text-gray-100 p-4 text-center font-bold text-xl">
          챗봇AI
        </div>

        {/* Chat area */}
        <div 
          className={cn('flex-1 bg-gray-800 text-gray-100 overflow-y-auto scrollbar-hide', className)}
          ref={scrollRef}
        >
          <div ref={messagesRef} style={{margin:'30px'}} className="p-5 space-y-2">
            {messages.length ? (
              <ChatList messages={messages} isShared={false} session={session} />
            ) : (
              <EmptyScreen />
            )}
            <div className="w-full h-px" ref={visibilityRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="bg-gray-600 p-1">
          <ChatPanel
            id={id}
            input={input}
            setInput={setInput}
            isAtBottom={isAtBottom}
            scrollToBottom={scrollToBottom}
          />
        </div>
      </div>
    </div>
  )
}