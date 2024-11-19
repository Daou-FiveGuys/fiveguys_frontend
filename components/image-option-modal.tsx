'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Info } from 'lucide-react'
import { XIcon } from 'lucide-react'
import { Separator } from '@radix-ui/react-dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

const styleOptions = [
  {
    value: 'style1',
    label: '스타일 1',
    image:
      'https://i.pinimg.com/736x/39/2d/a2/392da2ecea6c95f366c8df5ef461947e.jpg?height=200&width=200'
  },
  {
    value: 'style2',
    label: '스타일 2',
    image:
      'https://i.pinimg.com/736x/21/74/8e/21748e848c22f6fdfea4fbc876e6261d.jpg?height=200&width=200'
  },
  {
    value: 'style3',
    label: '스타일 3',
    image: '/placeholder.svg?height=200&width=200'
  },
  {
    value: 'style4',
    label: '스타일 4',
    image: '/placeholder.svg?height=200&width=200'
  }
]

const InfoPopover = ({ content }: { content: string }) => (
  <Popover>
    <PopoverTrigger>
      <Info className="w-4 h-4 text-gray-500" />
    </PopoverTrigger>
    <PopoverContent className="text-sm">
      <p>{content}</p>
    </PopoverContent>
  </Popover>
)

export default function Component({
  isOpen = true,
  onClose = ({
    step,
    selectedStyle,
    imageSize,
    numInferenceSteps,
    seed,
    guidanceScale,
    safetyChecker
  }: {
    step: number
    selectedStyle: string
    imageSize: { width: number; height: number }
    numInferenceSteps: number
    seed: string
    guidanceScale: number
    safetyChecker: boolean
  }) => {}
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [imageSize, setImageSize] = useState({ width: 256, height: 256 })
  const [numInferenceSteps, setNumInferenceSteps] = useState(28)
  const [seed, setSeed] = useState('')
  const [guidanceScale, setGuidanceScale] = useState(3.5)
  const [safetyChecker, setSafetyChecker] = useState(true)

  const handleNext = () => {
    if (currentStep === 1 && selectedStyle) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleSubmit = () => {
    onClose({
      step: currentStep,
      selectedStyle,
      imageSize,
      numInferenceSteps,
      seed,
      guidanceScale,
      safetyChecker
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleSubmit}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1 ? '이미지 스타일 선택' : '추가 설정'}
          </DialogTitle>
        </DialogHeader>
        {currentStep === 1 ? (
          <div className="grid grid-cols-2 gap-4">
            {styleOptions.map(style => (
              <div
                key={style.value}
                className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                  selectedStyle === style.value ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedStyle(style.value)}
              >
                <Image
                  src={style.image}
                  alt={style.label}
                  width={200}
                  height={200}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-sm font-medium">
                    {style.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-size">이미지 크기</Label>
              <div className="flex items-center space-x-2">
                <Select
                  value={`${imageSize.width}x${imageSize.height}`}
                  onValueChange={value => {
                    const [width, height] = value.split('x').map(Number)
                    setImageSize({ width, height })
                  }}
                >
                  <SelectTrigger id="image-size" className="flex-[2]">
                    <SelectValue placeholder="이미지 크기 선택" />
                  </SelectTrigger>
                  <SelectContent className="flex-[2]">
                    <SelectItem value="256x256">Default</SelectItem>
                    <SelectItem value="512x512">Square</SelectItem>
                    <SelectItem value="1024x1024">Square HD</SelectItem>
                    <SelectItem value="768x1024">Portrait 3:4</SelectItem>
                    <SelectItem value="576x1024">Portrait 9:16</SelectItem>
                    <SelectItem value="1024x768">Landscape 4:3</SelectItem>
                    <SelectItem value="1024x576">Landscape 16:9</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  disabled={true}
                  value={`${imageSize.width}`}
                  className="flex-[1]"
                />
                <XIcon className="flex space-x-2" />
                <Input
                  disabled={true}
                  value={`${imageSize.height}`}
                  className="flex-[1]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <Label htmlFor="num-inference-steps">Num Inference Steps</Label>
                <Separator className="px-1" />
                <InfoPopover content="이미지 생성 과정의 단계 수를 설정합니다. 높을수록 더 상세한 이미지가 생성되지만 시간이 더 걸립니다." />
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  id="num-inference-steps"
                  min={1}
                  max={50}
                  step={1}
                  value={[numInferenceSteps]}
                  onValueChange={([value]) => setNumInferenceSteps(value)}
                />
                <span>{numInferenceSteps}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <Label htmlFor="seed">Seed</Label>
                <Separator className="px-1" />
                <InfoPopover content="이미지 생성에 사용할 난수 시드입니다. 같은 시드를 사용하면 같은 이미지가 생성됩니다. 비워두면 랜덤 시드가 사용됩니다." />
              </div>
              <Input
                id="seed"
                value={seed}
                onChange={e => setSeed(e.target.value)}
                placeholder="random"
              />
            </div>
            <div className="space-y-2">
              <div className="flex">
                <Label htmlFor="guidance-scale">Guidance Scale (CFG)</Label>
                <Separator className="px-1" />
                <InfoPopover content="안내 스케일(CFG)은 이미지 생성 과정에서 텍스트 프롬프트의 영향력을 조절하는 값입니다. 높을수록 프롬프트에 더 가깝게 이미지가 생성됩니다." />
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  id="guidance-scale"
                  min={0}
                  max={20}
                  step={0.1}
                  value={[guidanceScale]}
                  onValueChange={([value]) => setGuidanceScale(value)}
                />
                <span>{guidanceScale.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="safety-checker"
                checked={safetyChecker}
                onCheckedChange={setSafetyChecker}
                disabled
              />
              <Label htmlFor="safety-checker">Enable Safety Checker</Label>
              <InfoPopover content="안전 검사기를 활성화합니다. (현재 비활성화)" />
            </div>
          </div>
        )}
        <DialogFooter>
          {currentStep === 2 && (
            <Button variant="outline" onClick={handleBack}>
              이전
            </Button>
          )}
          <Button onClick={currentStep === 1 ? handleNext : handleSubmit}>
            {currentStep === 1 ? '다음' : '확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}