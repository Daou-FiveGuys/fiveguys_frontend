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

const CreateImagePrompt: React.FC<CreateMessageProps> = ({
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
    | 'changeimageOption'
    | 'reGenerateImage'
    
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

  const processUserInput = async (input: string) => {
    switch (stage) {
      case 'initial':
        if (input === '예') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '이미지 생성을 시작합니다.'
          )
          setStage('generateImage')  //로컬에선 오류떠서.
        } else if (input === '아니오') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            `이미지 프롬프트를 열지 않습니다.`
          )
        } else {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '올바른 옵션을 선택해주세요: "예", "아니오"'
          )
        }
        break;
      case 'imageOption':
        if (input === '이미지 생성') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '이미지 생성을 시작합니다.'
          )
          setStage('generateImage') //로컬에선 오류떠서.
        } else if (input === '이미지 업로드') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            `선택하신 옵션 "${input}"이(가) 저장되었습니다.`
          )
          setText({text:input})
          console.log(message);
          setStage('editImage')
        } 
        else if(input === '이미지 없이'){
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            `선택하신 옵션 "${input}"이(가) 저장되었습니다.`
          )
          setText({text:input})
          console.log(message);
          setStage('initial')
        }
        else {
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
      case 'changeimageOption':
        if (input === '수정') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '이미지를 다시 생성을 시작합니다.'
          )
          setStage('reGenerateImage') //로컬에선 오류떠서.
        } else if (input === '저장') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            `선택하신 옵션 "${input}"이(가) 저장되었습니다.`
          )
          setText({text:input})
          console.log(message);
          setStage('editImage')
        } else {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '올바른 옵션을 선택해주세요: "수정", "저장"'
          )
        }
          break
      case 'reGenerateImage':
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
      setStage('changeimageOption')
      //dispatch(clearText())
      ChatUtils.addChat(
        buttonType,
        'assistant',
        "이미지를 저장하시겠습니까? 수정을 원하시면 '수정', 저장을 원하시면 '저장'을 입력해주세요."
      )
    } catch (error) {
      console.error('이미지 생성 실패:', error)
    }
  }
  const handlereGenerateImage = async (imageOption: ImageOption) => {
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
      {
        stage === 'reGenerateImage'?(
          <Component isOpen={true} onClose={handlereGenerateImage} />
      ): null}
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

export default CreateImagePrompt

export function ImageLoader() {
  return (
    <div className="space-y-2">
      <BotCard>
        <ImageSkeleton />
      </BotCard>
    </div>
  )
}
