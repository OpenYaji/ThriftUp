"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-provider"
import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/protected-route"

interface EventWithAttendance {
  id: string
  event_id: string
  attended: boolean
  created_at: string
  events: {
    id: string
    title: string
    description: string
    location: string
    event_date: string
    capacity: number
    attendee_count: number
    organizer_id: string
  }
}

export default function MyEventsPage() {
  const [attendingEvents, setAttendingEvents] = useState<EventWithAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchMyEvents()
    }
  }, [user])

  const fetchMyEvents = async () => {
    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase
        .from("event_attendees")
        .select(`
          *,
          events (
            id,
            title,
            description,
            location,
            event_date,
            capacity,
            attendee_count,
            organizer_id
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setAttendingEvents(data || [])
    } catch (err) {
      console.error("Error fetching events:", err)
      setError("Failed to load your events")
    } finally {
      setLoading(false)
    }
  }

  const cancelRSVP = async (attendanceId: string, eventId: string) => {
    if (!confirm("Are you sure you want to cancel your RSVP?")) return

    try {
      const supabase = getSupabaseBrowserClient()

      const { error: deleteError } = await supabase
        .from("event_attendees")
        .delete()
        .eq("id", attendanceId)

      if (deleteError) throw deleteError

      const event = attendingEvents.find(e => e.event_id === eventId)
      if (event) {
        await supabase
          .from("events")
          .update({ attendee_count: event.events.attendee_count - 1 })
          .eq("id", eventId)
      }

      setAttendingEvents(prev => prev.filter(e => e.id !== attendanceId))
    } catch (err) {
      console.error("Cancel RSVP error:", err)
      alert("Failed to cancel RSVP")
    }
  }

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date()
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="mb-8">
            <Link href="/dashboard" className="text-primary hover:underline mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">Events you're attending</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card h-32 animate-pulse bg-muted" />
              ))}
            </div>
          ) : attendingEvents.length === 0 ? (
            <div className="card p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">You haven't RSVP'd to any events.</p>
              <Link href="/events" className="inline-block px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {attendingEvents.map((attendance) => {
                const isPast = isEventPast(attendance.events.event_date)
                
                return (
                  <div key={attendance.id} className="card p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="w-16 h-16 bg-accent text-accent-foreground rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold">
                            {new Date(attendance.events.event_date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-bold">
                            {new Date(attendance.events.event_date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-xl truncate">{attendance.events.title}</h3>
                            {isPast && attendance.attended && (
                              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded flex-shrink-0">
                                Attended
                              </span>
                            )}
                            {isPast && !attendance.attended && (
                              <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded flex-shrink-0">
                                Past
                              </span>
                            )}
                            {!isPast && (
                              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded flex-shrink-0">
                                Upcoming
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                            {attendance.events.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="truncate">
                                {new Date(attendance.events.event_date).toLocaleString('en-US', { 
                                  weekday: 'short', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{attendance.events.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{attendance.events.attendee_count}/{attendance.events.capacity} attending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Link
                          href={`/events/${attendance.events.id}`}
                          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm font-medium whitespace-nowrap text-center"
                        >
                          View Details
                        </Link>
                        {!isPast && (
                          <button
                            onClick={() => cancelRSVP(attendance.id, attendance.events.id)}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition text-sm font-medium whitespace-nowrap"
                          >
                            Cancel RSVP
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}