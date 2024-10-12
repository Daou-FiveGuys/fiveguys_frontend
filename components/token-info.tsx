import React from 'react'
import { Button } from "@/components/ui/button"

interface TokenInfoProps {
  tokenCount: number
}

export function TokenInfo({ tokenCount }: TokenInfoProps) {
  const handleTokenCharge = () => {
    // 토큰 충전 페이지로 이동하는 로직 구현
    console.log("토큰 충전 페이지로 이동")
  }

  return (
    <div className="bg-gray-700 text-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">토큰 정보</h2>
      <p className="mb-4">남은 토큰 개수: <span className="font-bold text-2xl">{tokenCount}</span></p>
      <Button onClick={handleTokenCharge} variant="secondary">
        토큰 충전 바로가기
      </Button>
    </div>
  )
}