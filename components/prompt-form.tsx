'use client'

import * as React from 'react'
import { Dispatch, KeyboardEvent, SetStateAction } from 'react'
import Textarea from 'react-textarea-autosize'
import { flushSync } from 'react-dom'

import { useDispatch, useSelector } from 'react-redux'
import {
  addMessage,
  clearMessages,
  editMessage,
  UserType
} from '@/redux/slices/chatSlice'

import { BotCard, UserMessage } from './stocks/message'
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
import { SavePhoneNumber, comparePhoneNumber } from './save-phone-number'
import { UserTextMessage } from './user-text-message'
import { TokenInquiry } from './token-inquiry'
import { SendingMessage } from './sending-message'
import {
  ImageGenerator,
  returnSelectedImage,
  showExistingImages
} from './image-generator'

import {
  SendPhoneNumberData,
  validatePhoneNumberFile
} from './phone-number-record-at-once'

import { MessageSaver } from './message-saver'
import { ImageSaver } from './image-saver'

import MessageImageHistory, {
  getHistoryImage,
  getHistoryItem,
  getHistoryMessage
} from './message-image-history'
import { deductTokens } from './token-dedution'
import { useNumberManager } from './number-manager'
import { useNumberLoad } from './number-load'
import { ButtonCommand } from '@/components/button-command'
import { api } from '@/app/faq_chatbot/faq_service'
import { RootState } from '@/redux/store'
import { useActions } from 'ai/rsc'
import ReactDOMServer from 'react-dom/server'
import { ChatMessage } from './chat-message'

interface PhoneNumberData {
  name: string
  phoneNumber: string
  groupName: string
}

export const reactNodeToString = (node: React.ReactNode): string => {
  return ReactDOMServer.renderToString(node)
}

