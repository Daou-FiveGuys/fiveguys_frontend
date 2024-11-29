'use client'

import { Dispatch, useEffect, useState } from 'react'
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
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import {
  ImageOption,
  ImageStyle,
  initialState,
  setImageOption
} from '@/redux/slices/imageOptionSlice'
import { UnknownAction } from 'redux'
import {ButtonType} from "@/components/prompt-form";

const styleOptions: { value: ImageStyle; label: string; image: string }[] = [
  {
    value: 'waterColor',
    label: '수채화',
    image: 
      'https://i.pinimg.com/736x/39/2d/a2/392da2ecea6c95f366c8df5ef461947e.jpg?height=200&width=200'
  },
  {
    value: 'cityPop',
    label: '시티팝',
    image: 
      'https://i.pinimg.com/736x/21/74/8e/21748e848c22f6fdfea4fbc876e6261d.jpg?height=200&width=200'
  },
  {
    value: 'clearFilter',
    label: '일본 여름풍',
    image: 
      '/clearfilter-img.jpg?height=200&width=200'
  },
  {
    value: 'mix',
    label: '스타일 4',
    image: 
      'https://tjzk.replicate.delivery/models_organizations_avatar/01ed70be-0d47-4a4a-85fb-32c02cdd4ab5/bfl.png'
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
                                    imageOption,
                                    setImageOption,
                                    setActiveButton
                                  }: {
  isOpen?: boolean;
  imageOption: ImageOption;
  setImageOption: React.Dispatch<React.SetStateAction<ImageOption>>;
  setActiveButton: (value: ButtonType) => void;
}) {
  // 내부 상태 관리
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(
      imageOption.imageStyle
  );
  const [imageSize, setImageSize] = useState({
    width: imageOption.width,
    height: imageOption.height
  });
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(
      imageOption.numInferenceSteps
  );
  const [seed, setSeed] = useState<number>(imageOption.seed);
  const [guidanceScale, setGuidanceScale] = useState<number>(
      imageOption.guidanceScale
  );
  const [safetyChecker, setSafetyChecker] = useState(true);

  // imageOption 상태 업데이트
  useEffect(() => {
    const newImageOption: ImageOption = {
      imageStyle: selectedStyle,
      width: imageSize.width,
      height: imageSize.height,
      guidanceScale: guidanceScale,
      seed: seed,
      numInferenceSteps: numInferenceSteps
    };

    // 부모로 상태 전달
    setImageOption(newImageOption);
  }, [
    selectedStyle,
    imageSize.width,
    imageSize.height,
    guidanceScale,
    seed,
    numInferenceSteps,
    setImageOption
  ]);

  // 다음 단계로 이동
  const handleNext = () => {
    if (currentStep === 1 && selectedStyle) {
      setCurrentStep(2);
    }
  };

  // 이전 단계로 이동
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // 제출 로직
  const handleSubmit = () => {
    // isOpen은 props로 전달된 값이므로 직접 수정할 수 없습니다.
    // 부모에서 관리하는 상태를 통해 처리해야 합니다.
    setActiveButton('select-image'); // 버튼 상태 업데이트
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleSubmit}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1 ? '이미지 스타일 선택' : '추가 설정'}
          </DialogTitle>
        </DialogHeader>
        {currentStep === 1 ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {styleOptions.map(style => (
              <div
                key={style.value + style.label}
                className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border ${
                  selectedStyle === style.value
                    ? 'border-primary border-2'
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedStyle(style.value)}
              >
                <div className="aspect-square relative overflow-hidden rounded-lg p-1">
                  <Image
                    src={style.image}
                    alt={style.label}
                    layout="fill"
                    objectFit="cover"
                    className="w-full h-full"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg">
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
                onChange={e => setSeed(parseInt(e.target.value || '0'))}
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
