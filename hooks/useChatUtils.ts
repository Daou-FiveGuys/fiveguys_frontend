import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import ChatUtils from '@/components/prompt-form'

export function useChatUtils() {
  const dispatch = useDispatch()

  useEffect(() => {
    ChatUtils.initialize(dispatch) // 여기서 dispatch를 초기화합니다.
  }, [dispatch])
}
