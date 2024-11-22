'use client'
import MyPageForm from '@/components/mypage'
import apiClient from '@/services/apiClient'
import { useEffect, useState } from 'react'

export default function MyPage() {
  return (
    <main className="flex flex-col p-4">
      <MyPageForm />
    </main>
  )
}
