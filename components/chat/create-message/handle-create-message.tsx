import { ButtonType } from '@/components/prompt-form'
import ChatUtils from '../utils/ChatUtils'
import MessageOptionUtils from '../utils/MessageOptionUtils'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { MessageOptionState } from '@/redux/slices/messageOptionSlice'
import apiClient from '@/services/apiClient'
import { CreateMessageProcessType } from './create-message'

const buttonType: ButtonType = 'create-message'

export const handleCreateMessage = (
  value: string,
  setActiveButton: (value: ButtonType) => void,
  messageOption: MessageOptionState,
  currentProcess: CreateMessageProcessType,
  setCurrentProcess: (currentProcess: CreateMessageProcessType) => void,
  setIsDone: (isOpen: boolean) => void // 모달 띄우기 위해서.
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
    case 'done':
      handleNextLevel()
      break
    case 'done-ai':
      handleNextLevelAI()
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
          `전송하고자 하는 문자 내용을 입력해주세요!`
        )
        setCurrentProcess('message-input')
        break
      case '자동':
        ChatUtils.addChat(
          'create-message',
          'assistant-animation-html',
          `전송하고자 하는 문자의 내용을 간략히 입력해주세요! 🧙🏿‍♂️`
        )
        setCurrentProcess('message-generate')
        break
      default:
        exceptionHandler('다시 시도해주세요')
        break
    }
  }

  function handleMessageInput() {
    switch (value) {
      case '직접':
      case '자동':
      case '수정':
      case '재생성':
        exceptionHandler('다시 시도해주세요')
        break
      //2. 전송 입력 후 전송 프로세스
      default:
        MessageOptionUtils.addContent(value)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 문자는 다음과 같아요!</div><div><div style="margin-top: 12px; font-size: 16px; font-weight: 500;">${value}</div><ul><li><strong>수정</strong>을 원하시면 <strong><span style="color: #f838a8;">수정</span></strong>을 입력해주세요</li><li><strong>다음 단계</strong>는 <strong><span style="color: #34d399;">다음</span></strong>을 입력해주세요.</li><li><strong>전송</strong>을 원하시면 <strong><span style="color: #fbbf24;">전송</span></strong>을 입력해주세요.</li></ul></div>`
        )
        setCurrentProcess('done')
        break
    }
  }

  function handleNextLevel() {
    switch (value) {
      case '수정':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>수정하고자 하는 메시지를 입력해주세요</div>`
        )
        setCurrentProcess('edit')
        break
      case '다음':
        ChatUtils.addChat(
          buttonType,
          'assistant',
          `<div>문자 생성이 완료되었습니다 👏🏻</div>`
        )
        setCurrentProcess('welcome')
        setActiveButton('create-image-prompt')
        break
      case '전송':
        setIsDone(true) // 모달을 열기 위해 setSendModal을 호출합니다.
        setCurrentProcess('welcome')
        break
      //2. 전송 입력 후 전송 프로세스
      default:
        MessageOptionUtils.addContent(value)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 문자는 다음과 같아요!</div><div><div style="margin-top: 12px; font-size: 16px; font-weight: 500;">${value}</div><ul><li>수정을 원하시면 <span style="color: #f838a8;">수정</span>을 입력해주세요</li><li><strong>전송</strong>을 원하시면 <strong><span style="color: #fbbf24;">전송</span></strong>을 입력해주세요.</li><li>다음 단계는 <span style="color: #34d399;">다음</span>을 입력해주세요.</li></ul></div>`
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
            `<div>생성된 문자는 다음과 같아요!</div><div><div style="margin-top: 12px; font-size: 16px; font-weight: 500;">${res.data.data}</div><ul><li><div><strong>수정</strong>을 원하시면 <strong><span style="color: #f838a8">수정</span></strong>을 입력해주세요</div></li><li><div><strong>다시 생성</strong>은<strong><span style="color: #38bdf8"> 재생성</span></strong>을 입력해주세요</div></li><li><strong>전송</strong>을 원하시면 <strong><span style="color: #fbbf24;">전송</span></strong>을 입력해주세요.</li><li><div><strong>다음 단계</strong>는<strong><span style="color: #34d399"> 다음</span></strong>을 입력해주세요</div></li></ul></div></ul></div>`
          )
          ChatUtils.editIsTyping(id, true)
          setCurrentProcess('done-ai')
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
          '오류가 발생했습니다. 전송하고자 하는 문자 내용을 다시 입력해주세요'
        )
        ChatUtils.editIsTyping(buttonType, false)
        setCurrentProcess('message-generate')
      })
  }

  function handleMessageGenerate() {
    switch (value) {
      case '직접':
      case '자동':
      case '수정':
      case '재생성':
        exceptionHandler('다시 시도해주세요')
        break
      default:
        callGenerateMessage()
        break
    }
  }

  function handleNextLevelAI() {
    switch (value) {
      case '재생성':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `전송하고자 하는 문자의 내용을 간략히 입력해주세요! 🧙🏿‍♂️`
        )
        setCurrentProcess('message-generate')
        break
      case '수정':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>수정하고자 하는 메시지를 입력해주세요</div>`
        )
        setCurrentProcess('edit')
        break
      case '다음':
        ChatUtils.addChat(
          buttonType,
          'assistant',
          `<div>문자 생성이 완료되었습니다</div>`
        )
        setCurrentProcess('welcome')
        setActiveButton('create-image-prompt')
        break
      case '전송':
        setIsDone(true)
        setCurrentProcess('welcome')
        break
      default:
        exceptionHandler('다시 시도해주세요')
        break
    }
  }

  function handleEdit() {
    switch (value) {
      case '수정':
      case '다음':
      case '재생성':
      case '전송':
        exceptionHandler('다시 시도해주세요')
        break

      default:
        MessageOptionUtils.addContent(value)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',

          currentProcess === 'message-generate' || currentProcess === 'done-ai'
            ? `<div>입력하신 문자는 다음과 같아요!</div><div><div style="margin-top: 12px; font-size: 16px; font-weight: 500;">${value}</div><ul><li><strong>수정</strong>을 원하시면 <strong><span style="color: #f838a8;">수정</span></strong>을 입력해주세요</li><li><strong>전송</strong>을 원하시면 <strong><span style="color: #fbbf24;">전송</span></strong>을 입력해주세요.</li><li><strong>다음 단계</strong>는 <strong><span style="color: #34d399;">다음</span></strong>을 입력해주세요.</li></ul></div>`
            : `<div>수정된 내용은 다음과 같아요!</div><div><div style="margin-top: 12px; font-size: 16px; font-weight: 500;">${value}</div><ul><li><div><strong>수정</strong>을 원하시면 <strong><span style="color: #f838a8">수정</span></strong>을 입력해주세요</div></li><li><strong>전송</strong>을 원하시면 <strong><span style="color: #fbbf24;">전송</span></strong>을 입력해주세요.</li><li><div><strong>다음 단계</strong>는<strong><span style="color: #34d399"> 다음</span></strong>을 입력해주세요</div></li></ul></div>`
        )
        currentProcess === 'message-generate' || currentProcess === 'done-ai'
          ? setCurrentProcess('done-ai')
          : setCurrentProcess('done')
        break
    }
  }

  function exceptionHandler(value: string) {
    ChatUtils.addChat('create-message', 'assistant-animation', `${value}`)
  }
}
