'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { UserMessage } from './stocks/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { SavePhoneNumber } from './save-phone-number'
import { UserTextMessage } from './user-text-message'
import { ChatHistory } from './chat-history'
import { TokenInfo } from './token-info'
import { PhoneNumberRecord } from './phone-number-record'
import { ImageGenerator } from './image-generator'
import { ImageEnhance } from './image-enhance'

interface PhoneNumberData {
  name: string;
  phoneNumber: string;
  groupName: string;
}

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const [currentMode, setCurrentMode] = React.useState<'normal' | 'phone' | 'phone-name' | 'phone-group' | 'text' | 'history' | 'token' | 'send-message' | 'image-select' | 'image-action' | 'image-enhance-action'>('normal')
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [phoneData, setPhoneData] = React.useState<PhoneNumberData>({ name: '', phoneNumber: '', groupName: 'default' })

  // 샘플 전화번호 데이터
  const [samplePhoneNumbers, setSamplePhoneNumbers] = React.useState<PhoneNumberData[]>([
    { name: '홍길동', phoneNumber: '010-1234-5678', groupName: 'default' },
    { name: '김철수', phoneNumber: '010-9876-5432', groupName: '친구' },
  ])

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const predefinedMessages = [
    { message: "전화번호 저장", response: "전화번호를 입력해주세요.", mode: 'phone' },
    { message: "문자 생성", response: "어떤 내용의 문자를 생성할까요?", mode: 'text' },
    { message: "채팅 내역 조회", response: "채팅 내역을 조회합니다.", mode: 'history' },
    { message: "토큰 조회", response: "토큰 정보를 조회합니다.", mode: 'token' },
    { message: "메시지 전송", response: "전화번호를 입력하세요", mode: 'send-message' }
  ]

  const handlePredefinedMessage = async (message: string, response: string, mode: 'normal' | 'phone' | 'text' | 'history' | 'token' | 'send-message') => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{message}</UserMessage>
      },
      {
        id: nanoid(),
        display: response
      }
    ])
    setCurrentMode(mode)
  }

  const handlePhoneNumber = (number: string) => {
    const existingNumber = samplePhoneNumbers.find(item => item.phoneNumber === number)
    if (existingNumber) {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{number}</UserMessage>
        },
        {
          id: nanoid(),
          display: <SavePhoneNumber phoneData={existingNumber} />
        },
        {
          id: nanoid(),
          display: "이미 존재하는 전화번호입니다."
        }
      ])
      setCurrentMode('normal')
    } else {
      setPhoneData(prev => ({ ...prev, phoneNumber: number }))
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{number}</UserMessage>
        },
        {
          id: nanoid(),
          display: "이름을 입력해주세요."
        }
      ])
      setCurrentMode('phone-name')
    }
  }

  const handleName = (name: string) => {
    setPhoneData(prev => ({ ...prev, name }))
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{name}</UserMessage>
      },
      {
        id: nanoid(),
        display: "그룹명을 추가하시겠습니까? (예/아니오)"
      }
    ])
    setCurrentMode('phone-group')
  }

  const handleGroupNameResponse = (response: string) => {
    if (response.toLowerCase() === '예') {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{response}</UserMessage>
        },
        {
          id: nanoid(),
          display: "그룹명을 입력해주세요."
        }
      ])
    } else {
      const newPhoneData = { ...phoneData, groupName: 'default' }
      setSamplePhoneNumbers(prev => [...prev, newPhoneData])
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{response}</UserMessage>
        },
        {
          id: nanoid(),
          display: <SavePhoneNumber phoneData={newPhoneData} />
        },
        {
          id: nanoid(),
          display: "전화번호가 기본 그룹명으로 저장되었습니다."
        }
      ])
      setCurrentMode('normal')
    }
  }

  const handleGroupName = (groupName: string) => {
    const newPhoneData = { ...phoneData, groupName }
    setSamplePhoneNumbers(prev => [...prev, newPhoneData])
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{groupName}</UserMessage>
      },
      {
        id: nanoid(),
        display: <SavePhoneNumber phoneData={newPhoneData} />
      },
      {
        id: nanoid(),
        display: "전화번호가 저장되었습니다."
      }
    ])
    setCurrentMode('normal')
  }

  const handleSavePhoneNumber = (phoneNumber: string) => {
    setPhoneData(prev => ({ ...prev, phoneNumber }))
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "이름을 입력해주세요."
      }
    ])
    setCurrentMode('phone-name')
  }

  const handleImageGeneration = () => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <ImageGenerator />
      },
      {
        id: nanoid(),
        display: "0, 1, 2, 3, 4번 중 하나를 선택해주세요. (0: 이미지 재생성)"
      }
    ])
    setCurrentMode('image-select')
  }

  const handleImageAction = () => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "이미지 편집, 이미지 보강, 종료 중에 하나를 입력하세요."
      }
    ])
    setCurrentMode('image-action')
  }

  const handleImageEnhance = (imageId: string) => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <ImageEnhance imageId={imageId} />
      },
      {
        id: nanoid(),
        display: "이미지 편집, 종료 중에 입력하시오."
      }
    ])
    setCurrentMode('image-enhance-action')
  }

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()

        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        if (currentMode === 'phone') {
          handlePhoneNumber(value)
        } else if (currentMode === 'phone-name') {
          handleName(value)
        } else if (currentMode === 'phone-group') {
          if (value.toLowerCase() === '예' || value.toLowerCase() === '아니오') {
            handleGroupNameResponse(value)
          } else {
            handleGroupName(value)
          }
        } else if (currentMode === 'text') {
          setMessages(currentMessages => [
            ...currentMessages,
            {
              id: nanoid(),
              display: <UserMessage>{value}</UserMessage>
            },
            {
              id: nanoid(),
              display: <UserTextMessage message={value} onImageGeneration={handleImageGeneration} />
            }
          ])
          setCurrentMode('normal')
        } else if (currentMode === 'send-message') {
          setMessages(currentMessages => [
            ...currentMessages,
            {
              id: nanoid(),
              display: <UserMessage>{value}</UserMessage>
            },
            {
              id: nanoid(),
              display: <PhoneNumberRecord phoneNumber={value} onSavePhoneNumber={handleSavePhoneNumber} />
            }
          ])
          setCurrentMode('normal')
        } else if (currentMode === 'image-select') {
          if (value === '0') {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              },
              {
                id: nanoid(),
                display: "이미지를 재생성합니다."
              }
            ])
            handleImageGeneration()
          } else if (['1', '2', '3', '4'].includes(value)) {
            setSelectedImage(value)
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              },
              {
                id: nanoid(),
                display: <ImageGenerator selectedImage={value} />
              }
            ])
            handleImageAction()
          } else {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              },
              {
                id: nanoid(),
                display: "잘못된 선택입니다. 0, 1, 2, 3, 4 중 하나를 선택해주세요. (0: 이미지 재생성)"
              }
            ])
          }
        } else if (currentMode === 'image-action') {
          if (value === '이미지 편집') {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              },
              {
                id: nanoid(),
                display: "이미지 편집 페이지로 이동합니다."
              }
            ])
            router.push('/image-edit')
          } else if (value === '이미지 보강') {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              }
            ])
            handleImageEnhance(selectedImage!)
          } else if (value === '종료') {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              },
              {
                id: nanoid(),
                display: "이미지 생성이 종료되었습니다."
              }
            ])
            setCurrentMode('normal')
          } else {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              },
              {
                id: nanoid(),
                display: "잘못된 입력입니다. 이미지 편집, 이미지 보강, 종료 중에 하나를 입력하세요."
              }
            ])
          }
        } else if (currentMode === 'image-enhance-action') {
          if (value === '이미지 편집') {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              },
              {
                id: nanoid(),
                display: "이미지 편집 페이지로 이동합니다."
              }
            ])
            router.push('/image-edit')
          } else if (value === '종료') {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              },
              {
                id: nanoid(),
                display: "이미지 생성이 종료되었습니다."
              }
            ])
            setCurrentMode('normal')
          } else {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: nanoid(),
                display: <UserMessage>{value}</UserMessage>
              },
              {
                id: nanoid(),
                display: "잘못된 입력입니다. 이미지 편집, 종료 중에 입력하시오."
              }
            ])
          }
        } else {
          setMessages(currentMessages => [
            
            ...currentMessages,
            {
              id: nanoid(),
              display: <UserMessage>{value}</UserMessage>
            }
          ])

          const responseMessage = await submitUserMessage(value)
          setMessages(currentMessages => [...currentMessages, responseMessage])
        }
      }}
    >
      <div className="bg-gray-700 relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-4 size-8 rounded-full bg-background p-0 sm:left-4"
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
        <div className="flex justify-center space-x-2 mb-4 mt-8">
          {predefinedMessages.map((msg, index) => (
            <Button
              key={index}
              onClick={() => handlePredefinedMessage(msg.message, msg.response, msg.mode as 'normal' | 'phone' | 'text' | 'history' | 'token' | 'send-message')}
              variant="outline"
              size="sm"
            >
              {msg.message}
            </Button>
          ))}
        </div>
        <Textarea 
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{color:'black'}}
        />
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === ''}>
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}