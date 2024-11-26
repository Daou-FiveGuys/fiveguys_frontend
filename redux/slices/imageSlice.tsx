// store/imageSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ImageState {
  requestId: string | null
  url: string | null
}

const initialState: ImageState = {
  requestId: '33e08131-2b76-4787-b006-142e852f176d',
  url: 'https://fal.media/files/zebra/Qexi745cDCdp_A9dItfGA.png'
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
