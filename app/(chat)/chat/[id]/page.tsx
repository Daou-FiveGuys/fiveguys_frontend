import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'

// params를 Promise로 감싸지 않음, Next.js는 이미 동적으로 처리되므로
export interface ChatPageProps {
  params: {
    id: string;
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user || session.user === undefined || session.user.id === undefined) {
    return {}
  }

  const chat = await getChat(params.id, session.user.id)

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

  if (!session?.user) {
    redirect(`/login?next=/chat/${params.id}`)
  }

  const userId = session.user.id as string
  const chat = await getChat(params.id, userId)

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
