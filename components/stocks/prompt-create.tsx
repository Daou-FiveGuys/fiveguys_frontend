'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronUp, Copy, Download } from 'lucide-react'

export default function promptCreate() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [message, setMessage] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollbarRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollPosition(scrollPercentage)
    }
  }

  const handleScrollbarDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (contentRef.current && scrollbarRef.current) {
      const { top } = scrollbarRef.current.getBoundingClientRect()
      const y = e.clientY - top
      const scrollPercentage = y / scrollbarRef.current.clientHeight
      contentRef.current.scrollTop = scrollPercentage * (contentRef.current.scrollHeight - contentRef.current.clientHeight)
    }
  }

  const handleIncrease = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop += 50 // Increase scroll by 50px
    }
  }

  const handleCopy = async () => {
    if (contentRef.current) {
      try {
        await navigator.clipboard.writeText(contentRef.current.innerText)
        setMessage('Content copied to clipboard!')
      } catch (err) {
        setMessage('Failed to copy content. Please try again.')
      }
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDownload = () => {
    if (contentRef.current) {
      const blob = new Blob([contentRef.current.innerText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'content.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setMessage('Content downloaded!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  useEffect(() => {
    const content = contentRef.current
    if (content) {
      content.addEventListener('scroll', handleScroll)
      return () => content.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
      <div className="w-full max-w-md mx-auto h-64 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-full">
          <div className="absolute top-2 right-8 z-10 flex space-x-2">
            <button
                onClick={handleCopy}
                className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Copy content"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
                onClick={handleDownload}
                className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Download content"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div
              ref={contentRef}
              className="h-full overflow-y-scroll pr-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-4">Custom Prompt</h2>
              <p className="mb-4">This is a long content area to demonstrate the custom scrollbar. You can scroll through this content using the custom scrollbar on the right.</p>
              <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non felis et nunc blandit vestibulum. Donec felis nulla, aliquet vitae vestibulum eget, interdum eget mauris. Nullam ac augue vel magna sollicitudin ornare. Praesent sit amet erat purus. Aenean blandit fermentum quam, nec tincidunt purus fermentum at.</p>
              <p className="mb-4">Curabitur ut eros ac lacus ultricies convallis. Mauris at ex in ex bibendum feugiat id sed enim. Nulla facilisi. Donec mattis diam id velit bibendum, ut tincidunt nisi feugiat. Nam nec eros ut mi semper maximus. Cras in mi quis augue aliquam malesuada. Vestibulum facilisis, orci nec facilisis ultrices, urna diam accumsan nunc, nec lacinia felis odio sit amet elit.</p>
              <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut placerat euismod nisi, vitae vestibulum augue varius eu. Curabitur nec elementum orci. Cras vel justo at risus sodales malesuada. Integer sed nisi eget nunc feugiat vestibulum. Sed in eros euismod, varius nisi in, viverra justo.</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 h-full w-4 bg-gray-200">
            <div
                ref={scrollbarRef}
                className="relative w-full h-full"
                onMouseDown={handleScrollbarDrag}
            >
              <div
                  className="absolute w-full bg-gray-400 rounded"
                  style={{
                    top: `${scrollPosition}%`,
                    height: '20%',
                  }}
              ></div>
            </div>
          </div>
          <button
              className="absolute bottom-2 right-0 w-4 h-4 bg-gray-300 hover:bg-gray-400 flex items-center justify-center rounded"
              onClick={handleIncrease}
              aria-label="Scroll down"
          >
            <ChevronUp className="w-3 h-3 transform rotate-180" />
          </button>
        </div>
        {message && (
            <div className="absolute bottom-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-sm" aria-live="polite">
              {message}
            </div>
        )}
      </div>
  )
}