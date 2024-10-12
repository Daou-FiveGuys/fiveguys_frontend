import React from 'react'

interface ImageEnhanceProps {
  imageId: string
}

export function ImageEnhance({ imageId }: ImageEnhanceProps) {
  const enhancedImageSrc = `/placeholder.svg?height=300&width=300&text=Enhanced+Image+${imageId}`

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2 text-black">보강된 이미지</h3>
      <img 
        src={enhancedImageSrc} 
        alt={`Enhanced image ${imageId}`} 
        className="w-full h-auto rounded-md mb-2"
      />
    </div>
  )
}