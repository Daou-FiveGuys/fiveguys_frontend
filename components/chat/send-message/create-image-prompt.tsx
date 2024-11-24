import React from 'react'
import ChatUtils from './../utils/ChatUtils'
import { ButtonType } from '@/components/prompt-form'

interface CreateImagePromptProps {
  buttonType: ButtonType
}

const CreateImagePrompt: React.FC<CreateImagePromptProps> = ({ buttonType }) => {
  const handleImageGeneration = () => {
    // 이미지 생성 로직을 여기에 추가하세요
    ChatUtils.addChat(buttonType, 'assistant', '이미지 생성이 시작되었습니다.')
  }

  React.useEffect(() => {
    handleImageGeneration()
  }, [])

  return null
}

export default CreateImagePrompt

