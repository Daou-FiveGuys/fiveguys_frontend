import axios from 'axios'
import apiClient from '@/services/apiClient'
import { ImageOption } from '@/redux/slices/imageOptionSlice'

interface ImageSource {
  requestId: string
  url: string
}
//response 형식

export async function postImageGenerate(
  imageOption: ImageOption,
  prompt: string,
  index: number,
): Promise<ImageSource> {
  let iR: ImageSource = {
    requestId: '',
    url: ''
  }
  try {
    let url: string = '/ai/image/generate-lora'
    if (imageOption.imageStyle == "mix") {
      url = '/ai/image/generate'
    }
    const response = await apiClient.post(url, {
      prompt: prompt,
      lora: imageOption.imageStyle,
      width: imageOption.width,
      height: imageOption.height,
      numInterfaceSteps: imageOption.numInferenceSteps,
      seed: index+1,
      cfg: imageOption.guidanceScale
    })
    if (response.data) {
      return response.data.data
    } else {
      console.error('Enhanced image source not found in response')
      return iR
    }
  } catch (error) {
    console.error('Error enhancing image:', error)
    return iR
  }
}
//이미지 초회차 생성
export async function reFetchImageSources(
  seed: string,
  prompt: string
): Promise<ImageSource[] | { error: string }> {
  try {
    const authorization =
      'eyJhbGciOiJIUzUxMiJ9.eyJhdXRoIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV0sInN1YiI6ImZpdmVndXlzXzZ1a2VlbUBnbWFpbC5jb20iLCJpYXQiOjE3MzE0MjE4MTMsImV4cCI6MzUzMTQyMTgxM30.Q225YzlXdWMr6-h0fVT1DAfDQDseJq76UgEPGBd1xQc6kUy_GpWpF1tqDg07gZWlKjeVOh5pROUoBTS3EShC4g'

    const response = await axios.get(
      `http://localhost:8080/api/v1/ai/image/${seed}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authorization}`
        }
      }
    )

    console.log(response.data)

    if (
      response.data &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
      return response.data
    } else {
      throw new Error('Invalid response data')
    }
  } catch (error) {
    console.error('Error fetching image sources:', error)
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}
//이미지 재생성
