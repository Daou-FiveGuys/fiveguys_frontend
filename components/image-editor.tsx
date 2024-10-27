"use client"

import React, { useState } from 'react'
import { Square, Flame, Pencil, Type, Eraser, Palette, Circle, Triangle, Music, ThumbsUp, ImageIcon, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useRouter } from 'next/navigation'

interface EditPageProps {
  imageid: string
}

export default function ImageEditorForm({ imageid }: EditPageProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const router = useRouter()

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

  const handleSave = () => {
    // Here you would typically save the edited image
    // For now, we'll just navigate back
    router.back()
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
          <div className="space-y-2">
            <Button variant="outline" className="w-full">글꼴 선택</Button>
            <Button variant="outline" className="w-full">크기 조절</Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 flex">
        <div className="flex-1 p-4">
          <div className="w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden">
            <img 
              src={`/sampleImage${imageid}.jpg`} 
              alt={`Image ${imageid}`} 
              className="w-full h-full object-contain"
            />
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
      </div>
      <div className="bg-white p-4 shadow-lg flex justify-between items-center">
        <Button onClick={handleSave} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>저장</span>
        </Button>
        {selectedTool && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">옵션</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">{selectedTool} 옵션</h4>
                {renderToolOptions()}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}