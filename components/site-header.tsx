'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function SiteHeader() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10) // 10px 이상 스크롤하면 반투명 효과 적용
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    pathname.includes('/welcome') && (
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-md' // 스크롤 시 반투명
            : 'bg-background/95' // 기본 상태
        }`}
      >
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">🚀 Fiveguys</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-6">
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Blog
              </Link>
              <Link
                href="/documentation"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Documentation
              </Link>
            </nav>
            <Button asChild variant="default">
              <Link href="/sign-in">Sign In →</Link>
            </Button>
          </div>
        </div>
      </header>
    )
  )
}
