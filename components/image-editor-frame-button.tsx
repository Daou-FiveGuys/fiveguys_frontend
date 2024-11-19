'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { FrameIcon } from 'lucide-react'

type FrameOption = 'default' | '512x512' | 'landscape' | 'custom'

const frameOptions: Record<
  Exclude<FrameOption, 'custom'>,
  { width: number; height: number }
> = {
  default: { width: 1024, height: 1024 },
  '512x512': { width: 512, height: 512 },
  landscape: { width: 1024, height: 768 }
}

export default function FrameSizeAdjuster({
  initialWidth,
  initialHeight,
  onApply
}: {
  initialWidth: number
  initialHeight: number
  onApply: (width: number, height: number) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  frameOptions.default.width = initialWidth
  frameOptions.default.height = initialWidth

  const [selectedOption, setSelectedOption] = useState<FrameOption>('default')
  const [width, setWidth] = useState(initialWidth)
  const [height, setHeight] = useState(initialHeight)

  useEffect(() => {
    if (selectedOption !== 'custom') {
      const option = frameOptions[selectedOption]
      setWidth(option.width)
      setHeight(option.height)
    }
  }, [selectedOption])

  const handleOptionChange = (value: FrameOption) => {
    setSelectedOption(value)
  }

  const handleApply = () => {
    onApply(width, height)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <FrameIcon className="mr-2 h-4 w-4" />
          프레임
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <Select onValueChange={handleOptionChange} value={selectedOption}>
            <SelectTrigger>
              <SelectValue placeholder="프레임 크기 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="512x512">512x512</SelectItem>
              <SelectItem value="landscape">
                Landscape 4:3 (1024x768)
              </SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium">Width:</span>
              <Input
                type="number"
                value={width}
                onChange={e => setWidth(Number(e.target.value))}
                disabled={selectedOption !== 'custom'}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Height:</span>
              <Input
                type="number"
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                disabled={selectedOption !== 'custom'}
              />
            </label>
          </div>
          <Button onClick={handleApply} className="w-full">
            적용
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
