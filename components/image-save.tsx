import React, { useEffect, useState } from 'react'
import * as fabric from 'fabric'
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
  const [showProcessingModal, setShowProcessingModal] = useState(false)

  useEffect(() => {
    if (!canvas || !isDone) return

    // 캔버스를 이미지 데이터로 변환 (검은 배경에 흰색 외곽선, 검정색 채우기로 추출)
    const imageData = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1,
      enableRetinaScaling: true
    })

    setShowProcessingModal(true)

    const timer = setTimeout(() => {
      setShowProcessingModal(false)

      // 다운로드 처리
      const link = document.createElement('a')
      link.href = imageData
      link.download = 'canvas_image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      canvas.renderAll()
      setIsDone(false) // 업스케일링 상태 해제
    }, 3000) // 3초 동안 처리 완료 모달 표시

    return () => clearTimeout(timer) // 타이머 정리
  }, [canvas, isDone, setIsDone])

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
