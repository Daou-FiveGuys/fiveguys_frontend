'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Canvas,
  CanvasOptions,
  Circle,
  Triangle,
  Rect,
  Object as FabricObject,
  PencilBrush,
  Textbox
} from 'fabric'
import * as fabric from 'fabric'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Circle as CircleIcon,
  Hand as HandIcon,
  ItalicIcon,
  BoldIcon,
  HighlighterIcon,
  LetterTextIcon,
  Pen,
  Square,
  Triangle as TriangleIcon,
  Eraser,
  ChevronDown
} from 'lucide-react'
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
import { ChromePicker, ColorResult } from 'react-color'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

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
          radius: 50
        })
        break
      case 'triangle':
        fabricShape = new Triangle({
          ...shapeOptions,
          width: 100,
          height: 100
        })
        break
      case 'rectangle':
        fabricShape = new Rect({
          ...shapeOptions,
          width: 100,
          height: 100
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
    canvas.on('mouse:down', function (options) {
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
        canvas.forEachObject(obj => {
          obj.selectable = true
        })
      } else {
        canvas.selection = false
        canvas.forEachObject(obj => {
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

  const handleColorChange = (
    color: ColorResult,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentColor(color.hex)
    // Only add to recent colors if it's not from dragging (i.e., if it's a complete change)
    if (event.type === 'change') {
      setRecentColors(prevColors => {
        const newColors = [
          color.hex,
          ...prevColors.filter(c => c !== color.hex)
        ]
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

  /**
   *
   * 김상준
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   */

  const [font, setFont] = useState<string>('Arial')
  const [fontSize, setFontSize] = useState<number>(20)
  const [isAddingText, setIsAddingText] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isHighlighter, setIsHighlighter] = useState(false)
  const [highlighterColor, setHighlighterColor] = useState({
    r: 0,
    g: 0,
    b: 0,
    a: 1
  })
  const [currentTextColor, setCurrentTextColor] = useState('rgba(0, 0, 0, 255)')

  const [isMovingObject, setIsMovingObject] = useState<boolean>(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const textRef = useRef<fabric.IText | null>(null) // text 객체를 추적하는 ref
  const [apiTextData, setApiTextData] = useState([
    '안녕하세요! 😊',
    '방학을 맞이하여 한성대학교에서 코딩 캠프를 진행합니다!',
    '일시는 2024년 12월 3일 (화요일)이며, 시간은 10:00 - 12:00입니다',
    '장소는 한성대학교 상상관 6층입니다',
    '코딩에 관심이 있는 학생들의 많은 참여 부탁드립니다!',
    '함께 재미있는 시간을 보내요! 🖥️💻',
    '감사합니다!'
  ])

  const enableAddText = () => {
    setActiveShape('text')
    setIsAddingText(true)
  }

  const disableAddText = () => {
    setIsAddingText(false)
  }

  const handleTextColorChange = (color: ColorResult) => {
    const { r, g, b, a } = color.rgb
    setCurrentTextColor(`rgba(${r}, ${g}, ${b}, ${a})`)
  }

  const handleTextColorChangeComplete = (color: ColorResult) => {
    const { r, g, b, a } = color.rgb
    setCurrentTextColor(`rgba(${r}, ${g}, ${b}, ${a})`)
  }

  const getIText = (str: string) => {
    const text = new fabric.IText(str, {
      editable: true,
      width: 150,
      fontWeight: isBold ? 800 : 300,
      fontSize: fontSize,
      fill: currentTextColor,
      fontFamily: font,
      underline: isUnderline,
      backgroundColor: isHighlighter
        ? `rgba(${highlighterColor.r}, ${highlighterColor.g}, ${highlighterColor.b}, ${highlighterColor.a})`
        : 'rgba(0, 0, 0, 0)',
      fontStyle: isItalic ? 'italic' : 'normal'
    })
    text.textAlign = 'left'
    text.set({ width: text.width + 30 })
    text.enterEditing()
    setIsTyping(true)
    text.on('editing:entered', () => {
      setIsTyping(true)
    })

    // 편집이 끝날 때는 setIsTyping(false)
    text.on('editing:exited', () => {
      setIsTyping(false)
    })
    return text
  }

  const addTextByButton = (value: string) => {
    if (!canvas) return
    const text = getIText(value)
    text.left = textRef.current == null ? 100 : textRef.current.left
    text.top =
      textRef.current == null
        ? 100
        : textRef.current.top + text.fontSize + textRef.current.fontSize
    textRef.current = text
    canvas.add(text)
    canvas.setActiveObject(text)
  }

  // 텍스트 추가
  const handleAddText = (e: fabric.DropEventData) => {
    if (!canvas) return

    const pointer = canvas.getPointer(e.e)
    if (e.target) return

    if (isAddingText) {
      const text = getIText('')
      text.left = pointer.x
      text.top = pointer.y

      // 텍스트 객체를 ref로 관리하여 추적
      textRef.current = text
      canvas.add(text)
      canvas.setActiveObject(text)
    }
  }

  useEffect(() => {
    if (!canvas || !textRef.current) return
    const text = textRef.current

    // 편집이 시작될 때 setIsTyping(true)
    text.on('editing:entered', () => {
      setIsTyping(true)
    })

    // 편집이 종료될 때 setIsTyping(false)
    text.on('editing:exited', () => {
      setIsTyping(false)
    })

    // 텍스트 객체가 활성화되어 있을 때, 다시 편집을 시작하면 `setIsTyping`이 적용되도록 설정
    const handleTextClick = (e: fabric.DropEventData) => {
      if (e.target && e.target === text && !text.isEditing) {
        // 텍스트가 활성화되고 편집 모드에 들어갔을 때
        text.enterEditing()
        setIsTyping(true)
      }
    }

    // 텍스트 객체 클릭 시 편집 상태 시작
    canvas.on('mouse:down', handleTextClick)

    // Cleanup (컴포넌트가 언마운트되거나 텍스트가 삭제될 때)
    return () => {
      canvas.off('mouse:down', handleTextClick)
      if (text) {
        text.off('editing:entered')
        text.off('editing:exited')
      }
    }
  }, [canvas])

  var handleClick: (e: fabric.DropEventData) => void
  useEffect(() => {
    if (!canvas) return
    if (isAddingText) {
      // canvas에 클릭 이벤트 추가
      if (handleClick) canvas.off('mouse:down', handleClick)
      handleClick = (e: fabric.DropEventData) => handleAddText(e)
      canvas.on('mouse:down', handleClick)
      // 컴포넌트가 언마운트될 때 이벤트 제거
      return () => {
        canvas.off('mouse:down', handleClick)
      }
    }
  }, [
    canvas,
    isAddingText,
    currentTextColor,
    fontSize,
    font,
    isBold,
    isUnderline,
    isItalic,
    isHighlighter,
    highlighterColor,
    apiTextData
  ])

  const enableMoveObject = () => {
    if (!canvas) return

    // 객체 이동을 활성화
    canvas.selection = true
    canvas.forEachObject(obj => {
      obj.selectable = true
    })

    setIsMovingObject(true)
    setActiveShape('move')
  }

  const disableMoveObject = () => {
    if (!canvas) return

    // 객체 이동 비활성화
    canvas.selection = false
    canvas.forEachObject(obj => {
      obj.selectable = false
    })

    setIsMovingObject(false)
    setActiveShape(null)
  }

  const disableAll = () => {
    disableDrawing()
    disableErasing()
    disableMoveObject()
    disableAddText()
  }

  /**
   * 객체 선택, 백스페이스 누르면 지워짐
   */
  useEffect(() => {
    if (!canvas) return
    // 'backspace'와 'delete' 키 이벤트 리스너 등록
    const handleKeyDown = (e: KeyboardEvent) => {
      /**
       * 키보드 입력 중 백스페이스면 객체 지우기 안함
       */

      if (isTyping) return
      if (e.key === 'Backspace' || e.key === 'Delete') {
        // 선택된 객체가 하나 이상 있을 때
        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length > 0) {
          // 선택된 객체들을 삭제
          activeObjects.forEach(obj => {
            canvas.remove(obj)
          })
          canvas.discardActiveObject() // 선택 해제
          canvas.renderAll() // 캔버스를 리렌더링하여 삭제된 객체 반영
        }
      }
    }

    // 이벤트 리스너 추가
    window.addEventListener('keydown', handleKeyDown)

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [canvas, isTyping])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex space-x-4 mb-4">
          <Button
            onClick={() => {
              disableAll()
              enableMoveObject()
            }}
            variant={activeShape === 'move' ? 'default' : 'outline'}
          >
            <HandIcon className="mr-2 h-4 w-4" />
            선택
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[100px]">
                <Square className="mr-2 h-4 w-4" />
                도형
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  disableAll()
                  addShape('circle')
                }}
              >
                <CircleIcon className="mr-2 h-4 w-4" />원
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  disableAll()
                  addShape('triangle')
                }}
              >
                <TriangleIcon className="mr-2 h-4 w-4" />
                삼각형
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  disableAll()
                  addShape('rectangle')
                }}
              >
                <Square className="mr-2 h-4 w-4" />
                사각형
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => {
              disableAll()
              enableDrawing()
            }}
            variant={activeShape === 'pen' ? 'default' : 'outline'}
          >
            <Pen className="mr-2 h-4 w-4" /> 펜
          </Button>
          <Button
            onClick={() => {
              disableAll()
              enableErasing()
            }}
            variant={activeShape === 'eraser' ? 'default' : 'outline'}
          >
            <Eraser className="mr-2 h-4 w-4" /> 지우개
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[80px]">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: currentColor }}
                />
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
                    picker: { boxShadow: 'none', border: 'none', width: '100%' }
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
                        onClick={() =>
                          handleColorChangeComplete({
                            hex: color
                          } as ColorResult)
                        }
                        title={`색상: ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Select onValueChange={value => setCurrentThickness(Number(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="굵기" />
            </SelectTrigger>
            <SelectContent>
              {thicknesses.map(thickness => (
                <SelectItem key={thickness} value={thickness.toString()}>
                  {thickness}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                onClick={() => {
                  if (!isAddingText) {
                    disableAll()
                    enableAddText()
                  }
                }}
                variant={activeShape === 'text' ? 'default' : 'outline'}
              >
                <LetterTextIcon className="mr-2 h-4 w-4" />
                텍스트
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[225px] mt-2 relative left-0"
              style={{ top: '100%', left: '0' }} // PopoverContent가 버튼 아래에 나타나도록 설정
            >
              <div className="space-y-2">
                {' '}
                <div className="flex space-x-2 items-center justify-center">
                  <Button
                    onClick={() => {
                      setIsBold(!isBold)
                    }}
                    variant={isBold === true ? 'default' : 'outline'}
                    className="h-10 w-10 flex items-center justify-center text-lg p-3"
                  >
                    <BoldIcon />
                  </Button>

                  <Button
                    onClick={() => {
                      setIsUnderline(!isUnderline)
                    }}
                    variant={isUnderline === true ? 'default' : 'outline'}
                    className="h-10 w-10 flex items-center justify-center text-lg"
                  >
                    <span className="underline">_</span>
                  </Button>

                  <Button
                    onClick={() => {
                      setIsItalic(!isItalic)
                    }}
                    variant={isItalic === true ? 'default' : 'outline'}
                    className="h-10 w-10 flex items-center justify-center text-lg p-3"
                  >
                    <ItalicIcon />
                  </Button>
                  <div className="flex">
                    <Button
                      onClick={() => {
                        setIsHighlighter(!isHighlighter)
                      }}
                      variant={isHighlighter === true ? 'default' : 'outline'}
                      className="h-10 w-8 flex items-center justify-center text-lg p-2 rounded-r-none"
                    >
                      <HighlighterIcon />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          className="h-10 w-auto flex items-center justify-center text-lg p-0 rounded-l-none"
                          variant={'outline'}
                        >
                          ⌄
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="flex justify-center">
                        <ChromePicker
                          color={{
                            r: highlighterColor.r || 0,
                            g: highlighterColor.g || 0,
                            b: highlighterColor.b || 0,
                            a: highlighterColor.a || 1
                          }}
                          onChange={color =>
                            setHighlighterColor({
                              r: color.rgb.r ?? 0,
                              g: color.rgb.g ?? 0,
                              b: color.rgb.b ?? 0,
                              a: color.rgb.a ?? 1
                            })
                          }
                          onChangeComplete={color =>
                            setHighlighterColor({
                              r: color.rgb.r ?? 0,
                              g: color.rgb.g ?? 0,
                              b: color.rgb.b ?? 0,
                              a: color.rgb.a ?? 1
                            })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Select
                    value={font.toString()}
                    onValueChange={value => setFont(value)}
                  >
                    <SelectTrigger className="w-[100px] max-w-[120px] truncate">
                      <SelectValue placeholder={font == '' ? '폰트' : font} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto scroll-smooth">
                      <SelectItem value="Arial" style={{ fontFamily: 'Arial' }}>
                        Arial
                      </SelectItem>
                      <SelectItem
                        value="Courier New"
                        style={{ fontFamily: 'Courier New' }}
                      >
                        Courier New
                      </SelectItem>
                      <SelectItem
                        value="Times New Roman"
                        style={{ fontFamily: 'Times New Roman' }}
                      >
                        Times New Roman
                      </SelectItem>
                      <SelectItem
                        value="경기천년바탕"
                        style={{ fontFamily: '경기천년바탕' }}
                      >
                        경기천년바탕
                      </SelectItem>
                      <SelectItem
                        value="조선100년체"
                        style={{ fontFamily: '조선100년체' }}
                      >
                        조선100년체
                      </SelectItem>
                      <SelectItem
                        value="고운돋움-Regular"
                        style={{ fontFamily: '고운돋움-Regular' }}
                      >
                        고운돋움-Regular
                      </SelectItem>
                      <SelectItem
                        value="프리텐다드"
                        style={{ fontFamily: '프리텐다드' }}
                      >
                        프리텐다드
                      </SelectItem>
                      <SelectItem
                        value="에스코어드림"
                        style={{ fontFamily: '에스코어드림' }}
                      >
                        에스코어드림
                      </SelectItem>
                      <SelectItem
                        value="문경감홍사과"
                        style={{ fontFamily: '문경감홍사과' }}
                      >
                        문경감홍사과
                      </SelectItem>
                      <SelectItem
                        value="베이글팻"
                        style={{ fontFamily: '베이글팻' }}
                      >
                        베이글팻
                      </SelectItem>
                      <SelectItem
                        value="주아체"
                        style={{ fontFamily: '주아체' }}
                      >
                        주아체
                      </SelectItem>
                      <SelectItem
                        value="양진체"
                        style={{ fontFamily: '양진체' }}
                      >
                        양진체
                      </SelectItem>
                      <SelectItem
                        value="쿠키런"
                        style={{ fontFamily: '쿠키런' }}
                      >
                        쿠키런
                      </SelectItem>
                      <SelectItem
                        value="태나다체"
                        style={{ fontFamily: '태나다체' }}
                      >
                        태나다체
                      </SelectItem>
                      <SelectItem
                        value="강원교육튼튼체"
                        style={{ fontFamily: '강원교육튼튼체' }}
                      >
                        강원교육튼튼체
                      </SelectItem>
                      <SelectItem
                        value="설립체 유건욱"
                        style={{ fontFamily: '설립체 유건욱' }}
                      >
                        설립체 유건욱
                      </SelectItem>
                      <SelectItem
                        value="롯데리아 딱붙어체"
                        style={{ fontFamily: '롯데리아 딱붙어체' }}
                      >
                        롯데리아 딱붙어체
                      </SelectItem>
                      <SelectItem
                        value="어그로체"
                        style={{ fontFamily: '어그로체' }}
                      >
                        어그로체
                      </SelectItem>
                      <SelectItem
                        value="파셜산스-Regular"
                        style={{ fontFamily: '파셜산스-Regular' }}
                      >
                        파셜산스-Regular
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* 글꼴 크기 선택 */}
                  <Select
                    value={fontSize.toString()}
                    onValueChange={value => setFontSize(Number(value))}
                  >
                    <SelectTrigger className="w-[100px] max-w-[120px] truncate">
                      <SelectValue placeholder="크기" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                      <SelectItem value="24">24px</SelectItem>
                      <SelectItem value="32">32px</SelectItem>
                      <SelectItem value="48">48px</SelectItem>
                      <SelectItem value="60">60px</SelectItem>
                      <SelectItem value="72">72px</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="h-9 w-10 p-0 flex items-center justify-center"
                        variant={'outline'}
                      >
                        {/* 색상 원 */}
                        <div
                          style={{
                            backgroundColor: currentTextColor,
                            borderRadius: '50%',
                            aspectRatio: '1', // 정사각형 비율 유지
                            width: '80%', // 버튼 크기에 따라 자동으로 크기 조정
                            height: '80%' // 제거하거나 유지해도 좋음 (aspectRatio로 이미 크기 비율이 고정됨)
                          }}
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex justify-center p-2">
                      <ChromePicker
                        color={{
                          r:
                            parseInt(
                              currentTextColor.slice(5).split(',')[0].trim()
                            ) || 0,
                          g:
                            parseInt(
                              currentTextColor.slice(5).split(',')[1].trim()
                            ) || 0,
                          b:
                            parseInt(
                              currentTextColor.slice(5).split(',')[2].trim()
                            ) || 0,
                          a:
                            parseFloat(
                              currentTextColor.slice(5).split(',')[3].trim()
                            ) || 1
                        }}
                        onChange={handleTextColorChange}
                        onChangeComplete={handleTextColorChangeComplete}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div
                  className={`mt-2 overflow-y-scroll bg-gray-800 p-2 rounded-lg space-y-2`}
                  style={{
                    height:
                      apiTextData && apiTextData.length > 0
                        ? `${Math.min(apiTextData.length * 60, 250)}px`
                        : '2.5rem'
                  }}
                >
                  {apiTextData && apiTextData.length > 0 ? (
                    apiTextData.map((text, index) => (
                      <Button
                        key={index}
                        onClick={value => {
                          addTextByButton(apiTextData[index])
                        }}
                        className="w-full max-w-full h-auto px-2 py-1 border border-gray-500 text-white rounded-md whitespace-normal overflow-hidden break-words"
                        variant="outline"
                      >
                        {text}
                      </Button>
                    ))
                  ) : (
                    <div className="text-white flex items-center justify-center">
                      추천 문구가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <canvas ref={canvasRef} />
      </CardContent>
    </Card>
  )
}
