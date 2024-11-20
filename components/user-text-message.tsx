import { UserTextMessageApi } from './user-text-message-api'

interface UserTextMessageParams {
  message: string
  onCreatedMessage: (createdMessage: string) => void
  onCommunicationStatus: (success: boolean) => void
}

export async function userTextMessage({ 
  message, 
  onCreatedMessage, 
  onCommunicationStatus 
}: UserTextMessageParams): Promise<string> {
  try {
    const result = await UserTextMessageApi(message)
    if (result.isValid) {
      onCreatedMessage(result.text)
      onCommunicationStatus(true)
      return result.text
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : '알 수 없는 오류가 발생했습니다.'
      onCommunicationStatus(false)
      return errorMessage
    }
  } catch (error) {
    const errorMessage = '통신 중 오류가 발생했습니다.'
    onCommunicationStatus(false)
    return errorMessage
  }
}