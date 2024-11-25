import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ImageStyle = 'waterColor' | 'cityPop' | 'mix'

export interface ImageOption {
  imageStyle: ImageStyle
  width: number
  height: number
  seed: number
  numInferenceSteps: number
  guidanceScale: number
}

export const initialState: ImageOption = {
  imageStyle: 'mix',
  width: 256,
  height: 256,
  guidanceScale: 3.5,
  seed: -1,
  numInferenceSteps: 28
}
const imageOptionSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setImageOption(state, action: PayloadAction<ImageOption>) {
      state.imageStyle = action.payload.imageStyle
      state.width = action.payload.width
      state.height = action.payload.height
      state.guidanceScale = action.payload.guidanceScale
      state.seed = action.payload.seed
      state.numInferenceSteps = action.payload.numInferenceSteps
    }
  }
})

export const { setImageOption } = imageOptionSlice.actions
export default imageOptionSlice.reducer
