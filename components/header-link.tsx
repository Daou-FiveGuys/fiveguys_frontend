'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { IconNextChat, IconSeparator } from '@/components/ui/icons'

export default function UserOrLogin() {
  const pathname = usePathname()
  return (
    <>
      <Link href="/new" rel="nofollow">
        <IconNextChat className="size-6 mr-2 dark:hidden" inverted />
        <IconNextChat className="hidden size-6 mr-2 dark:block" />
      </Link>
      {!pathname.includes('/mypage') &&
        !pathname.includes('/login') &&
        !pathname.includes('/signup') && (
          <div className="flex items-center">
            <IconSeparator className="size-6 text-muted-foreground/50" />
            <Button variant="link" asChild className="-ml-2">
              <Link href="/mypage">My Page</Link>
            </Button>
          </div>
        )}
      {pathname.includes('/mypage') && (
        <div className="flex items-center">
          <IconSeparator className="size-6 text-muted-foreground/50" />
          <Button variant="link" asChild className="-ml-2">
            <Link href="/logout">Logout</Link>
          </Button>
        </div>
      )}
    </>
  )
}
