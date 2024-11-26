'use client'
import toast, { Toaster } from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'
import { Rect, Object as FabricObject } from 'fabric'
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
  FrameIcon
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
  const [apiTextData, setApiTextData] = useState([])

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

              // 이미지 크기 조정
              const maxWidth = canvasWidth * 0.8 // 캔버스의 80% 너비
              const maxHeight = canvasHeight * 0.8 // 캔버스의 80% 높이

              const scaleX = maxWidth / img.width!
              const scaleY = maxHeight / img.height!
              const scale = Math.min(scaleX, scaleY, 1) // 비율 유지하며 스케일 제한

              img.scale(scale)

              // 정중앙 배치
              img.set({
                left: canvasWidth / 2 - img.getScaledWidth() / 2,
                top: canvasHeight / 2 - img.getScaledHeight() / 2,
                originX: 'left',
                originY: 'top'
              })

              canvas.add(img)
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
              <Button className="w-full" variant="outline">
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
      </CardContent>
    </Card>
  )
}
