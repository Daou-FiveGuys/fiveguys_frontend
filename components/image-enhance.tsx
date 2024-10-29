import React from 'react'

interface ImageEnhanceProps {
  imageId: string
}
const image = `/sampleImage3.jpg`;

export function ImageEnhance({ imageId }: ImageEnhanceProps) {
  const enhancedImageSrc = imageId

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2 text-black">보강된 이미지</h3>
      <img 
        src={image} 
        alt={"보강완료"} 
        className="w-full h-auto rounded-md mb-2"
      />
    </div>
  )
}
export function ReturnEnhanceImage(){
  return image
}