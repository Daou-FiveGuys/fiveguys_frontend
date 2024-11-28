export enum ReservationState {
    DIRECT = "DIRECT",
    NOTYET = "NOTYET",
    DONE = "DONE",
    CANCEL = "CANCEL",
  }
  
  export enum MessageType {
    SMS = "SMS",
    MMS = "MMS",
    LMS = "LMS",
  }
  
  export interface Reservation {
    reservationId: number;
    sendTime: string;
    state: ReservationState;
    messageHistory: MessageHistory;
  }
  
  export interface MessageHistory {
    messageHistoryId: number;
    sendImage: SendImage | null;
    fromNumber: string;
    messageType: MessageType;
    subject: string;
    content: string;
    createdAt: string;
    contact2s: Contact2[];
    messageKey: string;
  }
  
  export interface SendImage {
    sendImageId: number;
    url: string;
  }
  
  export interface Contact2 {
    contactId: number;
    name: string;
    telNum: string;
    one: string;
    two: string;
    three: string;
    four: string;
    five: string;
    six: string;
    seven: string;
    eight: string;
  }
  
  export function getState(state: ReservationState): string {
    switch(state) {
      case ReservationState.DIRECT: return "전송 완료"
      case ReservationState.NOTYET: return "전송 대기"
      case ReservationState.DONE: return "전송 완료"
      case ReservationState.CANCEL: return "예약 취소"
    }
  }
  
  