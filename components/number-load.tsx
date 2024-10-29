import { useState } from 'react'
interface PhoneNumberData {
    name: string;
    phoneNumber: string;
    groupName: string;
  }
interface SavePhoneNumberProps {
    phoneData: PhoneNumberData;
  }

const sampleData: PhoneNumberData[] = [
  { name: '홍길동', phoneNumber: '010-1234-5678', groupName: 'default' },
  { name: '김철수', phoneNumber: '010-9876-5432', groupName: '친구' },
]

export function useNumberLoad() {
  const [phoneData, setPhoneData] = useState<PhoneNumberData[]>([])

  const loadSampleData = () => {
    setPhoneData(sampleData)
    return sampleData
  }

  return { phoneData, loadSampleData }
}