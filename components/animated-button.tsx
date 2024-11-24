'use client'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import React, { type CSSProperties } from 'react'

interface ShimmerButtonProps {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

const ShimmerButton = ({
  shimmerColor = '#ffffff',
  shimmerSize = '0.1em',
  shimmerDuration = '1.5s',
  borderRadius = '100px',
  background = 'radial-gradient(ellipse 80% 50% at 50% 120%,rgba(62, 61, 117),rgba(18, 18, 38))',
  className,
  children,
  ...props
}: ShimmerButtonProps) => {
  const router = useRouter()
  return (
    <button
      type="button" // 버튼 타입 추가
      onClick={() => router.push('/login')}
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background
        } as CSSProperties
      }
      className={cn(
        'group relative flex cursor-pointer overflow-hidden whitespace-nowrap px-6 py-4 text-white',
        '[background:var(--bg)] [border-radius:var(--radius)] dark:text-black',
        'transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(62,61,117,0.7)]',
        className
      )}
      {...props}
    >
      {/* spark container */}
      <div className="absolute inset-0 overflow-visible">
        {/* spark */}
        <div className="absolute inset-0 h-full w-full animate-slide">
          {/* spark before */}
          <div
            className="absolute inset-[-100%] w-auto h-auto animate-spinLinear"
            style={{
              background: `conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0%, var(--shimmer-color) var(--spread), transparent var(--spread))`,
              translate: '0 0',
              borderRadius: '0',
              mask: 'none',
              aspectRatio: '1'
            }}
          />
        </div>
      </div>
      {/* backdrop */}
      <div
        className="absolute"
        style={{
          background: 'var(--bg)',
          borderRadius: 'var(--radius)',
          inset: 'var(--cut)'
        }}
      />
      {/* content */}
      {children}
    </button>
  )
}

export default ShimmerButton
