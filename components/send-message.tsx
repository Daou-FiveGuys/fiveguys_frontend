


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SendMessageProps {
  message: string
}

export function SendMessage({ message }: SendMessageProps) {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>발송된 문자</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium">{message}</p>
      </CardContent>
    </Card>
  )
}
