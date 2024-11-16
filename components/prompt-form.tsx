'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { flushSync } from 'react-dom';
import ReactDOM from 'react-dom';

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
import { SavePhoneNumber, comparePhoneNumber } from './save-phone-number'
import { UserTextMessage } from './user-text-message'
import { ChatHistory } from './chat-history'
import { TokenInquiry } from './token-inquiry'
import { SendingMessage } from './sending-message'
import { ImageGenerator, returnSelectedImage, showExistingImages } from './image-generator'
import { ImageEnhance, ReturnEnhanceImage } from './image-enhance'

import { validatePhoneNumberFile, SendPhoneNumberData } from './phone-number-record-at-once'
import { PhoneNumberDisplay } from './phone-number-display'

import { MessageSaver } from './message-saver'
import { ImageSaver } from './image-saver'

import MessageImageHistory, { getHistoryItem, getHistoryMessage, getHistoryImage} from './message-image-history'
import {deductTokens} from './token-dedution'
import { useNumberManager } from './number-manager'
import { useNumberLoad } from './number-load'


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
  const [currentMode, setCurrentMode] = React.useState<'seed-select'|'phone-group-noninput'| 'text-create-action'|'image-Reselect'|'normal' | 'phone' | 'phone-name' | 'phone-group' | 'text' | 'history' | 'tokenInquiry' | 'send-message' | 'image-select' | 'image-action' | 'image-enhance-action'| 'bulk-save'|'phone-group-input'|'send-message-recipient'| 'send-message-group'|'text-action'|'image-enhancing-action'| 'history-action' >('normal')
  const [selectedImage, setSelectedImage] = React.useState('');
  const [phoneData, setPhoneData] = React.useState<PhoneNumberData>({ name: '', phoneNumber: '', groupName: 'default' })
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  type Action = 'text-image-select' | 'text-action-save' | 'text-action-generate' | 'send-message' | 'image-edit' | 'image-enhance' | 'image-save'
  const [message, setMessage] = React.useState('')
  const { getNextNumber } = useNumberManager()
  const [selectedSeed, setSelectedSeed] = React.useState('');
  const handleGetNumber = () => {
    const newNumber = getNextNumber()
    setSaveNum(newNumber)
  }
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
    name: string;
    phoneNumber: string;
    groupName: string;
  }
  const [samplePhoneNumbers, setSamplePhoneNumbers] = React.useState<PhoneNumberData[]>([{ name: '', phoneNumber: '', groupName: 'default' }])
  const { loadSampleData } = useNumberLoad()
  const [error, setError] = React.useState<string | null>(null)

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
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.onerror = () => {
            reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
          };
          reader.readAsText(file);
        });
  
        const result = await validatePhoneNumberFile(content); // Promise를 기다림
  
        if (result.isValid) {
          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: nanoid(),
              display: <SendPhoneNumberData content={content} />,
            },
          ]);
        } else {
          setMessages((currentMessages) => [
            ...currentMessages,
            ...result.errors.map(error => ({
              id: nanoid(),
              display: error,
            }))
          ]);
        }
      } catch (error) {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: nanoid(),
            display: "파일을 처리하는 중 오류가 발생했습니다.",
          },
        ]);
      } finally {
        setCurrentMode("normal");
      }
    }
  
    if (event.target) {
      event.target.value = ""; // 파일 입력 필드 초기화
    }
  };
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
  //토큰 조회 기능 + 이미지, 홍보문자 내역 조회.

  const [tokenCheck, setTokenCheck] = React.useState(true)
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
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{input}</UserMessage>
        },
        {
          id: nanoid(),
          display: <SendingMessage 
            recipient={input} 
            isGroup={currentMode === 'send-message-group'}
            lastCreatedMessage={lastCreatedMessage}
            currentImageUrl={currentImageUrl}
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
            }
          
          }
          />
        }
      ])
      setCurrentMode('normal')
    }
  }
  //메시지 전송 기능.

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
  //전화번호 추가 기능 1: 전화번호 파일 추가(파일 업로드까지) + 전화번호 추가 기능(전번 입력까지).

  const handlePhoneNumber = (number: string) => {
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
    //}
  }
  //전화번호 추가 기능 2: 전화번호 존재 여부 확인.

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
  //전화번호 추가 기능 3: 전화번호 추가 기능(문자입력).

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
  //전화번호 저장 기능 4: 문자입력 후 그룹명 지정 여부 확인

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
      // const newPhoneData = { ...phoneData, groupName: 'default' }
      // setSamplePhoneNumbers(prev => [...prev, newPhoneData])
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>
        },
        {
          id: nanoid(),
          display: "그룹명을 정말로 미입력하시겠습니까?."
        }
      ])
      setCurrentMode('phone-group-noninput')
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
  //전화번호 저장 기능 5: 예 -> 추가 입력, 아니오-> default 그룹으로 저장 후 동작 종료

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
      }
    ])
    setCurrentMode('normal')
  }
  //전화번호 추가 기능 6: 파일로 전화 번호 저장.
  const handleGroupNonName = () =>{
    const newPhoneData = { ...phoneData, groupName:'default' }
    setSamplePhoneNumbers(prev => [...prev, newPhoneData])
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <SavePhoneNumber phoneData={newPhoneData} />
      }
    ])
    setCurrentMode('normal')
  }

  const handleRegenerateMessage = () => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserTextMessage 
          message={lastTextInput} 
          onCreatedMessage={setLastCreatedMessage}
          onCommunicationStatus={setTextSuccess}
        />
      }
    ])
    if(textSuccess){
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "텍스트 주제 재입력을 원하면 주제, 텍스트 재생성을 원하면 재생성을 입력해주세요. 혹은 메시지 생성 완료를 입력해 주세요."
      }
    ])
    setCurrentMode('text-create-action')
  }
  else{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "메시지 전송에 실패했습니다."
      }
    ])
    setCurrentMode('normal')
  }
  }
  //문자 생성 기능 4: 문자 저장 후 이미지 생성 여부 확인
  
  const [saveNum, setSaveNum] = React.useState(-1)
  const [lastTextInput, setLastTextInput] = React.useState('')
  const [lastCreatedMessage, setLastCreatedMessage] = React.useState('')
  const [currentImageUrl, setCurrentImageUrl] = React.useState('')

  const handleSuccess = (success: boolean) => {
    setIsSuccess(success)
  };
  const handleImageGeneration = () => {
    console.log(selectedSeed);
    setMessages(currentMessages => [
      ...currentMessages,
      //추가
      {
        id: nanoid(),
        display: <ImageGenerator createdMessage={lastCreatedMessage} onSuccess={handleSuccess}/>
      }
    ])
    if(isSuccess){
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: "0, 1, 2, 3, 4번 중 하나를 선택해주세요. (0: 이미지 재생성)"
        }
      ])
      setCurrentMode('image-select')
    }
    else{
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: "이미지 생성에 실패했습니다."
        }
      ])
      setCurrentMode('normal')
    }
  }
  const [isSuccess, setIsSuccess] = React.useState(false);
  //이미지 생성 기능 1: 이미지 4장 생성 기능.
  const handleImageReSeed = (seed:string) =>{
    console.log(selectedSeed);
    setMessages(currentMessages => [
      ...currentMessages,
      //추가
      {
        id: nanoid(),
        display: <ImageGenerator createdMessage={lastCreatedMessage} seed={selectedSeed} onSuccess={handleSuccess}/>
      }
    ])
    if(isSuccess){
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: "0, 1, 2, 3, 4번 중 하나를 선택해주세요. (0: 이미지 재생성)"
        }
      ])
      setCurrentMode('image-select')
    }
    else{
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: "이미지 생성에 실패했습니다."
        }
      ])
      setCurrentMode('normal')
    }
  }

  const handleImageAction = (value:string) => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "이미지 재생성, 이미지 편집, 이미지 보강, 종료 중에 하나를 입력하세요."
      }
    ])
  }
  //이미지 생성 기능 2: 이미지 선택 후 이미지 편집, 보강, 종료 선택 기능.
  

  const [enhancedImg, setEnhancedImg] = React.useState('')

  React.useEffect(() => {
  if (enhancedImg) {
    
 }
}, [enhancedImg]);

  const handleImageEnhance = async (value:string, enhance:string) => {
    // const EnhanceImage = ReturnEnhanceImage()
    // setEnhancedImg(EnhanceImage)
    //handleDeductTokens()
    setMessages(currentMessages => [
      ...currentMessages,
      //추가
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>
        },
      {
        id: nanoid(),
        display: <ImageEnhance enhancedImageSrc={enhance} />
      },
      {
        id: nanoid(),
        display: "변경된 이미지를 저장하시겠습니까? (예/아니오/재보강)."
      }
    ])
    setCurrentMode('image-enhancing-action')
  }
  //이미지 생성 기능 3: 이미지 보강 기능

  const handleImageEdit = (value:string) => {
    //handleDeductTokens()
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
  //이미지 생성 기능 4: 이미지 편집 기능

  const handleSaveMessageAndImage = () => {
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
  // 이미지 생성 기능 5: 이미지 생성 종료 후 이미지와 문자 저장.
  //`MessageSaver` 컴포넌트를 사용해 `lastTextInput`과 `lastCreatedMessage`를 저장합니다.
  //`ImageSaver` 컴포넌트를 사용해 `currentImageUrl`을 저장합니다.

  const handleCheckTokens = async () => {
    // const result = await deductTokens()
    const result = true
    return result;
  }

  const handleSelectedImageSave = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: <ImageGenerator selectedImage={value} onSuccess={handleSuccess}/>
      }
      
    ])
    console.log(selectedSeed);

    if(error==""){
      {
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: nanoid(),
            display: "오류가 발생하여 종료합니다."
          }
          
        ])
      }
      setCurrentMode("normal")
    }
  }
  const stopImageCreate = (value:string) =>{
    //const imageUrl = `/sampleImage${selectedImage}.jpg`
    //setCurrentImageUrl(imageUrl)
    // const selectImage = returnSeletedImage(value)
    // setSelectedImage(selectImage)
    // setCurrentImageUrl(selectImage)
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      }
    ])
  }
  const handleImageRegeneration = (value:string) =>{
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
  }
  const HandleimageEnhancingAction = (value:string) =>{
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
  }
  const errorMessageAutoSave = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "토큰이 부족합니다."
      }
    ])
    handleTextSave(value)
  }
  const HandleimageEnhancingCancle = (value:string) =>{
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
  }
  const handleHistory = () =>{
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
  }
  // 채팅 내역 조회 1: 내역 보여준 후 고유번호 입력 받음.
  const handleHistoryFind = (value:string) =>{
    const historyId = Number(value);
    const historyItem = getHistoryItem(historyId);
    if (historyItem) {
      const historyMsg = getHistoryMessage(historyItem) 
      const histroyImg = getHistoryImage(historyItem)
      setLastCreatedMessage(historyMsg)
      setCurrentImageUrl(histroyImg)
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>
        },
        {
          id: nanoid(),
          display: <ImageSaver imageUrl={histroyImg} saveNum={saveNum} />
        },
        {
          id: nanoid(),
          display: <MessageSaver message={{ userInput: "", createdMessage: historyMsg }} saveNum={saveNum} />
        },
        // <MessageImageHistory id={historyId} />
        
        {
          id: nanoid(),
          display: "이미지와 문자를 불러왔습니다."
        }
      ]);
      //sssss
      setSaveNum(prevSaveNum => prevSaveNum + 1)
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
  }
  // 채팅 내역 조회 2: 고유번호 입력 받아 그 데이터를 currentUrl과 lastMessage에 저장.
  const handleTextSave = (value:string) =>{
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
  }
  const [textSuccess, setTextSuccess] = React.useState(false);
  const handleTextSuccess = () =>{
    
  }

  const handleText = (value:string) =>{
    setLastTextInput(value)
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
          onCreatedMessage={setLastCreatedMessage}
          onCommunicationStatus={setTextSuccess}
        />
      }
    ])
    if(textSuccess){
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "텍스트 주제 재입력을 원하면 주제, 텍스트 재생성을 원하면 재생성을 입력해주세요. 혹은 메시지 생성 완료를 입력해 주세요."
      }
    ])
    setCurrentMode('text-create-action')
  }
  else{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "메시지 생성에 실패했습니다."
      }
    ])
    setCurrentMode('normal')
  }
  }
  const [awaitingReselection, setAwaitingReselection] = React.useState(false)
  const requestReselection = () => {
    setAwaitingReselection(true)
  }
  React.useEffect(() => {
    if (awaitingReselection) {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: "0, 1, 2, 3, 4 중 하나를 선택해주세요. (0: 이미지 재생성)"
        }
      ])
    }
  }, [awaitingReselection])

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
  //문자 재생성 기능
  const handleStopGenerateText = () =>{
    setCurrentMode('text-action')
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: "이미지 생성, 메시지 저장을 할 수 있습니다."
      }
    ])
  }
  //문자 생성을 멈추고 이미지 생성, 메시지 저장 선택 단계로 넘어감.

  //
  //아래부터 예외 관련 함수
  const handleErrorText = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "토큰이 부족합니다."
      }
    ])
    handleErrorTextSave(value)
  }
  const handleErrorTextSave = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
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
  }
  const handleErrorRegenerateText = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "재생성할 토큰이 부족합니다."
      }
    ])
    handleErrorTextSave(value)
  }
  const handleErrorTextCreateAction = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "잘못된 입력입니다. '재생성', '주제' 혹은 '메시지 생성 완료'를 입력해주세요."
      }
    ])
  }
  const handleErrorGenerateImage = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "토큰이 부족합니다."
      }
    ])
    handleErrorTextSave(value)
  }
  const handleErrorTextAction = (value:string) =>{
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
  const handleErrorSendingMessage = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "토큰이 부족합니다."
      }
    ])
    setCurrentMode('normal')
  }
  const handleErrorImageSelected = (value:string) =>{
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
  const handleErrorImage = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "토큰이 부족합니다. 생성된 이미지 중에서 선택해 주세요."
      }
    ])
    setCurrentMode('image-Reselect');
  }
  const handleErrorImageReselected = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "잘못된 선택입니다. 1, 2, 3, 4 중 하나를 선택해주세요."
      }
    ])
    // 현재 모드를 유지하여 다시 선택하도록 함
    setCurrentMode('image-Reselect')
  }
  const handleErrorImageAction = (value:string) =>{
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
  const handleErrorEnhance = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "토큰이 부족합니다. 보강을 진행하지 않습니다. 이미지 편집, 종료 중에 하나를 입력하세요."
      }
    ])
    HandleimageEnhancingAction(value)
  }
  const handleErrorImageEnhancingAction = (value:string) =>{
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
  const handleErrorImageEnhanceAction = (value:string) =>{
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
  const handleErrorGenerateImageApi = (value:string) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      {
        id: nanoid(),
        display: "이미지 생성하는 중에 오류가 발생했습니다."
      }
    ])
    handleErrorTextSave(value)
  }
  const handleErrorPhoneNumberCompare = (value:string, errors:string[]) =>{
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      },
      ...errors.map(error => ({
        id: nanoid(),
        display: error,
      }))
    ])
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
               const newPhoneData = { ...phoneData, value }
               const result = await comparePhoneNumber({ phoneData: newPhoneData })
               console.log(result.errors)
               if(result.isValid){
                handleGroupName(value)
               }
               else{
                handleErrorPhoneNumberCompare(value, result.errors)
               }

            } else if (currentMode === 'phone-group-noninput') {
              setMessages(currentMessages => [
                ...currentMessages,
                {
                  id: nanoid(),
                  display: <UserMessage>{value}</UserMessage>
                }
              ])
              if(value =="예"){
                const newPhoneData = { ...phoneData, groupName:'default' }
                const result = await comparePhoneNumber({ phoneData: newPhoneData })
                console.log(result.errors)
                if(result.isValid){
                 handleGroupNonName()
                }
                else{
                  handleErrorPhoneNumberCompare(value, result.errors)
                }
              }else if(value =="아니오"){
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: "그룹명을 추가하시겠습니까? (예/아니오)"
                  }
                ])
                setCurrentMode('phone-group')
              }
              else{
                //나중에...
              }
            } else if (currentMode === 'text') {
              const hasEnoughTokens = await handleCheckTokens()
              if(hasEnoughTokens) handleText(value)
              else handleErrorText(value)
              
            } else if (currentMode === 'text-create-action') {
                if (value.toLowerCase() === '재생성') {
                  const hasEnoughTokens = await handleCheckTokens()
                  if(hasEnoughTokens)handleRegenerateMessage()
                  else handleErrorRegenerateText(value)

                } else if (value.toLowerCase() === '주제') {
                  handleReenterTopic()

                } else if (value.toLowerCase() === '메시지 생성 완료') {
                  handleStopGenerateText()

                }else {
                  handleErrorTextCreateAction(value)
                }
              
            
            } else if (currentMode === 'text-action') {
              if (value.toLowerCase() === '이미지 생성') {
                const hasEnoughTokens = await handleCheckTokens()
                //console.log(result)
                if(true) {
                  // const result = await showExistingImages();
                  // if(result){handleImageGeneration()}
                  // else {
                  //   handleErrorGenerateImage(value)
                  // }
                  handleImageGeneration()
                }
                else handleErrorGenerateImageApi(value)

              } 
              else if (value.toLowerCase() === '메시지 저장') handleTextSave(value)
              else handleErrorTextAction(value)

            } else if (currentMode === 'send-message' || currentMode === 'send-message-recipient' || currentMode === 'send-message-group') {
              const hasEnoughTokens = await handleCheckTokens()
              if(hasEnoughTokens) handleSendMessage(value);
              else handleErrorSendingMessage(value)

            } else if (currentMode === 'image-select') {
              if (value === '0') {
                const hasEnoughTokens = await handleCheckTokens()
                if(hasEnoughTokens){
                  handleImageRegeneration(value)
                  setAwaitingReselection(false)
                }
                else handleErrorImage(value)

              } else if (['1', '2', '3', '4'].includes(value)) {
                const src = returnSelectedImage(value)
                console.log(src)
                setSelectedSeed(value)
                setSelectedImage(src)
                setCurrentImageUrl(src)
                handleSelectedImageSave(value)  
                handleImageAction(value)
                setCurrentMode('image-action')
              } else handleErrorImageSelected(value)

            } else if (currentMode === 'image-Reselect') {
              if (['1', '2', '3', '4'].includes(value)) {
                handleSelectedImageSave(value)  
                const src = returnSelectedImage(value)
                setSelectedSeed(value)
                console.log(src)
                setSelectedImage(src)
                setCurrentImageUrl(src)
                handleImageAction(value)
                setCurrentMode('image-action')
              } 
              else handleErrorImageReselected(value)

            }else if (currentMode === 'image-action') {
              if (value === '이미지 편집') {
                handleImageEdit(value)
              } 
              else if (value === '이미지 보강') {
                const hasEnoughTokens = await handleCheckTokens()
                if(hasEnoughTokens){
                  const enhance = await ReturnEnhanceImage(currentImageUrl)
                  console.log(enhance)
                  if(enhance !== ""){
                    setEnhancedImg(enhance);
                    handleImageEnhance(value, enhance);
                  }
                }
                else handleErrorEnhance(value)
              } else if(value === '이미지 재생성'){
                const hasEnoughTokens = await handleCheckTokens()
                console.log(selectedSeed)
                if(hasEnoughTokens){
                  if(selectedSeed !== ""){
                    handleImageReSeed(selectedSeed)
                  }
                  else{}
                }
                else{}
              }
              else if (value.toLowerCase() === '종료') handleSaveMessageAndImage()
              else handleErrorImageAction(value)

            } else if (currentMode === 'image-enhancing-action') {
              if (value.toLowerCase() === '예') {
                  setCurrentImageUrl(enhancedImg)
                  HandleimageEnhancingAction(value)

              } else if (value.toLowerCase() === '아니오') {
                setCurrentImageUrl(selectedImage)
                HandleimageEnhancingCancle(value)

              } else if (value.toLowerCase() === '재보강') {
                const hasEnoughTokens = await handleCheckTokens()
                if(hasEnoughTokens){
                  const enhance = await ReturnEnhanceImage(currentImageUrl)
                  flushSync(() => {
                    setEnhancedImg(enhance)
                 });
                 handleImageEnhance(value, enhance);

                  console.log(enhance)
                }
                else{
                  setMessages(currentMessages => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{value}</UserMessage>
                    },
                    {
                      id: nanoid(),
                      display: "토큰이 부족합니다. 보강을 진행하지 않습니다. 현재 이미지로 보강하시겠습니까?"
                    }
                  ])
                  if (value.toLowerCase() === '예') {
                    setCurrentImageUrl(enhancedImg)
                    HandleimageEnhancingAction(value)
                } else if (value.toLowerCase() === '아니오') {
                  setCurrentImageUrl(selectedImage)
                  HandleimageEnhancingCancle(value)
                }
                }
              } else handleErrorImageEnhancingAction(value)

            } else if (currentMode === 'image-enhance-action') {
              if (value === '이미지 편집') {
                handleImageEdit(value)
              } else if (value.toLowerCase() === '종료') {
                setCurrentImageUrl(enhancedImg)
                handleSaveMessageAndImage()
              } else handleErrorImageEnhanceAction(value)

            } else if (currentMode === 'history') {
              handleHistory()
            } else if (currentMode === 'history-action') {
              handleHistoryFind(value)
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
        onChange={ handleFileUpload}
        accept=".txt"
        aria-label="Upload a text file"
      />
      </form>
  )
}