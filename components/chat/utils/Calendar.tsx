import React from 'react'
import { Button } from '@/components/ui/button'

interface ComponentProps {}

export default function CalendarComponent(props: ComponentProps): JSX.Element {
  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6 gap-6">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium">April 2023</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ChevronLeftIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-4 text-center">
          <div className="font-medium text-gray-500 dark:text-gray-400">
            Sun
          </div>
          <div className="font-medium text-gray-500 dark:text-gray-400">
            Mon
          </div>
          <div className="font-medium text-gray-500 dark:text-gray-400">
            Tue
          </div>
          <div className="font-medium text-gray-500 dark:text-gray-400">
            Wed
          </div>
          <div className="font-medium text-gray-500 dark:text-gray-400">
            Thu
          </div>
          <div className="font-medium text-gray-500 dark:text-gray-400">
            Fri
          </div>
          <div className="font-medium text-gray-500 dark:text-gray-400">
            Sat
          </div>
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className={`relative rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer ${
                i % 7 === 0 ? 'text-red-500 dark:text-red-400' : ''
              }`}
            >
              <div className="font-medium">{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
