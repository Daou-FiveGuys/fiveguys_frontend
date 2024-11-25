import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Image, Send, PlusCircle } from "lucide-react";
import { api, AmountUsed } from "./service";
import { useEffect, useState } from "react";

export function AmountUsedCard() {
  const [amountUsed, setAmountUsed] = useState<AmountUsed | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API 호출 대신 테스트 데이터를 설정
    setTimeout(() => {
      api.readAmountUsed(setAmountUsed)
      setLoading(false); // 데이터 로드 완료
    }, 1000); // 테스트용 1초 지연
  }, []);

  if (loading) {
    return <p>Loading...</p>; // 로딩 상태 표시
  }

  if (!amountUsed) {
    return <p>Error: Unable to load data.</p>; // 데이터 로드 실패
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>전체 사용량 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <MessageSquare className="mr-2" size={20} />
              메시지
            </h3>
            <p>메세지 생성 수: {amountUsed.msgGcnt}회</p>
            <p>메세지 전송 수: {amountUsed.msgScnt}회</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Image className="mr-2" size={20} />
              이미지
            </h3>
            <p>이미지 생성 수: {amountUsed.imgGcnt}장</p>
            <p>이미지 전송 수: {amountUsed.imgScnt}장</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        최근 메시지 전송 시간: {new Date(amountUsed.lastDate).toLocaleString()}
      </CardFooter>
    </Card>
  )
}
