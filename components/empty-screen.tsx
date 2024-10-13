import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          안녕하세요 Five Guys Chatbot에 오신 걸 환영합니다.
        </h1>
        <p className="leading-normal text-muted-foreground">
          여기서 당신 원하는 문자와 이미지를 생성할 수 있습니다!
        </p>
        <p className="leading-normal text-muted-foreground">
          또한,
          저장된 토큰과 전화번호, 채팅 내역을 조회할 수 있습니다.
          {/*<ExternalLink href="https://vercel.com/blog/ai-sdk-3-generative-ui">
            React Server Components
          </ExternalLink>{' '}*/}
        </p><p className="leading-normal text-muted-foreground">
          어서 시도해보세요!
        </p>
      </div>
    </div>
  )
}
