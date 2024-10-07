"use client"
//추가
import React, { useState } from 'react'
import { Square, Flame, Pencil, Type, Eraser, Palette, Circle, Triangle, Music, ThumbsUp, ImageIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

export default function ImageEditorForm() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const tools = [
    { name: '도형', icon: <Square /> },
    { name: '아이콘', icon: <Flame /> },
    { name: '이미지 수정', icon: <ImageIcon /> },
    { name: '연필', icon: <Pencil /> },
    { name: '텍스트', icon: <Type /> },
    { name: '지우개', icon: <Eraser /> },
    { name: '색상', icon: <Palette /> },
  ]

  const handleToolClick = (toolName: string) => {
    setSelectedTool(selectedTool === toolName ? null : toolName)
  }

  const renderToolOptions = () => {
    switch (selectedTool) {
      case '도형':
        return (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="icon"><Circle /></Button>
            <Button variant="outline" size="icon"><Square /></Button>
            <Button variant="outline" size="icon"><Triangle /></Button>
          </div>
        )
      case '아이콘':
        return (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="icon"><Flame /></Button>
            <Button variant="outline" size="icon"><Music /></Button>
            <Button variant="outline" size="icon"><ThumbsUp /></Button>
          </div>
        )
      case '이미지 수정':
        return (
          <div className="space-y-2">
            <Button variant="outline" className="w-full"><ImageIcon /></Button>
            <Button variant="outline" className="w-full"><ImageIcon /></Button>
            <Button variant="outline" className="w-full">AI</Button>
          </div>
        )
      case '텍스트':
        return (
          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">글꼴 변경</Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid gap-2">
                  {['Arial', 'Verdana', 'Times New Roman', 'Courier', 'Georgia'].map(font => (
                    <Button key={font} variant="ghost" className="justify-start">
                      {font}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">글자 크기 변경</Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid gap-2">
                  {[12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                    <Button key={size} variant="ghost" className="justify-start">
                      {size}px
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <div className="space-y-2">
              {[
                "삶이 있는 한 희망은 있다. - 키케로",
                "산다는 것, 그것은 치열한 전투이다. - 로망 로랑",
                "하루에 3시간을 걸으면 7년 후에 지구를 한 바퀴 돌 수 있다. - 사무엘 존슨"
              ].map((quote, index) => (
                <div key={index} className="bg-white rounded-lg p-2 text-sm border border-gray-200">
                  {quote}
                </div>
              ))}
            </div>
          </div>
        )
      case '지우개':
        return (
          <div className="space-y-2">
            <Button variant="outline" className="w-full"><Eraser className="mr-2" /> 지우개</Button>
            <Button variant="outline" className="w-full"><Eraser className="mr-2" /> 전체 지우기</Button>
          </div>
        )
      case '색상':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 36 }, (_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-6 h-6 p-0"
                  style={{ backgroundColor: `hsl(${i * 10}, 100%, 50%)` }}
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">최근에 사용한 색상</p>
              <div className="flex space-x-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-6 h-6 p-0"
                    style={{ backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <div className="w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-md">
          {/* 이미지 편집 영역 */}
        </div>
      </div>
      <div className="w-20 bg-white shadow-lg flex flex-col items-center py-4 space-y-4">
        {tools.map((tool) => (
          <Button
            key={tool.name}
            variant={selectedTool === tool.name ? "default" : "outline"}
            size="icon"
            onClick={() => handleToolClick(tool.name)}
          >
            {tool.icon}
          </Button>
        ))}
      </div>
      {selectedTool && (
        <div className="w-64 bg-gray-100 p-4">
          {renderToolOptions()}
        </div>
      )}
    </div>
  )
}