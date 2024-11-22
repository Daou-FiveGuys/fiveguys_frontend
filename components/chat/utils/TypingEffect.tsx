import React from 'react'

interface TypingEffectProps {
  text: string
  speed?: number
  onComplete?: () => void
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  text,
  speed = 50,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = React.useState('')
  const indexRef = React.useRef(0)

  const onCompleteRef = React.useRef(onComplete)
  React.useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const characters = React.useMemo(() => Array.from(text), [text])

  React.useEffect(() => {
    indexRef.current = 0
    setDisplayedText('')

    const intervalId = setInterval(() => {
      if (indexRef.current < characters.length) {
        const currentChar = characters[indexRef.current]
        if (currentChar !== undefined) {
          setDisplayedText(prev => prev + currentChar)
          indexRef.current += 1
        } else {
          console.warn(`Undefined character at index: ${indexRef.current}`)
          clearInterval(intervalId)
          if (onCompleteRef.current) onCompleteRef.current()
        }
      } else {
        clearInterval(intervalId)
        if (onCompleteRef.current) onCompleteRef.current()
      }
    }, speed)

    return () => clearInterval(intervalId)
  }, [characters, speed])

  return <div>{displayedText}</div>
}

export default TypingEffect
