import React from 'react'

interface ImageGeneratorProps {
  selectedImage?: string
}

export function ImageGenerator({ selectedImage }: ImageGeneratorProps) {
  const sampleImages = [
    { id: '1', src: '/placeholder.svg?height=200&width=200' },
    { id: '2', src: '/placeholder.svg?height=200&width=200' },
    { id: '3', src: '/placeholder.svg?height=200&width=200' },
    { id: '4', src: '/placeholder.svg?height=200&width=200' }
  ]

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
    </div>
  )
}