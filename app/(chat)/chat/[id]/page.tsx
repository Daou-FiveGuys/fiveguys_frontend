import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'

export interface ChatPageProps {
  params: Promise<{ id: string }>
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const session = await auth()

  if (!session?.user || session?.user?.id === undefined) {
    return {}
  }

  const chat = await getChat(id, session.user.id)

  if (!chat || 'error' in chat) {
    return {
      title: 'Chat'
    }
  } else {
    return {
      title: chat?.title.toString().slice(0, 50) ?? 'Chat'
    }
  }
}

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  if (!session?.user) {
    redirect(`/login?next=/chat/${id}`)
  }

  const userId = session.user.id as string
  const chat = await getChat(id, userId)

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