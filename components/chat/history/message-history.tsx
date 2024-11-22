'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MessageCard } from './message-card'
import { SentMessages } from './history-panel'

export function MessageHistory({
  sentMessages: sentMessages
}: {
  sentMessages: SentMessages[]
}) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const cardWidth = 300 // 카드의 너비
  const cardHeight = 400 // 카드의 높이
  const gap = 20 // 카드 간 간격
  const leftPadding = cardWidth / 2 // 첫 번째 카드 왼쪽 여백
  const rightPadding = cardWidth / 2 // 마지막 카드 오른쪽 여백

  useEffect(() => {
    const handleResize = () => {
      updateCardScales()
    }

    handleResize() // 초기 설정
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleScroll = () => {
    if (containerRef.current) {
      const container = containerRef.current
      const scrollLeft = container.scrollLeft
      const containerWidth = container.clientWidth

      const approximateIndex = Math.round(
        (scrollLeft + containerWidth / 2 - leftPadding) / (cardWidth + gap)
      )

      const validIndex = Math.max(
        0,
        Math.min(approximateIndex, sentMessages.length - 1)
      )

      setSelectedCardIndex(validIndex)

      if (scrollLeft <= leftPadding) {
        setSelectedCardIndex(0)
      }

      updateCardScales()
    }
  }

  const selectCard = (index: number) => {
    if (containerRef.current) {
      const container = containerRef.current
      const containerWidth = container.clientWidth

      const targetScrollLeft =
        index * (cardWidth + gap) +
        leftPadding -
        (containerWidth - cardWidth) / 2

      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      })
      setSelectedCardIndex(index)
    }
  }

  const updateCardScales = () => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.message-card')
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerCenter = containerRect.left + containerRect.width / 2

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect()
        const cardCenter = cardRect.left + cardRect.width / 2
        const distanceFromCenter = Math.abs(containerCenter - cardCenter)

        const scale = Math.max(0.8, 1 - distanceFromCenter / 500)
        ;(card as HTMLElement).style.transform = `scale(${scale})`
      })
    }
  }

  const handlePrevious = () => {
    const newIndex = Math.max(selectedCardIndex - 1, 0)
    selectCard(newIndex)
  }

  const handleNext = () => {
    const maxIndex = sentMessages.length - 1
    const newIndex = Math.min(selectedCardIndex + 1, maxIndex)
    selectCard(newIndex)
  }

  useEffect(() => {
    if (containerRef.current) {
      updateCardScales()
    }
  }, [])

  if (sentMessages.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto mt-4">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">발송된 문자가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  const isSingleCard = sentMessages.length === 1

  return (
    <div
      className="flex flex-col items-center w-full"
      style={{
        height: '100%' // 화면의 전체 높이에 맞추기
      }}
    >
      <div
        ref={containerRef}
        className={`relative w-full max-w-4xl overflow-x-auto ${
          isSingleCard ? 'justify-center' : 'justify-start'
        }`}
        style={{
          height: `${cardHeight}px`, // 카드 높이에 맞추기
          display: 'flex',
          alignItems: 'center',
          paddingLeft: isSingleCard ? 0 : `${leftPadding}px`,
          paddingRight: isSingleCard ? 0 : `${rightPadding}px`
        }}
        onScroll={handleScroll}
      >
        <div
          className={`flex ${isSingleCard ? 'justify-center' : 'space-x-5'}`}
          style={{
            width: `${
              isSingleCard
                ? cardWidth
                : sentMessages.length * (cardWidth + gap) +
                  leftPadding +
                  rightPadding
            }px`
          }}
        >
          {sentMessages.map((message, index) => (
            <div
              key={message.id}
              className="flex-shrink-0 message-card"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`, // 카드 높이 설정
                transition: 'transform 0.1s ease-out'
              }}
            >
              <MessageCard
                message={message}
                isSelected={index === selectedCardIndex}
                onSelect={() => selectCard(index)}
              />
            </div>
          ))}
        </div>
      </div>
      {!isSingleCard && (
        <div
          className="flex justify-center space-x-4"
          style={{
            marginTop: '10px' // 버튼 위쪽 간격만 추가
          }}
        >
          <Button
            onClick={handlePrevious}
            disabled={selectedCardIndex === 0}
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedCardIndex === sentMessages.length - 1}
            variant="outline"
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
