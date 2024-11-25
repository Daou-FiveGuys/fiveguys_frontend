import { ButtonType } from '@/components/prompt-form'
import ChatUtils from '../utils/ChatUtils'
import MessageOptionUtils from '../utils/MessageOptionUtils'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { MessageOptionState } from '@/redux/slices/messageOptionSlice'
import apiClient from '@/services/apiClient'

export type CreateMessageProcessType =
  | 'welcome'
  | 'message-input'
  | 'message-generate'
  | 'edit'
let currentProcess: CreateMessageProcessType = 'welcome'
const buttonType: ButtonType = 'create-message'

export const handleCreateMessage = (
  value: string,
  setActiveButton: (value: ButtonType) => void,
  messageOption: MessageOptionState
) => {
  switch (currentProcess) {
    case 'welcome':
      handleWelcome()
      break
    case 'message-input':
      handleMessageInput()
      break
    case 'message-generate':
      handleMessageGenerate()
      break
    case 'edit':
      handleEdit()
      break
    default:
      exceptionHandler('다시 시도해주세요')
  }

  function handleWelcome() {
    switch (value) {
      case '직접':
        ChatUtils.addChat(
          'create-message',
          'assistant-animation-html',
          `직접 입력을 선택하셨습니다 메시지 입력해라`
        )
        currentProcess = 'message-input'
        break
      case '자동':
        ChatUtils.addChat(
          'create-message',
          'assistant-animation-html',
          `자동 입력을 선택하셨습니다 문장을 입력해주세요`
        )
        currentProcess = 'message-generate'
        break
      default:
        exceptionHandler('다시 시도해주세요')
        break
    }
  }

  function handleMessageInput() {
    switch (value) {
      case '수정':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 문자는 다음과 같습니다<div><strong>${messageOption.content}</strong>수정하고자 하는 메시지를 입력해주세요</div></div>`
        )
        currentProcess = 'edit'
        break
      case '다음':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>문자 생성이 완료되었습니다.<div><strong>${messageOption.content}</strong></div><div/></div></div>`
        )
        currentProcess = 'welcome'
        setActiveButton('create-image-prompt')
        break
      default:
        MessageOptionUtils.addContent(value)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 문자는 다음과 같습니다<div><strong>${value}</strong></div><div/>수정을 원하시면 <span style="color: #f838a8">수정</span>, 다음 단계는<span style="color: #34d399">다음</span>을 입력해주세요.</div></div>`
        )
        break
    }
  }

  function callGenerateMessage() {
    const id = ChatUtils.addChat(
      buttonType,
      'assistant-animation',
      '문자를 생성하고 있어요! 💭'
    )
    apiClient
      .post('/ai/gpt/generate-text', { text: value })
      .then(res => {
        if (res.data.code === 200) {
          MessageOptionUtils.addContent(res.data.data)
          ChatUtils.editUserType(buttonType, id, 'assistant-animation-html')
          ChatUtils.editChat(
            buttonType,
            id,
            `<div>오래 기다리셨어요 생성된 문자는 다음과 같아요!<div><strong>${res.data.data}</strong></div><div/>추가 수정을 원하시면 <span style="color: #f838a8">수정</span>, 다음 단계는<span style="color: #34d399">다음</span>을 입력해주세요.</div></div>`
          )
          ChatUtils.editIsTyping(id, true)
        } else {
          throw new Error()
        }
      })
      .catch(err => {
        MessageOptionUtils.addContent(null)
        ChatUtils.editIsTyping(buttonType, true)
        ChatUtils.editChat(
          buttonType,
          id,
          '오류가 발생했습니다. 다시 시도해주세요'
        )
      })
  }

  function handleMessageGenerate() {
    switch (value) {
      case '재생성':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `다시 입력해줘잉`
        )
        break
      case '수정':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 문자는 다음과 같습니다<div><strong>${messageOption.content}</strong>수정하고자 하는 메시지를 입력해주세요</div></div>`
        )
        currentProcess = 'edit'
        break
      case '다음':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>문자 생성이 완료되었습니다.<div><strong>${messageOption.content}</strong></div><div/></div></div>`
        )
        currentProcess = 'welcome'
        setActiveButton('create-image-prompt')
        break
      default:
        callGenerateMessage()
        break
    }
  }

  function handleEdit() {
    switch (value) {
      case '수정':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 문자는 다음과 같습니다<div><strong>${messageOption.content}</strong>수정하고자 하는 메시지를 입력해주세요</div></div>`
        )
        break
      case '다음':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>문자 생성이 완료되었습니다.<div><strong>${messageOption.content}</strong></div><div/></div></div>`
        )
        currentProcess = 'welcome'
        setActiveButton('create-image-prompt')
        break
      default:
        MessageOptionUtils.addContent(value)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>수정된 내용은 다음과 같습니다<div><strong>${value}</strong></div><div/>추가 수정을 원하시면 <span style="color: #f838a8">수정</span>, 다음 단계는<span style="color: #34d399">다음</span>을 입력해주세요.</div></div>`
        )
        break
    }
  }

  function exceptionHandler(value: string) {
    ChatUtils.addChat('create-message', 'assistant-animation', `${value}`)
  }
}
