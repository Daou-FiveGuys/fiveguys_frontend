// PapagoPopup.tsx
import { Button } from '@nextui-org/button'
import React, { useEffect, useState } from 'react'
import { TranslationPopup } from './papago-pop-up-content'
import { ButtonType } from '../prompt-form'

interface PapagoPopupProps {
  activeButton: ButtonType
}
const PapagoPopup: React.FC<PapagoPopupProps> = ({ activeButton }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen)
  }

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (
      activeButton === 'send-message' ||
      activeButton === 'create-message' ||
      activeButton === 'create-image-prompt'
    )
      setIsVisible(true)
    else setIsVisible(false)
  }, [activeButton])

  return (
    <>
      <div
        className={`flex items-center space-x-2 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          animation: 'float 3s infinite ease-in-out'
        }}
      >
        <button
          onClick={togglePopup}
          className="relative rounded-full w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-800 shadow-md hover:shadow-lg transition-shadow duration-300"
          aria-label={isPopupOpen ? '번역기 닫기' : '번역기 열기'}
        >
          {/* 버튼 이미지 */}
          <img
            src="https://play-lh.googleusercontent.com/_QBOE9CjR52GCUysHKReJLY0f72Rrjvw4S1Po7iwgEEv1StW9AOb43TS5_Veid2rRA=w480-h960-rw"
            alt={isPopupOpen ? 'Close Translation' : 'Open Translation'}
            className="w-6 h-6"
          />
        </button>
        <TranslationPopup isOpen={isPopupOpen} onClose={togglePopup} />
      </div>
    </>
  )
}

export default PapagoPopup
