import React, { useState, useEffect } from 'react'

interface ImageSaverProps {
  imageUrl: string;
  saveNum: number;
}

export function ImageSaver({ imageUrl, saveNum }: ImageSaverProps) {
  const [savedImages, setSavedImages] = useState<string[]>([]);

  useEffect(() => {
    setSavedImages(prevImages => [...prevImages, imageUrl]);
  }, [imageUrl]);

  return (
    <div className="bg-blue-100 p-4 rounded-md">
      <p className="font-medium text-blue-800">이미지가 저장되었습니다 (저장 번호: {saveNum}):</p>
      <img src={imageUrl} alt="Saved Image" className="mt-2 max-w-full h-auto" />
    </div>
  );
}