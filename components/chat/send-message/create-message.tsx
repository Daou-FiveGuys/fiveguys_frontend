import React, { useEffect, useState } from 'react'
import ChatUtils from './../utils/ChatUtils'
import { ButtonType } from '@/components/prompt-form'
import { useDispatch } from 'react-redux'
import { setText, clearText } from '@/redux/slices/createTextSlice'

interface CreateMessageProps {
  buttonType: ButtonType
  lastUserInput: string | null
}

// 샘플 데이터
const sampleData = {
  title: "여름 할인 이벤트",
  content: "무더운 여름을 시원하게! 전 제품 20% 할인",
  imageUrl: "/placeholder.svg?height=300&width=400"
}

const CreateMessage: React.FC<CreateMessageProps> = ({ buttonType, lastUserInput }) => {
  const [stage, setStage] = useState<'initial' | 'directInput' | 'autoGenerate' | 'imageOption'>('initial')
  const dispatch = useDispatch()

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
        ChatUtils.addChat(buttonType, 'assistant', '입력하신 내용이 저장되었습니다. 이미지 옵션을 선택해주세요: "이미지 생성", "이미지 업로드", "이미지 없이"')
        break
      case 'autoGenerate':
        const generatedText = JSON.stringify(sampleData)
        dispatch(setText({ text: generatedText }))
        ChatUtils.addChat(buttonType, 'user', input)
        ChatUtils.addChat(buttonType, 'assistant', '샘플 데이터가 생성되었습니다: ' + generatedText)
        ChatUtils.addChat(buttonType, 'assistant', '이미지 옵션을 선택해주세요: "이미지 생성", "이미지 업로드", "이미지 없이"')
        setStage('imageOption')
        break
      case 'imageOption':
        if (['이미지 생성', '이미지 업로드', '이미지 없이'].includes(input)) {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(buttonType, 'assistant', `선택하신 옵션 "${input}"이(가) 저장되었습니다.`)
          setStage('initial')
          dispatch(clearText())
        } else {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(buttonType, 'assistant', '올바른 옵션을 선택해주세요: "이미지 생성", "이미지 업로드", "이미지 없이"')
        }
        break
    }
  }

  return null
}

export default CreateMessage

