import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'

export const useIsMessagesEmpty = (buttonType: string): boolean => {
  const messages = useSelector(
    (state: RootState) => state.chat[buttonType]?.messages || []
  )
  return messages.length === 0
}
