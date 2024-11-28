import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState
} from 'react'
import { Button } from '@/components/ui/button'
import { ButtonType } from '@/components/prompt-form'
import ChatUtils from './../utils/ChatUtils'
import { handleCreateMessage } from './handle-create-message'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import MessageOptionUtils from '../utils/MessageOptionUtils'
import CancelProcessModal from '../cancel-process-modal'
import MessageCardModal from '../history/message-card-modal'
import AddressBookModal from '@/app/address/modal/select-contact-modal'
import SaveEditedImage from '@/components/image-save'
import SaveEditedImageWithModal from '@/components/image-save'
import CustomImageModal from '@/components/image-method-modal'
export interface CustomButtonHandle {
  handleEnterPress: (value: string) => void
}

interface CustomButtonProps {
  buttonType: ButtonType
  activeButton: ButtonType
  setActiveButton: (value: ButtonType) => void
}

export type CreateMessageProcessType =
  | 'welcome'
  | 'message-input'
  | 'message-generate'
  | 'done'
  | 'done-ai'
  | 'edit'
  | 'send'
  | 'done'
  | 'done-ai'
  | 'edit'

const CreateMessageButton = forwardRef<CustomButtonHandle, CustomButtonProps>(
  ({ buttonType, activeButton, setActiveButton }, ref) => {
    const isActive = buttonType === activeButton
    const [hasAddedChat, setHasAddedChat] = React.useState(false)
    const [lastUserInput, setLastUserInput] = React.useState<string | null>(
      null
    )
    const [currentProcess, setCurrentProcess] =
      useState<CreateMessageProcessType>('welcome')
    const messageOption = useSelector((state: RootState) => state.messageOption)
    const messages = useSelector(
      (state: RootState) => state.chat[buttonType].messages
    )
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSendModalOpen, setIsSendModalOpen] = useState(false)
    const image = useSelector((state: RootState) => state.image)

    React.useEffect(() => {
      if (ChatUtils.dispatch && !hasAddedChat && messages.length === 0) {
        setHasAddedChat(true)
        ChatUtils.addChat(
          buttonType,
          'assistant-animation-html',
          `<div>문자 전송을 도와드릴게요! 우선 전송할 내용을 정해볼까요? 🧐 <ul><li><div><strong><span>직접 입력</strong>은 <strong><span style="color: #34d399;">직접</span></strong>을 입력해주세요</div></li><li><div><strong><span>자동 생성</strong>은 <strong><span style="color: #38bdf8;">자동</span></strong>을 입력해주세요</div></li></ul></div>`
        )
      }
    }, [isActive, hasAddedChat, messages])

    useImperativeHandle(ref, () => ({
      handleEnterPress: (value: string) => {
        value = value.trim()
        if (value) {
          ChatUtils.addChat(buttonType, 'user', value)
          setLastUserInput(value)
        }

        setTimeout(() => {
          handleCreateMessage(
            value,
            setActiveButton,
            messageOption,
            currentProcess,
            setCurrentProcess,
            setIsDone
          )
        }, 100)
      }
    }))

    const handleButtonClick = () => {
      setIsModalOpen(true)
    }

    const handleConfirm = () => {
      setIsModalOpen(false)
      MessageOptionUtils.addContent('')
      MessageOptionUtils.addPrompt('')
      ChatUtils.clearChat(buttonType)
      ChatUtils.clearChat('create-image-prompt')
      ChatUtils.clearChat('image-generate')
      ChatUtils.clearChat('select-image')
      ChatUtils.clearChat('select-image-option')
      setActiveButton('create-message')
      setCurrentProcess('welcome')
      setHasAddedChat(false)
      ChatUtils.addChat(
        buttonType,
        'assistant-animation-html',
        `<div>문자 전송을 도와드릴게요! 우선 전송할 내용을 정해볼까요? 🧐 <ul><li><div><strong><span>직접 입력</strong>은 <strong><span style="color: #34d399;">직접</span></strong>을 입력해주세요</div></li><li><div><strong><span>자동 생성</strong>은 <strong><span style="color: #38bdf8;">자동</span></strong>을 입력해주세요</div></li></ul></div>`
      )
    }

    const handleCancel = () => {
      setIsSendModalOpen(false)
    }
    //addressBookModal 닫는 용도
    
    const [isDone, setIsDone] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [method, setMethod] = useState('')
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(true)
    //
    console.log(file)
    const handleFileGenerated = (generatedFile: File, method: string) => {
      setMethod('image')
      setIsSendModalOpen(true)
      setFile(generatedFile)
    }

    interface SaveEditedImageProps {
      isDone: boolean
      setIsDone: React.Dispatch<React.SetStateAction<boolean>>
      onFileGenerated: (file: File, method: string) => void
    }
    const SaveEditedImageWithModal: React.FC<SaveEditedImageProps> = ({
      setIsDone,
      onFileGenerated
    }) => {
  

      const handleOptionSelect = async (option: 'link' | 'image') => {
        setIsModalOpen(false)
        if(image.url === null)return;
        if (option === 'image') {
          
          const compressedBlob = await resizeImage(image.url, 300 * 1024)
          const fileName = `edited_image_${new Date().toISOString()}.jpeg`
          const compressedFile = new File([compressedBlob], fileName, {
            type: 'image/png'
          })
          handleFileGenerated(compressedFile, 'image')
        } else {
          const blob = dataURLToBlob(image.url)
          const fileName = `edited_image_${new Date().toISOString()}.jpeg`
          const originalFile = new File([blob], fileName, { type: 'image/png' })
          handleFileGenerated(originalFile, 'link')
        }
    
        // 상태 초기화
        setIsDone(false)
      }
  
      const dataURLToBlob = (dataURL: string): Blob => {
        const parts = dataURL.split(',')
        const byteString =
          parts[0].indexOf('base64') >= 0
            ? atob(parts[1])
            : decodeURIComponent(parts[1])
        const mimeString = parts[0].split(':')[1].split(';')[0]
    
        const array = new Uint8Array(byteString.length)
        for (let i = 0; i < byteString.length; i++) {
          array[i] = byteString.charCodeAt(i)
        }
    
        return new Blob([array], { type: mimeString })
      }
  
      const resizeImage = async (
        dataURL: string,
        maxSize: number
      ): Promise<Blob> => {
        if(dataURL === null)return new Blob();
        let quality = 1.0
        let scaleFactor = 1.0
        let blob = dataURLToBlob(dataURL)
    
        // 압축 반복
        while (blob.size > maxSize && (quality > 0.05 || scaleFactor > 0.1)) {
          // 품질 감소
          if (quality > 0.05) {
            quality -= 0.05
          }
    
          // 배율 감소
          if (blob.size > maxSize * 1.5 && scaleFactor > 0.1) {
            scaleFactor -= 0.1
          }
    
          // HTML Canvas 생성 및 크기 조정
          const image = new Image()
          image.src = dataURL
    
          // Promise로 이미지 로드 완료 대기
          await new Promise(resolve => (image.onload = resolve))
    
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
    
          canvas.width = image.width * scaleFactor
          canvas.height = image.height * scaleFactor
    
          // 크기 조정 후 다시 그림
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    
          // JPEG로 변환하여 크기 축소
          const resizedDataURL = canvas.toDataURL('image/jpeg', quality)
          blob = dataURLToBlob(resizedDataURL)
        }
        
    
        return blob
      }
    
      return (
        <>
          {isSaveModalOpen && (
            <CustomImageModal
              onLinkSend={() => handleOptionSelect('link')}
              onImageSend={() => handleOptionSelect('image')}
              onClose={() => {
                setIsSaveModalOpen(false)
                setIsDone(false)
              }}
            />
          )}
        </>
      )
    }
    //canvas 없는 버전으로 변형함.

    return (
      <>
        <Button
          className="w-full md:w-28 h-8 mb-2 md:mb-0"
          variant={isActive ? 'default' : 'outline'}
          onClick={handleButtonClick}
        >
          문자 생성
        </Button>
        {isModalOpen && (
          <CancelProcessModal
            isOpen={isModalOpen}
            onClose={handleCancel}
            onConfirm={handleConfirm}
          />
        )}        
        {
          isDone && (
            (!image.url && messageOption.title!==null && messageOption.content!==null) ? (
              <MessageCardModal
              message={{
              id: 0,
              title: messageOption.title,
              content: messageOption.content,
              image: null, 
              date: new Date(),
              }} 
              isOpen={isSendModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
              )
            : (
              <SaveEditedImageWithModal
              isDone={isDone}
              setIsDone={setIsDone}
              onFileGenerated={handleFileGenerated}/>
            )
          )
        }
        {/* 이미지가 있으면 편집창 처럼 나오게, 이미지 없으면 이미지 없는 상태로 전송 모달 */}
        {
          isSendModalOpen &&  (
          <AddressBookModal
            file={file} // null 적으면 전송하기 버튼 클릭 시 오류남.
            onClose={handleCancel}
            method={method}
          />
        )
        }
        {/* 링크, 사진으로 보내기 클릭 시 나오는 모달 */}
      </>
    )
  }
)

export default CreateMessageButton
