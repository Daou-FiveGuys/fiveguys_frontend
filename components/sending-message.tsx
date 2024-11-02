import React from 'react'
import { Button } from '@/components/ui/button'

interface SendingMessageProps {
  recipient: string;
  isGroup: boolean;
  onAddPhoneNumber: (phoneNumber: string) => void;
  currentImageUrl: string;
  lastCreatedMessage: string;
}

export function SendingMessage({ recipient, isGroup, lastCreatedMessage, currentImageUrl, onAddPhoneNumber }: SendingMessageProps) {
  const isPhoneNumber = (input: string) => /^\d+$/.test(input);

  if (isGroup) {
    return (
      <div className="mt-2 p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-semibold mb-2">그룹 메시지 전송 완료</h3>
        <p><strong>그룹명:</strong> {recipient}</p>
        <p>그룹 내 모든 연락처로 메시지가 성공적으로 전송되었습니다.</p>
      </div>
    )
  } else {
    return (
      <div className="mt-2 p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-semibold mb-2">메시지 전송 완료</h3>
        <p><strong>수신자:</strong> {isPhoneNumber(recipient) ? recipient : `${recipient} (전화번호 없음)`}</p>
        <p>메시지가 성공적으로 전송되었습니다.</p>
        <h5>{lastCreatedMessage}</h5>
        {currentImageUrl && <img src={currentImageUrl} alt="전송된 이미지" className="mt-2 max-w-full h-auto" />}
        {!isPhoneNumber(recipient) && (
          <Button onClick={() => onAddPhoneNumber(recipient)} className="mt-4">
            전화번호 추가
          </Button>
        )}
      </div>
    )
  }
}