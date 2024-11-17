import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'

export interface ChatPageProps {
  params: Promise<{
    id: string
  }>
}

// generateMetadata에서 params를 비동기적으로 처리
export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user || session.user === undefined || session.user.id === undefined) {
    return {}
  }

  const p = await params;  // Promise에서 실제 값 추출
  const chat = await getChat(p.id, session.user.id)

  if (!chat || 'error' in chat) {
    redirect('/')
  } else {
    return {
      title: chat?.title.toString().slice(0, 50) ?? 'Chat'
    }
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  const p = await params;  // Promise에서 실제 값 추출
  if (!session?.user) {
    redirect(`/login?next=/chat/${p.id}`)
  }

  const userId = session.user.id as string
  const chat = await getChat(p.id, userId)

  if (!chat || 'error' in chat) {
    redirect('/')
  } else {
    if (chat?.userId !== session?.user?.id) {
      notFound()
    }

    return (
      <AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
        <Chat
          id={chat.id}
          session={session}
          initialMessages={chat.messages}
          missingKeys={missingKeys}
        />
      </AI>
    )
  }
}
