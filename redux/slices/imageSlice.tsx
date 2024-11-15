// store/imageSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ImageState {
  requestId: string | null
  url: string | null
}

const initialState: ImageState = {
  requestId: 'e5c449c9-877b-4d33-9e7f-3a12ccb88964',
  url: 'https://fal.media/files/lion/P6e0ncdN6pP_35_yX6_ez_0c0ad928a6a34b8383c3b3bdb2ba1ecc.jpg'
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
