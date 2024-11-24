import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MessageOptionState {
  title: string | null
  content: string | null
  prompt: string | null
}

const initialState: MessageOptionState = {
  title: null,
  content: null,
  prompt: null
}

const messageOption = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setMessage(state, action: PayloadAction<MessageOptionState>) {
      state.title = action.payload.title
      state.content = action.payload.content
      state.prompt = action.payload.prompt
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

export const { setMessage, clearTitle, clearContent, clearPrompt } =
  messageOption.actions
export default messageOption.reducer
