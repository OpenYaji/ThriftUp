"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-provider"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Debug: Log auth state changes
    console.log("Navigation auth state:", { user: !!user, loading })
  }, [user, loading])

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      setIsOpen(false)
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg" />
            <span className="gradient-text font-bold text-xl">ThriftUp</span>
          </Link>

          <div className="hidden md:flex gap-8">
            <Link href="/marketplace" className="hover:text-primary transition">
              Marketplace
            </Link>
            <Link href="/auctions" className="hover:text-primary transition">
              Auctions
            </Link>
            <Link href="/events" className="hover:text-primary transition">
              Events
            </Link>
            <Link href="/community" className="hover:text-primary transition">
              Community
            </Link>
          </div>

          <div className="hidden md:flex gap-4 items-center">
            {loading ? (
              <div className="w-32 h-10 bg-muted animate-pulse rounded-lg" />
            ) : user ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition font-medium">
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <Link href="/marketplace" className="block px-4 py-2 hover:bg-muted rounded" onClick={() => setIsOpen(false)}>
              Marketplace
            </Link>
            <Link href="/auctions" className="block px-4 py-2 hover:bg-muted rounded" onClick={() => setIsOpen(false)}>
              Auctions
            </Link>
            <Link href="/events" className="block px-4 py-2 hover:bg-muted rounded" onClick={() => setIsOpen(false)}>
              Events
            </Link>
            <Link href="/community" className="block px-4 py-2 hover:bg-muted rounded" onClick={() => setIsOpen(false)}>
              Community
            </Link>
            {loading ? (
              <div className="mx-4 h-10 bg-muted animate-pulse rounded-lg" />
            ) : user ? (
              <>
                <Link href="/dashboard" className="block px-4 py-2 hover:bg-muted rounded font-medium" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="mx-4 px-6 py-2 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:opacity-90 transition text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-4 py-2 hover:bg-muted rounded" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="mx-4 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Join
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
