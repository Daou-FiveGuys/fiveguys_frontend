import { configureStore } from '@reduxjs/toolkit'
import imageReducer from './slices/imageSlice' // Image Slice
import chatReducer from './slices/chatSlice'
import imageOptionReducer from './slices/imageOptionSlice'
import calendarReducer from './slices/calendarSlice'
import contact2Reducer from './slices/contactsSlice'

export const store = configureStore({
  reducer: {
    image: imageReducer,
    chat: chatReducer,
    imageOption: imageOptionReducer,
    calendar: calendarReducer,
    contact2: contact2Reducer
  }
})

// RootState와 AppDispatch 타입 내보내기
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
