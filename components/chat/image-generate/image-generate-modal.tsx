import React, { Dispatch, useEffect, useState } from 'react'
import ChatUtils from './../utils/ChatUtils'
import { ButtonType } from '@/components/prompt-form'
import { useDispatch, useSelector } from 'react-redux'
// import { clearText, setText } from '@/redux/slices/createTextSlice' 🚨 삭제 🚨
import Component from '@/components/image-option-modal'
import { ImageOption, setImageOption } from '@/redux/slices/imageOptionSlice'
import { postImageGenerate } from '@/components/image-generator-api'
import {ImageState, setImageData} from '@/redux/slices/imageSlice'
import Image from 'next/image'
import ReactDOMServer from 'react-dom/server'
import { ImageSkeleton } from '@/components/ui/image-skeleton'
import { BotCard } from '@/components/stocks'
import ImagePreviewModal from '@/components/image-preview-modal'
import { useRouter } from 'next/navigation'
import { RootState } from '@/redux/store'
import { UnknownAction } from 'redux'
import {MessageOptionState, setContent} from '@/redux/slices/messageOptionSlice'
import { sleep } from '@/lib/utils'

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

const ImageGenerateModal: React.FC<CreateMessageProps> = ({
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
  >('imageOption')
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

  // const message = useSelector((state: RootState) => state.createText) 🚨 삭제

  const processUserInput = async (input: string) => {
    switch (stage) {
      case 'imageOption':
        if (input === '이미지 생성') {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            '이미지 생성을 시작합니다.'
          )
          setStage('generateImage') //로컬에선 오류떠서.
        } else if (['이미지 업로드', '이미지 없이'].includes(input)) {
          ChatUtils.addChat(buttonType, 'user', input)
          ChatUtils.addChat(
            buttonType,
            'assistant',
            `선택하신 옵션 "${input}"이(가) 저장되었습니다.`
          )
          // import { clearText, setText } from '@/redux/slices/createTextSlice' 🚨 삭제 🚨
          // console.log(message)
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

// export default ImageGenerateModal

export function ImageLoader() {
  return (
    <div className="space-y-2">
      <BotCard>
        <ImageSkeleton />
      </BotCard>
    </div>
  )
}

export const handleLoadingImage = (buttonType: ButtonType) => {
  const skeletons = Array(4)
    .fill(null)
    .map((_, index) => <ImageSkeleton key={`skeleton-${index}`} />)
  ChatUtils.addChat(
    buttonType,
    'assistant-animation-html',
    ReactDOMServer.renderToString(<>{skeletons}</>)
  )
}

export default function HandleGenerateImage({
  imageOption,
  messageOption
}: {
  imageOption: ImageOption
  messageOption: MessageOptionState
}) {
  const skeletonIds: string[] = []
  const buttonType = ''
  // 로딩 상태 추가 (가로 4개로 배치)
  return (
    <BotCard>
      {Array(4)
        .fill(null)
        .map((_, i) => (
          <ImageSkeleton key={`skeleton-${i}`} />
        ))}
    </BotCard>
  )

  // 각각의 이미지 생성 요청을 비동기적으로 처리
  /*const imagePromises = Array(4)
      .fill(null)
      .map(async () =>
        postImageGenerate(imageOption, messageOption.prompt || '')
      )
    const imageUrls: string[] = []
    const imageList: ImageState[] = []
    for (const [index, imagePromise] of imagePromises.entries()) {
      try {
        const result = await imagePromise
        imageList[index] = {
          requestId: result.requestId,
          url: result.url
        }
        imageUrls[index] = result.url
      } catch (error) {
        console.error(`이미지 생성 실패 (Index: ${index}):`, error)
        imageUrls[index] = '' // 실패한 경우 빈 값으로 설정
      }
    }*/
  /*
    ChatUtils.addChat(
      buttonType,
      'assistant',
      ReactDOMServer.renderToString(
        <div style={{ display: 'flex', gap: '8px' }}>
          {imageUrls.map((url, idx) =>
            url ? (
              <button
                key={`image-${idx}`}
                onClick={() => alert(`클릭한 이미지 URL: ${url}`)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                <img
                  src={url}
                  alt={`Generated Image ${idx + 1}`}
                  width={200}
                  height={200}
                  style={{ borderRadius: '8px' }}
                />
              </button>
            ) : (
                <button
                    key={`image-${idx}`}
                    onClick={() => console.log(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                >
                  <img
                      src={'https://fal.media/files/zebra/P5U45vbYFA-XC_qbPt4xv_78e77d40040c4f5fbe676209d78d3f6e.jpg'}
                      alt={`Generated Image ${idx + 1}`}
                      width={200}
                      height={200}
                      style={{borderRadius: '8px'}}
                  />
                </button>
            )
          )}
        </div>
      )
    )*/
  /*  } catch (error) {
    console.error('이미지 생성 실패:', error)
  }*/
}

