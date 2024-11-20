import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import PngImage, {
  IconGitHub,
  IconJira,
  IconNextChat,
  IconSeparator,
  IconSlack,
  IconVercel
} from '@/components/ui/icons'
import { headers } from 'next/headers'
import UserOrLogin from './header-link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/Daou-FiveGuys/fiveguys_frontend"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a>
        <a
          href="https://daoutech-ig-capstone.atlassian.net/jira/software/projects/FG/boards/1/timeline"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <PngImage
            src="/jira.png"
            alt="Description of the image"
            width={20}
            height={20}
            className="rounded-md"
          />
          <span className="hidden ml-2 md:flex text-blue-600">
            Manage to Jira
          </span>
        </a>
      </div>
    </header>
  )
}
