'use client'

import React from 'react'
import HTMLTypingEffect from './HTMLTypingEffect'

const TestTypingEffect: React.FC = () => {
  const htmlContent =
    '<p>씨앗이란 문자 또는 국내팩스 발송에 사용할 수 있는 &#x27;뿌리오&#x27;할인 상품입니다.</p>'

  const handleComplete = () => {
    console.log('타이핑 완료!')
  }

  return (
    <div className="relative mx-auto max-w-2xl prose">
      <HTMLTypingEffect
        htmlContent={htmlContent}
        speed={100}
        onComplete={handleComplete}
      />
    </div>
  )
}

export default TestTypingEffect
