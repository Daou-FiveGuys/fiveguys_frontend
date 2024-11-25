import apiClient from "@/services/apiClient"
import { addDays } from "date-fns";
import { format } from "date-fns/format"
import { ko } from "date-fns/locale/ko"
import { Dispatch, SetStateAction } from "react";

export interface AmountUsed {
    amountUsedId: number;       // AmountUsed ID
    msgScnt: number;            // 문자 발신 총 횟수
    msgGcnt: number;            // 문자 생성 총 횟수
    imgScnt: number;            // 이미지 발신 총 횟수
    imgGcnt: number;            // 이미지 생성 총 횟수
    dailyAmounts: DailyAmount[]; // 연결된 DailyAmount 리스트
    lastDate: string;           // 마지막 이미지 생성 일자 (ISO Date String)
  }
  
export interface DailyAmount {
    dailyAmountId: number;     // DailyAmount ID
    msgScnt: number;           // 문자 발신 총 횟수
    msgGcnt: number;           // 문자 생성 총 횟수
    imgScnt: number;           // 이미지 발신 총 횟수
    imgGcnt: number;           // 이미지 생성 총 횟수
    date: string;              // 일자 (ISO Date String)
  }

export interface CommonResponse<T> {
  code: number
  message: string
  data: T
}

export const api = { 
    readAmountUsed : async (setAmountUsed: Dispatch<SetStateAction<AmountUsed | undefined>>

    ) => {
        try {
            const response = await apiClient.get<CommonResponse<AmountUsed>>(`/amountUsed/`)
            
            let amountUsed = response.data.data;
            console.log(amountUsed) // TODO: 삭제할 것
            if(response.data.code == 200) {
              setAmountUsed(amountUsed)
              return
            }

            throw new Error('AmountUsed Not Found')
        } catch (error) {
        console.error('AmountUsed Not Found:', error)
        }
    },
    
    /**
     * const currentDate = new Date()
     */
    readDailyAmount : async (
      date: Date, setTodayInfo: Dispatch<SetStateAction<DailyAmount | undefined>>
    ) => {
        try {
          const formattedDate = format(date, 'yyyy-MM-dd', { locale: ko })
          const response = await apiClient.get<CommonResponse<DailyAmount>>(`/amountUsed/day/${formattedDate}`)
          let dailyAmount = response.data.data;
          console.log(dailyAmount) // TODO: 삭제할 것
          if(response.data.code == 200) {
              setTodayInfo(dailyAmount)
              return
          }
  
          throw new Error('DailyAmount Not Found')
        } catch (error) {
          console.error('DailyAmount Not Found:', error)
        }
    },

    readDailyAmountWeek: async (
      date: Date,
      setWeeklyData: Dispatch<SetStateAction<DailyAmount[]>>
    ) => {
      try {
        const dailyAmounts: DailyAmount[] = [];
        const formattedDate = format(date, 'yyyy-MM-dd', { locale: ko });
    
        for (let i = 0; i < 7; i++) {
          // 날짜를 하루씩 증가
          const currentDate = addDays(new Date(formattedDate), i);
          const currentFormattedDate = format(currentDate, 'yyyy-MM-dd', { locale: ko });
    
          // API 호출
          const response = await apiClient.get<CommonResponse<DailyAmount>>(`/amountUsed/day/${currentFormattedDate}`);
          
          // DailyAmount 객체 생성
          const dailyAmount = response.data.data || {
            dailyAmountId: -1,
            msgScnt: 0,
            msgGcnt: 0,
            imgScnt: 0,
            imgGcnt: 0,
            date: currentFormattedDate,
          };
    
          // 결과 배열에 추가
          dailyAmounts.push(dailyAmount);
        }
    
        // 최종 결과 업데이트
        setWeeklyData(dailyAmounts);
      } catch (error) {
        console.error('Error fetching weekly daily amounts:', error);
        setWeeklyData([]); // 에러가 발생하면 데이터 초기화
      }
    }    
}