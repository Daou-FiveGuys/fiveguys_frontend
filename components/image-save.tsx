'use client'

import React, { useState } from 'react'
import * as fabric from 'fabric'
import CustomImageModal from './image-method-modal'

interface SaveEditedImageProps {
  canvas: fabric.Canvas | null
  isDone: boolean
  setIsDone: React.Dispatch<React.SetStateAction<boolean>>
  onFileGenerated: (file: File, method: string) => void
}

const SaveEditedImageWithModal: React.FC<SaveEditedImageProps> = ({
  canvas,
  setIsDone,
  onFileGenerated
}) => {
  const [isModalOpen, setIsModalOpen] = useState(true)

  const handleOptionSelect = async (option: 'link' | 'image') => {
    setIsModalOpen(false)

    const imageData = canvas!.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1,
      enableRetinaScaling: true
    })

    if (option === 'image') {
      const compressedBlob = await resizeImage(imageData, 300 * 1024)
      const fileName = `edited_image_${new Date().toISOString()}.jpeg`
      const compressedFile = new File([compressedBlob], fileName, {
        type: 'image/png'
      })
      onFileGenerated(compressedFile, 'image')
    } else {
      const blob = dataURLToBlob(imageData)
      const fileName = `edited_image_${new Date().toISOString()}.jpeg`
      const originalFile = new File([blob], fileName, { type: 'image/png' })
      onFileGenerated(originalFile, 'link')
    }

    // 상태 초기화
    setIsDone(false)
  }

  const resizeImage = async (
    dataURL: string,
    maxSize: number
  ): Promise<Blob> => {
    let quality = 1.0
    let scaleFactor = 1.0
    let blob = dataURLToBlob(dataURL)

    // 압축 반복
    while (blob.size > maxSize && (quality > 0.05 || scaleFactor > 0.1)) {
      // 품질 감소
      if (quality > 0.05) {
        quality -= 0.05
      }

      // 배율 감소
      if (blob.size > maxSize * 1.5 && scaleFactor > 0.1) {
        scaleFactor -= 0.1
      }

      // HTML Canvas 생성 및 크기 조정
      const image = new Image()
      image.src = dataURL

      // Promise로 이미지 로드 완료 대기
      await new Promise(resolve => (image.onload = resolve))

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      canvas.width = image.width * scaleFactor
      canvas.height = image.height * scaleFactor

      // 크기 조정 후 다시 그림
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      // JPEG로 변환하여 크기 축소
      const resizedDataURL = canvas.toDataURL('image/jpeg', quality)
      blob = dataURLToBlob(resizedDataURL)
    }

    return blob
  }

  const dataURLToBlob = (dataURL: string): Blob => {
    const parts = dataURL.split(',')
    const byteString =
      parts[0].indexOf('base64') >= 0
        ? atob(parts[1])
        : decodeURIComponent(parts[1])
    const mimeString = parts[0].split(':')[1].split(';')[0]

    const array = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) {
      array[i] = byteString.charCodeAt(i)
    }

    return new Blob([array], { type: mimeString })
  }

  return (
    <>
      {isModalOpen && (
        <CustomImageModal
          onLinkSend={() => handleOptionSelect('link')}
          onImageSend={() => handleOptionSelect('image')}
          onClose={() => {
            setIsModalOpen(false)
            setIsDone(false)
          }}
        />
      )}
    </>
  )
}

export default SaveEditedImageWithModal
