import React from 'react'
import { sampleData } from './message-image-history';


interface ImageGeneratorProps {
  selectedImage?: string
  createdMessage?: string  // 새로운 prop 추가
}
const sampleImages = [
  { id: '1', src: '/sampleImage1.jpg' },
  { id: '2', src: '/sampleImage2.jpg' },
  { id: '3', src: '/sampleImage3.jpg' },
  { id: '4', src: '/sampleImage4.jpg' }
]
export function ImageGenerator({ selectedImage, createdMessage }: ImageGeneratorProps) {

  // createdMessage 저장 기능 추가
  React.useEffect(() => {
    if (createdMessage) {
      console.log('Saving created message:', createdMessage);
      // 여기에 실제 저장 로직을 구현할 수 있습니다.
    }
  }, [createdMessage]);

  if (selectedImage) {
    const image = sampleImages.find(img => img.id === selectedImage)
    if (image) {
      return (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2 text-black">선택된 이미지</h3>
          <img 
            src={image.src} 
            alt={`Selected image ${image.id}`} 
            className="w-full h-auto rounded-md mb-2"
          />
          {createdMessage && (
            <p className="text-sm text-gray-600">관련 메시지: {createdMessage}</p>
          )}
        </div>
      )
    }
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2 text-black">생성된 이미지</h3>
      <div className="grid grid-cols-2 gap-2">
        {sampleImages.map((image) => (
          <div key={image.id} className="relative">
            <img 
              src={image.src} 
              alt={`Generated image ${image.id}`} 
              className="w-full h-auto rounded-md"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              {image.id}
            </div>
          </div>
        ))}
      </div>
      {createdMessage && (
        <p className="mt-2 text-sm text-gray-600">관련 메시지: {createdMessage}</p>
      )}
    </div>
  )
}

export function returnSeletedImage(value:string){
  if(value == '1'){
    return sampleImages[0].src
  }
  else if(value == '2'){
    return sampleImages[1].src
  }
  else if(value == '3'){
    return sampleImages[2].src
  }
  else{
    return sampleImages[3].src
  }
}