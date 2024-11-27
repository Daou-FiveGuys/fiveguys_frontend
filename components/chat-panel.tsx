import * as React from 'react'

import { ButtonType, PromptForm } from '@/components/prompt-form'
import { FooterText } from '@/components/footer'
import { Dispatch, SetStateAction } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import SkipButton from './chat/utils/skip-button'
import PapagoPopup from './papago/papago-pop-up'

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: Dispatch<SetStateAction<string>>
  isAtBottom: boolean
  scrollToBottom: () => void
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}

export function ChatPanel({
  input,
  setInput,
  scrollToBottom,
  activeButton,
  setActiveButton
}: ChatPanelProps) {
  const chatState = useSelector((state: RootState) => state.chat)
  const messages =
    activeButton === 'create-message' ||
    activeButton === 'create-image-prompt' ||
    activeButton === 'image-generate' ||
    activeButton === 'select-image' ||
    activeButton === 'select-image-options'
      ? [
          ...(chatState['create-message']?.messages || []),
          ...(chatState['create-image-prompt']?.messages || []),
          ...(chatState['image-generate']?.messages || [])
        ]
      : chatState[activeButton]?.messages || []
  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex flex-col items-center relative">
          {/* 상단 버튼 그룹: SkipButton 중앙, PapagoPopup 오른쪽 */}
          <div className="w-full flex justify-center items-center mb-4">
            {[
              'create-message',
              'create-image-prompt',
              'image-generate',
              'select-image',
              'select-image-options'
            ].includes(activeButton) && (
              <SkipButton
                messages={messages}
                activeButton={activeButton}
                chatState={chatState}
              />
            )}

            {/* PapagoPopup을 부모 컨테이너의 오른쪽 끝에 배치 */}
            {(activeButton === 'create-message' ||
              activeButton === 'create-image-prompt') && (
              <div className="absolute right-4">
                <PapagoPopup activeButton={activeButton} />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            input={input}
            setInput={setInput}
            activeButton={activeButton}
            setActiveButton={setActiveButton}
          />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
