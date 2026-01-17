"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-provider"
import Navigation from "@/components/navigation"

interface Auction {
  id: string
  listing_id: string
  seller_id: string
  starting_price: number
  current_bid: number | null
  highest_bidder_id: string | null
  reserve_price: number | null
  buy_now_price: number | null
  min_bid_increment: number
  start_time: string
  end_time: string
  status: string
  listings: {
    id: string
    title: string
    description: string
    image_urls: string[]
    condition: string
    category: string
    user_id: string
  }
}

interface Bid {
  id: string
  bidder_id: string
  bid_amount: number
  created_at: string
  users: {
    username: string
  }
}

export default function AuctionDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [bidAmount, setBidAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchAuctionDetails()
      fetchBids()
    }
  }, [params.id])

  const fetchAuctionDetails = async () => {
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
            condition,
            category,
            user_id
          )
        `)
        .eq("id", params.id)
        .single()

      if (error) throw error
      setAuction(data)
    } catch (err) {
      console.error("Error fetching auction:", err)
      setError("Failed to load auction details")
    } finally {
      setLoading(false)
    }
  }

  const fetchBids = async () => {
    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase
        .from("bids")
        .select(`
          *,
          users (username)
        `)
        .eq("auction_id", params.id)
        .order("bid_amount", { ascending: false })

      if (error) throw error
      setBids(data || [])
    } catch (err) {
      console.error("Error fetching bids:", err)
    }
  }

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (auction?.seller_id === user.id) {
      setError("You cannot bid on your own auction")
      return
    }

    const amount = parseFloat(bidAmount)
    const increment = auction?.min_bid_increment || 1
    const minBid = (auction?.current_bid || auction?.starting_price || 0) + increment

    if (amount < minBid) {
      setError(`Bid must be at least $${minBid.toFixed(2)} (minimum increment: $${increment.toFixed(2)})`)
      return
    }

    setSubmitting(true)

    try {
      const supabase = getSupabaseBrowserClient()

      const { error: bidError } = await supabase.from("bids").insert({
        auction_id: params.id,
        bidder_id: user.id,
        bid_amount: amount,
      })

      if (bidError) throw bidError

      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          current_bid: amount,
          highest_bidder_id: user.id,
        })
        .eq("id", params.id)

      if (updateError) throw updateError

      setSuccess(`Bid placed successfully! You are now the highest bidder.`)
      setBidAmount("")
      fetchAuctionDetails()
      fetchBids()
    } catch (err) {
      console.error("Bid error:", err)
      setError(err instanceof Error ? err.message : "Failed to place bid")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (auction?.seller_id === user.id) {
      setError("You cannot buy your own auction")
      return
    }

    if (!confirm(`Buy this item now for $${auction?.buy_now_price?.toFixed(2)}?`)) {
      return
    }

    setSubmitting(true)

    try {
      const supabase = getSupabaseBrowserClient()

      // End the auction immediately
      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          current_bid: auction?.buy_now_price,
          highest_bidder_id: user.id,
          status: 'completed',
        })
        .eq("id", params.id)

      if (updateError) throw updateError

      // Record the final bid
      await supabase.from("bids").insert({
        auction_id: params.id,
        bidder_id: user.id,
        bid_amount: auction?.buy_now_price,
      })

      setSuccess(`Congratulations! You won this auction with Buy Now for $${auction?.buy_now_price?.toFixed(2)}`)
      fetchAuctionDetails()
      fetchBids()
    } catch (err) {
      console.error("Buy now error:", err)
      setError(err instanceof Error ? err.message : "Failed to complete purchase")
    } finally {
      setSubmitting(false)
    }
  }

  const getTimeRemaining = () => {
    if (!auction) return ""
    const end = new Date(auction.end_time).getTime()
    const now = new Date().getTime()
    const distance = end - now

    if (distance < 0) return "Auction Ended"

    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  const isOwner = user && auction && auction.seller_id === user.id
  const isHighestBidder = user && auction && auction.highest_bidder_id === user.id
  const currentBid = auction?.current_bid || auction?.starting_price || 0
  const increment = auction?.min_bid_increment || 1
  const minBid = currentBid + increment
  const isAuctionEnded = auction?.status === 'completed' || (auction && new Date(auction.end_time) < new Date())

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="animate-pulse space-y-4">
              <div className="h-96 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!auction) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="card p-12 text-center">
              <h3 className="text-xl font-bold mb-2">Auction Not Found</h3>
              <p className="text-muted-foreground mb-4">This auction does not exist or has been removed.</p>
              <Link href="/auctions" className="text-primary hover:underline">
                Back to Auctions
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Link href="/auctions" className="text-primary hover:underline mb-6 inline-block">
            ← Back to Auctions
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                {auction.listings.image_urls?.[currentImageIndex] ? (
                  <img
                    src={auction.listings.image_urls[currentImageIndex]}
                    alt={auction.listings.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No image</p>
                  </div>
                )}
              </div>
              
              {auction.listings.image_urls && auction.listings.image_urls.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {auction.listings.image_urls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt={`${auction.listings.title} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auction Details */}
            <div>
              <div className="card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    auction.status === 'active' ? 'bg-green-100 text-green-800' : 
                    auction.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {auction.status === 'completed' ? 'Ended' : 
                     auction.status === 'scheduled' ? 'Upcoming' : 'Live'}
                  </span>
                  {isOwner && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      Your Auction
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-2">{auction.listings.title}</h1>
                <p className="text-muted-foreground mb-4">{auction.listings.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-semibold capitalize">{auction.listings.condition}</p>
                  </div>
                  {auction.listings.category && (
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-semibold">{auction.listings.category}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-b border-border py-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Bid</p>
                      <p className="text-4xl font-bold text-secondary">${currentBid.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Min increment: ${increment.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Time Remaining</p>
                      <p className="text-lg font-semibold">{getTimeRemaining()}</p>
                    </div>
                  </div>

                  {auction.buy_now_price && !isAuctionEnded && (
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Buy Now Price</p>
                          <p className="text-2xl font-bold text-yellow-900">${auction.buy_now_price.toFixed(2)}</p>
                          <p className="text-xs text-yellow-700">Skip bidding & win instantly!</p>
                        </div>
                        {!isOwner && (
                          <button
                            onClick={handleBuyNow}
                            disabled={submitting}
                            className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
                          >
                            Buy Now
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {isHighestBidder && !isOwner && (
                    <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm">
                      ✓ You are the highest bidder
                    </div>
                  )}

                  {isAuctionEnded && (
                    <div className="bg-gray-50 text-gray-800 px-4 py-2 rounded-lg text-sm">
                      This auction has ended
                    </div>
                  )}
                </div>

                {/* Bid Form */}
                {!isOwner && !isAuctionEnded ? (
                  <>
                    {success && (
                      <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-3 rounded-lg mb-4">
                        {success}
                      </div>
                    )}

                    {error && (
                      <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-lg mb-4">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handlePlaceBid} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Your Bid (Minimum: ${minBid.toFixed(2)})
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min={minBid}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                            placeholder={`${minBid.toFixed(2)}`}
                            required
                            disabled={!user || submitting}
                          />
                          <button
                            type="button"
                            onClick={() => setBidAmount(minBid.toString())}
                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
                            disabled={!user || submitting}
                          >
                            Min
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Quick bid: Minimum + ${increment.toFixed(2)} increment
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={!user || submitting}
                        className="w-full px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                      >
                        {!user ? "Login to Bid" : submitting ? "Placing Bid..." : "Place Bid"}
                      </button>
                    </form>
                  </>
                ) : isOwner ? (
                  <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg">
                    You cannot bid on your own auction
                  </div>
                ) : (
                  <div className="bg-gray-50 text-gray-800 px-4 py-3 rounded-lg">
                    Bidding has ended for this auction
                  </div>
                )}
              </div>

              {/* Bid History */}
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4">Bid History</h3>
                {bids.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No bids yet</p>
                ) : (
                  <div className="space-y-2">
                    {bids.map((bid, index) => (
                      <div key={bid.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-semibold">{bid.users.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bid.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${bid.bid_amount.toFixed(2)}</p>
                          {index === 0 && (
                            <span className="text-xs text-green-600">Highest</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
