import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CreateTextState {
  text: string;
}

const initialState: CreateTextState = {
  text: '',
}

const createTextSlice = createSlice({
  name: 'createText',
  initialState,
  reducers: {
    setText: (state, action: PayloadAction<{ text: string;}>) => {
      state.text = action.payload.text
    },
    clearText: (state) => {
      state.text = ''
    },
  },
})

export const { setText, clearText } = createTextSlice.actions
export default createTextSlice.reducer
//createText: 문자 생성 완료 후 저장함.
