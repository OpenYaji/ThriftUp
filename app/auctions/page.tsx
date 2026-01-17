"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import Navigation from "@/components/navigation"

interface Auction {
  id: string
  listing_id: string
  starting_price: number
  current_bid: number | null
  reserve_price: number | null
  start_time: string
  end_time: string
  status: string
  listings: {
    id: string
    title: string
    description: string
    image_urls: string[]
    condition: string
  }
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase
        .from("auctions")
        .select(`
          *,
          listings (
            id,
            title,
            description,
            image_urls,
            condition
          )
        `)
        .in("status", ["active", "scheduled"])
        .order("end_time", { ascending: true })

      if (error) throw error

      setAuctions(data || [])
    } catch (err) {
      console.error("Error fetching auctions:", err)
      setError("Failed to load auctions")
    } finally {
      setLoading(false)
    }
  }

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime()
    const now = new Date().getTime()
    const distance = end - now

    if (distance < 0) return "Ended"

    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Live Auctions</h1>
            <p className="text-muted-foreground">Bid on rare vintage pieces</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-96 animate-pulse bg-muted" />
              ))}
            </div>
          ) : auctions.length === 0 ? (
            <div className="card p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">No Active Auctions</h3>
              <p className="text-muted-foreground mb-4">There are no active auctions at the moment.</p>
              <Link href="/dashboard/auction/new" className="inline-block px-6 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition">
                Start an Auction
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.id}`}
                  className="card overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    {auction.listings.image_urls?.[0] && (
                      <img
                        src={auction.listings.image_urls[0]}
                        alt={auction.listings.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                      {auction.status === "scheduled" ? "Upcoming" : "Live"}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{auction.listings.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {auction.listings.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Bid</p>
                        <p className="text-2xl font-bold text-secondary">
                          ${(auction.current_bid || auction.starting_price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Time Left</p>
                        <p className="text-lg font-semibold">{getTimeRemaining(auction.end_time)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="px-2 py-1 bg-blue-100 text-secondary text-xs rounded">
                        {auction.listings.condition}
                      </span>
                      <button className="text-secondary font-semibold text-sm hover:underline">
                        Place Bid →
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
