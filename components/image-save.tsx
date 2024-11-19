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

    const originalWidth = canvas.width // 현재 캔버스 크기 저장
    const originalHeight = canvas.height

    // 원본 이미지 크기 가져오기
    let scaleX = 1
    let scaleY = 1

    if (canvas.backgroundImage) {
      scaleX = canvas.backgroundImage.width / canvas.width
      scaleY = canvas.backgroundImage.height / canvas.height

      canvas.setWidth(canvas.backgroundImage.width)
      canvas.setHeight(canvas.backgroundImage.height)
      canvas.renderAll()
    }

    // 모든 객체의 외곽선을 흰색으로, 내부 채우기를 검정색으로 변경
    canvas.getObjects().forEach(obj => {
      obj.set({
        left: obj.left * scaleX,
        top: obj.top * scaleY,
        scaleX: obj.scaleX * scaleX,
        scaleY: obj.scaleY * scaleY
      })
      obj.setCoords()
    })
    canvas.renderAll()

    // 캔버스를 이미지 데이터로 변환 (검은 배경에 흰색 외곽선, 검정색 채우기로 추출)
    const imageData = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1,
      enableRetinaScaling: false
    })

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
      fabric.FabricImage.fromURL(newImageUrl, {
        crossOrigin: 'anonymous'
      }).then(function (img) {
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