export function PromptForm({
  input,
  setInput,
  scrollToBottom
}: {
  input: string
  setInput: Dispatch<SetStateAction<string>>
  scrollToBottom?: () => void
}): JSX.Element {
  const dispatch = useDispatch()
  const messages = useSelector((state: RootState) => state.chat)
  const handleMS = (result: boolean) => setMessagSuccess(result)
  const [messageSuccess, setMessagSuccess] = React.useState(false)
  const { submitUserMessage } = useActions()

  const addMessageToChatSlice = (
    userType: UserType,
    display: React.ReactNode
  ) => {
    const content = reactNodeToString(display)
    const id = nanoid()
    dispatch(
      addMessage({
        id: id,
        display: content,
        userType: userType
      })
    )
    return id
  }

  const router = useRouter()

  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const [currentMode, setCurrentMode] = React.useState<
    | 'phone-group-noninput'
    | 'image-reselect'
    | 'text-create-action'
    | 'normal'
    | 'phone'
    | 'phone-name'
    | 'phone-group'
    | 'text'
    | 'history'
    | 'tokenInquiry'
    | 'send-message'
    | 'image-select'
    | 'image-action'
    | 'bulk-save'
    | 'phone-group-input'
    | 'send-message-recipient'
    | 'send-message-group'
    | 'text-action'
    | 'history-action'
    | 'normal'
    | 'send-message-text'
    | 'send-message-promft'
    | 'send-message-generate'
    | 'send-message-select'
    | 'send-message'
    | 'return'
    | 'faq'
  >('normal')
  const [selectedImage, setSelectedImage] = React.useState('')
  const [phoneData, setPhoneData] = React.useState<PhoneNumberData>({
    name: '',
    phoneNumber: '',
    groupName: 'default'
  })

  const [subMode, setSubMode] = React.useState<
    | 'text-create-action'
    | 'normal'
    | 'text'
    | 'image-select'
    | 'image-reselect'
    | 'image-action'
    | 'text-action'
    | 'faq'
  >('normal')

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  type Action =
    | 'text-image-select'
    | 'text-action-save'
    | 'text-action-generate'
    | 'send-message'
    | 'image-edit'
    | 'image-save'
  const { getNextNumber } = useNumberManager()
  const [selectedSeed, setSelectedSeed] = React.useState('')
  const handleGetNumber = () => {
    const newNumber = getNextNumber()
    setSaveNum(newNumber)
  }

  // Enter - Focusing - Text Area
  React.useEffect(() => {
    const handleKeyDownFocus = (event: Event) => {
      if ((event as unknown as KeyboardEvent).key === 'Enter') {
        // Enter to focusing textArea
        if (document.activeElement !== inputRef.current) {
          event.preventDefault()
          if (inputRef.current) {
            inputRef.current.focus()
          }
        } else {
          event.preventDefault() // now focusing, skippp
        }
      }
    }

    // global event
    window.addEventListener('keydown', handleKeyDownFocus)

    // unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDownFocus)
    }
  }, [])

  React.useEffect(() => {
    // 컴포넌트 마운트 시 즉시 번호를 받아옵니다.
    const initialNumber = getNextNumber()
    setSaveNum(initialNumber)
  }, []) // 빈 배열을 넣어 마운트 시에만 실행되도록 합니다.

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
    const data = loadSampleData()
    setSamplePhoneNumbers(data)
    console.log(data)
  }, [])

  interface PhoneData {
    name: string
    phoneNumber: string
    groupName: string
  }
  const [samplePhoneNumbers, setSamplePhoneNumbers] = React.useState<
    PhoneNumberData[]
  >([{ name: '', phoneNumber: '', groupName: 'default' }])
  const { loadSampleData } = useNumberLoad()
  const [error, setError] = React.useState<string | null>(null)

  const predefinedMessages = [
    {
      message: '전화번호 저장',
      response: '전화번호를 입력해주세요.',
      mode: 'phone'
    },
    {
      message: '문자 생성',
      response: '어떤 내용의 문자를 생성할까요?',
      mode: 'text'
    },
    {
      message: '히스토리 조회',
      response: '히스토리를 조회합니다.',
      mode: 'history'
    },
    {
      message: '토큰 조회',
      response: '토큰 정보를 조회합니다.',
      mode: 'tokenInquiry'
    },
    {
      message: '메시지 전송',
      response: '한명 혹은 단체로 전달하신건가요?',
      mode: 'send-message'
    },
    {
      message: 'FaQ',
      response: '무엇이 궁금하신가요?',
      mode: 'faq'
    }
  ]

  const validatePhoneNumber = (value: string) => {
    return /^\d{11}$/.test(value)
  }
  // 전화번호 검사1
  const validateName = (value: string) => {
    return /^[a-zA-Z가-힣\s]+$/.test(value)
  }
  // 전화번호 검사2
  const validateGroupResponse = (value: string) => {
    return ['예', '아니오'].includes(value)
  }
  // 전화번호 검사3
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => {
            const result = e.target?.result as string
            resolve(result)
          }
          reader.onerror = () => {
            reject(new Error('파일을 읽는 중 오류가 발생했습니다.'))
          }
          reader.readAsText(file)
        })

        const result = await validatePhoneNumberFile(content) // Promise를 기다림
        addMessageToChatSlice(
          '챗봇',
          result.isValid ? (
            <SendPhoneNumberData content={content} />
          ) : (
            <div>{result.errors.join(', ')}</div> // 오류 메시지를 문자열로 변환
          )
        )
      } catch (error) {
        addMessageToChatSlice('챗봇', '파일을 처리하는 중 오류가 발생했습니다.')
      } finally {
        setCurrentMode('normal')
      }
    }

    if (event.target) {
      event.target.value = '' // 파일 입력 필드 초기화
    }
  }
  //전화번호 저장 파일 업로드 기능.

  const handlePredefinedMessage = async (
    message: string,
    response: string,
    mode:
      | 'normal'
      | 'phone'
      | 'text'
      | 'history'
      | 'tokenInquiry'
      | 'send-message'
      | 'faq'
      | 'normal'
      | 'send-message-text'
      | 'send-message-promft'
      | 'send-message-generate'
      | 'send-message-select'
      | 'send-message'
      | 'return'
      | 'faq'
  ) => {
    if (mode === 'tokenInquiry') {
      addMessageToChatSlice('사용자', <UserMessage>{message}</UserMessage>)
      addMessageToChatSlice('챗봇', <BotCard>response</BotCard>)
      addMessageToChatSlice('챗봇', <TokenInquiry />)

      setCurrentMode('normal')
    } else if (mode === 'history') {
      addMessageToChatSlice('사용자', <UserMessage>{message}</UserMessage>)
      addMessageToChatSlice('챗봇', <BotCard>{response}</BotCard>)
      addMessageToChatSlice('챗봇', <MessageImageHistory id={-1} />)
      addMessageToChatSlice(
        '챗봇',
        <BotCard>조회할 고유번호를 입력하세요.</BotCard>
      )
      setCurrentMode('history-action')
    } else if (mode === 'text') {
      addMessageToChatSlice('사용자', <UserMessage>{message}</UserMessage>)
      addMessageToChatSlice('챗봇', <BotCard>{response}</BotCard>)
      addMessageToChatSlice('챗봇', <BotCard>주제를 입력해주세요.</BotCard>)
      if (
        (currentMode === 'send-message' ||
          currentMode === 'send-message-recipient' ||
          currentMode === 'send-message-group') &&
        subMode === 'text'
      ) {
        setSubMode('normal')
        setCurrentMode('text')
      } else if (
        currentMode === 'send-message' ||
        currentMode === 'send-message-recipient' ||
        currentMode === 'send-message-group'
      ) {
        setSubMode('text')
      } else setCurrentMode('text')
    } else if (mode === 'send-message-text') {
      addMessageToChatSlice('사용자', <UserMessage>{message}</UserMessage>)
      addMessageToChatSlice(
        '챗봇',
        <BotCard>메시지 전송을 잠시 중단합니다. 주제를 입력해 주세요.</BotCard>
      )
      setSubMode('text')
    } else if (mode === 'send-message-promft') {
    } else if (mode === 'send-message-generate') {
    } else if (mode === 'send-message-select') {
    } else if (mode === 'return') {
      dispatch(clearMessages())
      setCurrentMode('normal')
      setSubMode('normal')
    } else if (mode === 'normal') {
      addMessageToChatSlice('사용자', <UserMessage>{message}</UserMessage>)
      addMessageToChatSlice('챗봇', <BotCard>{response}</BotCard>)
      setCurrentMode(mode)
    } else if (mode === 'faq') {
      setCurrentMode(mode)
      addMessageToChatSlice('사용자', <UserMessage>{message}</UserMessage>)
      addMessageToChatSlice('챗봇', <BotCard>무엇이 궁금하신가요?</BotCard>)
    }
  }
  //버튼 누르면 고정답변 해주고 모드 변경.
  //토큰 조회 기능 + 이미지, 홍보문자 내역 조회.

  const [tokenCheck, setTokenCheck] = React.useState(true)
  const [messageRecipient, setMessageRecipient] = React.useState<string>('')

  const handleSendMessage = (input: string) => {
    if (currentMode === 'send-message') {
      if (input.toLowerCase() === '한명' || input.toLowerCase() === '단체') {
        addMessageToChatSlice('사용자', <UserMessage>{input}</UserMessage>)
        addMessageToChatSlice(
          '챗봇',
          input.toLowerCase() === '한명' ? (
            <BotCard>
              <ButtonCommand
                setInput={setInput}
                command={'전화번호'}
                ref={inputRef}
              />{' '}
              혹은
              <ButtonCommand
                setInput={setInput}
                command={'이름'}
                ref={inputRef}
              />{' '}
              을 입력해 주세요.
            </BotCard>
          ) : (
            <BotCard>
              <ButtonCommand
                setInput={setInput}
                command={'그룹명'}
                ref={inputRef}
              />{' '}
              을 입력해 주세요.
            </BotCard>
          )
        )

        setCurrentMode(
          input.toLowerCase() === '한명'
            ? 'send-message-recipient'
            : 'send-message-group'
        )
      } else {
        addMessageToChatSlice('사용자', <UserMessage>{input}</UserMessage>)
        addMessageToChatSlice(
          '사용자',
          <BotCard>
            <ButtonCommand
              setInput={setInput}
              command={'한명'}
              ref={inputRef}
            />{' '}
            혹은{' '}
            <ButtonCommand
              setInput={setInput}
              command={'단체'}
              ref={inputRef}
            />
            로 입력해 주세요.
          </BotCard>
        )
      }
    } else if (
      currentMode === 'send-message-recipient' ||
      currentMode === 'send-message-group'
    ) {
      setMessageRecipient(input)

      addMessageToChatSlice('사용자', <UserMessage>{input}</UserMessage>)
      addMessageToChatSlice(
        '챗봇',
        <SendingMessage
          recipient={input}
          isGroup={currentMode === 'send-message-group'}
          lastCreatedMessage={lastCreatedMessage}
          currentImageUrl={currentImageUrl}
          onAddPhoneNumber={phoneNumber => {
            addMessageToChatSlice(
              '챗봇',
              <BotCard>
                새로운 전화번호를 추가합니다. 전화번호를 입력해주세요.
              </BotCard>
            )
            setMessageRecipient(phoneNumber)
            setCurrentMode('phone')
          }}
        />
      )
      setCurrentMode('normal')
    }
  }
  //메시지 전송 기능.

  const handlePhone = (value: string) => {
    if (value === '단체저장') {
      addMessageToChatSlice('사용자', <UserMessage>{input}</UserMessage>)
      addMessageToChatSlice('사용자', <BotCard>파일을 첨부해주세요.</BotCard>)
      setCurrentMode('bulk-save')
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    } else {
      // 기존의 전화번호 처리 로직
      if (!validatePhoneNumber(value)) {
        addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
        addMessageToChatSlice(
          '챗봇',
          <BotCard>
            올바른 이름 형식이 아닙니다. 11자리 숫자를 입력하세요.
          </BotCard>
        )
        return
      } else {
        handlePhoneNumber(input)
      }
    }
  }
  //전화번호 추가 기능 1: 전화번호 파일 추가(파일 업로드까지) + 전화번호 추가 기능(전번 입력까지).

  const handlePhoneNumber = (number: string) => {
    //const existingNumber = samplePhoneNumbers.find(item => item.phoneNumber === number)
    //if (existingNumber) {
    // setMessages(currentMessages => [
    //   ...currentMessages,
    //   {
    //     id: nanoid(),
    //     display: <UserMessage>{number}</UserMessage>
    //   },
    //   {
    //     id: nanoid(),
    //     display: <SavePhoneNumber phoneData={existingNumber} />
    //   },
    //   {
    //     id: nanoid(),
    //     display: "이미 존재하는 전화번호입니다."
    //   }
    // ])
    // setCurrentMode('normal')
    //} else {
    setPhoneData(prev => ({ ...prev, phoneNumber: number }))
    addMessageToChatSlice('사용자', <UserMessage>{number}</UserMessage>)
    addMessageToChatSlice('챗봇', <BotCard>이름을 입력해주세요.</BotCard>)

    setCurrentMode('phone-name')
    //}
  }
  //전화번호 추가 기능 2: 전화번호 존재 여부 확인.

  const handlePhoneName = (value: string) => {
    if (!validateName(value)) {
      addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
      addMessageToChatSlice(
        '챗봇',
        <BotCard>
          올바른 이름 형식이 아닙니다. 영어나 한글로 입력해주세요.
        </BotCard>
      )

      return
    }
    handleName(value)
  }
  //전화번호 추가 기능 3: 전화번호 추가 기능(문자입력).

  const handleName = (name: string) => {
    setPhoneData(prev => ({ ...prev, name }))
    addMessageToChatSlice('사용자', <UserMessage>{name}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        그룹명을 추가하시겠습니까? (
        <ButtonCommand setInput={setInput} command={'예'} ref={inputRef} />/
        <ButtonCommand setInput={setInput} command={'아니오'} ref={inputRef} />)
      </BotCard>
    )

    setCurrentMode('phone-group')
  }
  //전화번호 저장 기능 4: 문자입력 후 그룹명 지정 여부 확인

  const handleGroupNameResponse = (value: string) => {
    if (value.toLowerCase() === '예') {
      addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
      addMessageToChatSlice('챗봇', <BotCard>그룹명을 입력해주세요.</BotCard>)
      setCurrentMode('phone-group-input')
    } else if (value.toLowerCase() === '아니오') {
      // const newPhoneData = { ...phoneData, groupName: 'default' }
      // setSamplePhoneNumbers(prev => [...prev, newPhoneData])

      addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
      addMessageToChatSlice(
        '챗봇',
        <BotCard>그룹명을 정말로 미입력하시겠습니까?.</BotCard>
      )
      setCurrentMode('phone-group-noninput')
    } else {
      addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
      addMessageToChatSlice(
        '챗봇',
        <BotCard>
          잘못된 입력입니다.
          <ButtonCommand
            setInput={setInput}
            command={'예'}
            ref={inputRef}
          />{' '}
          또는
          <ButtonCommand
            setInput={setInput}
            command={'아니오'}
            ref={inputRef}
          />
          로 답해주세요.
        </BotCard>
      )
    }
  }
  //전화번호 저장 기능 5: 예 -> 추가 입력, 아니오-> default 그룹으로 저장 후 동작 종료

  const handleGroupName = (groupName: string) => {
    const newPhoneData = { ...phoneData, groupName }
    setSamplePhoneNumbers(prev => [...prev, newPhoneData])
    addMessageToChatSlice('사용자', <UserMessage>{groupName}</UserMessage>)
    addMessageToChatSlice('챗봇', <SavePhoneNumber phoneData={newPhoneData} />)
    setCurrentMode('normal')
  }
  //전화번호 추가 기능 6: 파일로 전화 번호 저장.
  const handleGroupNonName = () => {
    const newPhoneData = { ...phoneData, groupName: 'default' }
    setSamplePhoneNumbers(prev => [...prev, newPhoneData])

    addMessageToChatSlice('챗봇', <SavePhoneNumber phoneData={newPhoneData} />)
    setCurrentMode('normal')
  }

  const handleRegenerateMessage = () => {
    addMessageToChatSlice(
      '사용자',
      <UserTextMessage
        message={lastTextInput}
        onCreatedMessage={setLastCreatedMessage}
        onCommunicationStatus={handleMS}
      />
    )
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        <ButtonCommand setInput={setInput} command={'주제'} ref={inputRef} />
        ,
        <ButtonCommand setInput={setInput} command={'재요청'} ref={inputRef} />
        혹은
        <ButtonCommand
          setInput={setInput}
          command={'메시지 생성 완료'}
          ref={inputRef}
        />
        를 입력해주세요.
      </BotCard>
    )

    if (subMode === 'text-create-action') {
      setSubMode('text-create-action')
    } else setCurrentMode('text-create-action')
  }
  //문자 생성 기능 4: 문자 저장 후 이미지 생성 여부 확인

  const [saveNum, setSaveNum] = React.useState(-1)
  const [lastTextInput, setLastTextInput] = React.useState('')
  const [lastCreatedMessage, setLastCreatedMessage] = React.useState('')
  const [currentImageUrl, setCurrentImageUrl] = React.useState('')

  const [imgSuccess, setImgSuccess] = React.useState(false)
  const handleIS = (result: boolean) => setImgSuccess(result)
  const handleImageGeneration = () => {
    if (subMode === 'text-action' || subMode === 'image-action')
      setSubMode('image-select')
    else setCurrentMode('image-select')
    addMessageToChatSlice(
      '챗봇',
      <ImageGenerator
        createdMessage={lastCreatedMessage}
        onSuccess={handleIS}
        seed={selectedSeed}
      />
    )
    addMessageToChatSlice(
      '챗봇',
      <BotCard>1, 2, 3, 4번 중 하나를 선택해주세요.</BotCard>
    )
  }
  //이미지 생성 기능 1: 이미지 4장 생성 기능.

  const handleImageReSeed = (seed: string) => {
    console.log(selectedSeed)
    addMessageToChatSlice(
      '챗봇',
      <ImageGenerator
        createdMessage={lastCreatedMessage}
        seed={seed}
        onSuccess={handleIS}
      />
    )
    addMessageToChatSlice(
      '챗봇',
      <BotCard>1, 2, 3, 4번 중 하나를 선택해주세요.</BotCard>
    )
    setCurrentMode('image-select')
  }

  const handleImageAction = (value: string) => {
    dispatch(
      addMessage({
        id: nanoid(),
        userType: '챗봇',
        display: '재생성, 편집, 종료 중에 하나를 입력하세요.'
      })
    )
    if (subMode === 'image-select') setSubMode('image-action')
    else setCurrentMode('image-action')
  }
  //이미지 생성 기능 2: 이미지 선택 후 이미지 편집, 보강, 종료 선택 기능.

  const handleImageEdit = (value: string) => {
    //handleDeductTokens()
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <BotCard>이미지 편집 페이지로 이동합니다.</BotCard>
    )
    router.push(`/edit`)
  }
  //이미지 생성 기능 4: 이미지 편집 기능
  const handleSaveMessageAndImage = () => {
    addMessageToChatSlice(
      '챗봇',
      <MessageSaver
        message={{
          userInput: lastTextInput,
          createdMessage: lastCreatedMessage
        }}
        saveNum={saveNum}
      />
    )
    addMessageToChatSlice(
      '챗봇',
      <ImageSaver imageUrl={currentImageUrl} saveNum={saveNum} />
    )
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        `메시지와 이미지가 저장되었습니다 (저장 번호: ${saveNum}). 새로운 대화를
        시작하려면 아무 메시지나 입력해주세요.`
      </BotCard>
    )

    setSaveNum(prevSaveNum => prevSaveNum + 1)
    if (subMode !== 'normal') {
      addMessageToChatSlice(
        '챗봇',
        <BotCard>
          이미지 생성이 완료되었습니다. 메시지 전송으로 돌아갑니다.
        </BotCard>
      )
      setSubMode('normal')
    } else setCurrentMode('normal')
  }
  // 이미지 생성 기능 5: 이미지 생성 종료 후 이미지와 문자 저장.
  //`MessageSaver` 컴포넌트를 사용해 `lastTextInput`과 `lastCreatedMessage`를 저장합니다.
  //`ImageSaver` 컴포넌트를 사용해 `currentImageUrl`을 저장합니다.

  const handleCheckTokens = async () => {
    // const result = await deductTokens()
    const result = true
    return result
  }

  const handleSelectedImageSave = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <ImageGenerator selectedImage={value} onSuccess={handleIS} />
    )

    if (error == '') {
      addMessageToChatSlice(
        '챗봇',
        <BotCard>오류가 발생하여 종료합니다.</BotCard>
      )
    }
  }
  const stopImageCreate = (value: string) => {
    //const imageUrl = `/sampleImage${selectedImage}.jpg`
    //setCurrentImageUrl(imageUrl)
    // const selectImage = returnSeletedImage(value)
    // setSelectedImage(selectImage)
    // setCurrentImageUrl(selectImage)
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
  }
  const handleImageRegeneration = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice('챗봇', <BotCard>이미지를 재생성합니다.</BotCard>)

    handleImageGeneration()
  }
  const errorMessageAutoSave = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice('챗봇', <BotCard>토큰이 부족합니다.</BotCard>)

    // handleTextSave(value)
  }
  const handleHistory = () => {
    addMessageToChatSlice('사용자', <MessageImageHistory id={-1} />)
    addMessageToChatSlice(
      '챗봇',
      <BotCard>"조회할 고유번호를 입력하세요."</BotCard>
    )
    setCurrentMode('history-action')
  }
  // 채팅 내역 조회 1: 내역 보여준 후 고유번호 입력 받음.
  const handleHistoryFind = (value: string) => {
    const historyId = Number(value)
    const historyItem = getHistoryItem(historyId)
    if (historyItem) {
      const historyMsg = getHistoryMessage(historyItem)
      const histroyImg = getHistoryImage(historyItem)
      setLastCreatedMessage(historyMsg)
      setCurrentImageUrl(histroyImg)

      addMessageToChatSlice('사용자', <MessageImageHistory id={-1} />)
      addMessageToChatSlice(
        '챗봇',
        <ImageSaver imageUrl={histroyImg} saveNum={saveNum} />
      )
      addMessageToChatSlice(
        '챗봇',
        <MessageSaver
          message={{ userInput: '', createdMessage: historyMsg }}
          saveNum={saveNum}
        />
      )
      addMessageToChatSlice(
        '챗봇',
        <BotCard>이미지와 문자를 불러왔습니다.</BotCard>
      )

      setSaveNum(prevSaveNum => prevSaveNum + 1)
      setCurrentMode('normal')
    } else {
      addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
      addMessageToChatSlice(
        '사용자',
        <BotCard>해당 고유번호의 데이터를 찾을 수 없습니다.</BotCard>
      )
    }
  }
  // 채팅 내역 조회 2: 고유번호 입력 받아 그 데이터를 currentUrl과 lastMessage에 저장.
  const handleTextSave = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <MessageSaver
        message={{
          userInput: lastTextInput,
          createdMessage: lastCreatedMessage
        }}
        saveNum={saveNum}
      />
    )
    addMessageToChatSlice(
      '챗봇',
      <BotCard>`메시지가 저장되었습니다 (저장 번호: ${saveNum}).`</BotCard>
    )
    setSaveNum(prevSaveNum => prevSaveNum + 1)

    if (subMode === 'text-action') {
      addMessageToChatSlice(
        '챗봇',
        '메시지가 생성되었습니다. 메시지 전송으로 돌아갑니다.'
      )
      setSubMode('normal')
    } else setCurrentMode('normal')
  }

  const handleText = (value: string) => {
    setLastTextInput(value)

    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '사용자',
      <UserTextMessage
        message={value}
        onCreatedMessage={setLastCreatedMessage}
        onCommunicationStatus={handleMS}
      />
    )
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        텍스트 주제 재입력을 원하면
        <ButtonCommand setInput={setInput} command={'주제'} ref={inputRef} />
        , 텍스트 재생성을 원하면
        <ButtonCommand setInput={setInput} command={'재생성'} ref={inputRef} />
        을 입력해주세요. 혹은
        <ButtonCommand
          setInput={setInput}
          command={'메시지 생성 완료'}
          ref={inputRef}
        />
        를 입력해 주세요.
      </BotCard>
    )
    if (subMode === 'text') {
      setSubMode('text-create-action')
    } else setCurrentMode('text-create-action')
  }
  const [awaitingReselection, setAwaitingReselection] = React.useState(false)
  const requestReselection = () => {
    setAwaitingReselection(true)
  }
  React.useEffect(() => {
    if (awaitingReselection) {
      addMessageToChatSlice(
        '챗봇',
        <BotCard>
          <ButtonCommand setInput={setInput} command={'1'} ref={inputRef} />
          ,
          <ButtonCommand setInput={setInput} command={'2'} ref={inputRef} />
          ,
          <ButtonCommand setInput={setInput} command={'3'} ref={inputRef} />
          ,
          <ButtonCommand setInput={setInput} command={'4'} ref={inputRef} />, 중
          하나를 선택해주세요.
        </BotCard>
      )
    }
  }, [awaitingReselection])

  const handleReenterTopic = () => {
    addMessageToChatSlice('챗봇', <BotCard>주제를 다시 입력해 주세요.</BotCard>)
    if (subMode === 'text-create-action') setSubMode('text')
    else setCurrentMode('text')
  }
  //문자 재생성 기능
  const handleStopGenerateText = () => {
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        <ButtonCommand
          setInput={setInput}
          command={'이미지 생성'}
          ref={inputRef}
        />
        ,
        <ButtonCommand
          setInput={setInput}
          command={'이미지 불러오기'}
          ref={inputRef}
        />
        ,
        <ButtonCommand
          setInput={setInput}
          command={'메시지 저장'}
          ref={inputRef}
        />
        을 할 수 있습니다.
      </BotCard>
    )
    if (subMode === 'text-create-action') setSubMode('text-action')
    else setCurrentMode('text-action')
  }
  //문자 생성을 멈추고 이미지 생성, 메시지 저장 선택 단계로 넘어감.

  //
  //아래부터 예외 관련 함수
  const handleErrorText = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice('챗봇', <BotCard>토큰이 부족합니다.</BotCard>)
    handleErrorTextSave(value)
  }
  const handleErrorTextSave = (value: string) => {
    addMessageToChatSlice(
      '사용자',
      <MessageSaver
        message={{
          userInput: lastTextInput,
          createdMessage: lastCreatedMessage
        }}
        saveNum={saveNum}
      />
    )
    addMessageToChatSlice(
      '챗봇',
      <BotCard>메시지가 저장되었습니다 (저장 번호: ${saveNum}).</BotCard>
    )
    setSaveNum(prevSaveNum => prevSaveNum + 1)
    if (subMode !== 'normal') {
      setSubMode('normal')
    } else setCurrentMode('normal')
  }
  const handleErrorRegenerateText = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <BotCard>재생성할 토큰이 부족합니다.</BotCard>
    )
    handleErrorTextSave(value)
  }
  const handleErrorTextCreateAction = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        잘못된 입력입니다.
        <ButtonCommand setInput={setInput} command={'재생성'} ref={inputRef} />
        ,
        <ButtonCommand
          setInput={setInput}
          command={'주제'}
          ref={inputRef}
        />{' '}
        혹은
        <ButtonCommand
          setInput={setInput}
          command={'메시지 생성 완료'}
          ref={inputRef}
        />
        를 입력해주세요.
      </BotCard>
    )
  }
  const handleErrorGenerateImage = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice('챗봇', <BotCard>토큰이 부족합니다.</BotCard>)
    handleErrorTextSave(value)
  }
  const handleErrorTextAction = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        잘못된 입력입니다.
        <ButtonCommand
          setInput={setInput}
          command={'이미지 생성'}
          ref={inputRef}
        />{' '}
        또는
        <ButtonCommand
          setInput={setInput}
          command={'이미지 불러오기'}
          ref={inputRef}
        />{' '}
        또는
        <ButtonCommand
          setInput={setInput}
          command={'메시지 저장'}
          ref={inputRef}
        />{' '}
        를 입력해주세요.
      </BotCard>
    )
  }
  const handleErrorSendingMessage = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice('챗봇', <BotCard>토큰이 부족합니다.</BotCard>)
  }
  const handleErrorImageSelected = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        잘못된 선택입니다.
        <ButtonCommand setInput={setInput} command={'1'} ref={inputRef} />,
        <ButtonCommand setInput={setInput} command={'2'} ref={inputRef} />,
        <ButtonCommand setInput={setInput} command={'3'} ref={inputRef} />,
        <ButtonCommand setInput={setInput} command={'4'} ref={inputRef} />, 중
        하나를 선택해주세요.
      </BotCard>
    )
  }
  const handleErrorImageAction = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        잘못된 입력입니다.
        <ButtonCommand setInput={setInput} command={'편집'} ref={inputRef} />
        ,
        <ButtonCommand setInput={setInput} command={'재생성'} ref={inputRef} />
        ,
        <ButtonCommand
          setInput={setInput}
          command={'종료'}
          ref={inputRef}
        />{' '}
        중에 하나를 입력하세요.
      </BotCard>
    )
  }
  const handleErrorGenerateImageApi = (value: string) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice('챗봇', '이미지 생성하는 중에 오류가 발생했습니다.')
    handleErrorTextSave(value)
  }
  const handleErrorPhoneNumberCompare = (value: string, errors: string[]) => {
    addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
    addMessageToChatSlice(
      '챗봇',
      <BotCard>
        {Array.isArray(errors) ? (
          errors.map((err, index) => <div key={index}>{err}</div>)
        ) : (
          <div>{errors}</div> // errors가 문자열이라면 그대로 렌더링
        )}
      </BotCard>
    )
    setCurrentMode('normal')
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
          handlePhone(value)
        } else if (currentMode === 'phone-name') {
          handlePhoneName(value)
        } else if (currentMode === 'phone-group') {
          handleGroupNameResponse(value)
        } else if (currentMode === 'phone-group-input') {
          handleGroupName(value)
        } else if (currentMode === 'faq') {
          addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
          let display = (
            <BotCard>
              <span style={{ color: 'gray' }}>생각중</span>
            </BotCard>
          )
          let id = addMessageToChatSlice('챗봇', display)
          let dots = 0
          const interval = setInterval(() => {
            dots = (dots + 1) % 4 // Cycle through 0, 1, 2, 3
            const text = (
              <BotCard>
                <span style={{ color: 'gray' }}>생각중{'. '.repeat(dots)}</span>
              </BotCard>
            )
            dispatch(editMessage([id, reactNodeToString(text)]))
          }, 500)
          await api.faqChatbotAsk(value, (response: any) => {
            clearInterval(interval)
            dispatch(
              editMessage([
                id,
                reactNodeToString(<BotCard>{response?.data}</BotCard>)
              ])
            )
          })
          setCurrentMode('faq')
        } else if (currentMode === 'phone-group-noninput') {
          addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
          if (value == '예') {
            const newPhoneData = { ...phoneData, groupName: 'default' }
            const result = await comparePhoneNumber({ phoneData: newPhoneData })
            console.log(result.errors)
            if (result.isValid) {
              handleGroupNonName()
            } else {
              handleErrorPhoneNumberCompare(value, result.errors)
            }
          } else if (value == '아니오') {
            addMessageToChatSlice(
              '챗봇',
              '그룹명을 추가하시겠습니까? (예/아니오)'
            )
            setCurrentMode('phone-group')
          } else {
            //나중에...
          }
        } else if (currentMode === 'text') {
          const hasEnoughTokens = await handleCheckTokens()
          if (hasEnoughTokens) handleText(value)
          else handleErrorText(value)
        } else if (currentMode === 'text-create-action') {
          if (value.toLowerCase() === '재생성') {
            const hasEnoughTokens = await handleCheckTokens()
            if (hasEnoughTokens) handleRegenerateMessage()
            else handleErrorRegenerateText(value)
          } else if (value.toLowerCase() === '주제') {
            handleReenterTopic()
          } else if (value.toLowerCase() === '메시지 생성 완료') {
            handleStopGenerateText()
          } else {
            handleErrorTextCreateAction(value)
          }
        } else if (currentMode === 'text-action') {
          if (value.toLowerCase() === '이미지 생성') {
            const result = await showExistingImages()
            console.log(result)
            if (true) {
              const hasEnoughTokens = await handleCheckTokens()
              if (true) {
                handleImageGeneration()
              } else {
                handleErrorGenerateImage(value)
              }
            } else handleErrorGenerateImageApi(value)
          } else if (value.toLowerCase() === '이미지 불러오기')
            handleImageEdit(value)
          else if (value.toLowerCase() === '메시지 저장') handleTextSave(value)
          else handleErrorTextAction(value)
        } else if (currentMode === 'send-message') {
          if (subMode === 'normal') {
            const hasEnoughTokens = await handleCheckTokens()
            if (hasEnoughTokens) handleSendMessage(value)
            else handleErrorSendingMessage(value)
          } else if (subMode === 'text') {
            console.log('문자생성')
            const hasEnoughTokens = await handleCheckTokens()
            if (hasEnoughTokens) handleText(value)
            else handleErrorText(value)
          } else if (subMode === 'text-create-action') {
            if (value.toLowerCase() === '재생성') {
              console.log('재생성')
              const hasEnoughTokens = await handleCheckTokens()
              if (hasEnoughTokens) handleRegenerateMessage()
              else handleErrorRegenerateText(value)
            } else if (value.toLowerCase() === '주제') {
              console.log('주제')
              handleReenterTopic()
            } else if (value.toLowerCase() === '메시지 생성 완료') {
              console.log('메생완')
              handleStopGenerateText()
            } else {
              handleErrorTextCreateAction(value)
            }
          } else if (subMode === 'text-action') {
            if (value.toLowerCase() === '이미지 생성') {
              const result = await showExistingImages()
              console.log(result)
              if (true) {
                //되나볼려고
                const hasEnoughTokens = await handleCheckTokens()
                if (hasEnoughTokens) {
                  handleImageGeneration()
                } else {
                  handleErrorGenerateImage(value)
                }
              } else handleErrorGenerateImageApi(value)
            } else if (value.toLowerCase() === '이미지 불러오기') {
              handleImageEdit(value)
            } else if (value.toLowerCase() === '메시지 저장')
              handleTextSave(value)
            else handleErrorTextAction(value)
          } else if (subMode === 'image-select') {
            if (['1', '2', '3', '4'].includes(value)) {
              //const selectImage = returnSelectedImage(value)
              const selectImage = '1'
              setSelectedImage(selectImage)
              setCurrentImageUrl(selectImage)
              setSelectedSeed(value)
              handleSelectedImageSave(value)
              handleImageAction(value)
            } else handleErrorImageSelected(value)
          } else if (subMode === 'image-action') {
            if (value === '편집') {
              handleImageEdit(value)
            } else if (value.toLowerCase() === '재생성') {
              const hasEnoughTokens = await handleCheckTokens()
              if (hasEnoughTokens) {
                handleImageRegeneration(value)
              } else {
                handleErrorGenerateImage(value)
              }
            } else if (value.toLowerCase() === '종료')
              handleSaveMessageAndImage()
            else handleErrorImageAction(value)
          }
        } else if (
          currentMode === 'send-message-recipient' ||
          currentMode === 'send-message-group'
        ) {
          if (subMode === 'normal') {
            const hasEnoughTokens = await handleCheckTokens()
            if (hasEnoughTokens) handleSendMessage(value)
            else handleErrorSendingMessage(value)
          } else if (subMode === 'text') {
            console.log('문자생성')
            const hasEnoughTokens = await handleCheckTokens()
            if (hasEnoughTokens) handleText(value)
            else handleErrorText(value)
          } else if (subMode === 'text-create-action') {
            if (value.toLowerCase() === '재생성') {
              console.log('재생성')
              const hasEnoughTokens = await handleCheckTokens()
              if (hasEnoughTokens) handleRegenerateMessage()
              else handleErrorRegenerateText(value)
            } else if (value.toLowerCase() === '주제') {
              console.log('주제')
              handleReenterTopic()
            } else if (value.toLowerCase() === '메시지 생성 완료') {
              console.log('메생완')
              handleStopGenerateText()
            } else {
              handleErrorTextCreateAction(value)
            }
          } else if (subMode === 'text-action') {
            if (value.toLowerCase() === '이미지 생성') {
              const result = await showExistingImages()
              console.log(result)
              if (true) {
                //되나볼려고
                const hasEnoughTokens = await handleCheckTokens()
                if (hasEnoughTokens) {
                  handleImageGeneration()
                } else {
                  handleErrorGenerateImage(value)
                }
              } else handleErrorGenerateImageApi(value)
            } else if (value.toLowerCase() === '이미지 불러오기') {
              handleImageEdit(value)
            } else if (value.toLowerCase() === '메시지 저장')
              handleTextSave(value)
            else handleErrorTextAction(value)
          } else if (subMode === 'image-select') {
            if (['1', '2', '3', '4'].includes(value)) {
              //const selectImage = returnSelectedImage(value)
              const selectImage = '1'
              setSelectedImage(selectImage)
              setCurrentImageUrl(selectImage)
              setSelectedSeed(value)
              handleSelectedImageSave(value)
              handleImageAction(value)
            } else handleErrorImageSelected(value)
          } else if (subMode === 'image-action') {
            if (value === '편집') {
              handleImageEdit(value)
            } else if (value.toLowerCase() === '재생성') {
              const hasEnoughTokens = await handleCheckTokens()
              if (hasEnoughTokens) {
                handleImageRegeneration(value)
              } else {
                handleErrorGenerateImage(value)
              }
            } else if (value.toLowerCase() === '종료')
              handleSaveMessageAndImage()
            else handleErrorImageAction(value)
          }
        } else if (currentMode === 'image-select') {
          if (['1', '2', '3', '4'].includes(value)) {
            const selectImage = returnSelectedImage(value)
            setSelectedImage(selectImage)
            setCurrentImageUrl(selectImage)
            handleSelectedImageSave(value)
            setSelectedSeed(value)
            handleImageAction(value)
          } else handleErrorImageSelected(value)
        } else if (currentMode === 'image-action') {
          if (value === '편집') {
            handleImageEdit(value)
          } else if (value.toLowerCase() === '재생성') {
            const selectImage = returnSelectedImage(value)
            setSelectedImage(selectImage)
            setCurrentImageUrl(selectImage)
            handleSelectedImageSave(value)
            handleImageAction(value)
          } else if (value.toLowerCase() === '종료') handleSaveMessageAndImage()
          else handleErrorImageAction(value)
        } else if (currentMode === 'history') {
          handleHistory()
        } else if (currentMode === 'history-action') {
          handleHistoryFind(value)
        } else {
          addMessageToChatSlice('사용자', <UserMessage>{value}</UserMessage>)
          const responseMessage = await submitUserMessage(value)
          addMessageToChatSlice('챗봇', <BotCard>{responseMessage}</BotCard>)
        }
        scrollToBottom && scrollToBottom()
      }}
    >
      <div className="flex justify-center space-x-2 mt-2 mb-8">
        {currentMode !== 'send-message'
          ? predefinedMessages.map((msg, index) => (
              <Button
                key={index}
                onClick={() =>
                  handlePredefinedMessage(
                    msg.message,
                    msg.response,
                    msg.mode as
                      | 'normal'
                      | 'phone'
                      | 'text'
                      | 'history'
                      | 'tokenInquiry'
                      | 'send-message'
                  )
                }
                variant="outline"
                size="sm"
              >
                {msg.message}
              </Button>
            ))
          : predefinedMessages.map((msg, index) => (
              <Button
                key={index}
                onClick={() =>
                  handlePredefinedMessage(
                    msg.message,
                    msg.response,
                    msg.mode as
                      | 'normal'
                      | 'send-message-text'
                      | 'send-message-promft'
                      | 'send-message-generate'
                      | 'send-message-select'
                      | 'return'
                  )
                }
                variant="outline"
                size="sm"
              >
                {msg.message}
              </Button>
            ))}
      </div>
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
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
                <IconArrowElbow />
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
