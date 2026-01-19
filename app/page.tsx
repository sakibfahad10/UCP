import Header from "@/components/header"

import Hero from "@/components/hero"
import Features from "@/components/features"

import HallOfFame from "@/components/hall-of-fame"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <Features />
      <HallOfFame />
      <Footer />
    </main>
  )
}
