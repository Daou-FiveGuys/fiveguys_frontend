import React, {useEffect, useRef, useState} from 'react'
import { ImageOption } from '@/redux/slices/imageOptionSlice'
import { postImageGenerate } from '@/components/image-generator-api'
import { setImageData } from '@/redux/slices/imageSlice'
import { ImageSkeleton } from '@/components/ui/image-skeleton'
import { BotCard } from '@/components/stocks'
import ImagePreviewModal from '@/components/image-preview-modal'
import { useRouter } from 'next/navigation'
import { MessageOptionState } from '@/redux/slices/messageOptionSlice'
import ImageUtils from "@/components/chat/utils/ImageUtils";

interface GImageData {
  requestId: string;
  url: string
}

export default function HandleGenerateImage({
  imageOption,
  messageOption
}: {
  imageOption: ImageOption
  messageOption: MessageOptionState
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()
  const [isDone, setDone] = useState<boolean>(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  let imageUrls: string[] = []
  const [imageUrlList, setImageUrlList] = useState<string[]>([])
  const [gImageData, setGImageData] = useState<GImageData[]>([])
  const handleEditImage = (isEdit: boolean) => {
    setIsOpen(false)
    isEdit && router.push('/edit')
  }
  const isFetchedRef = useRef(false);
  const fetchImages = async () => {
    if (isFetchedRef.current) return;
    isFetchedRef.current = true; // 플래그 설정
    try {
      const imagePromises = Array(4)
        .fill(null)
        .map(async (_, index) => {
          try {
            // postImageGenerate 결과 확인
            const result = await postImageGenerate(
              imageOption,
              messageOption.prompt || '',
                index
            )
            return {
              requestId: result?.requestId || '',
              url: result?.url || ''
            }
          } catch (error) {
            console.error('이미지 생성 실패:', error)
            return null // 실패한 경우 null 반환
          }
        })

      const imageResults = await Promise.all(imagePromises) // 모든 이미지 Promise 처리
      let imageUrls: string[] = ['','','','']
      const imageList: Array<{ requestId: string; url: string }> = []
      console.log(imageResults)
      setImageUrlList(imageResults.map((r) => r?.url || ""))
      setGImageData(
        imageResults.map(r => {
          return {
            requestId: r?.requestId || "",
            url: r?.url || ""
          }
        }
      ))
      imageResults.forEach((result, index) => {
        if (result) {
          imageList[index] = {
            requestId: result.requestId,
            url: result.url
          }
          imageUrls[index] = result.url
        } else {
          imageList[index] = {
            requestId: '',
            url: ''
          }
          // 실패한 경우 기본값 설정
          imageUrls[index] = '/public/no-image.png'
        }
      })

      setDone(true) // 완료 상태 업데이트
    } catch (error) {
      console.error('전체 이미지 생성 실패:', error)
    } finally {
      console.log(imageUrls)
    }
  }

  useEffect(() => {
    fetchImages().then(r => r)
  }, [])

  // 로딩 상태 추가 (가로 4개로 배치)
  return !isDone ? (
      <div className="ml-2">
        <BotCard>
          <div className="grid grid-cols-2 w-fit gap-2">
            {Array(4)
                .fill(null)
                .map((_, i) => (
                    <ImageSkeleton key={`skeleton-${i}`} />
                ))}
          </div>
        </BotCard>
      </div>
  ) : (
    <>
      {isOpen && imageUrl && (
        <ImagePreviewModal
          imageUrl={imageUrl}
          isOpen={isOpen}
          onClose={handleEditImage}
        />
      )}
      <BotCard>
        {imageUrlList?.map(
          (
            url,
            idx // imageUrls?.map
          ) =>
            url ? (
              <button
                key={`image-${idx}`}
                onClick={() => {
                  setImageUrl(url)
                  /*setImageUrl(
                    'https://fal.media/files/zebra/P5U45vbYFA-XC_qbPt4xv_78e77d40040c4f5fbe676209d78d3f6e.jpg'
                  )*/
                  ImageUtils.addImage(
                     gImageData[idx].requestId, gImageData[idx].url
                  )
                  setIsOpen(true)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                <img
                  /*src={
                    'https://fal.media/files/zebra/P5U45vbYFA-XC_qbPt4xv_78e77d40040c4f5fbe676209d78d3f6e.jpg'
                  }*/
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
                  src={
                    '/public/no-image.png'
                  }
                  alt={`Generated Image ${idx + 1}`}
                  width={200}
                  height={200}
                  style={{ borderRadius: '8px' }}
                />
              </button>
            )
        )}
      </BotCard>
    </>
  )
}
