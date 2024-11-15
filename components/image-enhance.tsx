import apiClient from '@/services/apiClient'
import axios from 'axios'

interface ImageEnhanceProps {
  enhancedImageSrc: string
}
var random = 1
export function ImageEnhance({ enhancedImageSrc }: ImageEnhanceProps) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2 text-black">보강된 이미지</h3>
      <img
        src={enhancedImageSrc}
        alt={'보강완료'}
        className="w-full h-auto rounded-md mb-2"
      />
    </div>
  )
}
export async function ReturnEnhanceImage(imageSrc: string): Promise<string> {
  try {
    const response = await apiClient.post(
      'https://your-api-endpoint.com/enhance',
      { image: imageSrc }
    )
    if (response.data && response.data.enhancedImageSrc) {
      return response.data.enhancedImageSrc
    } else {
      console.error('Enhanced image source not found in response')
      return ''
    }
  } catch (error) {
    console.error('Error enhancing image:', error)
    return ''
  }
}
