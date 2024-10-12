import React from 'react'

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
}

interface ChatHistoryProps {
  messages: ChatMessage[]
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-md max-h-80 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">채팅 내역</h2>
      {messages.map((msg) => (
        <div key={msg.id} className={`mb-2 p-2 rounded-md ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
          <p className="font-medium">{msg.sender === 'user' ? '사용자' : '봇'}</p>
          <p>{msg.message}</p>
          <p className="text-xs text-gray-500">{msg.timestamp}</p>
        </div>
      ))}
    </div>
  )
}