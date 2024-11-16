import React, { useState, useEffect } from 'react'
import { fetchImageSources, reFetchImageSources } from './image-generator-api'

interface ImageGeneratorProps {
  selectedImage?: string
  createdMessage?: string
  seed?:string
  onSuccess: (success: boolean) => void
}

interface ImageData {
  id: string;
  src: string;
}

let initialImages: ImageData[] = [
];

export function checkImageGenerationSuccess(
  lastCreatedMessage: string,
  selectedSeed: string,
  callback: (success: boolean) => void
) {
  return (
    <ImageGenerator
      createdMessage={lastCreatedMessage}
      seed={selectedSeed}
      onSuccess={callback}
    />
  );
}

export async function showExistingImages(prompt?: string, seed?: string): Promise<boolean> {
  try {
    const result = seed ? await reFetchImageSources(seed, prompt || '') : await fetchImageSources(prompt || '');
    if ('error' in result) {
      console.error(result.error);
      return false;
    }
    // 성공적으로 이미지를 받아온 경우 initialImages 업데이트
    if (Array.isArray(result)) {
      initialImages = result.map((image, index) => ({
        id: (index + 1).toString(),
        src: image.src
      }));
    }
    return true;
  } catch (error) {
    console.error('Error in showExistingImages:', error);
    return false;
  }
}

export function ImageGenerator({ selectedImage, createdMessage, seed }: ImageGeneratorProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadImages() {
      setIsLoading(true);
      const success = await showExistingImages(createdMessage,seed);
      if (success) {
        setImages(initialImages);
        setError(null);
      } else {
        setError('이미지를 불러오는데 실패했습니다');
      }
      setIsLoading(false);
      setRefreshKey(prevKey => prevKey + 1);
    }
    loadImages();
  }, [seed, createdMessage]);

  useEffect(() => {
    if (createdMessage) {
      console.log('생성된 메시지 저장:', createdMessage)
    }
  }, [createdMessage]);

  if (isLoading) {
    return <div>이미지 로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-500">오류: {error}</div>;
  }

  if (selectedImage) {
    const image = images.find(img => img.id === selectedImage)
    if (image) {
      return (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2 text-black">선택된 이미지</h3>
          <img 
            src={image.src} 
            alt={`선택된 이미지 ${image.id}`} 
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
              alt={`생성된 이미지 ${image.id}`} 
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
  console.log(image)
  return image ? image.src :'';
}