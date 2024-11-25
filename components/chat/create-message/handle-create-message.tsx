import { ButtonType } from '@/components/prompt-form'
import ChatUtils from '../utils/ChatUtils'

export const handleCreateMessage = (value: string, buttonType: ButtonType) => {
  ChatUtils.addChat(
    buttonType,
    'assistant-animation-html',
    `<span style="color:blue">재호 화이팅</span>`
  )
}
