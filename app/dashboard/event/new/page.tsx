"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-provider"
import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/protected-route"

// Add this script to your app/layout.tsx or load it here
declare global {
  interface Window {
    google: any
  }
}

export default function NewEventPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [eventDate, setEventDate] = useState("")
  const [capacity, setCapacity] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapError, setMapError] = useState("")
  const { user } = useAuth()
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const autocompleteRef = useRef<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if API key exists
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setMapError("Google Maps API key not configured")
      return
    }

    // Load Google Maps script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) return

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onerror = () => {
      setMapError("Failed to load Google Maps. Please check your API key.")
    }

    script.onload = () => {
      initializeMap()
    }

    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.querySelector('script[src*="maps.googleapis.com"]')
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove)
      }
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    // Default to user's location or fallback to San Francisco
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLatitude(lat)
          setLongitude(lng)
          createMap(lat, lng)
        },
        () => {
          // Fallback to default location
          createMap(37.7749, -122.4194)
        }
      )
    } else {
      createMap(37.7749, -122.4194)
    }
  }

  const createMap = (lat: number, lng: number) => {
    if (!mapRef.current || !window.google) return

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
    })

    // Add marker
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance.current,
      draggable: true,
    })

    // Update location when marker is dragged
    window.google.maps.event.addListener(markerRef.current, 'dragend', (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      setLatitude(lat)
      setLongitude(lng)
      reverseGeocode(lat, lng)
    })

    // Add click listener to map
    window.google.maps.event.addListener(mapInstance.current, 'click', (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      setLatitude(lat)
      setLongitude(lng)
      markerRef.current.setPosition(event.latLng)
      reverseGeocode(lat, lng)
    })

    // Initialize autocomplete
    if (searchInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ['formatted_address', 'geometry', 'name'],
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          setLatitude(lat)
          setLongitude(lng)
          setLocation(place.formatted_address || place.name)
          mapInstance.current.setCenter({ lat, lng })
          markerRef.current.setPosition({ lat, lng })
        }
      })
    }
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        setLocation(results[0].formatted_address)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      const { error: insertError } = await supabase.from("events").insert({
        organizer_id: user?.id,
        title,
        description,
        location,
        // Only include lat/lng if they exist
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
        event_date: eventDate,
        capacity: parseInt(capacity),
        attendee_count: 0,
        status: "upcoming",
      })

      if (insertError) throw insertError

      setSuccess(true)
      
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      console.error("Create event error:", err)
      setError(err instanceof Error ? err.message : "Failed to create event")
    } finally {
      setLoading(false)
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
            <h1 className="text-4xl font-bold mb-2">Host a Thrift Meet</h1>
            <p className="text-muted-foreground">Organize an event for the community</p>
          </div>

          {success && (
            <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Success!</p>
                <p className="text-sm">Your event has been created. Redirecting to dashboard...</p>
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
            <div>
              <label className="block text-sm font-medium mb-2">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                required
                placeholder="e.g., Downtown Vintage Market"
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
                placeholder="Describe your event..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Location *</label>
                {!mapError && (
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="text-sm text-primary hover:underline"
                  >
                    {showMap ? 'Hide Map' : 'Pick on Map'}
                  </button>
                )}
              </div>

              {mapError && (
                <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Map Unavailable</p>
                  <p>{mapError}</p>
                  <p className="mt-2 text-xs">You can still create events by entering the location manually below.</p>
                </div>
              )}
              
              {showMap && !mapError && (
                <div className="mb-4 space-y-3">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                  <div 
                    ref={mapRef}
                    className="w-full h-96 rounded-lg border border-border bg-muted flex items-center justify-center"
                  >
                    {!window.google && (
                      <p className="text-muted-foreground">Loading map...</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click on the map or drag the marker to set the event location
                  </p>
                </div>
              )}

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                required
                placeholder="e.g., Downtown Community Center, 123 Main St"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Event Date & Time *</label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Capacity *</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                  min="1"
                  placeholder="Max attendees"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Event"}
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
