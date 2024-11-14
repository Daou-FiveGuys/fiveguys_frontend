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
  CircleIcon,
  Hand as HandIcon,
  ItalicIcon,
  BoldIcon,
  HighlighterIcon,
  LetterTextIcon,
  Pen,
  Square,
  TriangleIcon,
  Eraser,
  ChevronDown,
  HammerIcon,
  Wand2Icon,
  SparklesIcon,
  EyeOffIcon,
  Crop,
  Image
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { EyeClosedIcon } from '@radix-ui/react-icons'
import Modal from './modal'
import { Separator } from '@radix-ui/react-dropdown-menu'
import ImageAIEdit from './image-processing'

const thicknesses = [1, 2, 3, 5, 8, 13, 21, 34, 40]

interface MaskInfo {
  left: number
  top: number
  width: number
  height: number
}
//마스킹 정보 인터페이스.

class CustomPencilBrush extends fabric.PencilBrush {
  globalCompositeOperation: GlobalCompositeOperation

  constructor(canvas: fabric.Canvas) {
    super(canvas)
    this.globalCompositeOperation = 'destination-out' // 원하는 블렌딩 모드 설정
  }

  applyCompositeOperation(ctx: CanvasRenderingContext2D) {
    ctx.globalCompositeOperation = this.globalCompositeOperation
  }
}

