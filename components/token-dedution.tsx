'use server'

let tokenBalance = 10 // 초기 토큰 잔액

export async function getTokenBalance() {
  return tokenBalance
}

export async function deductTokens() {
  if (tokenBalance >= 10) {
    tokenBalance -= 10
    return true
  }
  return false
}
export async function TokenDisplay() {
    const balance = await getTokenBalance()
  
    return (
      <div className="p-4 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-2">토큰 잔액</h2>
        <p className="text-3xl font-bold text-blue-600">{balance}</p>
      </div>
    )
  }