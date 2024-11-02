import React, { useState, useEffect } from 'react'
import { fetchImageSources } from './image-generator-api'

interface ImageGeneratorProps {
  selectedImage?: string
  createdMessage?: string
}

interface ImageData {
  id: string;
  src: string;
}

// 전역 변수로 initialImages 선언
let initialImages: ImageData[] = [
  { id: '1', src: '/sampleImage1.jpg' },
  { id: '2', src: '/sampleImage2.jpg' },
  { id: '3', src: '/sampleImage3.jpg' },
  { id: '4', src: '/sampleImage4.jpg' }
];

export async function showExistingImages(): Promise<boolean> {
  try {
    const result = await fetchImageSources();
    if (result === "error") {
      return false;
    }
    // 성공적으로 이미지를 받아온 경우 initialImages 업데이트
    initialImages = result.map((image, index) => ({
      id: (index + 1).toString(),
      src: image.src
    }));
    return true;
  } catch (error) {
    console.error('Error in showExistingImages:', error);
    return false;
  }
}

export function ImageGenerator({ selectedImage, createdMessage}: ImageGeneratorProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadImages() {
      setIsLoading(true);
      const success = await showExistingImages();
      if (success) {
        setImages(initialImages); // 업데이트된 initialImages 사용
        setError(null);
      } else {
        setError('Failed to load images');
      }
      setIsLoading(false);
    }
    loadImages();
  }, []);

  useEffect(() => {
    if (createdMessage) {
      console.log('Saving created message:', createdMessage)
    }
  }, [createdMessage]);

  if (isLoading) {
    return <div>Loading images...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (selectedImage) {
    const image = images.find(img => img.id === selectedImage)
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
        {images.map((image) => (
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

export function returnSelectedImage(value: string) {
  const image = initialImages.find(img => img.id === value);
  return image ? image.src : '';
}