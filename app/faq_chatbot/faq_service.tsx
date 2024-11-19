import apiClient from '@/services/apiClient';
import { FaqResponse } from './faq_response';

export const api = {
    faqChatbotAsk: async (
      question: String
    ): Promise<FaqResponse|undefined> => {
      try {
        const response = await apiClient.post<CommonResponse<FaqResponse>>(`/chatbot/`,{
          message: question,
          ai_model_id: 0
        })
        
        const faqChatbotAnswer = response.data.data;
        if(response.data.code == 200 || response.data.code==404) return faqChatbotAnswer;

        return undefined;
      } catch(error) {
        return undefined
      }
    }
};

export interface CommonResponse<T> {
  code: number;
  message: string;
  data: T;
}