// chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UserType =
  | 'user'
  | 'assistant-animation'
  | 'assistant-animation-html'
  | 'assistant'
  | 'normal'

export interface Message {
  id: string
  userType: UserType
  text: string
}

export interface ChatContext {
  messages: Message[]
  isTyping: boolean
}

export type ChatState = {
  [chatId: string]: ChatContext
}

const initialState: ChatState = {
  ['faq']: { messages: [], isTyping: false },
  ['history']: { messages: [], isTyping: false },
  ['usage']: { messages: [], isTyping: false },
  ['send-message']: { messages: [], isTyping: false },
  ['amount-used']: {messages: [], isTyping: false}
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>
    ) => {
      const { chatId, message } = action.payload
      if (!state[chatId]) {
        state[chatId] = { messages: [], isTyping: false }
      }
      state[chatId].messages.push(message)
      console.log(state[chatId].messages)
    },
    clearMessages: (state, action: PayloadAction<{ chatId: string }>) => {
      const { chatId } = action.payload
      if (state[chatId]) {
        state[chatId].messages = []
      }
    },
    deleteMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>
    ) => {
      const { chatId, messageId } = action.payload
      if (state[chatId]) {
        state[chatId].messages = state[chatId].messages.filter(
          message => message.id !== messageId
        )
      }
    },
    editMessage: (
      state,
      action: PayloadAction<{
        chatId: string
        messageId: string
        newText: string
      }>
    ) => {
      const { chatId, messageId, newText } = action.payload
      const chatContext = state[chatId]
      if (chatContext) {
        const message = chatContext.messages.find(
          message => message.id === messageId
        )
        if (message) {
          message.text = newText
        }
      }
    },
    setIsTyping: (
      state,
      action: PayloadAction<{ chatId: string; isTyping: boolean }>
    ) => {
      const { chatId, isTyping } = action.payload
      if (!state[chatId]) {
        state[chatId] = { messages: [], isTyping: false }
      }
      state[chatId].isTyping = isTyping
    },
    updateMessageUserType: (
      state,
      action: PayloadAction<{
        chatId: string
        messageId: string
        userType: UserType
      }>
    ) => {
      const { chatId, messageId, userType } = action.payload
      const chatContext = state[chatId]
      if (chatContext) {
        const message = chatContext.messages.find(
          message => message.id === messageId
        )
        if (message) {
          message.userType = userType
        }
      }
    }
  }
})

export const {
  addMessage,
  clearMessages,
  deleteMessage,
  editMessage,
  setIsTyping,
  updateMessageUserType
} = chatSlice.actions
export default chatSlice.reducer
