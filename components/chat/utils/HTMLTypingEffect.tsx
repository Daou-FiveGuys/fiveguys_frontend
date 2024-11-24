'use client'

import React, { useEffect, useRef } from 'react'

interface HTMLTypingEffectProps {
  htmlContent: string
  speed?: number
  onComplete?: () => void
}

interface Instruction {
  type: 'open' | 'text' | 'close'
  char?: string
  tagName?: string
  attributes?: { [key: string]: string }
}

const HTMLTypingEffect: React.FC<HTMLTypingEffectProps> = ({
  htmlContent,
  speed = 50,
  onComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const instructionsRef = useRef<Instruction[]>([])
  const isTypingRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    // DOMParser로 HTML 파싱 및 명령어 생성
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const elements = Array.from(doc.body.childNodes)

    const instructions: Instruction[] = []
    const traverse = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const attributes: { [key: string]: string } = {}
        Array.from(element.attributes).forEach(attr => {
          attributes[attr.name] = attr.value
        })
        // <a> 태그인 경우 target="_blank" 추가
        if (element.tagName.toLowerCase() === 'a') {
          attributes['target'] = '_blank'
        }
        instructions.push({
          type: 'open',
          tagName: element.tagName.toLowerCase(),
          attributes
        })
        Array.from(node.childNodes).forEach(traverse)
        instructions.push({
          type: 'close',
          tagName: element.tagName.toLowerCase()
        })
      } else if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || ''
        for (const char of textContent) {
          if (char !== '\n') {
            instructions.push({ type: 'text', char })
          }
        }
      }
    }

    elements.forEach(traverse)
    instructionsRef.current = instructions

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
        isTypingRef.current = false
        if (onComplete) onComplete()
        return
      }

      const instruction = instructionsRef.current[currentInstructionIndex]
      currentInstructionIndex += 1

      const parent = stack[stack.length - 1]

      if (instruction.type === 'open' && instruction.tagName) {
        const element = document.createElement(instruction.tagName)
        if (instruction.attributes) {
          Object.entries(instruction.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value)
          })
        }
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
      className="relative mx-auto max-w-2xl prose dark:prose-dark"
      style={{ whiteSpace: 'pre-wrap' }}
    />
  )
}

export default HTMLTypingEffect
