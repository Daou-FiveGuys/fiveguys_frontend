import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const sampleTokenData = { username: "김철수", tokenCount: 150 }

export function TokenInquiry() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>토큰 조회</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">{sampleTokenData.username}</span>
          <span>남은 토큰: {sampleTokenData.tokenCount}개</span>
        </div>
        <Button variant="outline" className="w-full">
          토큰 충전
        </Button>
      </CardContent>
    </Card>
  )
}