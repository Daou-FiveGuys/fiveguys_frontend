// PromptForm.tsx

'Use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import ChatUtils from './chat/utils/ChatUtils'
import { RootState } from '@/redux/store'
import FaqButton, { CustomButtonHandle } from './chat/faq'
import HistoryButton from './chat/history/history'
import SendMessageButton from './chat/send-message/send-message'
import CreateMessageButton from './chat/create-message/create-message'
import ImagePromptButton from './chat/image-prompt/image-prompt'

/**
 *
 * 🚨 되도록 ChatUtils class 를 사용하세요 🚨
 *
 * redux 사용법
 *
 * 전체 메시지 조회
 * const messages = useSelector((state : RootState) => state.chat)
 *
 * const dispatch = useDispatch()
 *
 * 전체 메시지 삭제
 * dispatch(
 *  clearMessages()
 * )
 *
 * 특정 메시지 삭제 => 되돌아가기 기능에서 활용
 * dispatch(
 *  deleteMessage(id)
 * )
 *
 * 특정 메시지 변경 => API 호출 지연 시 (생각중... 설정 후 응답 오면 변경)
 * dispatch(
 *  editMessage([id, ReactNode])
 * )
 *
 */

/**
 * 버튼 타입입니다 기본은 FAQ로 처음 사이트 로딩되면 FAQ 기능이 활성화 된다는 것을 뜻합니다.
 */
export type ButtonType =
  | 'faq' //------------------------ FAQ
  | 'history' //-------------------- 문자내역
  | 'usage' //---------------------- 사용량
  | 'send-message' //--------------- 문자 전송
  | 'return' //--------------------- ↑ 돌아가기
  | 'create-message' //------------- 문자 생성 or 입력 (수정 가능하도록)
  | 'create-image-prompt' //-------- 이미지 프롬프트 생성 (입력 또는 생성) : 여기서 이미지 생성할건지 먼저 물어봐주세요 이미지 생성 안하면 이미지 추가하는 할건지에 따라 분기
  | 'image-generate' //------------- 이미지 생성 : 이미지 생성하기 전에 image-option-modal에서 ImageOptionSlice(redux)에 값을 저장 시키고 값을 토대로 생성 요청
//---------------------------------- 여기서 선택까지 수행하고 이미지 편집으로 넘기든가 이미지 추가 안했으면 주소록 고르는 모달으로 넘겨주세요 flux랑 flux lora랑 생성하는 api 달라요

export function PromptForm({
  input,
  setInput,
  activeButton,
  setActiveButton
}: {
  input: string
  setInput: (value: string) => void
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}) {
  const dispatch = useDispatch()
  const router = useRouter()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const FaqButtonRef = React.useRef<CustomButtonHandle>(null)
  const HistoryButtonRef = React.useRef<CustomButtonHandle>(null)
  const CreateMessageButtonRef = React.useRef<CustomButtonHandle>(null)
  const SendMessageButtonRef = React.useRef<CustomButtonHandle>(null)
  const ImagePromptButtonRef = React.useRef<CustomButtonHandle>(null)


  const isTyping = useSelector(
    (state: RootState) => state.chat[activeButton]?.isTyping || false
  )

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
    ChatUtils.initialize(dispatch)
  }, [])

  const handleFormSubmit = (
    e: React.FormEvent | React.KeyboardEvent,
    value: string
  ) => {
    e.preventDefault()

    const trimmedValue = value.trim()
    if (!trimmedValue) return

    if (isTyping) {
      return
    }

    if (FaqButtonRef.current && activeButton === 'faq') {
      FaqButtonRef.current.handleEnterPress(trimmedValue)
    }
    if (HistoryButtonRef.current && activeButton === 'history') {
      HistoryButtonRef.current.handleEnterPress(trimmedValue)
    }
    if (CreateMessageButtonRef.current && activeButton === 'create-message') {
      CreateMessageButtonRef.current.handleEnterPress(trimmedValue)
    }
    if (SendMessageButtonRef.current && activeButton === 'send-message') {
      SendMessageButtonRef.current.handleEnterPress(trimmedValue)
    }
    if (ImagePromptButtonRef.current && activeButton === 'create-image-prompt') {
      ImagePromptButtonRef.current.handleEnterPress(trimmedValue)
    }
    

    setInput('')
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-2 px-4 md:px-8">

      <FaqButton
          ref={FaqButtonRef}
          buttonType="faq"
          activeButton={activeButton}
          setActiveButton={setActiveButton}
        />
        <HistoryButton
          ref={HistoryButtonRef}
          buttonType="history"
          activeButton={activeButton}
          setActiveButton={setActiveButton}
        />
        <SendMessageButton
          ref={SendMessageButtonRef}
          buttonType='send-message'
          activeButton={activeButton}
          setActiveButton={setActiveButton}
        />
      </div>
      <form>
        <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12 mt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
                onClick={() => {
                  router.push('/new')
                }}
              >
                <IconPlus />
                <span className="sr-only">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
          <Textarea
            ref={inputRef}
            tabIndex={0}
            placeholder={
              activeButton === 'history'
                ? '대화 기능을 사용할 수 없습니다'
                : 'Send a message.'
            }
            className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            name="message"
            rows={1}
            value={input}
            disabled={activeButton === 'history'}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              const nativeEvent = e.nativeEvent as KeyboardEvent
              if (e.key === 'Enter' && !nativeEvent.isComposing) {
                e.preventDefault()
                handleFormSubmit(e, input)
              }
            }}
          />
          <div className="absolute right-0 top-[13px] sm:right-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button" // 버튼 타입을 'button'으로 설정
                  size="icon"
                  disabled={input === '' || isTyping}
                  onClick={e => handleFormSubmit(e, input)} // onClick 이벤트로 변경
                >
                  <IconArrowElbow />
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </form>
    </>
  )
}
