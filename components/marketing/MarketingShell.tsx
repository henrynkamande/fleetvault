import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

type MarketingShellProps = {
  children: React.ReactNode
  /** When true, only render children (e.g. homepage Hero already includes nav styling). */
  bare?: boolean
}

export default function MarketingShell({ children, bare = false }: MarketingShellProps) {
  if (bare) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <header className="w-full bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] pb-6 pt-2">
        <Navbar />
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  )
}
