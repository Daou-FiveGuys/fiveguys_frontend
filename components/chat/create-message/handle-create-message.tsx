import ChatUtils from '../utils/ChatUtils'

export const handleCreateMessage = (value: string) => {
  ChatUtils.addChat(
    'create-message',
    'assistant-animation-html',
    `<span style="color:blue">재호 화이팅</span>`
  )
}
