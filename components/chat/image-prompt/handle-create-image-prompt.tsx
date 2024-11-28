import { ButtonType } from '@/components/prompt-form'
import ChatUtils from '../utils/ChatUtils'
import MessageOptionUtils from '../utils/MessageOptionUtils'
import { MessageOptionState } from '@/redux/slices/messageOptionSlice'
import apiClient from '@/services/apiClient'
import { CreateImagePromptProcessType } from './image-prompt'

const buttonType: ButtonType = 'create-image-prompt'
export const handleCreateImagePrompt = (
  value: string,
  setActiveButton: (value: ButtonType) => void,
  messageOption: MessageOptionState,
  currentProcess: CreateImagePromptProcessType,
  setCurrentProcess: (currentProcess: CreateImagePromptProcessType) => void
) => {
  switch (currentProcess) {
    case 'welcome':
      handleWelcome()
      break
    case 'prompt-input':
      handleImagePromptInput()
      break
    case 'prompt-generate':
      handleImagePromptGenerate()
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
          'create-image-prompt',
          'assistant-animation-html',
          `직접 입력을 선택하셨습니다. 생성하고자 하는 이미지를 묘사해주세요 👨🏽‍🎨`
        )
        setCurrentProcess('prompt-input')
        break
      case '자동':
        handleImagePromptGenerate()
        setCurrentProcess('prompt-generate')
        break
      default:
        exceptionHandler('다시 시도해주세요')
        break
    }
  }

  function handleImagePromptInput() {
    switch (value) {
      case '직접':
      case '자동':
      case '수정':
      case '재생성':
        exceptionHandler('다시 시도해주세요')
        break
      default:
        MessageOptionUtils.addPrompt(value)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 프롬프트는 다음과 같아요!<div style="margin-top: 12px; font-size: 16px; font-weight: 500;">${value}</div><div/><ul><li><strong>수정</strong>을 원하시면 <strong><span style="color: #f838a8">수정</span></strong>을 입력해주세요</li><li><strong>다음 단계</strong>는<strong><span style="color: #34d399"> 다음</span></strong>을 입력해주세요</li></ul>`
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
          `<div>수정하고자 하는 프롬프트를 입력해주세요</div>`
        )
        setCurrentProcess('edit')
        break
      case '다음':
        ChatUtils.addChat(
          buttonType,
          'assistant',
          `<div>프롬프트 생성이 완료되었습니다. 👏🏻</div>`
        )
        setCurrentProcess('welcome')
        setActiveButton('image-generate')
        break
    }
  }

  function callGeneratePrompt() {
    const id = ChatUtils.addChat(
      buttonType,
      'assistant-animation',
      '프롬프트를 생성하고 있어요! 💭'
    )
    apiClient
      .post('/ai/gpt/generate-image-prompt', { text: messageOption.content })
      .then(res => {
        if (res.data.code === 200) {
          MessageOptionUtils.addPrompt(res.data.data)
          ChatUtils.editUserType(buttonType, id, 'assistant-animation-html')
          ChatUtils.editChat(
            buttonType,
            id,
            `<div>생성된 프롬프트는 다음과 같아요!<div style="margin-top: 12px; font-size: 16px; font-weight: 500;">${res.data.data}</div><div/><ul><li><strong>수정</strong>을 원하시면 <strong><span style="color: #f838a8">수정</span></strong></li>을 입력해주세요<li><div><strong>다시 생성</strong>은<strong><span style="color: #38bdf8"> 재생성</span></strong>을 입력해주세요</div></li><li><div><strong>다음 단계</strong>는<strong><span style="color: #34d399"> 다음</span></strong>을 입력해주세요</div></li></ul>`
          )
          ChatUtils.editIsTyping(id, true)
          setCurrentProcess('done-ai')
        } else {
          throw new Error()
        }
      })
      .catch(err => {
        MessageOptionUtils.addPrompt(null)
        ChatUtils.editIsTyping(buttonType, true)
        ChatUtils.editChat(
          buttonType,
          id,
          '오류가 발생했습니다. 아무키나 입력하여 다시 시도해주세요'
        )
        ChatUtils.editIsTyping(buttonType, false)
        setCurrentProcess('prompt-generate')
      })
  }

  function handleImagePromptGenerate() {
    callGeneratePrompt()
  }

  function handleNextLevelAI() {
    switch (value) {
      case '재생성':
        callGeneratePrompt()
        break
      case '수정':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>수정하고자 하는 프롬프트를 입력해주세요</div></div>`
        )
        setCurrentProcess('edit')
        break
      case '다음':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>프롬프트 생성이 완료되었습니다. 👏🏻</div>`
        )
        setCurrentProcess('welcome')
        setActiveButton('create-image-prompt')
        break
      default:
        exceptionHandler('다시 시도해주세요')
        break
    }
  }

  function handleEdit() {
    switch (value) {
      case '수정':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>수정하고자 하는 메시지를 입력해주세요</div>`
        )
        break
      case '다음':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>프롬프트 생성이 완료되었습니다. 👏🏻</div>`
        )
        setCurrentProcess('welcome')
        setActiveButton('image-generate')
        break
      default:
        MessageOptionUtils.addPrompt(value)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>다음 내용으로 수정되었습니다.<div style="margin-top: 12px; font-size: 16px;>${value}</div><div/><ul><li><strong>수정</strong>을 원하시면 <strong><span style="color: #f838a8">수정</span></strong>을 입력해주세요</li><li><strong>다음 단계</strong>는 <strong><span style="color: #34d399">다음</span></strong>을 입력해주세요</li></ul>`
        )
        break
    }
  }

  function exceptionHandler(value: string) {
    ChatUtils.addChat('create-image-prompt', 'assistant-animation', `${value}`)
  }
}
