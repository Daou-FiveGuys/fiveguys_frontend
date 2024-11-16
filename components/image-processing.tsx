import React, { useEffect, useState } from 'react'
import * as fabric from 'fabric'
import ImageInpantMoal from './image-modal'
import ImageProcessingRequestSuccessModal from './image-confirm-modal'
import { useDispatch, useSelector } from 'react-redux'
import { setImageData } from '@/redux/slices/imageSlice'
import { RootState } from '@/redux/store'
import apiClient from '@/services/apiClient'

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
  const dispatch = useDispatch()
  const image = useSelector((state: RootState) => state.image)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null)
  const [newRequestId, setNewRequestId] = useState<string | null>(null)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [maskObjects, setMaskObjects] = useState<
    fabric.FabricObject<
      Partial<fabric.FabricObjectProps>,
      fabric.SerializedObjectProps,
      fabric.ObjectEvents
    >[]
  >([])

  const handleImageUpdate = (requestId: string, url: string) => {
    dispatch(setImageData({ requestId: requestId, url: url }))
  }

  useEffect(() => {
    if (!canvas || !isProcessing) return
    switch (mode) {
      case 'inpaint':
        handleSetMaskObjects()
        sendImageForInpainting()
        break
      case 'removeText':
      case 'upscale':
        sendImageRequestId(mode === 'removeText' ? '/remove-text' : '/upscale')
        break
    }
    setShowProcessingModal(true)

    const timer = setTimeout(() => {
      setShowProcessingModal(false)
    }, 3000) // 3초 동안 처리 완료 모달 표시

    return () => clearTimeout(timer) // 타이머 정리
  }, [canvas, isProcessing, setIsProcessing])

  const handleSetMaskObjects = () => {
    if (!canvas) return
    setMaskObjects([])
    canvas.getObjects().map(obj => {
      if (obj.visible) {
        setMaskObjects(prev => [...prev, obj])
      }
    })
  }

  const applyNewImage = () => {
    if (!canvas) return
    if (newImageUrl) {
      fabric.FabricImage.fromURL(newImageUrl, {
        crossOrigin: 'anonymous'
      }).then(img => {
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
    dispatch(setImageData({ requestId: newRequestId, url: newImageUrl }))
    if (mode === 'inpaint')
      canvas.getObjects().forEach(obj => {
        if (maskObjects.some(mask => obj === mask)) canvas.remove(obj)
      })
    canvas.renderAll()
    setIsModalOpen(false) // 최종 모달 닫기
  }

  const cancelNewImage = () => {
    setNewRequestId(null)
    setNewImageUrl(null)
    setIsModalOpen(false)
  }

  const sendImageRequestId = async (url: string) => {
    // 필요한 조건 체크: canvas가 존재하고 처리 중일 때만 요청
    if (!canvas || !isProcessing) return

    const ImageRequestDTO = {
      requestId: image.requestId
    }

    try {
      // POST 요청 전송
      const response = await apiClient.post(`${url}`, ImageRequestDTO, {
        headers: {
          Authorization: `Bearer `, // 실제 인증 토큰으로 변경
          'Content-Type': 'application/json'
        }
      })

      // 응답 데이터 처리
      if (response.data.code === 200) {
        setNewRequestId(response.data.data.requestId)
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
    if (!canvas || !isProcessing || !canvas.backgroundImage) return

    // 복제할 캔버스를 생성
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

    // 배경 이미지를 제거하고 배경색을 검은색으로 설정
    const originalBackgroundImage = canvas.backgroundImage
    const originalBackgroundColor = canvas.backgroundColor

    canvas.backgroundImage = undefined
    canvas.backgroundColor = 'black'

    // 모든 객체의 원래 색상과 좌표 저장
    const originalStrokeColors = canvas
      .getObjects()
      .map(obj => obj.stroke as string)
    const originalFillColors = canvas
      .getObjects()
      .map(obj => obj.fill as string)
    const originalPositions = canvas.getObjects().map(obj => ({
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY
    }))

    // 모든 객체의 외곽선을 흰색으로, 내부 채우기를 검정색으로 변경
    canvas.getObjects().forEach(obj => {
      obj.set({
        stroke: 'white',
        fill: 'black',
        left: obj.left * scaleX,
        top: obj.top * scaleY,
        scaleX: obj.scaleX * scaleX,
        scaleY: obj.scaleY * scaleY
      })
      obj.setCoords()
    })

    canvas.renderAll() // 변경 사항 렌더링

    // 마스크 이미지 추출
    const imageData = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1,
      enableRetinaScaling: false
    })

    // 배경 이미지와 색상, 객체의 원래 색상 복원
    canvas.backgroundImage = originalBackgroundImage
    canvas.backgroundColor = originalBackgroundColor
    canvas.getObjects().forEach((obj, index) => {
      obj.set({
        stroke: originalStrokeColors[index],
        fill: originalFillColors[index],
        left: originalPositions[index].left,
        top: originalPositions[index].top,
        scaleX: originalPositions[index].scaleX,
        scaleY: originalPositions[index].scaleY
      })
      obj.setCoords()
    })

    canvas.setWidth(originalWidth) // 캔버스 크기 복원
    canvas.setHeight(originalHeight)
    canvas.renderAll() // 원래 상태로 다시 렌더링

    // 이미지 데이터를 Blob 형식으로 변환
    const blob = await fetch(imageData).then(res => res.blob())

    // FormData 생성
    const formData = new FormData()
    formData.append('multipartFile', blob, 'canvas_image.png')

    const imageInpaintDTO = {
      requestId: image.requestId, // 실제 요청 ID로 설정
      prompt: option, // 사용자가 입력한 프롬프트,
      width: canvas.backgroundImage?.width,
      height: canvas.backgroundImage?.height
    }

    formData.append(
      'imageInpaintDTO',
      new Blob([JSON.stringify(imageInpaintDTO)], { type: 'application/json' })
    )

    try {
      // axios를 사용하여 서버로 데이터 전송
      const response = await apiClient.post('/inpaint', formData, {
        headers: {
          Authorization: `Bearer `, // 실제 인증 토큰으로 변경
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.code === 200) {
        setNewRequestId(response.data.data.requestId)
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
