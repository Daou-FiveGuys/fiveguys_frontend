import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface TokenInquiryProps {
  tokenCount: number
}

export function TokenInquiry({ tokenCount }: TokenInquiryProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>토큰 조회</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-semibold">현재 보유 토큰: {tokenCount}개</p>
        <Link href="/token-recharge" passHref>
          <Button variant="outline" className="w-full">
            토큰 충전 페이지로 이동
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}