import React, { useEffect, useState } from 'react'
import * as fabric from 'fabric'
import ImageInpantMoal from './image-modal'
import ImageProcessingRequestSuccessModal from './image-confirm-modal'
import axios from 'axios'

interface YourComponentProps {
  canvas: fabric.Canvas | null
  isProcessing: boolean
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
  mode: string
  option: string | null
}

const ImageAIEdit: React.FC<YourComponentProps> = ({
  canvas,
  isProcessing,
  setIsProcessing,
  mode,
  option
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null)
  const [showProcessingModal, setShowProcessingModal] = useState(false)

  useEffect(() => {
    if (!canvas || !isProcessing) return
    switch (mode) {
      case 'inpaint':
        sendImageForInpainting()
        break
      case 'removeText':
      case 'upscale':
        let url = 'http://localhost:8080/api/v1/ai/image'
        if (mode === 'removeText') url += `/remove-text/${option}`
        else url += `/upscale`
        sendImageRequestId(url)
        break
    }
    setShowProcessingModal(true)

    const timer = setTimeout(() => {
      setShowProcessingModal(false)
    }, 3000) // 3초 동안 처리 완료 모달 표시

    return () => clearTimeout(timer) // 타이머 정리
  }, [canvas, isProcessing, setIsProcessing])

  const applyNewImage = () => {
    if (!canvas) return
    if (newImageUrl) {
      fabric.FabricImage.fromURL(newImageUrl).then(img => {
        if (!canvas) return

        // 기존 캔버스 크기 가져오기
        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()

        // 이미지의 비율이 동일하므로, 그대로 캔버스 크기에 맞게 설정
        img.scaleToWidth(canvasWidth) // 캔버스 폭에 맞게 스케일링
        img.scaleToHeight(canvasHeight) // 캔버스 높이에 맞게 스케일링

        img.left = 0 // 이미지를 캔버스 왼쪽 위로 정렬
        img.top = 0

        canvas.backgroundImage = img
        canvas.renderAll.bind(canvas)
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

  const sendImageRequestId = async (url: string) => {
    // 필요한 조건 체크: canvas가 존재하고 처리 중일 때만 요청
    if (!canvas || !isProcessing) return

    // `requestId`와 기타 필요한 정보를 포함한 DTO 객체 생성
    const ImageRequestDTO = {
      requestId: '' // 여기에 실제 requestId를 입력하세요
      // 추가적으로 필요한 필드가 있다면 여기에 추가합니다.
    }

    try {
      // POST 요청 전송
      const response = await axios.post(`${url}`, ImageRequestDTO, {
        headers: {
          Authorization: `Bearer {액세스토큰}`, // 실제 인증 토큰으로 변경
          'Content-Type': 'application/json'
        }
      })

      // 응답 데이터 처리
      if (response.data.code === 200) {
        setNewImageUrl(response.data.data.url) // 서버에서 받은 이미지 URL 설정
        setIsModalOpen(true) // 모달 열기
      } else {
        console.error('Error uploading image:', response.data.message)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const sendImageForInpainting = async () => {
    if (!canvas || !isProcessing) return

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
    const imageData = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1,
      enableRetinaScaling: true
    })

    // 배경 이미지와 색상, 객체의 원래 색상 복원
    canvas.backgroundImage = originalBackgroundImage
    canvas.backgroundColor = originalBackgroundColor
    canvas.getObjects().forEach((obj, index) => {
      obj.set({
        stroke: originalStrokeColors[index],
        fill: originalFillColors[index]
      })
    })
    canvas.renderAll() // 원래 상태로 다시 렌더링

    // 이미지 데이터를 Blob 형식으로 변환
    const blob = await fetch(imageData).then(res => res.blob())

    // FormData 생성
    const formData = new FormData()
    formData.append('multipartFile', blob, 'canvas_image.png')

    const imageInpaintDTO = {
      requestId: 'your-request-id', // 실제 요청 ID로 설정
      prompt: option // 사용자가 입력한 프롬프트
    }

    formData.append(
      'imageInpaintDTO',
      new Blob([JSON.stringify(imageInpaintDTO)], { type: 'application/json' })
    )

    try {
      // axios를 사용하여 서버로 데이터 전송
      const response = await axios.post(
        'https://your-server-url/inpaint',
        formData,
        {
          headers: {
            Authorization: `Bearer `, // 실제 인증 토큰으로 변경
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      // 서버 응답 처리
      setNewImageUrl(response.data.imageUrl) // 서버에서 받은 이미지 URL 설정
      setIsModalOpen(true) // 모달 열기
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsProcessing(false)
    }
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
