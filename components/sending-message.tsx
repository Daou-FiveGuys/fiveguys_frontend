import React from 'react'
import { Button } from '@/components/ui/button'

interface PhoneNumberData {
  name: string;
  phoneNumber: string;
  groupName: string;
}

interface SendingMessageProps {
  recipient: string;
  isGroup: boolean;
  onAddPhoneNumber: (phoneNumber: string) => void;
  currentImageUrl: string;
  lastCreatedMessage: string;
}
export function SendingMessage({ recipient, isGroup, lastCreatedMessage, currentImageUrl, onAddPhoneNumber }: SendingMessageProps) {
  const samplePhoneNumbers: PhoneNumberData[] = [
    { name: '홍길동', phoneNumber: '01012345678', groupName: '가족' },
    { name: '김철수', phoneNumber: '01087654321', groupName: '친구' },
    { name: '이영희', phoneNumber: '01011112222', groupName: '직장' },
  ];

  const isPhoneNumber = (input: string) => /^\d+$/.test(input);
  const [currentUrl, setCurrentUrl] = React.useState('');

  if (isGroup) {
    const groupExists = samplePhoneNumbers.some(item => item.groupName === recipient);
    if (groupExists) {
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
          <h3 className="text-lg font-semibold mb-2">존재하지 않는 그룹</h3>
          <p>입력하신 그룹명 ({recipient})은 존재하지 않습니다.</p>
          <h4 className="text-md font-semibold mt-4 mb-2">전체 전화번호 정보:</h4>
          <ul className="list-disc list-inside">
            {samplePhoneNumbers.map((contact, index) => (
              <li key={index}>{contact.name} - {contact.phoneNumber} ({contact.groupName})</li>
            ))}
          </ul>
        </div>
      )
    }
  } else {
    const existingContact = samplePhoneNumbers.find(item => 
      isPhoneNumber(recipient) ? item.phoneNumber === recipient : item.name === recipient
    );

    if (existingContact) {
      return (
        <div className="mt-2 p-4 bg-gray-100 rounded-md">
          <h3 className="text-lg font-semibold mb-2">메시지 전송 완료</h3>
          <p><strong>수신자:</strong> {existingContact.name} ({existingContact.phoneNumber})</p>
          <p>메시지가 성공적으로 전송되었습니다.</p>
          <h5>{lastCreatedMessage}</h5>
          <img src={currentImageUrl} alt=""></img>
        </div>
      )
    } else {
      return (
        <div className="mt-2 p-4 bg-gray-100 rounded-md">
          <h3 className="text-lg font-semibold mb-2">존재하지 않는 연락처</h3>
          <p>입력하신 {isPhoneNumber(recipient) ? '전화번호' : '이름'}({recipient})는 연락처에 존재하지 않습니다.</p>
          <h4 className="text-md font-semibold mt-4 mb-2">전체 전화번호 정보:</h4>
          <ul className="list-disc list-inside">
            {samplePhoneNumbers.map((contact, index) => (
              <li key={index}>{contact.name} - {contact.phoneNumber} ({contact.groupName})</li>
            ))}
          </ul>
          <Button onClick={() => onAddPhoneNumber(recipient)} className="mt-4">
            전화번호 추가
          </Button>
        </div>
      )
    }
  }
}
