// TranslationPopup.tsx
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { translateToEnglish, translateToKorean } from './papago-api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, ArrowLeftRight, Clipboard, ClipboardCheck } from 'lucide-react'
import CopyButton from './clipboard-button'

interface TranslationPopupProps {
  isOpen: boolean
  onClose: () => void
}

export const TranslationPopup: React.FC<TranslationPopupProps> = ({
  isOpen,
  onClose
}) => {
  const [isKoreanToEnglish, setIsKoreanToEnglish] = useState(true)
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const handleTranslate = async () => {
    try {
      const result = isKoreanToEnglish
        ? await translateToEnglish(inputText)
        : await translateToKorean(inputText)
      setTranslatedText(result)
    } catch (error) {
      console.error('Translation error:', error)
      setTranslatedText('번역 중 오류가 발생했습니다.')
    }
  }
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(translatedText)
      .then(() => {
        // You can add a toast notification here if desired
        console.log('Text copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
      })
  }

  const toggleTranslationDirection = () => {
    setIsKoreanToEnglish(!isKoreanToEnglish)
    setInputText('')
    setTranslatedText('')
  }

  const getTextAreaClassName = (text: string) => {
    const baseClass = 'w-full h-32 sm:h-40 p-2 border rounded-md resize-none'
    if (text.length > 500) return `${baseClass} text-xs`
    if (text.length > 300) return `${baseClass} text-sm`
    return `${baseClass} text-base`
  }


  const copyToClipboard2 = () => {
    navigator.clipboard
        .writeText(translatedText)
        .then(() => {
          setIsCopied(true)
          setTimeout(() => {
            setIsCopied(false)
          }, 1000)
        })
        .catch(err => {
          console.error('텍스트 복사 실패:', err)
        })
  }

  // 오버레이와 팝업을 포탈을 통해 렌더링
  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 z-50`}
    >
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative">
        {/* 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        {/* 제목 */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          번역기
        </h2>
        {/* 번역 입력 및 출력 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 입력 텍스트 */}
          <div className="flex-1">
            <Label
              htmlFor="input-text"
              className="mb-2 block text-gray-700 dark:text-gray-200"
            >
              {isKoreanToEnglish ? '한국어' : 'English'}
            </Label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                isKoreanToEnglish ? '한국어를 입력하세요' : 'Enter English text'
              }
              className={getTextAreaClassName(inputText)}
            />
          </div>
          {/* 번역된 텍스트 */}
          <div className="flex-1 relative">
            <Label
              htmlFor="translated-text"
              className="mb-2 block text-gray-700 dark:text-gray-200"
            >
              {isKoreanToEnglish ? 'English' : '한국어'}
            </Label>
            <textarea
              id="translated-text"
              value={translatedText}
              readOnly
              placeholder={
                isKoreanToEnglish ? 'Translated English' : '번역된 한국어'
              }
              className={getTextAreaClassName(translatedText)}
            />
            {/* 클립보드 복사 버튼 */}
            <CopyButton textToCopy={translatedText} copyToClipboard={copyToClipboard2}/>
          </div>
        </div>
        {/* 번역 방향 전환 및 번역 버튼 */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <span>{isKoreanToEnglish ? '한국어' : 'English'}</span>
            <Button
              variant="outline"
              size="icon"
              className="dark:border-zinc-600 dark:text-zinc-200"
              onClick={toggleTranslationDirection}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <span>{isKoreanToEnglish ? 'English' : '한국어'}</span>
          </div>
          <Button
            onClick={() => {
              if (inputText.trim().length !== 0) handleTranslate()
              setIsCopied(false)
            }}
            className="w-full sm:w-auto bg-zinc-700 hover:bg-zinc-800 text-white dark:bg-zinc-600 dark:hover:bg-zinc-500"
          >
            번역
          </Button>
        </div>
      </div>
    </div>,
    document.body // 포탈의 타겟을 body로 설정
  )
}

export default TranslationPopup
