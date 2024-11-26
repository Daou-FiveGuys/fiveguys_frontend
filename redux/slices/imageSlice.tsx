// store/imageSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ImageState {
  requestId: string | null
  url: string | null
}

const initialState: ImageState = {
  requestId: 'd63c7405-15c8-4eda-9939-f124afe3cb74',
  url: 'https://fal.media/files/panda/sWvbZ_f4jJjUGrV1sKf7g_ff1709e838fd41c6b018d68bc33f2ef9.jpg'
}

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImageData(state, action: PayloadAction<ImageState>) {
      state.requestId = action.payload.requestId
      state.url = action.payload.url
    },
    clearImageData(state) {
      state.requestId = null
      state.url = null
    }
  }
})

export const { setImageData, clearImageData } = imageSlice.actions
export default imageSlice.reducer
