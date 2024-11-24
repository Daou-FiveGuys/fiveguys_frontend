'use client' // 클라이언트 컴포넌트로 선언

import React, { useEffect, useRef } from 'react'
import classNames from 'classnames'

interface HTMLTypingEffectProps {
  htmlContent: string // HTML 콘텐츠
  speed?: number // 한 글자당 출력 속도(ms)
  onComplete?: () => void // 타이핑 완료 시 호출될 콜백 함수
}

interface Instruction {
  type: 'open' | 'text' | 'close'
  char?: string
  tagName?: string
}

const HTMLTypingEffect: React.FC<HTMLTypingEffectProps> = ({
  htmlContent,
  speed = 50,
  onComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null) // 콘텐츠를 렌더링할 Ref
  const instructionsRef = useRef<Instruction[]>([]) // 명령어 리스트 캐싱
  const isTypingRef = useRef(false) // 현재 타이핑 중인지 확인

  useEffect(() => {
    if (!containerRef.current) return

    // DOMParser로 HTML 파싱 및 명령어 생성
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const elements = Array.from(doc.body.childNodes)

    const instructions: Instruction[] = []
    const traverse = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        instructions.push({
          type: 'open',
          tagName: (node as HTMLElement).tagName.toLowerCase()
        })
        Array.from(node.childNodes).forEach(traverse)
        instructions.push({
          type: 'close',
          tagName: (node as HTMLElement).tagName.toLowerCase()
        })
      } else if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || ''
        for (const char of textContent) {
          // 개행 문자 제거
          if (char !== '\n') {
            instructions.push({ type: 'text', char })
          }
        }
      }
    }

    elements.forEach(traverse)
    instructionsRef.current = instructions

    // 애니메이션 시작
    if (!isTypingRef.current) {
      isTypingRef.current = true
      startTyping()
    }
  }, [htmlContent])

  const startTyping = () => {
    if (!containerRef.current) return

    let currentInstructionIndex = 0
    const stack: HTMLElement[] = [containerRef.current]

    const typeEffect = () => {
      if (currentInstructionIndex >= instructionsRef.current.length) {
        isTypingRef.current = false // 타이핑 완료
        if (onComplete) onComplete()
        return
      }

      const instruction = instructionsRef.current[currentInstructionIndex]
      currentInstructionIndex += 1

      const parent = stack[stack.length - 1]

      if (instruction.type === 'open' && instruction.tagName) {
        const element = document.createElement(instruction.tagName)
        parent.appendChild(element)
        stack.push(element)
      } else if (instruction.type === 'text' && instruction.char) {
        if (parent.lastChild?.nodeType === Node.TEXT_NODE) {
          parent.lastChild.textContent += instruction.char
        } else {
          const textNode = document.createTextNode(instruction.char)
          parent.appendChild(textNode)
        }
      } else if (instruction.type === 'close' && instruction.tagName) {
        stack.pop()
      }

      setTimeout(typeEffect, speed)
    }

    typeEffect()
  }

  return (
    <div
      ref={containerRef}
      className={classNames('relative mx-auto max-w-2xl prose dark:prose-dark')}
      style={{ whiteSpace: 'pre-wrap' }}
    />
  )
}

export default HTMLTypingEffect
