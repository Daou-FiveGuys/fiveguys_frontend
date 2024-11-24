'use client'

import React, { useEffect, useState } from 'react'
import * as fabric from 'fabric'

interface SaveEditedImageProps {
  canvas: fabric.Canvas | null
  isDone: boolean
  setIsDone: React.Dispatch<React.SetStateAction<boolean>>
  onFileGenerated: (file: File) => void // Callback prop
}

const SaveEditedImage: React.FC<SaveEditedImageProps> = ({
  canvas,
  isDone,
  setIsDone,
  onFileGenerated
}) => {
  useEffect(() => {
    if (!canvas || !isDone) return

    const imageData = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1,
      enableRetinaScaling: true
    })

    const blob = dataURLToBlob(imageData)
    const fileName = `edited_image_${new Date().toISOString()}.png`
    const generatedFile = new File([blob], fileName, { type: 'image/png' })

    onFileGenerated(generatedFile) // Notify parent
    setIsDone(false)
  }, [canvas, isDone, setIsDone, onFileGenerated])

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

  return null // No UI needed
}

export default SaveEditedImage
