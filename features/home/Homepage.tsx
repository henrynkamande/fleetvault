import { Suspense } from 'react'
import Footer from '@/components/ui/Footer'
import BlogPreview from './BlogPreview'
import Explore from './Explore'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import Join from './Join'
import { APP_MARKETING_URL, APP_NAME } from '@/lib/constants'

const homepageMeta = {
  title: `${APP_NAME} — GPS-Free Fleet Management`,
  description:
    `${APP_NAME} is a privacy-first fleet management system for vehicle owners and managers. Track trips, manage drivers, and monitor income and expenses — without live GPS.`,
}

function BlogPreviewFallback() {
  return (
    <section className="bg-[#F9F9F9] py-16" aria-label="Blog loading">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-title text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-[#111827]">
          From the blog
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-gray-700">
          Loading product updates and fleet operations insights...
        </p>
      </div>
    </section>
  )
}

export default function Homepage() {
  return (
    <main className="min-h-screen bg-[#F9F9F9]">
      <Hero />
      <Explore />
      <HowItWorks />
      <Suspense fallback={<BlogPreviewFallback />}>
        <BlogPreview />
      </Suspense>
      <Join />
      <Footer />

      <section className="sr-only" aria-hidden>
        <h1>{homepageMeta.title}</h1>
        <p>{homepageMeta.description}</p>
        <a href={APP_MARKETING_URL}>{APP_MARKETING_URL}</a>
      </section>
    </main>
  )
}
