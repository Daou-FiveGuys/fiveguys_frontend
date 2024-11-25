'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function TopNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/address', label: '그룹 관리' },
    { href: '/address/excel', label: '주소록' }
  ]

  return (
    <nav className="w-full mb-6 border-b container">
      <ul className="flex space-x-4 pl-4">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link href={item.href} passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    'relative py-6 text-base font-medium transition-colors hover:text-black/80 dark:text-zinc-200',
                    isActive ? 'text-black' : 'text-black/60'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-black dark:bg-zinc-200" />
                  )}
                </Button>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
