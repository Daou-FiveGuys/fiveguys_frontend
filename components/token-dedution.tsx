'use server'

import axios from 'axios'

export async function getTokenBalance() {
  try {
    const response = await axios.post('/api/getTokenBalance') // 실제 API 엔드포인트로 변경해야 합니다
    return response.data.tokenBalance
  } catch (error) {
    console.error('Failed to fetch token balance:', error)
    throw new Error('토큰 잔액을 가져오는데 실패했습니다.')
  }
}

export async function deductTokens() {
  const errors = []
  try {
    // const currentBalance = await getTokenBalance()
    const currentBalance = 10000
    if (currentBalance >= 10) {
      const newBalance = currentBalance - 10
      const response = await axios.post('/api/updateTokenBalance', { newBalance }) // 실제 API 엔드포인트로 변경해야 합니다
      if (response.data.success) {
        return true;
      }
      else {
        errors.push('토큰 차감에 실패했습니다.')
      }
    } else {
      errors.push('토큰 잔액이 부족합니다.')
    }
  } catch (error) {
    //console.error('Failed to deduct tokens:', error)
    //errors.push(error.message)
  }

  return false;
}

export async function TokenDisplay() {
  try {
    const balance = await getTokenBalance()
    return (
      <div className="p-4 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-2">토큰 잔액</h2>
        <p className="text-3xl font-bold text-blue-600">{balance}</p>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-4 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-2">오류</h2>
      </div>
    )
  }
}