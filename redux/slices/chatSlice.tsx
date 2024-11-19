import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UserType = '사용자' | '챗봇'

export interface ChatMessage {
  id: string
  userType: UserType
  display: string
}

const initialState: ChatMessage[] = []

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.push(action.payload)
    },
    clearMessages: () => initialState,
    deleteMessage: (state, action: PayloadAction<string>) => {
      return state.filter(message => message.id !== action.payload)
    },
    editMessage: (state, action: PayloadAction<string[]>) => {
      let chatMessage = state.filter(
        message => message.id === action.payload[0]
      )
      if (chatMessage.length === 0) return
      chatMessage[0].display = action.payload[1]
    }
  }
})

export const { addMessage, clearMessages, deleteMessage, editMessage } =
  chatSlice.actions
export default chatSlice.reducer
