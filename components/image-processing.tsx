import React, { useEffect, useState } from 'react'
import * as fabric from 'fabric'
import ImageInpantMoal from './image-modal'
import ImageProcessingRequestSuccessModal from './image-confirm-modal'

interface YourComponentProps {
  canvas: fabric.Canvas | null
  isProcessing: boolean
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
  mode: string
}

const ImageAIEdit: React.FC<YourComponentProps> = ({
  canvas,
  isProcessing,
  setIsProcessing,
  mode
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null)
  const [showProcessingModal, setShowProcessingModal] = useState(false)

  useEffect(() => {
    if (!canvas || !isProcessing) return
    switch (mode) {
      case 'inpaint':
        console.log('저장 시작')

        // 복제할 캔버스를 생성
        const originalBackgroundImage = canvas.backgroundImage
        const originalBackgroundColor = canvas.backgroundColor

        // 배경 이미지를 제거하고 배경색을 검은색으로 설정
        canvas.backgroundImage = undefined
        canvas.backgroundColor = 'black'

        // 모든 객체의 원래 색상을 저장
        const originalStrokeColors = canvas
          .getObjects()
          .map(obj => obj.stroke as string)
        const originalFillColors = canvas
          .getObjects()
          .map(obj => obj.fill as string)

        // 모든 객체의 외곽선을 흰색으로, 내부 채우기를 검정색으로 변경
        canvas.getObjects().forEach(obj => {
          obj.set({
            stroke: 'white',
            fill: 'black'
          })
        })
        canvas.renderAll() // 변경 사항 렌더링

        // 캔버스를 이미지 데이터로 변환 (검은 배경에 흰색 외곽선, 검정색 채우기로 추출)
        const imageData = canvas.toDataURL({
          format: 'png',
          quality: 1.0,
          multiplier: 1,
          enableRetinaScaling: true
        })

        // 배경 이미지와 색상 및 객체의 원래 색상 복원
        canvas.backgroundImage = originalBackgroundImage
        canvas.backgroundColor = originalBackgroundColor
        canvas.getObjects().forEach((obj, index) => {
          obj.set({
            stroke: originalStrokeColors[index],
            fill: originalFillColors[index]
          })
        })
        canvas.renderAll() // 원래 상태로 다시 렌더링

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
        break
      case 'removeText':
      case 'upscale':
        let url = ''
        if (mode === 'removeText') url = 'local-removetext'
        else url = 'local-upscale'
        /**
         * API 요청
         */
        break
    }
    setShowProcessingModal(true)

    const timer = setTimeout(() => {
      setShowProcessingModal(false)
      setNewImageUrl(
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWg7X0YYzUCU5m8BA_sH_ti92q4X0lCz5h_w&s'
      )
      setIsModalOpen(true) // 최종 모달 열기
      setIsProcessing(false) // 업스케일링 상태 해제
    }, 3000) // 3초 동안 처리 완료 모달 표시

    return () => clearTimeout(timer) // 타이머 정리
  }, [canvas, isProcessing, setIsProcessing])

  const applyNewImage = () => {
    if (!canvas) return
    if (newImageUrl) {
      fabric.FabricImage.fromURL(newImageUrl).then(function (img) {
        canvas.backgroundImage = img
        img.canvas = canvas
      })
    }
    if (mode === 'inpaint')
      canvas.getObjects().forEach(obj => {
        if (obj.visible) {
          canvas.remove(obj)
        }
      })
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
      {isModalOpen && (
        <ImageInpantMoal
          imageUrl={newImageUrl!} // 모달에 이미지 URL 전달
          onCancel={cancelNewImage}
          onConfirm={applyNewImage}
        />
      )}
    </div>
  )
}

export default ImageAIEdit
