import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import React from "react";
import { getPhoneDataList } from './phonedatalist';
interface PhoneNumberData {
  name: string;
  phoneNumber: string;
  groupName: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ServerResponse {
  success: boolean;
  message: string;
}

interface SendPhoneNumberDataProps {
  content: string;
}

// 파일 내용을 검증하는 함수
export async function validatePhoneNumberFile(fileContent: string): Promise<ValidationResult> {
  const lines = fileContent.split('\n')
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
  })

    // Add new functionality to use getPhoneDataList
    try {
      const phoneDataList = await getPhoneDataList();
      if (phoneDataList instanceof Error) {
        errors.push(`전화번호 데이터 가져오기 오류: ${phoneDataList.message}`);
      } else {
        phoneDataList.forEach((data) => {
          console.log(data)
          //if (phoneNumberSet.has(data.phoneNumber)) { //실제 코드
            if (false ) {// 연습용
              console.log(1)
            errors.push(`전화번호 ${data.phoneNumber}는 이미 존재하는 번호입니다.`);
          }
        });
      }
    } catch (error) {
      console.log(2)
      errors.push(`전화번호 데이터 가져오기 중 예기치 않은 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }

  return { isValid: errors.length === 0, errors };
}

// 전화번호 데이터를 서버로 전송하는 함수
export function SendPhoneNumberData({ content }: SendPhoneNumberDataProps): React.ReactElement {
  const [phoneNumbers, setPhoneNumbers] = React.useState<PhoneNumberData[]>([])
  const [serverResponse, setServerResponse] = React.useState<ServerResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    const parsePhoneNumbers = (content: string): PhoneNumberData[] => {
      const lines = content.split('\n')
      return lines.map(line => {
        const [phoneNumber, name, groupName = 'default'] = line.trim().split(' ')
        return { phoneNumber, name, groupName }
      })
    }

    const sendPhoneNumbers = async (phoneNumbers: PhoneNumberData[]) => {
      try {
        const response = await axios.post('https://your-api-endpoint.com/save-phone-numbers', phoneNumbers,{
          headers: {
            'Content-Type': 'application/json', // JSON 형식임을 명시
          // 'Authorization': 'Bearer YOUR_API_TOKEN', // API 토큰 추가
          // userId: 'user123',
          // password: 'your_password', // 인증 정보를 데이터에 포함하는 경우
          },
        })
        return response.data
      } catch (error) {
        throw new Error('서버 통신 중 오류가 발생했습니다.')
      }
    }

    const processData = async () => {
      setIsLoading(true)
      try {
        const parsedNumbers = parsePhoneNumbers(content)
        setPhoneNumbers(parsedNumbers)
        const response = await sendPhoneNumbers(parsedNumbers)
        setServerResponse(response)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
        setServerResponse(null)
      } finally {
        setIsLoading(false)
      }
    }

    processData()
  }, [content])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>전화번호 데이터</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>그룹</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phoneNumbers.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.name}</TableCell>
                    <TableCell>{data.phoneNumber}</TableCell>
                    <TableCell>{data.groupName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {serverResponse && (
              <Alert className="mt-4" variant={serverResponse.success ? "default" : "destructive"}>
                <AlertTitle>{serverResponse.success ? "성공" : "오류"}</AlertTitle>
                <AlertDescription>{serverResponse.message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}