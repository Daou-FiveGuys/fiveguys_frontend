'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SentMessages } from './history-panel'
import MessageOptionUtils from '../utils/MessageOptionUtils'
import ImageUtils from '../utils/ImageUtils'
import { useRouter } from 'next/navigation'
import { Separator } from '@radix-ui/react-separator'
import AddressBookModal from '@/app/address/modal/select-contact-modal'

interface MessageCardModalProps {
  isOpen: boolean
  onClose: () => void
  message: SentMessages
  setIsSendModalOpen: (isOpen: boolean) => void// 모달 띄우기 위해서.
}

export default function MessageCardModal({
  isOpen,
  onClose,
  message,
  setIsSendModalOpen
}: MessageCardModalProps) {
  const [hovered, setHovered] = useState(false)

  const handleOpenImageInNewTab = () => {
    if(message.image === null)return;// null 값에 대한 예외처리.
    window.open(message.image, '_blank')
  }

  const router = useRouter()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="transition-all duration-500 ease-in-out"
        style={{
          opacity: isOpen ? 1 : 0,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)', // 중앙 정렬
          maxWidth: '400px', // 모달 최대 너비
          width: '100%', // 가로를 화면에 맞춤
          paddingBottom: '20px' // 아래쪽 여백
        }}
      >
        <div className="relative w-full flex justify-center mb-4">
          {/* 이미지에 대한 호버 효과 */}
          <div
            className="relative w-full"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="relative w-full h-0 pb-[100%]">
              {' '}
              {/* 정사각형 비율 유지 */}
              <img
                src={
                  message.image === null
                    ? 'https://i.pinimg.com/736x/01/7c/44/017c44c97a38c1c4999681e28c39271d.jpg'
                    : message.image
                }
                alt="Message image"
                className={`absolute top-0 left-0 w-full h-full rounded-md object-cover transition-all duration-300 ${
                  hovered ? 'filter brightness-50' : ''
                }`}
              />
            </div>

            {/* 호버 시 버튼 중앙에 배치 */}
            {hovered && (
              <Button
                variant="outline"
                className="absolute inset-0 m-auto flex justify-center items-center w-[200px] h-[50px] transition-opacity"
                onClick={handleOpenImageInNewTab}
              >
                다른 탭에서 보기
              </Button>
            )}
          </div>
        </div>

        {/* 제목과 내용 아래 배치 */}
        <DialogHeader>
          <DialogTitle>{message.title}</DialogTitle>
          <DialogDescription>{message.content}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex items-end justify-end">
            <Button variant="default" onClick={onClose}>
              닫기
            </Button>
            <Separator className="px-1" />
            {
              <Button
                className="bg-[rgb(31,111,186)]"
                onClick={() => {
                  
                  if (message.image !== null) {
                    // message.image가 있는 경우 동작
                    onClose();
                    ImageUtils.addImage(null, message.image);
                    MessageOptionUtils.addContent(message.content);
                    router.push('edit');
                  } else {
                    setIsSendModalOpen(true)
                }
              }
            }
              >
                재전송
              </Button>
            }
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
