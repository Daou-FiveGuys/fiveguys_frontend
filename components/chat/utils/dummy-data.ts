export interface Message {
  id: string
  content: string
  date: string
  image: string
  preview: string
}

export const dummyMessages: Message[] = [
  {
    id: '1',
    date: '2023-05-01T09:00:00',
    image: '/placeholder.svg?height=200&width=200',
    preview: '5월 황금연휴 특별 할인 이벤트!',
    content:
      '5월 황금연휴 특별 할인 이벤트! 지금 확인해보세요. 모든 상품 20% 할인과 함께 무료 배송 혜택을 드립니다. 이 기회를 놓치지 마세요!'
  },
  {
    id: '2',
    date: '2023-05-02T14:30:00',
    image: '/placeholder.svg?height=200&width=200',
    preview: '새로운 여름 컬렉션 출시',
    content:
      '새로운 여름 컬렉션이 출시되었습니다. 20% 할인 쿠폰도 드려요! 시원한 여름을 준비하세요. 한정 수량으로 준비된 특별 아이템을 지금 만나보세요.'
  },
  {
    id: '3',
    date: '2023-05-03T11:15:00',
    image: '/placeholder.svg?height=200&width=200',
    preview: '오늘 단 하루! 전 상품 무료배송',
    content:
      '오늘 단 하루! 전 상품 무료배송 혜택을 놓치지 마세요. 어떤 상품을 구매하셔도 배송비 걱정 없이 편하게 쇼핑하실 수 있습니다.'
  },
  {
    id: '4',
    date: '2023-05-04T16:45:00',
    image: '/placeholder.svg?height=200&width=200',
    preview: '여름 휴가 준비 베스트 아이템',
    content:
      '여름 휴가 준비하세요? 베스트 아이템 모음전 진행 중! 수영복, 샌들, 선글라스 등 여름 필수 아이템을 한 곳에서 만나보세요. 특별 할인가로 제공됩니다.'
  },
  {
    id: '5',
    date: '2023-05-05T10:00:00',
    image: '/placeholder.svg?height=200&width=200',
    preview: '어린이날 기념 특별 이벤트',
    content:
      '어린이날 기념 특별 이벤트! 키즈 상품 최대 50% 할인. 장난감, 의류, 신발 등 다양한 어린이 상품을 특별한 가격으로 만나보세요. 사랑하는 아이에게 선물하세요.'
  }
]
