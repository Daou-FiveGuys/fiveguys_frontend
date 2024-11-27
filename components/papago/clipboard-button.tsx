// CopyButton.tsx
import React, { useState } from 'react'
import { Clipboard, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CopyButtonProps {
  textToCopy: string
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(textToCopy)
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

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-8 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
      onClick={copyToClipboard}
      aria-label="복사하기"
    >
      {/* Clipboard 아이콘 */}
      <Clipboard
        className={`h-4 w-4 absolute transition-opacity duration-300 ${
          isCopied ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {/* ClipboardCheck 아이콘 */}
      <ClipboardCheck
        className={`h-4 w-4 absolute transition-opacity duration-300 ${
          isCopied ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </Button>
  )
}

export default CopyButton
