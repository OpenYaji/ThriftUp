"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

interface Listing {
  id: string
  title: string
  description: string
  price: number
  image_urls: string[]
  condition: string
  category: string
  user_id: string
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        let query = supabase.from("listings").select("*").eq("status", "active").eq("is_auction", false)

        if (filter !== "all") {
          query = query.eq("category", filter)
        }

        const { data, error } = await query.order("created_at", { ascending: false }).limit(20)

        if (error) throw error
        setListings(data || [])
      } catch (error) {
        console.error("Error fetching listings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [filter])

  const categories = ["all", "dresses", "tops", "bottoms", "outerwear", "accessories"]

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground mb-8">Browse curated vintage pieces from verified sellers</p>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === cat ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-border"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="card overflow-hidden hover:shadow-lg transition cursor-pointer">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {listing.image_urls?.[0] && (
                      <img
                        src={listing.image_urls[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold text-accent">{listing.category.toUpperCase()}</span>
                    <h3 className="font-bold text-lg mt-2 line-clamp-2">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 my-2">{listing.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xl font-bold text-primary">${listing.price.toFixed(2)}</span>
                      <button className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
