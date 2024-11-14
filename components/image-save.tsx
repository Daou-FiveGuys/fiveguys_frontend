import React, { useEffect, useState } from 'react'
import * as fabric from 'fabric'
import ImageInpantMoal from './image-modal'
import ImageProcessingRequestSuccessModal from './image-confirm-modal'

interface YourComponentProps {
  canvas: fabric.Canvas | null
  isDone: boolean
  setIsDone: React.Dispatch<React.SetStateAction<boolean>>
}

const SaveEditedImage: React.FC<YourComponentProps> = ({
  canvas,
  isDone,
  setIsDone
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null)
  const [showProcessingModal, setShowProcessingModal] = useState(false)

  useEffect(() => {
    if (!canvas || !isDone) return

    console.log('저장 시작')

    // 배경 이미지를 제거하고 배경색을 검은색으로 설정
    // canvas.backgroundImage = undefined
    canvas.backgroundColor = ''

    // 캔버스를 이미지 데이터로 변환 (검은 배경에 흰색 외곽선, 검정색 채우기로 추출)
    const imageData = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1,
      enableRetinaScaling: true
    })

    // fetch(imageData)
    //   .then(res => res.blob())
    //   .then(blob => {
    //     const formData = new FormData()
    //     formData.append('file', blob, 'canvas_image.png')

    //     return fetch('https://your-server-url/upload', {
    //       method: 'POST',
    //       body: formData
    //     })
    //   })
    //   .then(response => response.json())
    //   .then(data => {
    //     setNewImageUrl(data.imageUrl) // 서버에서 받은 이미지 URL 설정
    //     setIsModalOpen(true) // 모달 열기
    //   })
    //   .catch(error => console.error('Error uploading image:', error))
    //   .finally(() => setIsInpainting(false))
    setShowProcessingModal(true)

    const timer = setTimeout(() => {
      setShowProcessingModal(false)
      const link = document.createElement('a')
      link.href = imageData
      link.download = 'canvas_image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setIsDone(false) // 업스케일링 상태 해제
    }, 3000) // 3초 동안 처리 완료 모달 표시

    return () => clearTimeout(timer) // 타이머 정리
  }, [canvas, isDone, setIsDone])

  const applyNewImage = () => {
    if (!canvas) return
    if (newImageUrl) {
      fabric.FabricImage.fromURL(newImageUrl).then(function (img) {
        canvas.backgroundImage = img
        img.canvas = canvas
      })
    }
    canvas.renderAll()
    setIsModalOpen(false) // 최종 모달 닫기
  }

  const cancelNewImage = () => {
    setNewImageUrl(null)
    setIsModalOpen(false)
  }

  return (
    <div>
      {showProcessingModal && (
        <ImageProcessingRequestSuccessModal
          onConfirm={() => setShowProcessingModal(false)}
        />
      )}
    </div>
  )
}

export default SaveEditedImage
