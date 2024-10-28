'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { flushSync } from 'react-dom';

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
import { TokenInquiry } from './token-inquiry'
import { SendingMessage } from './sending-message'
import { ImageGenerator } from './image-generator'
import { ImageEnhance } from './image-enhance'

import { PhoneNumberRecordAtOnce } from './phone-number-record-at-once'
import { PhoneNumberDisplay } from './phone-number-display'

import { MessageSaver } from './message-saver'
import { ImageSaver } from './image-saver'

import MessageImageHistory, { getHistoryItem } from './message-image-history'
import {deductTokens} from './token-dedution'


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
  const [currentMode, setCurrentMode] = React.useState<'normal' | 'phone' | 'phone-name' | 'phone-group' | 'text' | 'history' | 'tokenInquiry' | 'send-message' | 'image-select' | 'image-action' | 'image-enhance-action'| 'bulk-save'|'phone-group-input'|'send-message-recipient'| 'send-message-group'|'text-action'|'image-enhancing-action'| 'history-action' >('normal')
  const [selectedImage, setSelectedImage] = React.useState('');
  const [phoneData, setPhoneData] = React.useState<PhoneNumberData>({ name: '', phoneNumber: '', groupName: 'default' })
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  type Action = 'text-image-select' | 'text-action-save' | 'text-action-generate' | 'send-message' | 'image-edit' | 'image-enhance' | 'image-save'
  const [message, setMessage] = React.useState('')
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
    { message: "히스토리 조회", response: "히스토리를 조회합니다.", mode: 'history' },
    { message: "토큰 조회", response: "토큰 정보를 조회합니다.", mode: 'tokenInquiry' },
    { message: "메시지 전송", response: "한명 혹은 단체로 전달하신건가요?", mode: 'send-message' }
  ]

  const validatePhoneNumber = (value: string) => {
    return /^\d{11}$/.test(value);
  }
  // 전화번호 검사1
  const validateName = (value: string) => {
    return /^[a-zA-Z가-힣\s]+$/.test(value);
  }
  // 전화번호 검사2
  const validateGroupResponse = (value: string) => {
    return ['예', '아니오'].includes(value);
  }
  // 전화번호 검사3
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const { phoneNumbers, errors } = PhoneNumberRecordAtOnce(content)
        if (errors.length > 0) {
          setMessages(currentMessages => [
            ...currentMessages,
            {
              id: nanoid(),
              display: (
                <div>
                  <p>파일 처리 중 오류가 발생했습니다:</p>
                  <ul>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                  <p>오류를 수정한 후 다시 시도해주세요.</p>
                </div>
              )
            }
          ])
        } else {
          setMessages(currentMessages => [
            ...currentMessages,
            {
              id: nanoid(),
              display: <PhoneNumberDisplay phoneNumbers={phoneNumbers} />
            }
          ])
        }
        setCurrentMode('normal')
      }
      reader.readAsText(file)
    }
    if (event.target) {
      event.target.value = ''
    }
  }
  //전화번호 저장 파일 업로드 기능.

  const handlePredefinedMessage = async (message: string, response: string, mode: 'normal' | 'phone' | 'text' | 'history' | 'tokenInquiry' | 'send-message') => {
    if (mode === 'tokenInquiry') {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{message}</UserMessage>
        },
        {
          id: nanoid(),
          display: response
        },
        {
          id: nanoid(),
          display: <div><TokenInquiry /></div>
        }
      ]);
      setCurrentMode('normal')
    }else if (mode === 'history') {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{message}</UserMessage>
        },
        {
          id: nanoid(),
          display: response
        },
        {
          id: nanoid(),
          display: <MessageImageHistory id={-1} /> // -1을 사용하여 모든 데이터를 표시
        },
        {
          id: nanoid(),
          display: "조회할 고유번호를 입력하세요."
        }
      ])
      setCurrentMode('history-action')
    }
    else{
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
  }
  //버튼 누르면 고정답변 해주고 모드 변경.

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

  const handleGroupNameResponse = (value: string) => {
    if (value.toLowerCase() === '예') {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>
        },
        {
          id: nanoid(),
          display: "그룹명을 입력해주세요."
        }
      ])
      setCurrentMode('phone-group-input')
    } else if (value.toLowerCase() === '아니오') {
      const newPhoneData = { ...phoneData, groupName: 'default' }
      setSamplePhoneNumbers(prev => [...prev, newPhoneData])
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>
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
    } else {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>
        },
        {
          id: nanoid(),
          display: "잘못된 입력입니다. '예' 또는 '아니오'로 답해주세요."
        }
      ])
    }
  }
  //그룹명 입력 여부 컴포넌트 예-> 추가적으로 입력

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
  const [tokenCheck, setTokenCheck] = React.useState(true)
  const handleResultChange = async (result: boolean) => {
    flushSync(() => {
    setTokenCheck(result)
    console.log(result)
    });
  }

  const handleImageGeneration = () => {
    setMessages(currentMessages => [
      ...currentMessages,
      //추가
      {
        id: nanoid(),
        display: <ImageGenerator createdMessage={lastCreatedMessage} />
      },
      {
        id: nanoid(),
        display: "0, 1, 2, 3, 4번 중 하나를 선택해주세요. (0: 이미지 재생성)"
      }
    ])
    setCurrentMode('image-select')
  }
  //이미지 4장 생성 기능.

  const handleImageAction = () => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "이미지 편집, 이미지 보강, 종료 중에 하나를 입력하세요."
      }
    ])
    const imageUrl = `/sampleImage${selectedImage}.jpg`
    setCurrentImageUrl(imageUrl)
    setCurrentMode('image-action')
  }
  //이미지 선택 후 이미지 편집, 보강, 종료 선택 기능.

  const [enhancedImg, setEnhancedImg] = React.useState('')
  const handleImageEnhance = () => {
    setEnhancedImg(`/sampleImage${selectedImage}.jpg`)
    handleDeductTokens()
    setMessages(currentMessages => [
      ...currentMessages,
      //추가
      {
        id: nanoid(),
        display: <ImageEnhance imageId={selectedImage} />
      },
      {
        id: nanoid(),
        display: "변경된 이미지를 저장하시겠습니까? (예/아니오)"
      }
    ])
    setCurrentMode('image-enhancing-action')
  }
  //이미지 보강 기능

  const [messageRecipient, setMessageRecipient] = React.useState<string>('')
  const handleSendMessage = (input: string) => {
    if (currentMode === 'send-message') {
      if (input.toLowerCase() === '한명' || input.toLowerCase() === '단체') {
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{input}</UserMessage>
          },
          {
            id: nanoid(),
            display: input.toLowerCase() === '한명' ? "전화번호 혹은 이름을 입력해 주세요." : "그룹명을 입력해 주세요."
          }
        ])
        setCurrentMode(input.toLowerCase() === '한명' ? 'send-message-recipient' : 'send-message-group')
      } else {
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{input}</UserMessage>
          },
          {
            id: nanoid(),
            display: "한명 혹은 단체로 입력해 주세요."
          }
        ])
      }
    } else if (currentMode === 'send-message-recipient' || currentMode === 'send-message-group') {
      setMessageRecipient(input)
      handleDeductTokens()
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{input}</UserMessage>
        },
        //추가
        
        {
          id: nanoid(),
          display: <SendingMessage 
            recipient={input} 
            isGroup={currentMode === 'send-message-group'}
            onAddPhoneNumber={(phoneNumber) => {
              setMessages(currentMessages => [
                ...currentMessages,
                {
                  id: nanoid(),
                  display: "새로운 전화번호를 추가합니다. 전화번호를 입력해주세요."
                }
              ])
              setMessageRecipient(phoneNumber)
              setCurrentMode('phone')
            }}
          />
        }
      ])
      setCurrentMode('normal')
    }
  }
  const handlePhone = (value: string) => {
    if (value === '단체저장') {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>
        },
        {
          id: nanoid(),
          display: "파일을 첨부해주세요."
        }
      ])
      setCurrentMode('bulk-save')
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    } else {
      // 기존의 전화번호 처리 로직
      if (!validatePhoneNumber(value)) {
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{value}</UserMessage>
          },
          {
            id: nanoid(),
            display: "올바른 이름 형식이 아닙니다. 11자리 숫자를 입력하세요."
          }
        ])
        return;
      }
      else{
        handlePhoneNumber(input);
      }
    
    }
  }
  const handlePhoneName = (value: string) =>{
    if (!validateName(value)) {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>
        },
        {
          id: nanoid(),
          display: "올바른 이름 형식이 아닙니다. 영어나 한글로 입력해주세요."
        }
      ])
      return;
    }
    handleName(value)
  }

  const handleReenterTopic = () => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "주제를 다시 입력해 주세요."
      }
    ])
    setCurrentMode('text')
  }
  //사용자에게 주제를 다시 입력하라는 메시지를 표시하고 `currentMode`를 'text'로 설정합니다.
  const handleRegenerateMessage = () => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserTextMessage 
          message={lastTextInput} 
          onReenterTopic={handleReenterTopic}
          onRegenerateMessage={handleRegenerateMessage}
          onCreatedMessage={setLastCreatedMessage}
        />
      },
      {
        id: nanoid(),
        display: "이미지 생성을 원하시면 '이미지 생성'을 입력해주세요. 혹은 '메시지 저장'을 입력해 주세요."
      }
    ])
    setCurrentMode('text-action')
  }
  //마지막으로 입력한 텍스트로 `UserTextMessage` 컴포넌트를 다시 생성합니다.
  
  const [saveNum, setSaveNum] = React.useState(0)
  const [lastTextInput, setLastTextInput] = React.useState('')
  const [lastCreatedMessage, setLastCreatedMessage] = React.useState('')
  const [currentImageUrl, setCurrentImageUrl] = React.useState('')
  const handleSaveMessageAndImage = () => {
    handleDeductTokens()
    //이거 두번 결제 추가 구현해야됨.
    setMessages(currentMessages => [
      ...currentMessages,
      
      {
        id: nanoid(),
        display: <MessageSaver message={{ userInput: lastTextInput, createdMessage: lastCreatedMessage }} saveNum={saveNum} />
      },
      {
        id: nanoid(),
        display: <ImageSaver imageUrl={currentImageUrl} saveNum={saveNum} />
      },
      {
        id: nanoid(),
        display: `메시지와 이미지가 저장되었습니다 (저장 번호: ${saveNum}). 새로운 대화를 시작하려면 아무 메시지나 입력해주세요.`
      }
    ])
    setSaveNum(prevSaveNum => prevSaveNum + 1)
    setCurrentMode('normal')
  }
  //`MessageSaver` 컴포넌트를 사용해 `lastTextInput`과 `lastCreatedMessage`를 저장합니다.
  //`ImageSaver` 컴포넌트를 사용해 `currentImageUrl`을 저장합니다.

  const handleImageEdit = () => {
    handleDeductTokens()
    setMessages(currentMessages => [
      ...currentMessages,
      //추가 2번
    ])
    if (currentImageUrl) {
      router.push(`/edit/${encodeURIComponent(selectedImage)}`)
    } else {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: "편집할 이미지가 없습니다. 먼저 이미지를 선택해주세요."
        }
      ])
    }
  }
  //이미지 편집 툴 이동 컴포넌트.
  const handleDeductTokens = async () => {
    const result = await deductTokens()
    if (result) {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: '토큰이 성공적으로 차감되었습니다.'
        }
      ])
    } else {
      setMessages(currentMessages => [
        ...currentMessages,
        //추가
        {
          id: nanoid(),
          display: '토큰이 부족합니다.'
        }
      ]
      )
      setCurrentMode('normal')
    }
  }
  //남은 토큰 확인 기능.

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
              handlePhone(value)
            } else if (currentMode === 'phone-name') {
              handlePhoneName(value)
            } else if (currentMode === 'phone-group') {
              handleGroupNameResponse(value)
            } else if (currentMode === 'phone-group-input') {
              handleGroupName(value)
            } else if (currentMode === 'text') {
              setLastTextInput(value)
              handleDeductTokens()
              setMessages(currentMessages => [
                ...currentMessages,
                {
                  id: nanoid(),
                  display: <UserMessage>{value}</UserMessage>
                },
                {
                  id: nanoid(),
                  display: <UserTextMessage 
                    message={value} 
                    onReenterTopic={handleReenterTopic}
                    onRegenerateMessage={handleRegenerateMessage}
                    onCreatedMessage={setLastCreatedMessage}
                  />
                },
                {
                  id: nanoid(),
                  display: "이미지 생성을 원하시면 '이미지 생성'을 입력해주세요. 혹은 '메시지 저장'을 입력해 주세요."
                }
              ])
              setCurrentMode('text-action')
            } else if (currentMode === 'text-action') {
              if (value.toLowerCase() === '이미지 생성') {
                handleImageGeneration()
              } else if (value.toLowerCase() === '메시지 저장') {
                handleDeductTokens()
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{value}</UserMessage>
                  },
                  {
                    id: nanoid(),
                    display: <MessageSaver message={{ userInput: lastTextInput, createdMessage: lastCreatedMessage }} saveNum={saveNum} />
                  },
                  {
                    id: nanoid(),
                    display: `메시지가 저장되었습니다 (저장 번호: ${saveNum}).`
                  }
                ])
                setSaveNum(prevSaveNum => prevSaveNum + 1)
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
                    display: "잘못된 입력입니다. '이미지 생성' 또는 '메시지 저장'을 입력해주세요."
                  }
                ])
              }
            } else if (currentMode === 'send-message' || currentMode === 'send-message-recipient' || currentMode === 'send-message-group') {
              handleSendMessage(value);
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
                    display: <ImageGenerator selectedImage={value}/>
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
                handleImageEdit()
              } else if (value === '이미지 보강') {
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{value}</UserMessage>
                  }
                ])
                handleImageEnhance()
              } else if (value.toLowerCase() === '종료') {
                const imageUrl = `/sampleImage${selectedImage}.jpg`
                setCurrentImageUrl(imageUrl)
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{value}</UserMessage>
                  }
                ])
                handleSaveMessageAndImage()
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
            } else if (currentMode === 'image-enhancing-action') {
              if (value.toLowerCase() === '예') {
                setCurrentImageUrl(enhancedImg)
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{value}</UserMessage>
                  },
                  {
                    id: nanoid(),
                    display: "향상된 이미지가 저장되었습니다."
                  },
                  {
                    id: nanoid(),
                    display: "이미지 편집, 종료 중에 하나를 입력하세요."
                  }
                ])
                setCurrentMode('image-enhance-action')
              } else if (value.toLowerCase() === '아니오') {
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{value}</UserMessage>
                  },
                  {
                    id: nanoid(),
                    display: "이미지가 저장되지 않았습니다."
                  },
                  {
                    id: nanoid(),
                    display: "이미지 편집, 종료 중에 하나를 입력하세요."
                  }
                ])
                setCurrentMode('image-enhance-action')
              } else {
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{value}</UserMessage>
                  },
                  {
                    id: nanoid(),
                    display: "잘못된 입력입니다. '예' 또는 '아니오'로 답해주세요."
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
                handleImageEdit()
              } else if (value.toLowerCase() === '종료') {
                const imageUrl = `/sampleImage${selectedImage}.jpg`
                setCurrentImageUrl(imageUrl)
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{value}</UserMessage>
                  }
                ])
                handleSaveMessageAndImage()
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
            } else if (currentMode === 'history') {
              setMessages(currentMessages => [
                ...currentMessages,
                {
                  id: nanoid(),
                  display: <MessageImageHistory id={-1} /> // -1을 사용하여 모든 데이터를 표시
                },
                {
                  id: nanoid(),
                  display: "조회할 고유번호를 입력하세요."
                }
              ])
              setCurrentMode('history-action')
            } else if (currentMode === 'history-action') {
              const historyId = Number(value);
              const historyItem = getHistoryItem(historyId);
              if (historyItem) {
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{value}</UserMessage>
                  },
                  {
                    id: nanoid(),
                    display: <MessageImageHistory id={historyId} />
                  },
                  {
                    id: nanoid(),
                    display: "이미지와 문자를 불러왔습니다."
                  }
                ]);
                setCurrentMode('normal');
              } else {
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{value}</UserMessage>
                  },
                  {
                    id: nanoid(),
                    display: "해당 고유번호의 데이터를 찾을 수 없습니다."
                  }
                ]);
              }
            } else if (currentMode === 'tokenInquiry') {
              setMessages(currentMessages => [
                ...currentMessages,
              ]);
              setCurrentMode('normal')
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
        <div className="flex justify-center space-x-2 mt-2 mb-8">
          {predefinedMessages.map((msg, index) => (
              <Button
                  key={index}
                  onClick={() => handlePredefinedMessage(msg.message, msg.response, msg.mode as 'normal' | 'phone' | 'text' | 'history' | 'tokenInquiry' | 'send-message')}
                  variant="outline"
                  size="sm"
              >
                {msg.message}
              </Button>
          ))}
        </div>
        <div
            className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
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
                <IconPlus/>
                <span className="sr-only">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>

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
          />
          <div className="absolute right-0 top-[13px] sm:right-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" disabled={input === ''}>
                  <IconArrowElbow/>
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
          
        </div>
        <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept=".txt"
        aria-label="Upload a text file"
      />
      </form>
  )
}