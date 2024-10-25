import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PhoneNumberStorageProps {
  phoneNumbers: string[]
}

export function PhoneNumberStorage({ phoneNumbers }: PhoneNumberStorageProps) {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>저장된 전화번호</CardTitle>
      </CardHeader>
      <CardContent>
        {phoneNumbers.length === 0 ? (
          <p>저장된 전화번호가 없습니다.</p>
        ) : (
          <ul className="list-disc pl-5">
            {phoneNumbers.map((number, index) => (
              <li key={index}>{number}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
//저장된 전화번호 확인.