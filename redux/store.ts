import { configureStore } from '@reduxjs/toolkit'
import imageReducer from './slices/imageSlice' // Image Slice

export const store = configureStore({
  reducer: {
    image: imageReducer // 새 Image Slice
  }
})

// RootState와 AppDispatch 타입 내보내기
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
