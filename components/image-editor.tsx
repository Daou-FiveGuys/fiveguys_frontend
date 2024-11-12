'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, CanvasOptions, Circle, Triangle, Rect, Object as FabricObject, PencilBrush } from 'fabric'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Circle as CircleIcon, Pen, Square, Triangle as TriangleIcon, Eraser, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChromePicker, ColorResult } from 'react-color'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const thicknesses = [1, 2, 3, 5, 8, 13, 21, 34, 40]

export default function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [activeShape, setActiveShape] = useState<string | null>(null)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentThickness, setCurrentThickness] = useState(5)
  const [recentColors, setRecentColors] = useState<string[]>([])

  useEffect(() => {
    if (canvasRef.current) {
      const options: Partial<CanvasOptions> = {
        width: 800,
        height: 600,
        backgroundColor: '#f0f0f0'
      }
      const fabricCanvas = new Canvas(canvasRef.current, options)
      fabricCanvas.isDrawingMode = false
      setCanvas(fabricCanvas)

      return () => {
        fabricCanvas.dispose()
      }
    }
  }, [])

  const addShape = (shape: string) => {
    if (!canvas) return

    let fabricShape: FabricObject

    const shapeOptions = {
      fill: 'transparent',
      stroke: currentColor,
      strokeWidth: currentThickness,
      left: 100,
      top: 100
    }

    switch (shape) {
      case 'circle':
        fabricShape = new Circle({
          ...shapeOptions,
          radius: 50,
        })
        break
      case 'triangle':
        fabricShape = new Triangle({
          ...shapeOptions,
          width: 100,
          height: 100,
        })
        break
      case 'rectangle':
        fabricShape = new Rect({
          ...shapeOptions,
          width: 100,
          height: 100,
        })
        break
      default:
        return
    }

    canvas.add(fabricShape)
    canvas.renderAll()
    setActiveShape(shape)
  }
  //도형 추가 기능

  const enableDrawing = () => {
    if (!canvas) return

    canvas.isDrawingMode = true
    canvas.freeDrawingBrush = new PencilBrush(canvas)
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = currentThickness
      canvas.freeDrawingBrush.color = currentColor
    }
    setActiveShape('pen')
  }
  //펜 기능

  const disableDrawing = () => {
    if (!canvas) return

    canvas.isDrawingMode = false
    setActiveShape(null)
  }
  

  const enableErasing = () => {
    if (!canvas) return

    canvas.isDrawingMode = false
    canvas.off('mouse:down') 
    canvas.on('mouse:down', function(options) {
      if (options.target) {
        canvas.remove(options.target)
        canvas.renderAll()
      }
    })
    setActiveShape('eraser')
  }
  //지우기 기능

  const disableErasing = () => {
    if (!canvas) return

    canvas.off('mouse:down') 
  }

  useEffect(() => {
    if (!canvas) return

    const handleSelection = () => {
      if (activeShape !== 'eraser') {
        canvas.selection = true
        canvas.forEachObject((obj) => {
          obj.selectable = true
        })
      } else {
        canvas.selection = false
        canvas.forEachObject((obj) => {
          obj.selectable = false
        })
      }
    }

    handleSelection()

  }, [canvas, activeShape])

  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = currentColor
      canvas.freeDrawingBrush.width = currentThickness
    }
  }, [canvas, currentColor, currentThickness])

  const handleColorChange = (color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentColor(color.hex)
    // Only add to recent colors if it's not from dragging (i.e., if it's a complete change)
    if (event.type === 'change') {
      setRecentColors(prevColors => {
        const newColors = [color.hex, ...prevColors.filter(c => c !== color.hex)]
        return newColors.slice(0, 6)
      })
    }
  }
  //색상 파커에 색상 추가(다 안채워진 상태)

  const handleColorChangeComplete = (color: ColorResult) => {
    setCurrentColor(color.hex)
    setRecentColors(prevColors => {
      const newColors = [color.hex, ...prevColors.filter(c => c !== color.hex)]
      return newColors.slice(0, 6)
    })
  }
  //색상 파커에 색상 추가(전부 채워진 상태)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex space-x-4 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[100px]">
                <Square className="mr-2 h-4 w-4" />
                도형
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => { addShape('circle'); disableDrawing(); disableErasing() }}>
                <CircleIcon className="mr-2 h-4 w-4" />
                원
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { addShape('triangle'); disableDrawing(); disableErasing() }}>
                <TriangleIcon className="mr-2 h-4 w-4" />
                삼각형
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { addShape('rectangle'); disableDrawing(); disableErasing() }}>
                <Square className="mr-2 h-4 w-4" />
                사각형
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => { enableDrawing(); disableErasing() }} variant={activeShape === 'pen' ? 'default' : 'outline'}>
            <Pen className="mr-2 h-4 w-4" /> 펜
          </Button>
          <Button onClick={() => { enableErasing(); disableDrawing() }} variant={activeShape === 'eraser' ? 'default' : 'outline'}>
            <Eraser className="mr-2 h-4 w-4" /> 지우개
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[80px]">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: currentColor }} />
                색상
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[225px]">
              <ChromePicker
                color={currentColor}
                onChange={handleColorChange}
                onChangeComplete={handleColorChangeComplete}
                disableAlpha={true}
                styles={{
                  default: {
                    picker: { boxShadow: 'none', border: 'none', width: '100%' },
                  }
                }}
              />
              {recentColors.length > 0 && (
                <div className="mt-4 w-full">
                  <p className="text-sm font-medium mb-2">최근 사용한 색상</p>
                  <div className="flex gap-2 justify-between">
                    {recentColors.map((color, index) => (
                      <button
                        key={index}
                        className="w-[32px] h-[32px] rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChangeComplete({ hex: color } as ColorResult)}
                        title={`색상: ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Select onValueChange={(value) => setCurrentThickness(Number(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="굵기" />
            </SelectTrigger>
            <SelectContent>
              {thicknesses.map((thickness) => (
                <SelectItem key={thickness} value={thickness.toString()}>
                  {thickness}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <canvas ref={canvasRef} />
      </CardContent>
    </Card>
  )
}