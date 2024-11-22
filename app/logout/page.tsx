'use client'
import apiClient from '@/services/apiClient'
import { deleteCookie } from '@/utils/cookies'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Logout() {
  const router = useRouter()

  useEffect(() => {
    apiClient
      .get('/oauth/logout')
      .then(res => {})
      .finally(() => {
        deleteCookie('access_token')
        router.push('/')
      })
  }, [])
  return <main className="flex flex-col p-4"></main>
}
