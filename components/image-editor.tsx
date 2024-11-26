'use client'
import toast, { Toaster } from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'
import { Rect, Object as FabricObject } from 'fabric'
import { filters } from 'fabric'
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
  ImagePlusIcon,
  FrameIcon,
  Sparkles
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
import { EyeClosedIcon } from '@radix-ui/react-icons'
import Modal from './modal'
import { Separator } from '@radix-ui/react-dropdown-menu'
import ImageAIEdit from './image-processing'
import SaveEditedImage from './image-save'
import ImageNotAvailableModal from './image-not-available-modal'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Input } from './ui/input'
import { ChangeEvent } from 'react'
import AddressBookModal from '@/app/address/modal/select-contact-modal'
import apiClient from '@/services/apiClient'
import { Slider } from './ui/slider'
import { useRouter } from 'next/navigation'
import { Dialog } from '@radix-ui/react-dialog'
import { ImageEditorCancelDialog } from './image-editor-cancel-modal'

type FrameOption = 'default' | '512x512' | 'landscape' | 'custom'

const frameOptions: Record<
  Exclude<FrameOption, 'custom'>,
  { width: number; height: number }
> = {
  default: { width: 1024, height: 1024 },
  '512x512': { width: 512, height: 512 },
  landscape: { width: 1024, height: 768 }
}

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
    this.globalCompositeOperation = 'destination-out'
  }

  onMouseUp({ e }: fabric.TEvent<fabric.TPointerEvent>): boolean {
    // 부모 메서드 호출
    const shouldContinue = super.onMouseUp({ e })

    // 추가적으로 globalCompositeOperation 적용
    const ctx = this.canvas.getContext() as CanvasRenderingContext2D
    if (ctx) {
      const originalCompositeOperation = ctx.globalCompositeOperation
      ctx.globalCompositeOperation = this.globalCompositeOperation
      ctx.restore()
      ctx.globalCompositeOperation = originalCompositeOperation
    }

    return shouldContinue
  }
}

interface ShapeOptions {
  fill: string
  stroke: string
  strokeWidth: number
  left: number
  top: number
  width?: number
  height?: number
  radius?: number
}

