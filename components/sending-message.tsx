'use client'
//그룹이면 샘플데이터에서 그룹 확인 후 전달. 그룹아니면 전화번호 존재 여부 없이 전화번호 전달.
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'

interface SendingMessageProps {
  recipient: string;
  isGroup: boolean;
  onAddPhoneNumber: (phoneNumber: string) => void;
  currentImageUrl: string;
  lastCreatedMessage: string;
}

export function SendingMessage({ recipient, isGroup, lastCreatedMessage, currentImageUrl, onAddPhoneNumber }: SendingMessageProps) {
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isValidPhoneNumber = (input: string) => /^\d{11}$/.test(input);

  // 샘플 데이터 생성 (그룹 정보 포함)
  const sampleData = [
    { groupName: '가족', name: '홍길동', phone: '01012345678' },
    { groupName: '가족', name: '김철수', phone: '01087654321' },
    { groupName: '친구', name: '이영희', phone: '01011112222' },
    { groupName: '직장', name: '박민수', phone: '01033334444' },
  ];

  // recipient에 해당하는 전화번호 찾기
  const phoneNumberToSend = isGroup
    ? sampleData.find(item => item.groupName === recipient)?.phone || ''
    : isValidPhoneNumber(recipient) ? recipient : '';

  useEffect(() => {
    const sendMessage = async () => {
      if (!phoneNumberToSend) {
        setSendingStatus('error')
        setErrorMessage('유효한 전화번호가 없습니다.')
        return
      }

      setSendingStatus('sending')
      try {
        const response = await axios.post('/api/send-message', {
          recipient: phoneNumberToSend,
          message: lastCreatedMessage,
          imageUrl: currentImageUrl
        })
        if (response.status === 200) {
          setSendingStatus('success')
        } else {
          throw new Error('메시지 전송에 실패했습니다')
        }
      } catch (error) {
        setSendingStatus('error')
        setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
      }
    }

    sendMessage()
  }, [phoneNumberToSend, lastCreatedMessage, currentImageUrl])

  if (sendingStatus === 'sending') {
    return <div className="mt-2 p-4 bg-gray-100 rounded-md">메시지를 전송 중입니다...</div>
  }

  if (sendingStatus === 'error') {
    return (
      <div className="mt-2 p-4 bg-red-100 rounded-md">
        <h3 className="text-lg font-semibold mb-2 text-red-600">메시지 전송 실패</h3>
        <p>{errorMessage}</p>
      </div>
    )
  }

  if (isGroup) {
    return (
      <div className="mt-2 p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-semibold mb-2">그룹 메시지 전송 완료</h3>
        <p><strong>그룹명:</strong> {recipient}</p>
        <p>그룹 내 연락처로 메시지가 성공적으로 전송되었습니다.</p>
        {phoneNumberToSend && <p><strong>전송된 전화번호:</strong> {phoneNumberToSend}</p>}
      </div>
    )
  } else {
    return (
      <div className="mt-2 p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-semibold mb-2">메시지 전송 완료</h3>
        <p><strong>수신자:</strong> {recipient}</p>
        <p>메시지가 성공적으로 전송되었습니다.</p>
        <h5>{lastCreatedMessage}</h5>
        {currentImageUrl && <img src={currentImageUrl} alt="전송된 이미지" className="mt-2 max-w-full h-auto" />}
        {!isValidPhoneNumber(recipient) && (
          <Button onClick={() => onAddPhoneNumber(recipient)} className="mt-4">
            전화번호 추가
          </Button>
        )}
      </div>
    )
  }
}
