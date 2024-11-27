import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MessageOptionState {
  title: string | null
  content: string | null
  prompt: string | null
}

export const initialState: MessageOptionState = {
  title: null,
  content: null,
  prompt: null
}

const messageOption = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setMessage(state, action: PayloadAction<MessageOptionState>) {
      state.title = action.payload.title
      state.content = action.payload.content
      state.prompt = action.payload.prompt
    },
    setPrompt(state, action: PayloadAction<string | null>) {
      state.prompt = action.payload
    },
    setMessageOptionContent(state, action: PayloadAction<string | null>) {
      state.content = action.payload
    },
    clearTitle(state) {
      state.title = null
    },
    clearPrompt(state) {
      state.prompt = null
    },
    clearContent(state) {
      state.content = null
    }
  }
})

export const {
  setMessage,
  clearTitle,
  clearContent,
  clearPrompt,
  setMessageOptionContent,
  setPrompt
} = messageOption.actions
export default messageOption.reducer
