'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HistoryItem {
  id: number
  imageUrl: string
  topic: string
  content: string
}

const sampleData: HistoryItem[] = [
  {
    id: 1,
    imageUrl: "/placeholder.svg?height=100&width=100",
    topic: "인공지능의 미래",
    content: "인공지능 기술은 빠르게 발전하고 있으며, 향후 10년 동안 우리의 일상생활과 산업 전반에 큰 변화를 가져올 것으로 예상됩니다. 머신러닝과 딥러닝 기술의 발전으로 더욱 정교한 예측과 의사결정이 가능해질 것이며, 자율주행 자동차, 개인화된 의료 서비스, 지능형 가상 비서 등 다양한 분야에서 혁신이 일어날 것입니다."
  },
  {
    id: 2,
    imageUrl: "/placeholder.svg?height=100&width=100",
    topic: "기후 변화 대응",
    content: "기후 변화는 현재 인류가 직면한 가장 큰 도전 중 하나입니다. 온실가스 배출량을 줄이고 지속 가능한 에너지 원을 개발하는 것이 중요합니다. 재생 에너지 기술의 발전, 탄소 포집 및 저장 기술, 그리고 친환경 교통수단의 보급 등 다양한 노력이 필요합니다. 또한, 개인과 기업, 정부가 협력하여 자원을 효율적으로 사용하고 순환경제를 구축하는 것이 중요합니다."
  }
]

export function getHistoryItem(id: number): HistoryItem | undefined {
  return sampleData.find(item => item.id === id)
}

export default function MessageImageHistory({ id }: { id: number }) {
  const item = getHistoryItem(id)

  if (!item) {
    return <div>해당 고유번호의 데이터를 찾을 수 없습니다.</div>
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>메시지 및 이미지 히스토리</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={item.imageUrl}
              alt={item.topic}
              className="w-24 h-24 object-cover rounded"
            />
            <div>
              <h3 className="text-lg font-semibold">고유번호: {item.id}</h3>
              <h4 className="text-md font-medium">주제: {item.topic}</h4>
            </div>
          </div>
          <p className="text-sm text-gray-600">{item.content}</p>
        </div>
      </CardContent>
    </Card>
  )
}