import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PhoneNumberData {
  name: string;
  phoneNumber: string;
  groupName: string;
}

interface PhoneNumberRecordProps {
  phoneNumber: string;
  onSavePhoneNumber: (phoneNumber: string) => void;
}

export function PhoneNumberRecord({ phoneNumber, onSavePhoneNumber }: PhoneNumberRecordProps) {
  const [samplePhoneNumbers, setSamplePhoneNumbers] = useState<PhoneNumberData[]>([
    { name: '홍길동', phoneNumber: '010-1234-5678', groupName: 'default' },
    { name: '김철수', phoneNumber: '010-9876-5432', groupName: '친구' },
  ]);

  const existingNumber = samplePhoneNumbers.find(item => item.phoneNumber === phoneNumber);

  const handleSavePhoneNumber = () => {
    onSavePhoneNumber(phoneNumber);
  };

  return (
    <div className="mt-2 p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold mb-2">전화번호 기록</h3>
      <p><strong>전화번호:</strong> {phoneNumber}</p>
      {existingNumber ? (
        <p>이 전화번호로 메시지가 전송되었습니다.</p>
      ) : (
        <>
          <p className="text-red-500 mb-2">없는 전화번호입니다.</p>
          <Button onClick={handleSavePhoneNumber}>전화번호 저장</Button>
        </>
      )}
    </div>
  )
}