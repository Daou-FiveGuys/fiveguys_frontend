import React, { useEffect, useState } from 'react'
import ChatUtils from './../utils/ChatUtils'
import { ButtonType } from '@/components/prompt-form'
import { useDispatch, useSelector } from 'react-redux'
import { clearText, setText } from '@/redux/slices/createTextSlice'
import Component from '@/components/image-option-modal'
import { ImageOption, setImageOption } from '@/redux/slices/imageOptionSlice'
import { postImageGenerate } from '@/components/image-generator-api'
import { setImageData } from '@/redux/slices/imageSlice'
import Image from 'next/image'
import ReactDOMServer from 'react-dom/server'
import { ImageSkeleton } from '@/components/ui/image-skeleton'
import { BotCard } from '@/components/stocks'
import ImagePreviewModal from '@/components/image-preview-modal'
import { useRouter } from 'next/navigation'
import { RootState } from '@/redux/store'

interface CreateMessageProps {
  buttonType: ButtonType
  lastUserInput: string | null
}

// 샘플 데이터
const sampleData = {
  title: '여름 할인 이벤트',
  content: '무더운 여름을 시원하게! 전 제품 20% 할인',
  imageUrl: '/placeholder.svg?height=300&width=400'
}

export interface imgResponse {
  requestId: string
  url: string
}

const CreateMessage: React.FC<CreateMessageProps> = ({
  buttonType,
  lastUserInput
}) => {
  const [stage, setStage] = useState<
    | 'initial'
    | 'directInput'
    | 'autoGenerate'
    | 'imageOption'
    | 'generateImage'
    | 'loading'
    | 'editImage'
  >('initial')
  const dispatch = useDispatch()
  const [prompt, setPrompt] = useState<string>('')
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

  const message = useSelector((state: RootState) => state.createText)

  const processUserInput = (input: string) => {
    switch (stage) {
      case 'initial':
        if (input.toLowerCase() === '직접입력') {
          setStage('directInput')
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '홍보메시지를 직접 입력해주세요'
          )
        } else if (input.toLowerCase() === '자동생성') {
          setStage('autoGenerate')
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '홍보메시지의 주제를 입력해주세요'
          )
        } else {
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '다시 입력해주세요. "직접입력" 또는 "자동생성"을 선택해주세요.'
          )
        }
        break
      case 'directInput':
        dispatch(setText({ text: input }))
        setPrompt(input)
        ChatUtils.addChat(buttonType, 'user', input)
        setStage('imageOption')
        ChatUtils.addChat(
          buttonType,
          'assistant',
          '입력하신 내용이 저장되었습니다. 이미지 옵션을 선택해주세요: "이미지 생성", "이미지 업로드", "이미지 없이"'
        )
        break
      case 'autoGenerate':
        const generatedText = JSON.stringify(sampleData)
        dispatch(setText({ text: generatedText }))
        ChatUtils.addChat(buttonType, 'user', input)
        ChatUtils.addChat(
          buttonType,
          'assistant',
          '샘플 데이터가 생성되었습니다: ' + generatedText
        )
        ChatUtils.addChat(
          buttonType,
          'assistant',
          '이미지 옵션을 선택해주세요: "이미지 생성", "이미지 업로드", "이미지 없이"'
        )
        setStage('imageOption')
        break
      case 'imageOption':
        if (input === '이미지 생성') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '이미지 생성을 시작합니다.'
          )
          //setStage('generateImage') 로컬에선 오류떠서.
        } else if (['이미지 업로드', '이미지 없이'].includes(input)) {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            `선택하신 옵션 "${input}"이(가) 저장되었습니다.`
          )
          setText({text:input})
          console.log(message);
          setStage('initial')
        } else {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '올바른 옵션을 선택해주세요: "이미지 생성", "이미지 업로드", "이미지 없이"'
          )
        }
        break
      case 'generateImage':
        ChatUtils.addChat(
          buttonType,
          'assistant',
          '이미지를 생성하는 중입니다.'
        )
        break
    }
  }

  const handleGenerateImage = async (imageOption: ImageOption) => {
    dispatch(setImageOption(imageOption))
    setStage('loading') // 로딩 상태로 변경
    const imageSkeleton = ImageLoader()
    const imageSkeletonId = ChatUtils.addChat(
      buttonType,
      'assistant',
      ReactDOMServer.renderToString(imageSkeleton)
    )
    try {
      // 이미지 생성 API 호출
      const result = await postImageGenerate(imageOption, prompt)
      // 이미지 생성 완료 후 데이터 저장
      dispatch(
        setImageData({
          requestId: result.requestId,
          url: result.url
        })
      )
      const imageUrl = result.url // 이미지 URL
      // 이미지 메시지 추가
      const imageComp = (
        <BotCard>
          <Image
            src={imageUrl}
            alt="Message image"
            width={200}
            height={200}
            className="rounded-md"
          />
        </BotCard>
      )

      ChatUtils.deleteChat(buttonType, imageSkeletonId) // 로딩창 삭제
      ChatUtils.addChat(
        buttonType,
        'assistant',
        ReactDOMServer.renderToString(imageComp)
      )
      setImageUrls(imageUrl)
      setStage('editImage')
      dispatch(clearText())
    } catch (error) {
      console.error('이미지 생성 실패:', error)
    }
  }
  const [imageUrls, setImageUrls] = useState('')
  const router = useRouter()
  const handleEditImage = (isEdit: boolean) => {
    const editMessage = isEdit ? '편집을 시작합니다.' : '편집을 취소합니다.'
    ChatUtils.addChat(buttonType, 'assistant-animation', editMessage)
    isEdit && router.push('/edit/1')
    setStage('initial')
  }

  return (
    <div>
      {stage === 'generateImage' ? (
        <Component isOpen={true} onClose={handleGenerateImage} />
      ) : null}
      {stage === 'editImage' ? (
        <ImagePreviewModal
          imageUrl={imageUrls}
          isOpen={true}
          onClose={handleEditImage}
        />
      ) : null}
    </div>
  )
}

export default CreateMessage

export function ImageLoader() {
  return (
    <div className="space-y-2">
      <BotCard>
        <ImageSkeleton />
      </BotCard>
    </div>
  )
}
