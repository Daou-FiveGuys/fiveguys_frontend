import Link from 'next/link'
import { Github } from 'lucide-react'
import AnimatedButton from './animated-button'
import { Separator } from '@radix-ui/react-separator'

export function HeroSection() {
  return (
    <section className="relative flex items-center justify-center h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="spotlight left"></div>
        {/* 우하단 스포트라이트 */}
        <div className="spotlight right"></div>
      </div>
      <div className="container relative z-10 isolate flex flex-col items-center justify-center gap-4 py-12 text-center md:py-16 transform -translate-y-40">
        <div className="relative inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
          <div className="animate-gradient absolute inset-0 block h-full w-full bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:var(--bg-size)_100%] p-[1px] ![mask-composite:subtract] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]"></div>
          <span className="relative z-10">
            🎉 2024 Hansung Univ. PreCapstone{' '}
            <span className="inline-block transform scale-x-[-1]">🎉</span>
          </span>
        </div>
        <Separator className="space-y-2" />
        <div className="w-full space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-7xl font-saas">
            문자 발송의 새로운 패러다임 <br></br>
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Pa·Letter
            </span>{' '}
            🎨
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            아직도 문자 내용을 고민하세요? AI가 문장을 만들어주고, 이미지
            생성까지 해주는 새로운 문자 서비스, Pa·Letter를 만나보세요!
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <AnimatedButton className="mx-auto flex justify-center">
            <span className="z-10 w-48 whitespace-pre bg-gradient-to-b from-black from-30% to-gray-300/80 bg-clip-text text-center text-sm font-semibold leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 dark:text-transparent">
              {`시작하기`}
            </span>
          </AnimatedButton>
          <button className="inline-flex font-pretendard font-extrabold items-center justify-center rounded-md border border-transparent bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <Link
              href={'https://github.com/Daou-FiveGuys'}
              className="w-full flex items-center justify-center"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub 에서 보기
            </Link>
          </button>
        </div>
      </div>
    </section>
  )
}
