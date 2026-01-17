"use client"

import { Suspense } from "react"
import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import MarketplacePreview from "@/components/marketplace-preview"
import EventsPreview from "@/components/events-preview"
import CommunityPreview from "@/components/community-preview"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Suspense fallback={<div className="h-96 bg-gray-100" />}>
        <MarketplacePreview />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-gray-100" />}>
        <EventsPreview />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-gray-100" />}>
        <CommunityPreview />
      </Suspense>
      <Footer />
    </main>
  )
}
