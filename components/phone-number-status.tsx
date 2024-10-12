import React from 'react'

interface PhoneNumberStatusProps {
  exists: boolean
  phoneNumber: string
  name: string
}

export function PhoneNumberStatus({ exists, phoneNumber, name }: PhoneNumberStatusProps) {
  return (
    <div className="mt-2 p-4 bg-gray-100 rounded-md">
      <p className="text-lg font-semibold">
        {exists 
          ? `${phoneNumber}는 이미 존재하는 전화번호입니다.` 
          : `${phoneNumber}가 ${name} 이름으로 추가되었습니다.`}
      </p>
    </div>
  )
}