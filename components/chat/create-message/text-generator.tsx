import apiClient from '@/services/apiClient'

/**
 *
 * const result = await postTextGenerate('겨울 스키장 슬로프 이용권 할인')
 * console.log("Text : ", result)
 * @param message 프롬프트를 생성할 메세지
 */
export async function postTextGenerate(message: string): Promise<string> {
  try {
    const response = await apiClient.post('/ai/gpt/generate-text', {
      text: message
    })
    if (response.data) {
      return response.data.data
    } else {
      console.error('Generated Text not found in response')
      return response.data
    }
  } catch (error) {
    console.error('Error generating text:', error)
    return ''
  }
}
