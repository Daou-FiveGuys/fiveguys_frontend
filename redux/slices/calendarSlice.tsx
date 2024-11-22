// slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CalendarState {
  currentDate: string // ISO 형식
  selectedDate: string | null
}

export interface ChatState {
  activeChatId: string
  messages: Array<{ id: string; type: string; content: string }>
  calendar: CalendarState // 문자 내역 채팅방에서만 사용
}

const initialState: ChatState = {
  activeChatId: '',
  messages: [],
  calendar: {
    currentDate: new Date().toISOString(),
    selectedDate: null
  }
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat(state, action: PayloadAction<string>) {
      state.activeChatId = action.payload
    },
    updateCalendarDate(state, action: PayloadAction<string>) {
      state.calendar.selectedDate = action.payload
    },
    resetCalendar(state) {
      state.calendar = {
        currentDate: new Date().toISOString(),
        selectedDate: null
      }
    }
  }
})

export const { setActiveChat, updateCalendarDate, resetCalendar } =
  chatSlice.actions
export default chatSlice.reducer