const ImageEditModal = ({
  maskInfo,
  onEdit,
  onClose
}: {
  maskInfo: MaskInfo
  onEdit: () => void
  onClose: () => void
}) => {
  return (
    <Dialog
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
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
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  // const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [activeShape, setActiveShape] = useState<string | null>(null)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentThickness, setCurrentThickness] = useState(5)
  const [recentColors, setRecentColors] = useState<string[]>([])
  const [maskRect, setMaskRect] = useState<Rect | null>(null)
  const [maskInfo, setMaskInfo] = useState<MaskInfo | null>(null)
  const [isPen, setIsPen] = useState(false)

  useEffect(() => {
    if (canvasElementRef.current) {
      const initializeCanvas = () => {
        const parent = canvasElementRef.current!.parentElement
        const width = parent?.offsetWidth || 800
        const height = width * 0.6666

        const options = {
          width,
          height,
          backgroundColor: '#f0f0f0'
        }

        const fabricCanvas = new Canvas(
          canvasElementRef.current as HTMLCanvasElement,
          options
        )
        fabricCanvas.isDrawingMode = false
        setCanvas(fabricCanvas)

        return fabricCanvas
      }

      const fabricCanvas = initializeCanvas()
      fabric.FabricImage.fromURL('/123.jpg').then(function (img) {
        fabricCanvas.backgroundImage = img
        img.canvas = fabricCanvas
      })

      const handleResize = () => {
        const parent = canvasElementRef.current?.parentElement
        const width = parent?.offsetWidth || 800
        const height = width * 0.6666

        fabricCanvas.setDimensions({ width, height })
        fabricCanvas.renderAll()
      }

      window.addEventListener('resize', handleResize)

      return () => {
        fabricCanvas.dispose()
        window.removeEventListener('resize', handleResize)
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
    setIsPen(true)
    canvas.isDrawingMode = true
    if (!canvas.freeDrawingBrush) {
      const customBrush = new CustomPencilBrush(canvas)
      customBrush.globalCompositeOperation = 'source-atop' // 겹치는 부분을 투명하게 처리
      canvas.freeDrawingBrush = customBrush
      canvas.on('before:path:created', () => {
        const ctx = canvas.getContext() as CanvasRenderingContext2D
        if (ctx) {
          customBrush.applyCompositeOperation(ctx)
        }
      })
      // canvas.freeDrawingBrush = new PencilBrush(canvas)
    }
    canvas.freeDrawingBrush.width = currentThickness
    canvas.freeDrawingBrush.color = currentColor
    setActiveShape('pen')
  }
  //펜 기능

  const disableDrawing = () => {
    if (!canvas) return
    setIsPen(false)
    canvas.isDrawingMode = false
    setActiveShape(null)
  }

  const enableErasing = () => {
    if (!canvas) return

    canvas.isDrawingMode = false
    canvas.selection = true
    canvas.forEachObject(obj => {
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
    canvas.forEachObject(obj => {
      obj.selectable = false
      if (obj !== maskRect) {
        obj.opacity = 0
      }
    })

    let startX = 0
    let startY = 0
    let isDown = false
    let newRect: Rect | null = null

    canvas.on('mouse:down', options => {
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
        strokeWidth: 1
      })

      canvas.add(newRect)
      canvas.requestRenderAll()
    })

    canvas.on('mouse:move', options => {
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
      canvas.forEachObject(obj => {
        obj.opacity = 1
      })
      canvas.renderAll()
    }
  }

  const handleImageEdit = () => {
    if (canvas) {
      canvas.forEachObject(obj => {
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
        canvas.forEachObject(obj => {
          obj.selectable = true
        })
      } else if (activeShape === 'eraser') {
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

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: '경기천년바탕', label: '경기천년바탕' },
    { value: '조선100년체', label: '조선100년체' },
    { value: '고운돋움-Regular', label: '고운돋움-Regular' },
    { value: '프리텐다드', label: '프리텐다드' },
    { value: '에스코어드림', label: '에스코어드림' },
    { value: '문경감홍사과', label: '문경감홍사과' },
    { value: '베이글팻', label: '베이글팻' },
    { value: '주아체', label: '주아체' },
    { value: '양진체', label: '양진체' },
    { value: '쿠키런', label: '쿠키런' },
    { value: '태나다체', label: '태나다체' },
    { value: '강원교육튼튼체', label: '강원교육튼튼체' },
    { value: '설립체 유건욱', label: '설립체 유건욱' },
    { value: '롯데리아 딱붙어체', label: '롯데리아 딱붙어체' },
    { value: '어그로체', label: '어그로체' },
    { value: '파셜산스-Regular', label: '파셜산스-Regular' }
  ]

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
    text.set({ width: text.width + text.fontSize / 2 })
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

    // 캔버스 경계를 벗어나지 않도록 위치 조정
    const canvasWidth = canvas.width ?? 0
    const canvasHeight = canvas.height ?? 0

    // 텍스트가 캔버스 너비를 넘어가면 왼쪽으로 위치를 초기화
    if (text.left + text.width > canvasWidth) {
      text.left = 100
    }

    // 텍스트가 캔버스 높이를 넘어가면 맨 위로 초기화
    if (text.top + text.fontSize > canvasHeight) {
      text.top = 100
    }
    textRef.current = text
    canvas.add(text)
    canvas.setActiveObject(text)
  }

  useEffect(() => {
    if (!canvas) return

    let isDragging = false // 드래그 여부를 확인하는 플래그
    let startPointer: fabric.Point | null = null // 마우스가 눌린 시작 위치

    // 마우스가 눌렸을 때 위치를 기록
    const handleMouseDown = (
      options: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      startPointer = canvas.getPointer(options.e)
      isDragging = false
    }

    // 마우스가 움직였을 때 드래그 여부 확인
    const handleMouseMove = (
      options: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      if (!startPointer) return
      const pointer = canvas.getPointer(options.e)
      const distance = Math.sqrt(
        Math.pow(pointer.x - startPointer.x, 2) +
          Math.pow(pointer.y - startPointer.y, 2)
      )
      // 특정 거리 이상 이동하면 드래그로 간주
      if (distance > 5) {
        isDragging = true
      }
    }

    // 마우스가 놓였을 때, 드래그가 아니면 텍스트 추가
    const handleMouseUp = (
      options: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      if (!isDragging && isAddingText) {
        handleAddText(options) // 클릭 이벤트로 텍스트 추가
      }
      startPointer = null
    }

    // 이벤트 등록
    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    // Cleanup
    return () => {
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
    }
  }, [canvas, isAddingText])

  // 텍스트를 추가하는 함수 (기존의 handleAddText 함수 수정)
  const handleAddText = (
    options: fabric.TPointerEventInfo<fabric.TPointerEvent>
  ) => {
    if (!canvas) return

    const pointer = canvas.getPointer(options.e)
    if (options.target) return // 다른 객체가 클릭된 경우 텍스트를 추가하지 않음

    const text = getIText('') // 새로운 텍스트 객체 생성
    text.left = pointer.x
    text.top = pointer.y

    // 텍스트 객체를 ref로 관리하여 추적
    textRef.current = text
    canvas.add(text)
    canvas.setActiveObject(text)
  }

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
    disableMasking()
    disableDrawing()
    disableErasing()
    disableMoveObject()
    disableAddText()
    disableAITool()
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

  const [isMasking, setIsMasking] = useState(false) // 이미지 수정 상태
  const [isRemoveText, setIsRemoveText] = useState(false)
  const [selectedApi, setSelectedApi] = useState<string | null>('imggen') // 텍스트 제거 API 선택 상태
  const [maskingPenThickness, setMaskingPenThickness] = useState(20)
  const [isAITool, setIsAITool] = useState(false)
  const [normalObjects, setNormalObject] = useState<
    FabricObject<
      Partial<fabric.FabricObjectProps>,
      fabric.SerializedObjectProps,
      fabric.ObjectEvents
    >[]
  >([])
  const [pendingTool, setPendingTool] = useState<string | null>(null) // 임시로 전환할 도구를 저장
  const [showConfirmationModal, setShowConfirmationModal] = useState(false) // 모달 표시 여부

  const [isAddTextPopoverOpen, setIsAddTextPopoverOpen] = useState(false)
  const [isPenPopoverOpen, setIsPenPopoverOpen] = useState(false)
  const [isMaskingMode, setIsMaskingMode] = useState<boolean>(false)
  const [isEraseMode, setIsEraseMode] = useState<boolean>(false)
  const [isUpscale, setIsUpcale] = useState(false)

  const disableAITool = () => {
    setIsMasking(false)
    setIsUpcale(false)
    setIsRemoveText(false)
    setIsAITool(false)
    canvas?.renderAll()
  }

  const setMasking = () => {
    if (!canvas) return
    let canvasObjects = canvas.getObjects()
    canvasObjects.map(obj =>
      setNormalObject(noneMaskObject => [...noneMaskObject, obj])
    )
    canvas.isDrawingMode = true
    setIsMaskingMode(true)
    setIsEraseMode(false)
    if (!canvas.freeDrawingBrush) {
      const customBrush = new CustomPencilBrush(canvas)
      customBrush.globalCompositeOperation = 'source-atop' // 겹치는 부분을 투명하게 처리
      canvas.freeDrawingBrush = customBrush
      canvas.on('before:path:created', () => {
        const ctx = canvas.getContext() as CanvasRenderingContext2D
        if (ctx) {
          customBrush.applyCompositeOperation(ctx)
        }
      })
      // canvas.freeDrawingBrush = new PencilBrush(canvas)
    }
    canvas.freeDrawingBrush.color = '#CC99FF80'
    canvas.freeDrawingBrush.width = maskingPenThickness
    canvas.renderAll
  }
  const startMasking = () => {
    if (!canvas) return
    setIsMaskingMode(true)
    setIsEraseMode(false)

    /** TODO
     *
     * 이미지 수정 모드가 종료되었을 때도 수행할것
     *
     *
     * */
    canvas.off('mouse:down')
    canvas.isDrawingMode = true

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = '#CC99FF80'
      canvas.freeDrawingBrush.width = maskingPenThickness
    }
  }

  // 지우개 시작 함수
  const startErasing = () => {
    if (!canvas) return
    setIsMaskingMode(false)
    setIsEraseMode(true)
    canvas.isDrawingMode = false // 드로잉 모드 비활성화하여 객체 선택 모드로 전환

    // 객체 선택 후 클릭하면 삭제
    canvas.on('mouse:down', event => {
      const target = canvas.findTarget(event.e)
      if (target) {
        canvas.remove(target)
        canvas.requestRenderAll()
      }
    })
  }

  // 도구 변경 핸들러
  const handleToolChange = (tool: string) => {
    if (tool === 'masking') {
      startMasking()
    } else if (tool === 'eraser') {
      startErasing()
    }
  }

  // 마스킹 또는 지우개 두께 변경 시 업데이트
  useEffect(() => {
    if (!canvas || !canvas.freeDrawingBrush) return
    if (isMaskingMode) canvas.freeDrawingBrush.width = maskingPenThickness
  }, [maskingPenThickness, isMaskingMode])

  const handleMaskingClick = () => {
    if (isMasking) return
    setNormalObject(canvas!.getObjects())
    setMasking()
    setIsAITool(true)
    setIsMasking(true)
    setIsRemoveText(false)
  }

  const handleTextRemovalClick = () => {
    setIsMasking(false)
    setIsAITool(true)
    setIsRemoveText(true)
    setSelectedApi('imggen')
  }

  const handleUpscale = () => {
    setIsMasking(false)
    setIsRemoveText(false)
    setIsAITool(true)
    setIsUpcale(true)
  }

  /**
   * 마스킹 객체, 원본 객체 토글 수행
   */
  useEffect(() => {
    if (!canvas) return
    if (isMasking) {
      normalObjects.forEach(obj => {
        obj.set({
          visible: false,
          selectable: false
        })
      })
    } else {
      let maskObjects = canvas
        ?.getObjects()
        .filter(canvasObj => !normalObjects.some(obj => obj === canvasObj))
      maskObjects?.map(maskObj => canvas?.remove(maskObj))
      normalObjects.forEach(obj => {
        obj.set({
          visible: true,
          selectable: true
        })
      })
    }
    canvas.renderAll() // 화면 업데이트
  }, [isMasking])

  const enableTool = (tool: string) => {
    switch (tool) {
      case 'move':
        enableMoveObject()
        break
      case 'circle':
      case 'triangle':
      case 'rectangle':
        addShape(tool)
        break
      case 'pen':
        enableDrawing()
        break
      case 'eraser':
        enableErasing()
        break
      case 'addText':
        enableAddText()
        break
      case 'aiTool':
        setIsAITool(true)
        break
      case 'inpaint':
        handleMaskingClick()
        break
      case 'removeText':
        handleTextRemovalClick()
        break
      case 'upscale':
        handleUpscale()
        break
      default:
        console.warn(`Unknown tool: ${tool}`)
    }
  }

  const handleToolSwitch = (newTool: string) => {
    if (isMasking && newTool !== 'inpaint') {
      setPendingTool(newTool) // 전환할 도구 저장
      setShowConfirmationModal(true) // 모달 표시
    } else {
      disableAll()
      enableTool(newTool)
    }
  }

  const confirmToolSwitch = () => {
    disableAll()
    if (pendingTool) enableTool(pendingTool) // 전환할 도구 활성화
    setPendingTool(null) // 초기화
    setShowConfirmationModal(false) // 모달 닫기
  }

  const cancelToolSwitch = () => {
    setPendingTool(null) // 초기화
    setShowConfirmationModal(false) // 모달 닫기
  }

  useEffect(() => {
    if (!canvas) return
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = maskingPenThickness
    }
  }, [maskingPenThickness])

  const [isInpainting, setIsInpainting] = useState(false)
  const [isRemovingText, setIsRemovingText] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const modes = [
    {
      mode: 'inpaint',
      isProcessing: isInpainting,
      setIsProcessing: setIsInpainting
    },
    {
      mode: 'removeText',
      isProcessing: isRemovingText,
      setIsProcessing: setIsRemovingText
    },
    {
      mode: 'upscale',
      isProcessing: isUpscaling,
      setIsProcessing: setIsUpscaling
    }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-4">
          <Button
            onClick={() => {
              handleToolSwitch('move')
            }}
            className="w-full text-sm p-2 h-9"
            variant={activeShape === 'move' ? 'default' : 'outline'}
          >
            <HandIcon className="mr-2 h-4 w-4" />
            선택
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full text-sm p-2 h-9">
                <Square className="mr-2 h-4 w-4" />
                도형
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  handleToolSwitch('circle')
                }}
              >
                <CircleIcon className="mr-2 h-4 w-4" />원
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  handleToolSwitch('triangle')
                }}
              >
                <TriangleIcon className="mr-2 h-4 w-4" />
                삼각형
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  handleToolSwitch('rectangle')
                }}
              >
                <Square className="mr-2 h-4 w-4" />
                사각형
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover open={isPenPopoverOpen} onOpenChange={setIsPenPopoverOpen}>
            <PopoverTrigger>
              <Button
                className="w-full text-sm p-2 h-9"
                onClick={() => {
                  if (!isPen) {
                    handleToolSwitch('pen')
                  }
                }}
                variant={activeShape === 'pen' ? 'default' : 'outline'}
              >
                <Pen className="mr-2 h-4 w-4" /> 펜
              </Button>
            </PopoverTrigger>
            {isPen && (
              <PopoverContent className="w-auto p-0">
                <div className="flex space-x-2 p-2">
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
                            picker: {
                              boxShadow: 'none',
                              border: 'none',
                              width: '100%'
                            }
                          }
                        }}
                      />
                      {recentColors.length > 0 && (
                        <div className="mt-4 w-full">
                          <p className="text-sm font-medium mb-2">
                            최근 사용한 색상
                          </p>
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
                  <Select
                    onValueChange={value => setCurrentThickness(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="굵기" />
                    </SelectTrigger>
                    <SelectContent>
                      {thicknesses.map(thickness => (
                        <SelectItem
                          key={thickness}
                          value={thickness.toString()}
                        >
                          {thickness}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            )}
          </Popover>
          <Button
            className="w-full text-sm p-2 h-9"
            onClick={() => {
              handleToolSwitch('eraser')
            }}
            variant={activeShape === 'eraser' ? 'default' : 'outline'}
          >
            <Eraser className="mr-2 h-4 w-4" /> 지우개
          </Button>
          <div className="flex">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  onClick={() => {
                    if (!isAITool) {
                      handleToolSwitch('aiTool')
                    }
                  }}
                  variant={isAITool ? 'default' : 'outline'}
                  className="w-full text-sm p-2 h-9"
                  // className="h-9 w-full flex items-center justify-center whitespace-nowrap"
                >
                  <HammerIcon className="mr-2 h-4 w-4" />
                  AI 도구
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex-col w-full items-center justify-center space-y-2 p-2">
                {/* 이미지 수정 버튼 */}
                <div className="flex items-center space-x-0">
                  <Button
                    onClick={() => {
                      if (!isMasking) {
                        handleToolSwitch('inpaint')
                      }
                    }}
                    variant={isMasking ? 'default' : 'outline'}
                    className="h-9 flex items-center justify-center p-2 rounded-r-none"
                  >
                    <Wand2Icon className="mr-2 h-4 w-4" />
                    이미지 수정
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="h-9 w-auto flex items-center justify-center text-lg p-0 rounded-l-none"
                        variant="outline"
                      >
                        ⌄
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col w-full items-center justify-center space-y-2 p-2">
                      <div className="flex w-full items-center justify-center">
                        <Button
                          className="w-full"
                          onClick={() => handleToolChange('masking')}
                          variant={isMaskingMode ? 'default' : 'outline'}
                        >
                          마스킹
                        </Button>
                        <Separator className="p-1" />
                        <Button
                          className="w-full"
                          onClick={() => handleToolChange('eraser')}
                          variant={isEraseMode ? 'default' : 'outline'}
                        >
                          지우개
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        {[5, 10, 20, 35, 50].map(thickness => (
                          <Button
                            disabled={!isMaskingMode}
                            key={thickness}
                            onClick={() => setMaskingPenThickness(thickness)}
                            variant={
                              maskingPenThickness === thickness
                                ? 'default'
                                : 'outline'
                            }
                            className="h-8 w-8 rounded-full border flex items-center justify-center"
                          >
                            {thickness}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 텍스트 제거 버튼 */}
                <div className="flex items-center space-x-0">
                  <Button
                    onClick={() => {
                      handleToolSwitch('removeText')
                    }}
                    variant={isRemoveText === true ? 'default' : 'outline'}
                    className="h-9 flex items-center justify-center p-2 rounded-r-none"
                  >
                    <EyeClosedIcon className="mr-2 h-4 w-4" />
                    텍스트 제거
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="h-9 w-auto flex items-center justify-center text-lg p-0 rounded-l-none"
                        variant="outline"
                      >
                        ⌄
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex-col w-full items-center justify-center space-y-2 p-2">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setSelectedApi('imggen')}
                          className={`h-8 w-auto px-4 rounded border`}
                          variant={
                            isRemoveText === true && selectedApi === 'imggen'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          ImgGen
                        </Button>
                        <Button
                          onClick={() => setSelectedApi('photoroom')}
                          className={`h-8 w-auto px-4 rounded border`}
                          variant={
                            isRemoveText === true && selectedApi === 'photoroom'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          PhotoRoom
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center space-x-0">
                  <Button
                    onClick={() => {
                      handleToolSwitch('upscale')
                    }}
                    variant={isUpscale === true ? 'default' : 'outline'}
                    className="h-9 w-full flex items-center justify-center p-2 rounded"
                  >
                    <SparklesIcon className="mr-2 h-4 w-4" />업 스케일링
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Popover
            open={isAddTextPopoverOpen}
            onOpenChange={setIsAddTextPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                className="w-full text-sm p-2 h-9"
                onClick={() => {
                  if (!isAddingText) {
                    handleToolSwitch('addText')
                  }
                }}
                variant={activeShape === 'text' ? 'default' : 'outline'}
              >
                <LetterTextIcon className="mr-2 h-4 w-4" />
                텍스트
              </Button>
            </PopoverTrigger>
            {isAddingText && (
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
                        {fontOptions.map(font => (
                          <SelectItem
                            key={font.value}
                            value={font.value}
                            style={{ fontFamily: font.value }}
                          >
                            {font.label}
                          </SelectItem>
                        ))}
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
            )}
          </Popover>
        </div>
        {showConfirmationModal && (
          <Modal
            message="완료되지 않은 작업은 삭제됩니다. 계속하시겠습니까?"
            onConfirm={confirmToolSwitch}
            onCancel={cancelToolSwitch}
          />
        )}
        <div className="relative w-full h-0 pb-[66.66%] bg-gray-200">
          <canvas
            ref={canvasElementRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
        <Separator className="p-2" />
        <div className="flex justify-end">
          {!isMasking && !isRemoveText && !isUpscale && (
            <>
              <Button className="w-full" variant="outline">
                취소
              </Button>
              <Separator className="p-1" />
            </>
          )}

          <Button
            onClick={() => {
              if (isMasking && !isInpainting) {
                setIsInpainting(true)
              }
              if (isRemoveText && !isRemovingText) {
                setIsRemovingText(true)
              }
              if (isUpscale && !isUpscaling) {
                setIsUpscaling(true)
              }
            }}
            className="w-full"
          >
            {isMasking
              ? '프롬프트 입력'
              : isRemoveText
                ? '텍스트 제거'
                : isUpscale
                  ? '업 스케일링'
                  : '완료'}
          </Button>
        </div>
        {modes.map(({ mode, isProcessing, setIsProcessing }) => (
          <ImageAIEdit
            key={mode}
            canvas={canvas}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            mode={mode}
          />
        ))}
      </CardContent>
    </Card>
  )
}
