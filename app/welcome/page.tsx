import { SiteHeader } from '@/components/site-header'
import { HeroSection } from '@/components/hero-section'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col w-full h-full">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
      </main>
    </div>
  )
}