export default function ImageEditor() {
  const imageSlice = useSelector((state: RootState) => state.image)
  const [originalBackgroundImgObject, setOriginalBackgroundImgObject] =
    useState<fabric.FabricImage<
      Partial<fabric.ImageProps>,
      fabric.SerializedImageProps,
      fabric.ObjectEvents
    > | null>(null)
  const [originImgObject, setOriginImgObject] = useState<fabric.FabricImage<
    Partial<fabric.ImageProps>,
    fabric.SerializedImageProps,
    fabric.ObjectEvents
  > | null>(null)
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [activeShape, setActiveShape] = useState<string | null>(null)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentThickness, setCurrentThickness] = useState(5)
  const [currentShapeThickness, setCurrentShapeThickness] = useState(5)
  const [recentColors, setRecentColors] = useState<string[]>([])
  const [maskRect, setMaskRect] = useState<Rect | null>(null)
  const [maskInfo, setMaskInfo] = useState<MaskInfo | null>(null)
  const [isPen, setIsPen] = useState(false)
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 1024,
    height: 682
  })
  const [originalImgDimensions, setOriginalImgDimension] = useState({
    width: 0,
    height: 0
  })

  useEffect(() => {
    if (canvasElementRef.current) {
      const initializeCanvas = () => {
        const parent = canvasElementRef.current!.parentElement
        const maxWidth = parent?.offsetWidth || 1024 // 최대 너비
        const maxHeight = maxWidth * 0.6666 // 최대 높이 비율 설정 (2:3 비율)

        const options = {
          width: maxWidth,
          height: maxHeight,
          backgroundColor: '#FFFFFF'
        }

        const fabricCanvas = new fabric.Canvas(
          canvasElementRef.current as HTMLCanvasElement,
          options
        )
        fabricCanvas.isDrawingMode = false // 초기 드로잉 모드 비활성화
        fabricCanvas.enableRetinaScaling = true

        setCanvas(fabricCanvas)
        return fabricCanvas
      }

      const fabricCanvas = initializeCanvas()

      if (imageSlice.url) {
        fabric.FabricImage.fromURL(imageSlice.url, {
          crossOrigin: 'anonymous'
        }).then(img => {
          if (
            !canvasElementRef.current ||
            !fabricCanvas ||
            !fabricCanvas.lowerCanvasEl ||
            !fabricCanvas
          )
            return
          const parent = canvasElementRef.current.parentElement
          const parentWidth = parent?.offsetWidth || 1024

          // 최대 캔버스 크기 제한 설정
          const maxWidth = parentWidth
          const maxHeight = maxWidth * 0.6666

          // 이미지 크기 가져오기
          const imgWidth = img.width || 1024
          const imgHeight = img.height || 600

          // 이미지 비율 유지하며 최대 크기 제한 적용
          let scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight)
          const canvasWidth = imgWidth * scale
          const canvasHeight = imgHeight * scale

          setCanvasDimensions({ width: canvasWidth, height: canvasHeight })
          setOriginalImgDimension({ width: canvasWidth, height: canvasHeight })
          fabricCanvas.setDimensions({
            width: canvasWidth,
            height: canvasHeight
          })
          frameOptions.default.width = canvasWidth
          frameOptions.default.height = canvasHeight

          // 이미지 배경 설정 (캔버스 중앙에 배치)
          img.set({
            left: (canvasWidth - img.width * scale) / 2,
            top: (canvasHeight - img.height * scale) / 2
          })
          img
            .clone()
            .then((clonedImg: fabric.FabricImage) => {
              // 비동기 처리 (Promise 사용)
              clonedImg.visible = false
              clonedImg.set({
                left: (canvasWidth - img.width * scale) / 2,
                top: (canvasHeight - img.height * scale) / 2
              })
              clonedImg.scale(scale)
              fabricCanvas.backgroundImage = clonedImg
              setOriginalBackgroundImgObject(clonedImg)
              fabricCanvas.renderAll()
            })
            .catch(error => {
              console.error('Error cloning image:', error)
            })
          img.scale(scale)
          setOriginImgObject(img)
          fabricCanvas.sendObjectToBack(img)
          fabricCanvas.add(img)
          fabricCanvas.renderAll()
        })
      }

      fabricCanvas.on('object:moving', function (e) {
        var obj = e.target

        // 캔버스 크기
        var canvasWidth = fabricCanvas.getWidth()
        var canvasHeight = fabricCanvas.getHeight()

        // 객체의 크기
        var objWidth = obj.getScaledWidth()
        var objHeight = obj.getScaledHeight()

        if (objWidth <= canvasWidth && objHeight <= canvasHeight) {
          if (obj.left < 0) {
            obj.left = 0
          }
          if (obj.top < 0) {
            obj.top = 0
          }
          if (obj.left + objWidth > canvasWidth) {
            obj.left = canvasWidth - objWidth
          }
          if (obj.top + objHeight > canvasHeight) {
            obj.top = canvasHeight - objHeight
          }

          // 객체 위치 업데이트
          obj.setCoords()
        }
      })

      const handleResize = () => {
        // 크기 설정 후에는 이 이벤트가 동작하지 않도록 합니다.
        return
      }
      fabricCanvas.on('object:added', () => {
        fabricCanvas.sendObjectToBack(originImgObject!)
      })
      fabricCanvas.on('object:modified', () => {
        fabricCanvas.sendObjectToBack(originImgObject!)
      })

      window.addEventListener('resize', handleResize)

      return () => {
        fabricCanvas.dispose()
        window.removeEventListener('resize', handleResize)
      }
    }
  }, []) // 빈 배열로 한 번만 실행되도록 설정

  const enableDrawing = () => {
    if (!canvas) return
    setIsPen(true)
    canvas.isDrawingMode = true
    if (!canvas.freeDrawingBrush) {
      const customBrush = new CustomPencilBrush(canvas)
      customBrush.globalCompositeOperation = 'source-atop'
      canvas.freeDrawingBrush = customBrush

      // 객체 추가 이벤트로 배경색 유지
      canvas.on('before:path:created', () => {
        const ctx = canvas.getContext() as CanvasRenderingContext2D
        if (ctx) {
          ctx.save()
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width!, canvas.height!)
          ctx.restore()
        }
      })
    }
    canvas.freeDrawingBrush.width = currentThickness
    canvas.freeDrawingBrush.color = currentColor

    // 명시적 배경 렌더링
    canvas.backgroundColor = '#FFFFFF'
    canvas.renderAll()
    setActiveShape('pen')
  }
  //펜 기능

  useEffect(() => {
    if (!canvas || !originImgObject) return

    const handleSelection = () => {
      const activeObjects = canvas.getActiveObjects()

      if (activeObjects.includes(originImgObject)) {
        if (activeShape !== 'move') {
          // "선택" 모드가 아닌 경우 원본 이미지 선택 해제
          canvas.discardActiveObject()

          const objectsToKeepActive = activeObjects.filter(
            (obj: fabric.Object) => obj !== originImgObject
          )

          // 원본 이미지를 제외한 객체들만 다시 활성화
          if (objectsToKeepActive.length > 0) {
            const selection = new fabric.ActiveSelection(objectsToKeepActive, {
              canvas: canvas
            })
            canvas.setActiveObject(selection)
          }

          canvas.renderAll()
        }
      }
    }

    canvas.on('selection:created', handleSelection)
    canvas.on('selection:updated', handleSelection)

    return () => {
      canvas.off('selection:created', handleSelection)
      canvas.off('selection:updated', handleSelection)
    }
  }, [canvas, originImgObject, activeShape])

  const disableDrawing = () => {
    if (!canvas) return
    setIsPen(false)
    canvas.isDrawingMode = false
    setActiveShape(null)
  }

  const enableErasing = () => {
    if (!canvas || !originImgObject) return

    canvas.isDrawingMode = false
    canvas.selection = true

    // 원본 이미지는 선택 불가하게 설정
    originImgObject.selectable = false
    originImgObject.evented = false

    // 다른 객체들은 선택 가능하게 설정
    canvas.forEachObject((obj: fabric.Object) => {
      if (obj !== originImgObject) {
        obj.selectable = true
        obj.evented = true
      }
    })

    canvas.defaultCursor = 'crosshair'

    // 클릭한 객체를 삭제하는 이벤트 핸들러
    const eraseObject = (
      options: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ): void => {
      const target = options.target // 선택된 객체에 접근
      if (target && target !== originImgObject) {
        canvas.remove(target)
        canvas.discardActiveObject()
        canvas.requestRenderAll()
      }
    }

    // 기존의 이벤트 핸들러 제거 후 새 이벤트 핸들러 추가
    canvas.off('mouse:down')
    canvas.on('mouse:down', eraseObject)

    setActiveShape('eraser')
  }

  const disableErasing = () => {
    if (!canvas || !originImgObject) return

    // 이벤트 핸들러 제거
    canvas.off('mouse:down')

    // 모든 객체 선택 불가 설정
    canvas.forEachObject((obj: fabric.Object) => {
      obj.selectable = false
      obj.evented = false
    })

    // 원본 이미지 선택 불가 설정
    originImgObject.selectable = false
    originImgObject.evented = false

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

  const fontRef = useRef(font)
  const fontSizeRef = useRef(fontSize)
  const isBoldRef = useRef(isBold)
  const isUnderlineRef = useRef(isUnderline)
  const isItalicRef = useRef(isItalic)
  const isHighlighterRef = useRef(isHighlighter)
  const highlighterColorRef = useRef(highlighterColor)
  const currentTextColorRef = useRef(currentTextColor)
  useEffect(() => {
    fontRef.current = font
  }, [font])

  useEffect(() => {
    fontSizeRef.current = fontSize
  }, [fontSize])

  useEffect(() => {
    isBoldRef.current = isBold
  }, [isBold])

  useEffect(() => {
    isUnderlineRef.current = isUnderline
  }, [isUnderline])

  useEffect(() => {
    isItalicRef.current = isItalic
  }, [isItalic])

  useEffect(() => {
    isHighlighterRef.current = isHighlighter
  }, [isHighlighter])

  useEffect(() => {
    highlighterColorRef.current = highlighterColor
  }, [highlighterColor])

  useEffect(() => {
    currentTextColorRef.current = currentTextColor
  }, [currentTextColor])

  const [isMovingObject, setIsMovingObject] = useState<boolean>(false)
  const textRef = useRef<fabric.IText | null>(null) // text 객체를 추적하는 ref

  const [content, setContet] = useState(
    useSelector((state: RootState) => state.messageOption.content)
  )
  useEffect(() => {
    if (!content) {
      apiClient
        .post('/ai/gpt/extract-key-points', { text: content })
        .then(res => {
          if (res.data.code === 200) {
            setApiTextData(res.data.data)
          }
        })
        .catch(err => {
          setApiTextData([])
        })
    }
  }, [content])
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
    if (!canvas || !originImgObject) return

    canvas.selection = true

    canvas.forEachObject((obj: fabric.Object) => {
      if (obj !== originImgObject) {
        obj.selectable = true
        obj.evented = true
      } else {
        obj.selectable = false
        obj.evented = false
      }
    })

    setActiveShape('text')
    setIsAddingText(true)
  }

  useEffect(() => {
    if (!canvas || !originImgObject) return

    // 클릭 이벤트 리스너 추가
    const handleMouseDown = (
      event: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      // 클릭된 객체가 originalImgObject인지 확인
      if (event.target === originImgObject) {
        canvas.discardActiveObject() // 선택 해제
        canvas.renderAll() // 캔버스 다시 렌더링
      }
    }

    canvas.on('mouse:down', handleMouseDown)

    // Cleanup: 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      canvas.off('mouse:down', handleMouseDown)
    }
  }, [canvas, originImgObject])

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
      fontWeight: isBoldRef.current ? 'bold' : 'normal',
      fontSize: fontSizeRef.current,
      fill: currentTextColorRef.current,
      fontFamily: fontRef.current,
      underline: isUnderlineRef.current,
      backgroundColor: isHighlighterRef.current
        ? `rgba(${highlighterColorRef.current.r}, ${highlighterColorRef.current.g}, ${highlighterColorRef.current.b}, ${highlighterColorRef.current.a})`
        : 'rgba(0, 0, 0, 0)',
      fontStyle: isItalicRef.current ? 'italic' : 'normal'
    })
    text.textAlign = 'left'
    text.set({ width: text.width + text.fontSize / 2 })
    text.enterEditing()
    setIsTyping(true)

    text.on('editing:entered', () => {
      setIsTyping(true)
    })

    text.on('editing:exited', () => {
      setIsTyping(false)
    })

    return text
  }
  const parseRGBA = (rgbaString: string) => {
    const match = rgbaString.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.?\d*))?\)/
    )
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: match[4] ? parseFloat(match[4]) : 1
      }
    }
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  useEffect(() => {
    if (!canvas) return

    const handleSelection = () => {
      const activeObjects = canvas.getActiveObjects()
      if (activeObjects.length === 1 && activeObjects[0].type === 'i-text') {
        const text = activeObjects[0] as fabric.IText

        setFont(text.fontFamily || 'Arial')
        setFontSize(text.fontSize || 20)
        setIsBold(text.fontWeight === 'bold' || Number(text.fontWeight) > 500)
        setIsUnderline(!!text.underline)
        setIsItalic(text.fontStyle === 'italic')
        setCurrentTextColor(text.fill as string)

        // Parse background color for highlighter
        if (
          text.backgroundColor &&
          text.backgroundColor !== 'rgba(0, 0, 0, 0)'
        ) {
          setIsHighlighter(true)
          setHighlighterColor(parseRGBA(text.backgroundColor as string))
        } else {
          setIsHighlighter(false)
        }
      } else {
        // Multiple objects selected or not a text object
        // Keep existing state or reset if necessary
      }
    }

    const handleSelectionCleared = () => {
      // Optionally reset state variables or leave them unchanged
    }

    canvas.on('selection:created', handleSelection)
    canvas.on('selection:updated', handleSelection)
    canvas.on('selection:cleared', handleSelectionCleared)

    return () => {
      canvas.off('selection:created', handleSelection)
      canvas.off('selection:updated', handleSelection)
      canvas.off('selection:cleared', handleSelectionCleared)
    }
  }, [canvas])

  const addTextByButton = (value: string) => {
    if (!canvas) return

    const text = getIText(value)
    text.left = textRef.current == null ? 0 : textRef.current.left
    text.top =
      textRef.current == null
        ? 40
        : textRef.current.top + text.fontSize + textRef.current.fontSize

    // 캔버스 경계를 벗어나지 않도록 위치 조정
    const canvasWidth = canvas.width ?? 0
    const canvasHeight = canvas.height ?? 0

    // 텍스트가 캔버스 너비를 넘어가면 왼쪽으로 위치를 초기화
    if (text.left + text.width > canvasWidth) {
      text.left = 0
    }

    // 텍스트가 캔버스 높이를 넘어가면 맨 위로 초기화
    if (text.top + text.fontSize > canvasHeight) {
      text.top = 40
    }

    // 객체가 화면을 벗어나면 사이즈를 줄이고 toast 메시지를 표시
    if (
      text.left + text.width > canvasWidth ||
      text.top + text.fontSize > canvasHeight
    ) {
      const scaleFactor = Math.min(
        canvasWidth / text.width,
        canvasHeight / text.fontSize
      )
      text.set({ scaleX: scaleFactor, scaleY: scaleFactor })

      // toast 메시지 출력
      toast(
        t => (
          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap', // 텍스트가 한 줄로 표시되도록 설정
              borderRadius: '8px',
              backgroundColor: 'black',
              color: 'white',
              fontSize: '16px',
              fontWeight: 500
            }}
          >
            텍스트가 화면을 벗어났습니다. 텍스트 크기가 자동으로 줄어들었습니다.
          </div>
        ),
        {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: 'transparent',
            boxShadow: 'none'
          }
        }
      )
    }

    textRef.current = text
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
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
      if (isDragging) {
        if (!originImgObject) return
        // 현재 활성 객체들을 가져옴
        const activeObjects = canvas.getActiveObjects()

        if (activeObjects.includes(originImgObject)) {
          // 선택된 객체 중 originImgObject를 제거
          canvas.discardActiveObject() // 전체 비활성화
          const objectsToKeepActive = activeObjects.filter(
            obj => obj !== originImgObject
          )

          // originImgObject를 제외한 객체만 다시 활성화
          if (objectsToKeepActive.length > 0) {
            const selection = new fabric.ActiveSelection(objectsToKeepActive, {
              canvas: canvas
            })
            canvas.setActiveObject(selection)
          }
        }
        canvas.renderAll() // 렌더링 반영
      } else if (isAddingText) {
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
    if (!canvas || !originImgObject) return

    canvas.selection = true

    canvas.forEachObject((obj: fabric.Object) => {
      obj.selectable = true
      obj.evented = true
    })

    // 원본 이미지도 선택 가능하게 설정
    originImgObject.selectable = true
    originImgObject.evented = true

    setIsMovingObject(true)
    setActiveShape('move')
  }

  const disableMoveObject = () => {
    if (!canvas || !originImgObject) return

    canvas.selection = false

    canvas.forEachObject((obj: fabric.Object) => {
      obj.selectable = false
      obj.evented = false
    })

    originImgObject.selectable = false
    originImgObject.evented = false

    setIsMovingObject(false)
    setActiveShape(null)
  }

  const disableAll = () => {
    if (!canvas || !originImgObject) return
    canvas.discardActiveObject()
    // 모든 이벤트 핸들러 제거
    canvas.off('mouse:down', eraseObject as any)
    canvas.off('selection:created', handleSelection)
    canvas.off('selection:updated', handleSelection)

    // 모든 객체 선택 불가
    canvas.selection = false

    canvas.forEachObject((obj: fabric.Object) => {
      obj.selectable = false
      obj.evented = false
    })

    // 원본 이미지 선택 불가
    originImgObject.selectable = false
    originImgObject.evented = false

    setImageFilterPopoverOpen(false)
    setIsFramePopover(false)
    setIsFramePopoverOpen(false)
    setSelectedShape(null)
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

    // 현재 캔버스 객체를 상태에 저장
    canvas
      .getObjects()
      .forEach(obj => setNormalObject(prevState => [...prevState, obj]))

    canvas.isDrawingMode = true
    setIsMaskingMode(true)
    setIsEraseMode(false)

    if (!canvas.freeDrawingBrush) {
      // CustomPencilBrush 인스턴스 생성
      const customBrush = new CustomPencilBrush(canvas)
      customBrush.globalCompositeOperation = 'source-atop' // 겹치는 부분 투명 처리
      canvas.freeDrawingBrush = customBrush
    }

    // 브러시 속성 설정
    canvas.freeDrawingBrush.color = '#CC99FF80'
    canvas.freeDrawingBrush.width = maskingPenThickness

    // 변경 사항 즉시 반영
    canvas.renderAll()
  }

  const startMasking = () => {
    if (!canvas) return
    setIsMaskingMode(true)
    setIsEraseMode(false)

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

  // eraseObject 함수 정의
  const eraseObject = (
    options: fabric.TPointerEventInfo<fabric.TPointerEvent>
  ): void => {
    const target = options.target
    if (canvas && target && target !== originImgObject) {
      canvas.remove(target)
      canvas.discardActiveObject()
      canvas.requestRenderAll()
    }
  }

  // handleSelection 함수 정의
  const handleSelection = (): void => {
    if (!canvas || !originImgObject) return

    canvas.forEachObject((obj: fabric.Object) => {
      if (obj !== originImgObject) {
        obj.selectable = true
        obj.evented = true
      } else {
        obj.selectable = false
        obj.evented = false
      }
    })
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = function (f) {
        const data = f.target?.result
        if (typeof data === 'string') {
          fabric.FabricImage.fromURL(data, { crossOrigin: 'anonymous' }).then(
            img => {
              if (!canvas) return

              const canvasWidth = canvas.getWidth()
              const canvasHeight = canvas.getHeight()

              // 이미지 크기 비율 조정
              const maxWidth = canvasWidth * 0.8 // 캔버스의 80% 너비
              const maxHeight = canvasHeight * 0.8 // 캔버스의 80% 높이
              const scaleX = maxWidth / img.width!
              const scaleY = maxHeight / img.height!
              const scale = Math.min(scaleX, scaleY, 1) // 비율 유지하며 최대 스케일 제한

              img.scale(scale)

              // 이미지 정중앙 배치
              img.set({
                left: canvasWidth / 2 - img.getScaledWidth() / 2,
                top: canvasHeight / 2 - img.getScaledHeight() / 2,
                originX: 'left',
                originY: 'top'
              })

              // 최소 크기 설정
              img.setControlsVisibility({
                mt: false, // top middle
                mb: false, // bottom middle
                ml: false, // middle left
                mr: false // middle right
              })

              img.on(
                'scaling',
                (event: fabric.TEvent<fabric.TPointerEvent>) => {
                  const obj = (event as unknown as { target: fabric.Object })
                    .target
                  if (!obj) return

                  const boundingRect = obj.getBoundingRect() // true로 설정해 화면 경계를 기준으로
                  const minSize = 50

                  if (
                    boundingRect.width < minSize ||
                    boundingRect.height < minSize
                  ) {
                    const scaleX = minSize / boundingRect.width
                    const scaleY = minSize / boundingRect.height
                    const scale = Math.max(scaleX, scaleY)

                    obj.scale(scale)
                    obj.left = boundingRect.left // 위치 보정
                    obj.top = boundingRect.top
                  }

                  obj.setCoords()
                  canvas.renderAll()
                }
              )

              canvas.add(img)
              canvas.setActiveObject(img)
              canvas.renderAll()
            }
          )
        }
      }
      reader.readAsDataURL(file)
    }
  }
  const triggerFileInput = () => {
    document.getElementById('fileInput')?.click()
  }

  /**
   * 마스킹 객체, 원본 객체 토글 수행
   */
  useEffect(() => {
    if (!canvas || !canvas.backgroundImage || !originImgObject) return
    if (isMasking) {
      normalObjects.forEach(obj => {
        obj.set({
          visible: false,
          selectable: false
        })
      })
      canvas.backgroundImage.visible = true
      canvas.setDimensions(originalImgDimensions)
      originImgObject.visible = false
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
      canvas.backgroundImage.visible = false
      canvas.setDimensions(canvasDimensions)
      originImgObject.visible = true
    }
    canvas.discardActiveObject()
    canvas.renderAll() // 화면 업데이트
  }, [isMasking])

  useEffect(() => {
    if (!canvas || !canvas.backgroundImage) return
    canvas.backgroundImage.visible = isMasking
  }, [canvas?.backgroundImage, isMasking])

  const enableTool = (tool: string) => {
    switch (tool) {
      case 'move':
        enableMoveObject()
        break
      case 'circle':
      case 'triangle':
      case 'rectangle':
        setSelectedShape(tool)
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
      case 'addSticker':
        triggerFileInput()
        break
      case 'frameSize':
        setIsFramePopover(true)
        setIsFramePopoverOpen(true)
        break
      case 'filter':
        setImageFilterPopoverOpen(true)
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
    if (!canvas || !canvas.backgroundImage) return
    disableAll()
    if (pendingTool) enableTool(pendingTool) // 전환할 도구 활성화
    setInpaintPrompt('')
    setPendingTool(null) // 초기화
    setShowConfirmationModal(false) // 모달 닫기
  }

  const cancelToolSwitch = () => {
    setPendingTool(null) // 초기화
    setShowConfirmationModal(false) // 모달 닫기
  }

  const [currentShapeColor, setCurrentShapeColor] =
    useState('rgba(0, 0, 0, 255)')

  useEffect(() => {
    if (!canvas) return
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = maskingPenThickness
    }
  }, [maskingPenThickness])

  const [isInpainting, setIsInpainting] = useState(false)
  const [isRemovingText, setIsRemovingText] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [available, setAvailable] = useState(true)
  const [inpaintPrompt, setInpaintPrompt] = useState('')
  const modes = [
    {
      mode: 'inpaint',
      isProcessing: isInpainting,
      setIsProcessing: setIsInpainting,
      option: inpaintPrompt
    },
    {
      mode: 'removeText',
      isProcessing: isRemovingText,
      setIsProcessing: setIsRemovingText,
      option: selectedApi
    },
    {
      mode: 'upscale',
      isProcessing: isUpscaling,
      setIsProcessing: setIsUpscaling,
      option: null
    }
  ]
  const [isDone, setIsDone] = useState(false)
  const [selectedShape, setSelectedShape] = useState<string | null>(null)
  const [isFillEnabled, setIsFillEnabled] = useState(false)

  useEffect(() => {
    if (!canvas || !selectedShape) return

    // 드래그 선택 상자 비활성화
    canvas.selection = false

    let isDrawing = false
    let startX = 0
    let startY = 0
    let shapeInstance: fabric.Object | null = null
    let isDragged = false // 드래그 여부 확인 변수

    const onMouseDown = (
      event: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      if (!(event.e instanceof MouseEvent)) return

      // 클릭한 위치에 객체가 있는지 확인
      const target = canvas.findTarget(
        event as unknown as fabric.TPointerEvent
      ) as fabric.Object

      // 객체가 선택되었고, 그것이 도형 객체라면 선택만 수행
      if (
        target &&
        (target.type === 'circle' ||
          target.type === 'triangle' ||
          target.type === 'rect')
      ) {
        canvas.setActiveObject(target)
        canvas.renderAll()
        return
      }

      // 새로운 도형을 그릴 준비
      isDrawing = true
      isDragged = false // 드래그 여부 초기화
      const pointer = canvas.getPointer(event.e)
      startX = pointer.x
      startY = pointer.y
    }

    const onMouseMove = (
      event: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      if (!isDrawing || !(event.e instanceof MouseEvent)) return

      isDragged = true // 드래그 중임을 표시
      const pointer = canvas.getPointer(event.e)

      if (!shapeInstance) {
        // 도형의 초기 크기를 1x1로 설정
        const shapeOptions: ShapeOptions = {
          fill: isFillEnabled ? currentShapeColor : 'transparent',
          stroke: currentShapeColor,
          strokeWidth: currentShapeThickness,
          left: startX,
          top: startY
        }

        switch (selectedShape) {
          case 'circle':
            shapeInstance = new fabric.Circle({
              ...shapeOptions,
              radius: 1
            })
            break
          case 'triangle':
            shapeInstance = new fabric.Triangle({
              ...shapeOptions,
              width: 1,
              height: 1
            })
            break
          case 'rectangle':
            shapeInstance = new fabric.Rect({
              ...shapeOptions,
              width: 1,
              height: 1
            })
            break
          default:
            return
        }
        canvas.add(shapeInstance)
        canvas.setActiveObject(shapeInstance)
      }

      // 드래그에 따른 도형 크기 조정
      if (
        shapeInstance instanceof fabric.Circle &&
        selectedShape === 'circle'
      ) {
        const radius =
          Math.max(Math.abs(pointer.x - startX), Math.abs(pointer.y - startY)) /
          2
        shapeInstance.set({
          radius,
          left: startX - radius,
          top: startY - radius
        } as Partial<fabric.Circle>)
      } else if (shapeInstance) {
        shapeInstance.set({
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
          left: pointer.x < startX ? pointer.x : startX,
          top: pointer.y < startY ? pointer.y : startY
        })
      }

      shapeInstance.setCoords()
      canvas.renderAll()
    }

    const onMouseUp = () => {
      if (!isDragged && !shapeInstance) {
        // 드래그 없이 클릭만 했다면 기본 크기로 도형 생성
        const shapeOptions: ShapeOptions = {
          fill: isFillEnabled ? currentShapeColor : 'transparent',
          stroke: currentShapeColor,
          strokeWidth: currentShapeThickness,
          left: startX,
          top: startY,
          width: 50,
          height: 50
        }

        switch (selectedShape) {
          case 'circle':
            shapeInstance = new fabric.Circle({
              ...shapeOptions,
              radius: 25 // 기본 크기 50x50에 맞게 설정
            })
            break
          case 'triangle':
            shapeInstance = new fabric.Triangle(shapeOptions)
            break
          case 'rectangle':
            shapeInstance = new fabric.Rect(shapeOptions)
            break
          default:
            return
        }

        canvas.add(shapeInstance)
        canvas.setActiveObject(shapeInstance)
        canvas.renderAll()
      }

      isDrawing = false
      shapeInstance = null
    }

    canvas.on('mouse:down', onMouseDown)
    canvas.on('mouse:move', onMouseMove)
    canvas.on('mouse:up', onMouseUp)

    return () => {
      canvas.off('mouse:down', onMouseDown)
      canvas.off('mouse:move', onMouseMove)
      canvas.off('mouse:up', onMouseUp)
    }
  }, [
    canvas,
    selectedShape,
    isFillEnabled,
    currentShapeColor,
    currentShapeThickness
  ])

  const handleShapeColorChange = (color: ColorResult) => {
    const { r, g, b, a } = color.rgb
    setCurrentShapeColor(`rgba(${r}, ${g}, ${b}, ${a})`)
    setPickerColor({ r, g, b, a: a ?? 1 })
  }

  const handleShapeColorChangeComplete = (color: ColorResult) => {
    const { r, g, b, a } = color.rgb
    setCurrentShapeColor(`rgba(${r}, ${g}, ${b}, ${a})`)
  }

  const [pickerColor, setPickerColor] = useState({
    r: 0,
    g: 0,
    b: 0,
    a: 1
  })

  // `currentShapeColor`가 변경될 때마다 `pickerColor` 상태 업데이트
  useEffect(() => {
    if (currentShapeColor.startsWith('rgba')) {
      const colorParts = currentShapeColor.slice(5, -1).split(',')
      setPickerColor({
        r: parseInt(colorParts[0].trim()) || 0,
        g: parseInt(colorParts[1].trim()) || 0,
        b: parseInt(colorParts[2].trim()) || 0,
        a: parseFloat(colorParts[3]?.trim()) || 1
      })
    }
  }, [currentShapeColor])
  // 팝오버 열림 상태
  useEffect(() => {
    if (!canvas) return
    canvas.setWidth(canvasDimensions.width)
    canvas.setHeight(canvasDimensions.height)
    setWidth(canvas.width)
    setHeight(canvas.height)
    canvas.renderAll()
  }, [canvasDimensions.width, canvasDimensions.height])

  useEffect(() => {
    if (!originImgObject || !canvas) return
    if (originImgObject.left + originImgObject.width > canvas.width) {
      originImgObject.left = 0
    }

    // 텍스트가 캔버스 높이를 넘어가면 맨 위로 초기화
    if (originImgObject.top + originImgObject.height > canvas.height) {
      originImgObject.top = 0
    }
  }, [originImgObject, canvas])

  const [isFramePopover, setIsFramePopover] = useState(false)
  const [isframePopoverOpen, setIsFramePopoverOpen] = useState(false)

  const [selectedOption, setSelectedOption] = useState<FrameOption>('default')
  const [width, setWidth] = useState(canvasDimensions.width)
  const [height, setHeight] = useState(canvasDimensions.height)

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

  const applyCanvasSize = () => {
    if (!canvas) return
    setCanvasDimensions({ width: width, height: height })
    if (width > 1024) setWidth(1024)
    if (height > 1024) setHeight(1024)
    canvas.width = width
    canvas.height = height
    canvas.renderAll()
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [method, setMethod] = useState<string>('image')
  const handleFileGenerated = (generatedFile: File, method: string) => {
    setMethod(method)
    setFile(generatedFile)
    setIsModalOpen(true)
  }

  /**
   * Handle closing the modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFile(null)
  }

  const [imageFilterPopoverOpen, setImageFilterPopoverOpen] = useState(false)
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [selectedColor, setSelectedColor] = useState('#FF0000')
  const [showAdjustments, setShowAdjustments] = useState(false) // 조절 패널 표시 여부

  const applyFilter = (
    filter: filters.BaseFilter<string, Record<string, any>>
  ) => {
    if (!originImgObject) return

    // 기존 필터 초기화 후 새로운 필터 추가
    originImgObject.filters = originImgObject.filters || []
    originImgObject.filters.push(filter)
    if (brightness !== 0) {
      originImgObject.filters.push(new filters.Brightness({ brightness }))
    }
    if (contrast !== 0) {
      originImgObject.filters.push(new filters.Contrast({ contrast }))
    }
    if (saturation !== 0) {
      originImgObject.filters.push(new filters.Saturation({ saturation }))
    }
    originImgObject.applyFilters()
    canvas?.renderAll()
  }

  const resetFilters = () => {
    if (!originImgObject) return

    // 모든 필터 초기화
    originImgObject.filters = []
    originImgObject.applyFilters()
    canvas?.renderAll()

    // 슬라이더 값 초기화
    setBrightness(0)
    setContrast(0)
    setSaturation(0)
  }

  // 밝기, 대비, 채도 적용
  const updateColorAdjustments = () => {
    if (!originImgObject) return

    // 기존 필터 유지하면서 밝기, 대비, 채도 필터 업데이트
    const existingFilters =
      originImgObject.filters?.filter(
        filter =>
          !(filter instanceof filters.Brightness) &&
          !(filter instanceof filters.Contrast) &&
          !(filter instanceof filters.Saturation)
      ) || []

    if (brightness !== 0) {
      existingFilters.push(new filters.Brightness({ brightness }))
    }
    if (contrast !== 0) {
      existingFilters.push(new filters.Contrast({ contrast }))
    }
    if (saturation !== 0) {
      existingFilters.push(new filters.Saturation({ saturation }))
    }

    originImgObject.filters = existingFilters
    originImgObject.applyFilters()
    canvas?.renderAll()
  }

  // 상태 변수 선언
  const [filterPreviews, setFilterPreviews] = useState<
    {
      name: string
      filter: filters.BaseFilter<string, Record<string, any>>
      dataUrl: string
    }[]
  >([])

  // 필터 프리뷰 생성 함수
  const [filtersList, setFilter] = useState<
    { name: string; filter: filters.BaseFilter<string, Record<string, any>> }[]
  >([
    { name: '빈티지 효과', filter: new filters.Vintage() },
    { name: '코닥 크롬', filter: new filters.Kodachrome() },
    { name: '브라우니 효과', filter: new filters.Brownie() },
    { name: '세피아', filter: new filters.Sepia() },
    { name: '흑백', filter: new filters.Grayscale() },
    { name: '테크니컬러', filter: new filters.Technicolor() },
    { name: '폴라로이드 효과', filter: new filters.Polaroid() },
    { name: '노이즈 추가', filter: new filters.Noise({ noise: 10 }) },
    { name: '생동감', filter: new filters.Vibrance({ vibrance: 0.5 }) },
    {
      name: '컨볼루션 필터',
      filter: new filters.Convolute({
        matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0]
      })
    },
    { name: '컬러 매트릭스', filter: new filters.ColorMatrix() },
    { name: '블러', filter: new filters.Blur({ blur: 0.02 }) },
    {
      name: '감마 보정',
      filter: new filters.Gamma({ gamma: [1.2, 1.2, 1.2] })
    },
    { name: '픽셀화', filter: new filters.Pixelate({ blocksize: 1 }) },
    {
      name: '특정 색상 제거',
      filter: new filters.RemoveColor({ color: '#FF0000', distance: 0.3 })
    },
    { name: '색상 반전', filter: new filters.Invert() },
    { name: '색조 회전', filter: new filters.HueRotation({ rotation: 0.1 }) }
  ])

  const generateFilterPreviews = async () => {
    if (!originImgObject) return

    const croppedWidth = originImgObject.width! * 0.3
    const croppedHeight = croppedWidth

    const previews = await Promise.all(
      filtersList.map(async ({ name, filter }) => {
        try {
          const clonedImg =
            (await originImgObject.clone()) as fabric.FabricImage

          if (!clonedImg) {
            return { name, filter, dataUrl: '' }
          }

          // Crop image
          const left = (clonedImg.width! - croppedWidth) / 2
          const top = (clonedImg.height! - croppedHeight) / 2
          clonedImg.set({
            cropX: left,
            cropY: top,
            width: croppedWidth,
            height: croppedHeight,
            scaleX: 1,
            scaleY: 1
          })

          // Apply filter
          clonedImg.filters = [filter]
          clonedImg.applyFilters()

          // Render on temporary canvas
          const previewCanvas = document.createElement('canvas')
          previewCanvas.width = croppedWidth
          previewCanvas.height = croppedHeight
          const tempCanvas = new fabric.StaticCanvas(previewCanvas)
          tempCanvas.add(clonedImg)
          tempCanvas.renderAll()

          // Get data URL
          const dataUrl = previewCanvas.toDataURL('image/png')

          return { name, filter, dataUrl }
        } catch (error) {
          console.error('Error generating preview for filter:', name, error)
          return { name, filter, dataUrl: '' }
        }
      })
    )

    setFilterPreviews(previews)
  }

  useEffect(() => {
    if (imageFilterPopoverOpen && !isMasking) {
      generateFilterPreviews()
    }
  }, [imageFilterPopoverOpen])

  const [trigger, setTrigger] = useState(false)
  useEffect(() => {
    if (!isMasking) {
      setTrigger(!isMasking)
      generateFilterPreviews()
    }
  }, [isMasking])

  const [showCancelModal, setShowCancelModal] = useState(false) // 취소 모달 상태 추가
  const router = useRouter() // 루트 도메인으로 이동하기 위한 라우터

  return (
    <Card className="w-full max-w-5xl mx-auto overflow-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 mb-4">
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
          <Popover open={isPenPopoverOpen} onOpenChange={setIsPenPopoverOpen}>
            <PopoverTrigger asChild>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full text-sm p-2 h-9">
                {selectedShape === 'circle' ? (
                  <>
                    <CircleIcon className="mr-2 h-4 w-4" />원
                  </>
                ) : selectedShape === 'triangle' ? (
                  <>
                    <TriangleIcon className="mr-2 h-4 w-4" />
                    삼각형
                  </>
                ) : selectedShape === 'rectangle' ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    사각형
                  </>
                ) : (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    도형
                  </>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col space-y-1">
                <Button
                  onClick={() => {
                    if (selectedShape !== 'circle') handleToolSwitch('circle')
                  }}
                  className="flex items-center p-2"
                  variant={selectedShape === 'circle' ? 'default' : 'outline'}
                >
                  <CircleIcon className="mr-2 h-4 w-4" />원
                </Button>
                <Button
                  onClick={() => {
                    if (selectedShape !== 'triangle')
                      handleToolSwitch('triangle')
                  }}
                  className="flex items-center p-2"
                  variant={selectedShape === 'triangle' ? 'default' : 'outline'}
                >
                  <TriangleIcon className="mr-2 h-4 w-4" />
                  삼각형
                </Button>
                <Button
                  onClick={() => {
                    if (selectedShape !== 'rectangle')
                      handleToolSwitch('rectangle')
                  }}
                  className="flex items-center p-2"
                  variant={
                    selectedShape === 'rectangle' ? 'default' : 'outline'
                  }
                >
                  <Square className="mr-2 h-4 w-4" />
                  사각형
                </Button>
              </div>
              <div className="flex items-center space-x-2 border-t pt-2 mt-2 w-full">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="h-9 w-1/3 p-0 flex items-center justify-center"
                      variant="outline"
                    >
                      {/* 색상 원 */}
                      <div
                        style={{
                          backgroundColor: currentShapeColor,
                          borderRadius: '50%',
                          aspectRatio: '1',
                          width: '25%' // 버튼 크기에 따라 자동으로 크기 조정
                        }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="flex justify-center p-2">
                    <ChromePicker
                      color={pickerColor}
                      onChange={handleShapeColorChange}
                      onChangeComplete={handleShapeColorChangeComplete}
                    />
                  </PopoverContent>
                </Popover>

                <Select
                  onValueChange={value =>
                    setCurrentShapeThickness(Number(value))
                  }
                >
                  <SelectTrigger className="w-1/3">
                    <SelectValue
                      placeholder={
                        currentShapeThickness === 5
                          ? `굵기`
                          : currentShapeThickness
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {thicknesses.map(thickness => (
                      <SelectItem key={thickness} value={thickness.toString()}>
                        {thickness}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="h-9 w-1/3"
                  variant={isFillEnabled ? 'default' : 'outline'}
                  onClick={() => {
                    setIsFillEnabled(!isFillEnabled)
                  }}
                >
                  채우기
                </Button>
              </div>
            </PopoverContent>
          </Popover>
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
                          onClick={() => {
                            if (isMasking) handleToolChange('masking')
                          }}
                          variant={isMaskingMode ? 'default' : 'outline'}
                        >
                          마스킹
                        </Button>
                        <Separator className="p-1" />
                        <Button
                          className="w-full"
                          onClick={() => {
                            if (isMasking) handleToolChange('eraser')
                          }}
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
            <div>
              <Button
                className="w-full text-sm p-2 h-9"
                onClick={() => {
                  handleToolSwitch('addSticker')
                }}
                variant="outline"
              >
                <ImagePlusIcon className="mr-2 h-4 w-4" />
                스티커
              </Button>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
            <div>
              {/* Popover 버튼 */}
              <Popover
                open={imageFilterPopoverOpen}
                onOpenChange={setImageFilterPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    className="w-full text-sm p-2 h-9"
                    variant={imageFilterPopoverOpen ? 'default' : 'outline'}
                    onClick={() => {
                      if (!imageFilterPopoverOpen) {
                        handleToolSwitch('filter') // 조건 확인 및 도구 전환
                      } else {
                        setImageFilterPopoverOpen(false) // 팝오버 닫기
                      }
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    이미지 필터
                  </Button>
                </PopoverTrigger>
                {!isMasking && (
                  <PopoverContent className="w-96">
                    {/* 팝오버 컨텐츠 */}
                    <div className="space-y-4">
                      {/* 상단 영역: 원본으로 되돌리기 버튼과 조절 버튼 */}
                      <div className="flex items-center space-x-2">
                        {/* 원본으로 되돌리기 버튼 */}
                        <Button
                          onClick={resetFilters}
                          variant="outline"
                          className="w-full"
                        >
                          원본으로 되돌리기
                        </Button>

                        {/* 조절 버튼 */}

                        {/* 조절 Popover */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full">
                              조절
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-4">
                            {/* 조절 패널 */}
                            <div className="space-y-6">
                              {/* 밝기, 대비, 채도 슬라이더 */}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    밝기
                                  </label>
                                  <Slider
                                    className="w-full"
                                    min={-1}
                                    max={1}
                                    step={0.1}
                                    value={[brightness]}
                                    onValueChange={value => {
                                      setBrightness(value[0])
                                      updateColorAdjustments()
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    대비
                                  </label>
                                  <Slider
                                    className="w-full"
                                    min={-1}
                                    max={1}
                                    step={0.1}
                                    value={[contrast]}
                                    onValueChange={value => {
                                      setContrast(value[0])
                                      updateColorAdjustments()
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    채도
                                  </label>
                                  <Slider
                                    className="w-full"
                                    min={-1}
                                    max={1}
                                    step={0.1}
                                    value={[saturation]}
                                    onValueChange={value => {
                                      setSaturation(value[0])
                                      updateColorAdjustments()
                                    }}
                                  />
                                </div>
                              </div>

                              {/* RemoveColor 필터용 컬러 피커 */}
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  색상 제거
                                </label>
                                <div className="rounded-lg border p-2">
                                  <ChromePicker
                                    color={selectedColor}
                                    onChange={color => {
                                      setSelectedColor(color.hex)
                                      // 필터 리스트 업데이트
                                      filtersList.forEach(item => {
                                        if (item.name === '특정 색상 제거') {
                                          item.filter = new filters.RemoveColor(
                                            {
                                              color: color.hex,
                                              distance: 0.3
                                            }
                                          )
                                        }
                                      })
                                      generateFilterPreviews() // 프리뷰 업데이트
                                    }}
                                    disableAlpha
                                  />
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      {/* 필터 프리뷰 영역 */}
                      <div className="overflow-y-auto max-h-96">
                        <div className="grid grid-cols-2 gap-2">
                          {filterPreviews.map((preview, index) => (
                            <div
                              key={index}
                              className="relative group cursor-pointer"
                              onClick={() => applyFilter(preview.filter)}
                            >
                              <img
                                src={preview.dataUrl}
                                alt={preview.name}
                                className="w-full h-full object-cover rounded-lg" // border-radius 적용
                              />
                              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-lg"></div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-center">
                                  {preview.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            </div>
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
                      onValueChange={value => {
                        setFont(value)
                      }}
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
                          className="w-full max-w-full h-auto px-2 py-1 border border-gray-500 rounded-md whitespace-normal overflow-hidden break-words"
                          variant="outline"
                          style={{ background: 'default' }}
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

          <Popover open={isframePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={isFramePopover ? 'default' : 'outline'}
                onClick={() => {
                  if (!isFramePopover) handleToolSwitch('frameSize')
                  if (!isMasking) setIsFramePopoverOpen(!isframePopoverOpen)
                }}
              >
                <FrameIcon className="mr-2 h-4 w-4" />
                프레임
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <Select
                  onValueChange={handleOptionChange}
                  value={selectedOption}
                >
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
                      value={width === 0 ? 0 : Math.floor(width)}
                      onChange={e => {
                        const value = parseInt(e.target.value)
                        value === 0 ? 0 : Math.floor(value)
                        setWidth(value)
                      }}
                      disabled={selectedOption !== 'custom'}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Height:</span>
                    <Input
                      type="number"
                      value={height === 0 ? 0 : Math.floor(height)}
                      onChange={e => {
                        const value = parseInt(e.target.value)
                        value === 0 ? 0 : Math.floor(value)
                        setHeight(value)
                      }}
                      disabled={selectedOption !== 'custom'}
                    />
                  </label>
                </div>
                <Button onClick={applyCanvasSize} className="w-full">
                  적용
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {showConfirmationModal && (
          <Modal
            message="완료되지 않은 작업은 삭제됩니다. 계속하시겠습니까?"
            onConfirm={confirmToolSwitch}
            onCancel={cancelToolSwitch}
          />
        )}

        <div
          className="flex items-center justify-center bg-black" // Flexbox 설정
          style={{
            position: 'relative' // 화면 중앙 정렬을 위한 position 설정
          }}
        >
          <div
            className="flex items-center justify-center"
            style={
              !isMasking
                ? {
                    width: `${canvasDimensions.width}px`,
                    height: `${canvasDimensions.height}px`
                  }
                : {
                    width: `${originalImgDimensions.width}px`,
                    height: `${originalImgDimensions.height}px`
                  }
            }
          >
            <canvas ref={canvasElementRef} />
          </div>
        </div>

        <Separator className="p-2" />
        {isMasking && (
          <>
            <textarea
              value={inpaintPrompt}
              onChange={event => {
                setInpaintPrompt(event.target.value)
              }}
              className="w-full p-2 border rounded resize-none"
              style={{ height: '4rem', overflowY: 'auto' }}
              placeholder="내용을 입력하세요..."
            />
            <Separator className="p-1" />
          </>
        )}
        <div className="flex justify-end">
          {!isMasking && !isRemoveText && !isUpscale && (
            <>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowCancelModal(true)}
              >
                취소
              </Button>
              <Separator className="p-1" />
            </>
          )}
          <Button
            disabled={isMasking && inpaintPrompt.length === 0}
            onClick={() => {
              if (isInpainting || isRemovingText || isUpscaling) {
                setAvailable(false)
                return
              }

              if (isMasking && !isInpainting) {
                setIsInpainting(true)
              }
              if (isRemoveText && !isRemovingText) {
                setIsRemovingText(true)
              }
              if (isUpscale && !isUpscaling) {
                setIsUpscaling(true)
              }
              if (!isMasking && !isRemoveText && !isUpscale) {
                setIsDone(true)
              }
            }}
            className="w-full"
          >
            {isMasking
              ? '이미지 수정'
              : isRemoveText
                ? '텍스트 제거'
                : isUpscale
                  ? '업 스케일링'
                  : '완료'}
          </Button>
        </div>
        {modes.map(({ mode, isProcessing, setIsProcessing, option }) => (
          <ImageAIEdit
            key={mode}
            canvas={canvas}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            option={option}
            mode={mode}
            originImgObject={originImgObject}
            setOriginImgObject={setOriginImgObject}
            isMasking={isMasking}
          />
        ))}
        {isDone && (
          <SaveEditedImage
            canvas={canvas}
            isDone={isDone}
            setIsDone={setIsDone}
            onFileGenerated={handleFileGenerated}
          />
        )}
        {isModalOpen && file && (
          <AddressBookModal
            file={file}
            onClose={handleCloseModal}
            method={method}
          />
        )}
        {!available && (
          <ImageNotAvailableModal onConfirm={() => setAvailable(true)} />
        )}
        {showCancelModal && (
          <ImageEditorCancelDialog
            onConfirm={() => router.push('/')}
            onCancel={() => setShowCancelModal(false)}
          />
        )}
      </CardContent>
    </Card>
  )
}
