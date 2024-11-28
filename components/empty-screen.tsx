export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          안녕하세요 🎨 Pa·Letter에 오신 것을 환영합니다.
        </h1>
        <p className="leading-normal text-muted-foreground">
          AI를 활용한 문자 및 이미지 생성으로 더욱 간편하게 메시지를
          발송해보세요.
        </p>
        <p className="leading-normal text-muted-foreground">
          또한, FAQ 응답, 문자 내역 확인, 연락처 관리, 사용량 조회 기능도
          제공합니다.
        </p>
        <p className="leading-normal text-muted-foreground">
          그럼 시작해볼까요?
        </p>
      </div>
    </div>
  )
}
