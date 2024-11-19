import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'

export interface ChatPageProps {
  // params를 Promise로 선언
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user || session.user === undefined || session.user.id === undefined) {
    return {}
  }

  // params는 Promise로 감쌌으므로 await 사용
  const p = await params
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

  // params를 Promise로 처리
  params
    .then(async (p) => {
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
    })
    .catch((error) => {
      console.error("Error processing params: ", error)
      redirect('/')
    })
    .finally(() => {
      console.log("Processing of params completed.")
    })

  // 기본적으로 return을 할 수 없으므로 비동기 처리가 끝날 때까지 기다린 후 처리해야 합니다.
  return <div>Loading...</div>
}
