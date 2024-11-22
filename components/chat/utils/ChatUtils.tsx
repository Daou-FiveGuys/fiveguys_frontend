import { ButtonType } from '@/components/prompt-form'
import {
  addMessage,
  clearMessages,
  deleteMessage,
  editMessage,
  setIsTyping,
  UserType
} from '@/redux/slices/chatSlice'
import { nanoid } from 'nanoid'
import ReactDOMServer from 'react-dom/server'

/**
 * 채팅 기록 유지를 위한 static class
 *
 * if you wanna store Typing animation-text
 * => ChatUtils.addChat(`assistant-animation`, `string`)
 *
 * if you wanna store ReactNode
 * => ChatUtils.addChat(`UserType`, ChatUtils.reactNodeToString(`<BotCard>예시</BotCard>`))
 *
 * 🚨 DO NOT STORE REACTNODE AS "assistant-animation"
 */
export default class ChatUtils {
  static dispatch: Function | null = null

  static initialize(newDispatch: Function) {
    ChatUtils.dispatch = newDispatch
  }
  /**
   * 채팅 추가
   * React Component 바로 삽입 불가 내부 직렬화 함수를 이용하세요
   *
   * @param chatId : 채팅방 아이디 `ButtonType`
   * @param userType : `UserType`
   * @param text : `string` = 직렬화된 ReactNode
   * @returns `messageId` : `string` = 메시지 아이디
   */
  static addChat(chatId: ButtonType, userType: UserType, text: string) {
    if (!ChatUtils.dispatch) {
      throw new Error(
        'Dispatch is not initialized. Call ChatUtils.initialize() first.'
      )
    }

    const messageId = nanoid()
    ChatUtils.dispatch(
      addMessage({
        chatId: chatId,
        message: {
          id: messageId,
          text: text,
          userType: userType
        }
      })
    )
    if (userType === 'assistant-animation') {
      ChatUtils.dispatch(setIsTyping({ chatId, isTyping: true }))
    }
    return messageId
  }

  /**
   * 메시지 삭제
   * @param chatId 채팅방 ID
   * @param messageId 메시지 ID
   */
  static deleteChat(chatId: string, id: string) {
    if (!ChatUtils.dispatch) {
      throw new Error(
        'Dispatch is not initialized. Call ChatUtils.initialize() first.'
      )
    }
    ChatUtils.dispatch(deleteMessage({ chatId: chatId, messageId: id }))
  }

  /**
   * 메시지 삭제
   *
   * @param chatId 채팅 ID
   */
  static clearChat(chatId: string) {
    if (!ChatUtils.dispatch) {
      throw new Error(
        'Dispatch is not initialized. Call ChatUtils.initialize() first.'
      )
    }
    ChatUtils.dispatch(clearMessages({ chatId: chatId }))
  }

  /**
   * 메시지 수정
   *
   * @param chatId 채팅방 ID
   * @param messageId 메시지 ID
   * @param text 직렬화된 ReactNode
   */
  static editChat(chatId: string, messageId: string, text: string) {
    if (!ChatUtils.dispatch) {
      throw new Error(
        'Dispatch is not initialized. Call ChatUtils.initialize() first.'
      )
    }
    ChatUtils.dispatch(
      editMessage({ chatId: chatId, newText: text, messageId: messageId })
    )
  }

  /**
   * 리액트 컴포넌트 직렬화 함수
   *
   * @param node : ReactNode 리액트 컴포넌트
   * @returns string : 직렬화된 리액트 컴포넌트
   */
  static reactNodeToString(node: React.ReactNode): string {
    return ReactDOMServer.renderToString(node)
  }

  /**
   * 리액트 컴포넌트 역직렬화 함수
   *
   * @param htmlString : 직렬화된 리액트 컴포넌트
   * @returns ReactNode 리액트 컴포넌트
   */
  static stringToReactNode(htmlString: string): React.ReactNode {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  }
}