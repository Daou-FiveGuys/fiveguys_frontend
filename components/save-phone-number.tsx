import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface PhoneNumberData {
  name: string;
  phoneNumber: string;
  groupName: string;
}

interface SavePhoneNumberProps {
  phoneData: PhoneNumberData;
}

export function SavePhoneNumber({ phoneData }: SavePhoneNumberProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const savePhoneNumbers = async (data: PhoneNumberData) => {
    setSaveStatus('saving')
    try {
      const response = await axios.post('https://your-api-endpoint.com/save-phone-number', data)
      if (response.status === 200) {
        setSaveStatus('success')
      } else {
        throw new Error('전화번호 저장에 실패했습니다')
      }
    } catch (error) {
      setSaveStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    }
  }

  useEffect(() => {
    savePhoneNumbers(phoneData)
  }, [phoneData])

  return (
    <div className="mt-2 p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold mb-2">전화번호 정보</h3>
      <p><strong>이름:</strong> {phoneData.name}</p>
      <p><strong>전화번호:</strong> {phoneData.phoneNumber}</p>
      <p><strong>그룹:</strong> {phoneData.groupName}</p>
      
      {saveStatus === 'saving' && <p className="mt-2 text-blue-600">저장 중...</p>}
      {saveStatus === 'success' && <p className="mt-2 text-green-600">성공적으로 저장되었습니다!</p>}
      {saveStatus === 'error' && <p className="mt-2 text-red-600">오류: {errorMessage}</p>}
    </div>
  )
}