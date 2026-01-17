"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"

interface Listing {
  id: string
  title: string
  description: string
  price: number
  image_urls: string[]
  condition: string
}

export default function MarketplacePreview() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const supabase = getSupabaseBrowserClient()

        if (!supabase) {
          setIsConfigured(false)
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "active")
          .eq("is_auction", false)
          .limit(6)

        if (error) throw error
        setListings(data || [])
      } catch (error) {
        console.error("Error fetching listings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [])

  if (!isConfigured) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Listings</h2>
          <p className="text-muted-foreground mb-12">Handpicked vintage pieces from our community</p>
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Supabase credentials are not configured. Please add your{" "}
              <code className="font-mono bg-blue-100 px-2 py-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="font-mono bg-blue-100 px-2 py-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment
              variables.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Listings</h2>
        <p className="text-muted-foreground mb-12">Handpicked vintage pieces from our community</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-80 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="card overflow-hidden hover:shadow-lg transition">
                <div className="aspect-video bg-muted overflow-hidden">
                  {listing.image_urls?.[0] && (
                    <img
                      src={listing.image_urls[0] || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{listing.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{listing.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">${listing.price.toFixed(2)}</span>
                    <span className="px-2 py-1 bg-blue-100 text-secondary text-xs rounded">{listing.condition}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
