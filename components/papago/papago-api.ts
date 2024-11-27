import apiClient from '@/services/apiClient'

export async function translateToEnglish(text: string): Promise<string> {
  try {
    const response = await apiClient.post('/translation', {
      text: text,
      source: 'ko', // 원본 언어 코드
      target: 'en' // 번역 대상 언어 코드
    })

    return response.data.data
  } catch (error) {
    console.error('Error translating to English:', error)
    throw new Error('Failed to translate to English')
  }
}

export async function translateToKorean(text: string): Promise<string> {
  try {
    const response = await apiClient.post('/translation', {
      text: text,
      source: 'en', // 원본 언어 코드
      target: 'ko' // 번역 대상 언어 코드
    })

    return response.data.data
  } catch (error) {
    console.error('Error translating to Korean:', error)
    throw new Error('Failed to translate to Korean')
  }
}
