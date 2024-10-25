import React from 'react'

interface PhoneNumberData {
  name: string;
  phoneNumber: string;
  groupName: string;
}

interface PhoneNumberDisplayProps {
  phoneNumbers: PhoneNumberData[];
}

export function PhoneNumberDisplay({ phoneNumbers }: PhoneNumberDisplayProps) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">저장된 전화번호 목록</h3>
      <ul className="space-y-2">
        {phoneNumbers.map((phone, index) => (
          <li key={index} className="bg-gray-100 p-2 rounded">
            <p><strong>이름:</strong> {phone.name}</p>
            <p><strong>전화번호:</strong> {phone.phoneNumber}</p>
            <p><strong>그룹:</strong> {phone.groupName}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}