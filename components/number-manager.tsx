import { useState } from 'react'

export function useNumberManager() {
  const [currentNumber, setCurrentNumber] = useState(1) // 샘플 시작 번호

  const getNextNumber = () => {
    const nextNumber = currentNumber
    return nextNumber
  }

  return { getNextNumber }
}