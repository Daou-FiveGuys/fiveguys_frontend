//import { savePhoneNumbers } from './phone-number-save'

interface PhoneNumberData {
    name: string;
    phoneNumber: string;
    groupName: string;
  }
  
  interface PhoneNumberRecordResult {
    phoneNumbers: PhoneNumberData[];
    errors: string[];
  }
  
  export function PhoneNumberRecordAtOnce(fileContent: string): PhoneNumberRecordResult {
    const lines = fileContent.split('\n')
    const phoneNumbers: PhoneNumberData[] = []
    const errors: string[] = []
    const phoneNumberSet = new Set<string>()
  
    const isValidPhoneNumber = (number: string) => /^\d{11}$/.test(number);
    const isValidName = (name: string) => /^[a-zA-Z가-힣\s]+$/.test(name);
  
    lines.forEach((line, index) => {
      const [phoneNumber, name, groupName = 'default'] = line.trim().split(' ')
      
      if (!isValidPhoneNumber(phoneNumber)) {
        errors.push(`줄 ${index + 1}: 유효하지 않은 전화번호입니다. 11자리 숫자여야 합니다.`)
      } else if (phoneNumberSet.has(phoneNumber)) {
        errors.push(`줄 ${index + 1}: 중복된 전화번호입니다. (${phoneNumber})`)
      } else {
        phoneNumberSet.add(phoneNumber)
      }
  
      if (!isValidName(name)) {
        errors.push(`줄 ${index + 1}: 유효하지 않은 이름입니다. 한글 또는 영어만 사용 가능합니다.`)
      }
  
      if (isValidPhoneNumber(phoneNumber) && isValidName(name) && phoneNumberSet.has(phoneNumber)) {
        phoneNumbers.push({
          phoneNumber,
          name,
          groupName
        })
        //savePhoneNumbers({phoneNumber,name,groupName})
      }
    })
  
    return { phoneNumbers, errors }
  }