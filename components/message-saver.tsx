import React, { useState, useEffect } from 'react'

interface MessageData {
  userInput: string;
  createdMessage: string;
}

interface MessageSaverProps {
  message: MessageData;
  saveNum: number;
}

export function MessageSaver({ message, saveNum }: MessageSaverProps) {
  const [savedMessages, setSavedMessages] = useState<MessageData[]>([]);

  useEffect(() => {
    setSavedMessages(prevMessages => [...prevMessages, message]);
  }, [message]);

  return (
    <div className="bg-green-100 p-4 rounded-md">
      <p className="font-medium text-green-800">메시지가 저장되었습니다 (저장 번호: {saveNum}):</p>
      <p className="text-green-700">사용자 입력: {message.userInput}</p>
      <p className="text-green-700">생성된 메시지: {message.createdMessage}</p>
    </div>
  );
}