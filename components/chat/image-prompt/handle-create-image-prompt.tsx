import { ButtonType } from '@/components/prompt-form'
import ChatUtils from '../utils/ChatUtils'
import MessageOptionUtils from '../utils/MessageOptionUtils'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
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
          `직접 입력을 선택하셨습니다. 생성하고자 하는 이미지를 묘사해주세요 🎨`
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
      case '수정':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 프롬프트는 다음과 같습니다<div><strong>${messageOption.content}</strong>수정하고자 하는 메시지를 입력해주세요</div></div>`
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
        setActiveButton('create-image-prompt')
        break
      default:
        MessageOptionUtils.addPrompt(value)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 프롬프트는 다음과 같습니다<div><strong>${value}</strong></div><div/>수정을 원하시면 <span style="color: #f838a8">수정</span>, 다음 단계는<span style="color: #34d399">다음</span>을 입력해주세요.</div></div>`
        )
        break
    }
  }

  function callGeneratePrompt() {
    const id = ChatUtils.addChat(
      buttonType,
      'assistant-animation',
      '프롬프트 생성하고 있어요! 💭'
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
            `<div>오래 기다리셨어요 생성된 프롬프트는 다음과 같아요!<div><strong>${res.data.data}</strong></div><div/>추가 수정을 원하시면 <span style="color: #f838a8">수정</span>, 다음 단계는<span style="color: #34d399">다음</span>을 입력해주세요.</div></div>`
          )
          ChatUtils.editIsTyping(id, true)
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
          '오류가 발생했습니다. 다시 시도해주세요'
        )
      })
  }

  function handleImagePromptGenerate() {
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
          `<div>입력하신 프롬프트는 다음과 같습니다<div><strong>${messageOption.content}</strong>수정하고자 하는 메시지를 입력해주세요</div></div>`
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
        callGeneratePrompt()
        break
    }
  }

  function handleEdit() {
    switch (value) {
      case '수정':
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>입력하신 프롬프트는 다음과 같습니다<div><strong>${messageOption.content}</strong>수정하고자 하는 메시지를 입력해주세요</div></div>`
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
          `<div>수정된 내용은 다음과 같습니다<div><strong>${value}</strong></div><div/>추가 수정을 원하시면 <span style="color: #f838a8">수정</span>, 다음 단계는<span style="color: #34d399">다음</span>을 입력해주세요.</div></div>`
        )
        break
    }
  }

  function exceptionHandler(value: string) {
    ChatUtils.addChat('create-image-prompt', 'assistant-animation', `${value}`)
  }
}
