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
  ogImage: 'https://source.unsplash.com/1600x900/?fleet,logistics,truck,dashboard',
}

export default function Homepage() {
  return (
    <main className="min-h-screen bg-[#F9F9F9]">
      <Hero />
      <Explore />
      <HowItWorks />
      <BlogPreview />
      <Join />
      <Footer />

      <section className="sr-only" aria-hidden>
        <h1>{homepageMeta.title}</h1>
        <p>{homepageMeta.description}</p>
        <img src={homepageMeta.ogImage} alt={`${APP_NAME} open graph cover with fleet trucks`} />
        <a href={APP_MARKETING_URL}>{APP_MARKETING_URL}</a>
      </section>
    </main>
  )
}
