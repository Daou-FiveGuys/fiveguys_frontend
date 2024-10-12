import React from 'react'

interface PhoneNumberData {
  name: string;
  phoneNumber: string;
  groupName: string;
}

interface SavePhoneNumberProps {
  phoneData: PhoneNumberData;
}

export function SavePhoneNumber({ phoneData }: SavePhoneNumberProps) {
  return (
    <div className="mt-2 p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold mb-2">저장된 전화번호 정보</h3>
      <p><strong>이름:</strong> {phoneData.name}</p>
      <p><strong>전화번호:</strong> {phoneData.phoneNumber}</p>
      <p><strong>그룹:</strong> {phoneData.groupName}</p>
    </div>
  )
}