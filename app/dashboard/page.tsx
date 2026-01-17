"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-provider"
import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/protected-route"

interface UserProfile {
  username: string
  full_name?: string
}

interface Listing {
  id: string
  title: string
  price: number
  status: string
  created_at: string
  image_urls: string[]
}

interface Auction {
  id: string
  status: string
  end_time: string
  listings: {
    title: string
    image_urls: string[]
  }[]
}

interface Event {
  id: string
  title: string
  event_date: string
  attendee_count: number
  capacity: number
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [myAuctions, setMyAuctions] = useState<Auction[]>([])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'auctions' | 'events'>('listings')
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      try {
        const supabase = getSupabaseBrowserClient()

        // Load profile
        const { data: profileData } = await supabase
          .from("users")
          .select("username, full_name")
          .eq("id", user.id)
          .maybeSingle()

        if (profileData) {
          setUserProfile(profileData)
        }

        // Load user's listings
        const { data: listingsData } = await supabase
          .from("listings")
          .select("id, title, price, status, created_at, image_urls, is_auction")
          .eq("user_id", user.id)
          .eq("is_auction", false)
          .order("created_at", { ascending: false })
          .limit(5)

        setMyListings(listingsData || [])

        // Load user's auctions
        const { data: auctionsData } = await supabase
          .from("auctions")
          .select(`
            id,
            status,
            end_time,
            listings (
              title,
              image_urls
            )
          `)
          .eq("seller_id", user.id)
          .order("end_time", { ascending: false })
          .limit(5)

        setMyAuctions(auctionsData || [])

        // Load user's events
        const { data: eventsData } = await supabase
          .from("events")
          .select("id, title, event_date, attendee_count, capacity")
          .eq("organizer_id", user.id)
          .order("event_date", { ascending: true })
          .limit(5)

        setMyEvents(eventsData || [])
      } catch (err) {
        console.error("Dashboard load error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const deleteItem = async (type: 'listing' | 'auction' | 'event', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const supabase = getSupabaseBrowserClient()
      
      if (type === 'listing') {
        await supabase.from('listings').delete().eq('id', id)
        setMyListings(prev => prev.filter(item => item.id !== id))
      } else if (type === 'auction') {
        await supabase.from('auctions').delete().eq('id', id)
        setMyAuctions(prev => prev.filter(item => item.id !== id))
      } else if (type === 'event') {
        await supabase.from('events').delete().eq('id', id)
        setMyEvents(prev => prev.filter(item => item.id !== id))
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete item')
    }
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-32 bg-muted rounded" />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Welcome, {userProfile?.username}!</h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Quick Actions */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        href="/dashboard/listing/new"
                        className="card p-6 hover:shadow-lg transition cursor-pointer bg-primary text-primary-foreground"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <h3 className="text-lg font-bold">Add Listing</h3>
                        </div>
                        <p className="text-sm opacity-90">Sell your vintage items</p>
                      </Link>

                      <Link
                        href="/dashboard/auction/new"
                        className="card p-6 hover:shadow-lg transition cursor-pointer bg-secondary text-secondary-foreground"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="text-lg font-bold">Start Auction</h3>
                        </div>
                        <p className="text-sm opacity-90">Bid on rare pieces</p>
                      </Link>

                      <Link
                        href="/dashboard/event/new"
                        className="card p-6 hover:shadow-lg transition cursor-pointer bg-accent text-accent-foreground"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-lg font-bold">Host Event</h3>
                        </div>
                        <p className="text-sm opacity-90">Create a thrift meet</p>
                      </Link>

                      <Link href="/dashboard/post/new" className="card p-6 hover:shadow-lg transition cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <h3 className="text-lg font-bold">Create Post</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Share with community</p>
                      </Link>
                    </div>
                  </div>

                  {/* Browse Sections */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Explore</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/marketplace" className="card p-6 hover:shadow-lg transition">
                        <h3 className="text-lg font-bold mb-2">Marketplace</h3>
                        <p className="text-muted-foreground text-sm">Browse all listings</p>
                      </Link>

                      <Link href="/auctions" className="card p-6 hover:shadow-lg transition">
                        <h3 className="text-lg font-bold mb-2">Auctions</h3>
                        <p className="text-muted-foreground text-sm">Active bidding</p>
                      </Link>

                      <Link href="/events" className="card p-6 hover:shadow-lg transition">
                        <h3 className="text-lg font-bold mb-2">Events</h3>
                        <p className="text-muted-foreground text-sm">Upcoming meets</p>
                      </Link>

                      <Link href="/dashboard/my-events" className="card p-6 hover:shadow-lg transition bg-accent/10">
                        <h3 className="text-lg font-bold mb-2">My Events</h3>
                        <p className="text-muted-foreground text-sm">Events you're attending</p>
                      </Link>

                      <Link href="/community" className="card p-6 hover:shadow-lg transition">
                        <h3 className="text-lg font-bold mb-2">Community</h3>
                        <p className="text-muted-foreground text-sm">Join discussions</p>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="card p-6 sticky top-20">
                    <h2 className="text-xl font-bold mb-4">My Activity</h2>
                    
                    {/* Tabs */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setActiveTab('listings')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          activeTab === 'listings' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        Listings ({myListings.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('auctions')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          activeTab === 'auctions' ? 'bg-secondary text-secondary-foreground' : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        Auctions ({myAuctions.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('events')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          activeTab === 'events' ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        Events ({myEvents.length})
                      </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {activeTab === 'listings' && (
                        myListings.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No listings yet</p>
                        ) : (
                          myListings.map(listing => (
                            <div key={listing.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                              {listing.image_urls?.[0] && (
                                <img src={listing.image_urls[0]} alt={listing.title} className="w-16 h-16 object-cover rounded" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{listing.title}</h4>
                                <p className="text-xs text-muted-foreground">${listing.price.toFixed(2)}</p>
                                <span className={`text-xs px-2 py-0.5 rounded ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {listing.status}
                                </span>
                              </div>
                              <button
                                onClick={() => deleteItem('listing', listing.id)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))
                        )
                      )}

                      {activeTab === 'auctions' && (
                        myAuctions.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No auctions yet</p>
                        ) : (
                          myAuctions.map(auction => (
                            <div key={auction.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                              {auction.listings[0]?.image_urls?.[0] && (
                                <img src={auction.listings[0].image_urls[0]} alt={auction.listings[0].title} className="w-16 h-16 object-cover rounded" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{auction.listings[0]?.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                  Ends {new Date(auction.end_time).toLocaleDateString()}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded ${auction.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {auction.status}
                                </span>
                              </div>
                              <button
                                onClick={() => deleteItem('auction', auction.id)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))
                        )
                      )}

                      {activeTab === 'events' && (
                        myEvents.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No events yet</p>
                        ) : (
                          myEvents.map(event => (
                            <div key={event.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(event.event_date).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {event.attendee_count}/{event.capacity} attending
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Link
                                  href={`/dashboard/events/${event.id}/manage`}
                                  className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded hover:opacity-90 transition text-center"
                                >
                                  Manage
                                </Link>
                                <button
                                  onClick={() => deleteItem('event', event.id)}
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}
