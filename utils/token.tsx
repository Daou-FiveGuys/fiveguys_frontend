// utils/token.ts
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload)) // Base64 디코딩
    const currentTime = Math.floor(Date.now() / 1000) // 현재 시간을 초 단위로 계산
    return Number(decodedPayload.exp) < currentTime
  } catch (error) {
    console.error('토큰 유효성 검사 실패:', error)
    return true // 유효하지 않은 토큰으로 간주
  }
}

export function getUserRole(token: string): string {
  try {
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload))
    return decodedPayload.auth[0].authority
  } catch (error) {
    console.error('토큰 유효성 검사 실패:', error)
    return 'None' // 유효하지 않은 토큰으로 간주
  }
}
