"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"

interface Event {
  id: string
  title: string
  description: string
  location: string
  event_date: string
  attendee_count: number
  capacity: number
}

export default function EventsPreview() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const supabase = getSupabaseBrowserClient()

        if (!supabase) {
          setIsConfigured(false)
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("status", "upcoming")
          .order("event_date", { ascending: true })
          .limit(3)

        if (error) throw error
        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!isConfigured) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Thrift-Meet Events</h2>
          <p className="text-muted-foreground mb-12">Connect with collectors at exclusive in-person events</p>
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Supabase credentials are not configured. Please add your environment variables to fetch events.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Thrift-Meet Events</h2>
        <p className="text-muted-foreground mb-12">Connect with collectors at exclusive in-person events</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="card p-6 hover:shadow-lg transition">
                <div className="mb-4">
                  <div className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full font-semibold">
                    {formatDate(event.event_date)}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{event.description}</p>
                <div className="flex items-center gap-2 text-sm mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary font-semibold">
                    {event.attendee_count}/{event.capacity} attending
                  </span>
                  <button className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
