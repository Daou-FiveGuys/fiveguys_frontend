import React from 'react'

interface ImageEnhanceProps {
  enhancedImageSrc: string
}
var random = 1;
export function ImageEnhance({ enhancedImageSrc }: ImageEnhanceProps) {

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2 text-black">보강된 이미지</h3>
      <img 
        src={enhancedImageSrc} 
        alt={"보강완료"} 
        className="w-full h-auto rounded-md mb-2"
      />
    </div>
  )
}
export function ReturnEnhanceImage(){
  const image = `/sampleImage${random}.jpg`;
  random++;
  if(random==5)random=1;
  return image
}