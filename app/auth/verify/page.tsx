import { Suspense } from "react"
import Navigation from "@/components/navigation"
import VerifyContent from "@/components/verify-content"

export default function VerifyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <Suspense fallback={<div className="w-full max-w-md h-96 bg-muted rounded-lg animate-pulse" />}>
          <VerifyContent />
        </Suspense>
      </main>
    </>
  )
}
