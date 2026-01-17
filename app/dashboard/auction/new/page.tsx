"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-provider"
import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/protected-route"

export default function NewAuctionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startingBid, setStartingBid] = useState("")
  const [reservePrice, setReservePrice] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [condition, setCondition] = useState("good")
  const [category, setCategory] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const [buyNowPrice, setBuyNowPrice] = useState("")
  const [minBidIncrement, setMinBidIncrement] = useState("1.00")

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed")
      return
    }

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      
      if (!isValidType) {
        setError("Only image files are allowed")
        return false
      }
      if (!isValidSize) {
        setError("Image size must be less than 5MB")
        return false
      }
      return true
    })

    setImages(prev => [...prev, ...validFiles])

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    setError("")
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    const supabase = getSupabaseBrowserClient()
    const uploadedUrls: string[] = []

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${Date.now()}-${i}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
      setUploadProgress(((i + 1) / images.length) * 100)
    }

    return uploadedUrls
  }

  const validateDates = () => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start < now) {
      setError("Start date must be in the future")
      return false
    }

    if (end <= start) {
      setError("End date must be after start date")
      return false
    }

    if (reservePrice && parseFloat(reservePrice) <= parseFloat(startingBid)) {
      setError("Reserve price must be higher than starting bid")
      return false
    }

    if (buyNowPrice && parseFloat(buyNowPrice) <= parseFloat(startingBid)) {
      setError("Buy now price must be higher than starting bid")
      return false
    }

    if (parseFloat(minBidIncrement) < 0.01) {
      setError("Minimum bid increment must be at least $0.01")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!validateDates()) {
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      const supabase = getSupabaseBrowserClient()

      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await uploadImages()
      }

      // Create listing
      const { data: listingData, error: listingError } = await supabase.from("listings").insert({
        user_id: user?.id,
        title,
        description,
        price: parseFloat(startingBid),
        condition,
        category,
        status: "active",
        is_auction: true,
        image_urls: imageUrls,
      }).select().single()

      if (listingError) throw listingError

      // Create auction
      const { error: auctionError } = await supabase.from("auctions").insert({
        listing_id: listingData.id,
        seller_id: user?.id,
        starting_price: parseFloat(startingBid),
        reserve_price: reservePrice ? parseFloat(reservePrice) : null,
        buy_now_price: buyNowPrice ? parseFloat(buyNowPrice) : null,
        min_bid_increment: parseFloat(minBidIncrement),
        start_time: startDate,
        end_time: endDate,
        status: new Date(startDate) <= new Date() ? 'active' : 'scheduled',
      })

      if (auctionError) throw auctionError

      setSuccess(true)
      
      // Wait 2 seconds then redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      console.error("Create auction error:", err)
      setError(err instanceof Error ? err.message : "Failed to create auction")
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="mb-8">
            <Link href="/dashboard" className="text-primary hover:underline mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">Start New Auction</h1>
            <p className="text-muted-foreground">Create an auction for rare vintage pieces</p>
          </div>

          {success && (
            <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Success!</p>
                <p className="text-sm">Your auction has been created. Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card p-8 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Images * (Max 5 images, up to 5MB each)
              </label>
              
              <div className="grid grid-cols-5 gap-4 mb-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:opacity-90 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition">
                    <svg className="w-8 h-8 text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-muted-foreground">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading images...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {images.length}/5 images selected
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                required
                placeholder="e.g., Rare Vintage Band T-Shirt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                rows={5}
                required
                placeholder="Describe the item in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Starting Bid (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reserve Price (USD)
                  <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Minimum to sell"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Buy Now Price (USD)
                  <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={buyNowPrice}
                  onChange={(e) => setBuyNowPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Instant buy price"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Bid Increment (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={minBidIncrement}
                onChange={(e) => setMinBidIncrement(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                required
                placeholder="1.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Each new bid must be at least this much higher than the current bid
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Auction Start Date *</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Auction End Date *</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                >
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="e.g., Clothing, Accessories"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Start Auction"}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  )
}
