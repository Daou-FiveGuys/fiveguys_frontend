import React, { useEffect, useState } from 'react'
import ChatUtils from './../utils/ChatUtils'
import { ButtonType } from '@/components/prompt-form'
import { useDispatch } from 'react-redux'
import { setText } from '@/redux/slices/createTextSlice'
import { useRouter } from 'next/navigation'

interface CreatingMessageProps {
  buttonType: ButtonType
  lastUserInput: string | null
  setActiveButton: (value: ButtonType) => void
}

const sampleData = {
  title: "여름 할인 이벤트",
  content: "무더운 여름을 시원하게! 전 제품 20% 할인",
  imageUrl: "/placeholder.svg?height=300&width=400"
}

const CreatingMessage: React.FC<CreatingMessageProps> = ({ buttonType, lastUserInput, setActiveButton }) => {
  const [stage, setStage] = useState<'initial' | 'directInput' | 'autoGenerate' | 'imageOption' | 'imageSubOption'>('initial')
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    if (!ChatUtils.dispatch) {
      ChatUtils.initialize(dispatch)
    }
  }, [dispatch])

  useEffect(() => {
    if (lastUserInput) {
      processUserInput(lastUserInput)
    }
  }, [lastUserInput, buttonType])

  const processUserInput = (input: string) => {
    switch (stage) {
      case 'initial':
        if (input.toLowerCase() === '직접입력') {
          setStage('directInput')
          ChatUtils.addChat(buttonType, 'assistant', '홍보메시지를 직접 입력해주세요')
        } else if (input.toLowerCase() === '자동생성') {
          setStage('autoGenerate')
          ChatUtils.addChat(buttonType, 'assistant', '홍보메시지의 주제를 입력해주세요')
        } else {
          ChatUtils.addChat(buttonType, 'assistant', '다시 입력해주세요. "직접입력" 또는 "자동생성"을 선택해주세요.')
        }
        break
      case 'directInput':
        dispatch(setText({ text: input}))
        ChatUtils.addChat(buttonType, 'user', input)
        setStage('imageOption')
        ChatUtils.addChat(buttonType, 'assistant', '입력하신 내용이 저장되었습니다. 이미지 옵션을 선택해주세요: "이미지 생성" 또는 "미생성"')
        break
      case 'autoGenerate':
        const generatedText = JSON.stringify(sampleData)
        dispatch(setText({ text: generatedText}))
        ChatUtils.addChat(buttonType, 'user', input)
        ChatUtils.addChat(buttonType, 'assistant', '샘플 데이터가 생성되었습니다: ' + generatedText)
        ChatUtils.addChat(buttonType, 'assistant', '이미지 옵션을 선택해주세요: "이미지 생성" 또는 "미생성"')
        setStage('imageOption')
        break
      case 'imageOption':
        if (input === '이미지 생성') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(buttonType, 'assistant', '이미지 생성 옵션이 선택되었습니다.')
          // 여기에 이미지 생성 로직 추가
        } else if (input === '미생성') {
          setStage('imageSubOption')
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(buttonType, 'assistant', '이미지를 추가하시겠습니까? "이미지 추가" 또는 "이미지 없이"를 선택해주세요.')
        } else {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(buttonType, 'assistant', '올바른 옵션을 선택해주세요: "이미지 생성" 또는 "미생성"')
        }
        break
      case 'imageSubOption':
        if (input === '이미지 추가') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(buttonType, 'assistant', '이미지 추가를 위해 편집 페이지로 이동합니다.')
          router.push('/edit')
        } else if (input === '이미지 없이') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(buttonType, 'assistant', '이미지 없이 진행합니다.')
          break;
        } else {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(buttonType, 'assistant', '올바른 옵션을 선택해주세요: "이미지 추가" 또는 "이미지 없이"')
        }
        break
    }
  }

  return null
}

export default CreatingMessage

