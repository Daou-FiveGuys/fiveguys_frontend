'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, CanvasOptions, Circle, Triangle, Rect, Object as FabricObject, PencilBrush } from 'fabric'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CircleIcon, Pen, Square, TriangleIcon, Eraser, ChevronDown, Crop, Image } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChromePicker, ColorResult } from 'react-color'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const thicknesses = [1, 2, 3, 5, 8, 13, 21, 34, 40]

interface MaskInfo {
  left: number;
  top: number;
  width: number;
  height: number;
}
//마스킹 정보 인터페이스.

const ImageEditModal = ({ maskInfo, onEdit, onClose }: { maskInfo: MaskInfo; onEdit: () => void; onClose: () => void }) => {
  return (
    <Dialog onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={onEdit}>
          <Image className="mr-2 h-4 w-4" />
          이미지 수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>이미지 수정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>마스킹 영역 정보:</div>
          <div>Left: {maskInfo.left}</div>
          <div>Top: {maskInfo.top}</div>
          <div>Width: {maskInfo.width}</div>
          <div>Height: {maskInfo.height}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
//이미지 수정 버튼 클릭 시 수행되는 함수.

export default function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [activeShape, setActiveShape] = useState<string | null>(null)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentThickness, setCurrentThickness] = useState(5)
  const [recentColors, setRecentColors] = useState<string[]>([])
  const [maskRect, setMaskRect] = useState<Rect | null>(null)
  const [maskInfo, setMaskInfo] = useState<MaskInfo | null>(null)

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
    canvas.selection = true
    canvas.forEachObject((obj) => {
      obj.selectable = true
    })

    const eraseObject = () => {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        canvas.remove(activeObject)
        if (activeObject === maskRect) {
          setMaskRect(null)
          setMaskInfo(null)
        }
        canvas.discardActiveObject()
        canvas.requestRenderAll()
      }
    }

    canvas.on('selection:created', eraseObject)
    canvas.on('selection:updated', eraseObject)
    canvas.defaultCursor = 'crosshair'
    setActiveShape('eraser')
  }
  //지우기 기능
  
  const disableErasing = () => {
    if (!canvas) return

    canvas.off('selection:created')
    canvas.off('selection:updated')
    canvas.defaultCursor = 'default'
    setActiveShape(null)
  }

  const toggleMasking = () => {
    if (!canvas) return

    if (maskRect) {
      clearMasks()
    } else if (activeShape !== 'mask') {
      enableMasking()
    } else {
      disableMasking()
    }
  }
  //마스킹 상태 관리

  const enableMasking = () => {
    if (!canvas || maskRect) return
  
    setActiveShape('mask')
    canvas.isDrawingMode = false
    canvas.selection = false
    canvas.forEachObject((obj) => {
      obj.selectable = false
      if (obj !== maskRect) {
        obj.opacity = 0
      }
    })
  
    let startX = 0
    let startY = 0
    let isDown = false
    let newRect: Rect | null = null
  
    canvas.on('mouse:down', (options) => {
      if (maskRect) {
        canvas.remove(maskRect)
        canvas.requestRenderAll()
      }
  
      const pointer = canvas.getPointer(options.e as MouseEvent)
      isDown = true
      startX = pointer.x
      startY = pointer.y
  
      newRect = new Rect({
        left: startX,
        top: startY,
        width: 0,
        height: 0,
        fill: 'rgba(0,0,0,0.3)',
        stroke: 'black',
        strokeWidth: 1,
      })
  
      canvas.add(newRect)
      canvas.requestRenderAll()
    })
  
    canvas.on('mouse:move', (options) => {
      if (!isDown || !newRect) return
      const pointer = canvas.getPointer(options.e as MouseEvent)
  
      const width = Math.abs(pointer.x - startX)
      const height = Math.abs(pointer.y - startY)
  
      newRect.set({
        width: width,
        height: height,
        left: Math.min(startX, pointer.x),
        top: Math.min(startY, pointer.y)
      })
  
      canvas.requestRenderAll()
    })
  
    canvas.on('mouse:up', () => {
      isDown = false
      if (newRect) {
        setMaskRect(newRect)
        setMaskInfo({
          left: newRect.left || 0,
          top: newRect.top || 0,
          width: newRect.width || 0,
          height: newRect.height || 0
        })
        canvas.requestRenderAll()
        disableMasking()
      }
    })
  }
  // 마스킹 기능

  const disableMasking = () => {
    if (!canvas) return

    canvas.off('mouse:down')
    canvas.off('mouse:move')
    canvas.off('mouse:up')

    if (activeShape === 'mask') {
      setActiveShape(null)
    }
  }

  const clearMasks = () => {
    if (canvas && maskRect) {
      canvas.remove(maskRect)
      setMaskRect(null)
      setMaskInfo(null)
      canvas.forEachObject((obj) => {
        obj.opacity = 1
      })
      canvas.renderAll()
    }
  }

  const handleImageEdit = () => {
    if (canvas) {
      canvas.forEachObject((obj) => {
        if (obj !== maskRect) {
          obj.opacity = 1
        }
      })
      canvas.renderAll()
    }
  }

  useEffect(() => {
    if (!canvas) return

    const handleSelection = () => {
      if (activeShape !== 'eraser' && activeShape !== 'mask') {
        canvas.selection = true
        canvas.forEachObject((obj) => {
          obj.selectable = true
        })
      } else if (activeShape === 'eraser') {
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
    if (event.type === 'change') {
      setRecentColors(prevColors => {
        const newColors = [color.hex, ...prevColors.filter(c => c !== color.hex)]
        return newColors.slice(0, 6)
      })
    }
  }

  const handleColorChangeComplete = (color: ColorResult) => {
    setCurrentColor(color.hex)
    setRecentColors(prevColors => {
      const newColors = [color.hex, ...prevColors.filter(c => c !== color.hex)]
      return newColors.slice(0, 6)
    })
  }

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
              <DropdownMenuItem onSelect={() => { addShape('circle'); disableDrawing(); disableErasing(); disableMasking() }}>
                <CircleIcon className="mr-2 h-4 w-4" />
                원
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { addShape('triangle'); disableDrawing(); disableErasing(); disableMasking() }}>
                <TriangleIcon className="mr-2 h-4 w-4" />
                삼각형
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { addShape('rectangle'); disableDrawing(); disableErasing(); disableMasking() }}>
                <Square className="mr-2 h-4 w-4" />
                사각형
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button onClick={() => { enableDrawing(); disableErasing(); disableMasking() }} variant={activeShape === 'pen' ? 'default' : 'outline'}>
                <Pen className="mr-2 h-4 w-4" /> 펜
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <div className="flex space-x-2 p-2">
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
            </PopoverContent>
          </Popover>
          <Button onClick={() => { enableErasing(); disableDrawing(); disableMasking() }} variant={activeShape === 'eraser' ? 'default' : 'outline'}>
            <Eraser className="mr-2 h-4 w-4" /> 지우개
          </Button>
          <Button onClick={toggleMasking} variant={activeShape === 'mask' || maskRect ? 'default' : 'outline'}>
            <Crop className="mr-2 h-4 w-4" /> {maskRect ? '마스크 지우기' : activeShape === 'mask' ? '마스킹 취소' : '마스킹'}
            {/* activeShape = 클릭된 모드 */}
          </Button>
          {maskInfo && (
            <ImageEditModal
              maskInfo={maskInfo}
              onEdit={handleImageEdit}
              onClose={clearMasks}
            />
          )}
        </div>
        <canvas ref={canvasRef} />
      </CardContent>
    </Card>
  )
}