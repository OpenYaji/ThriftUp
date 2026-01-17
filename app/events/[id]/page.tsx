"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-provider"
import Navigation from "@/components/navigation"

interface Event {
  id: string
  organizer_id: string
  title: string
  description: string
  location: string
  event_date: string
  capacity: number
  attendee_count: number
  status: string
}

interface Attendee {
  id: string
  user_id: string
  attended: boolean
  created_at: string
  users: {
    username: string
    email: string
  }
}

export default function EventDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [isAttending, setIsAttending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchEventDetails()
      fetchAttendees()
    }
  }, [params.id, user])

  const fetchEventDetails = async () => {
    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) throw error
      setEvent(data)

      // Check if current user is attending
      if (user) {
        const { data: attendanceData } = await supabase
          .from("event_attendees")
          .select("id")
          .eq("event_id", params.id)
          .eq("user_id", user.id)
          .maybeSingle()

        setIsAttending(!!attendanceData)
      }
    } catch (err) {
      console.error("Error fetching event:", err)
      setError("Failed to load event details")
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendees = async () => {
    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase
        .from("event_attendees")
        .select(`
          *,
          users (username, email)
        `)
        .eq("event_id", params.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setAttendees(data || [])
    } catch (err) {
      console.error("Error fetching attendees:", err)
    }
  }

  const handleRSVP = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (event && event.attendee_count >= event.capacity) {
      setError("This event is at full capacity")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const supabase = getSupabaseBrowserClient()

      if (isAttending) {
        // Cancel RSVP
        const { error: deleteError } = await supabase
          .from("event_attendees")
          .delete()
          .eq("event_id", params.id)
          .eq("user_id", user.id)

        if (deleteError) throw deleteError

        // Update attendee count
        await supabase
          .from("events")
          .update({ attendee_count: (event?.attendee_count || 1) - 1 })
          .eq("id", params.id)

        setSuccess("RSVP cancelled successfully")
        setIsAttending(false)
      } else {
        // Add RSVP
        const { error: insertError } = await supabase
          .from("event_attendees")
          .insert({
            event_id: params.id,
            user_id: user.id,
            attended: false,
          })

        if (insertError) throw insertError

        // Update attendee count
        await supabase
          .from("events")
          .update({ attendee_count: (event?.attendee_count || 0) + 1 })
          .eq("id", params.id)

        setSuccess("RSVP confirmed! See you at the event")
        setIsAttending(true)
      }

      fetchEventDetails()
      fetchAttendees()
    } catch (err) {
      console.error("RSVP error:", err)
      setError(err instanceof Error ? err.message : "Failed to update RSVP")
    } finally {
      setSubmitting(false)
    }
  }

  const isOrganizer = user && event && event.organizer_id === user.id

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!event) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="card p-12 text-center">
              <h3 className="text-xl font-bold mb-2">Event Not Found</h3>
              <p className="text-muted-foreground mb-4">This event does not exist or has been removed.</p>
              <Link href="/events" className="text-primary hover:underline">
                Back to Events
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
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link href="/events" className="text-primary hover:underline mb-6 inline-block">
            ← Back to Events
          </Link>

          <div className="card p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-accent text-accent-foreground rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold">
                    {new Date(event.event_date).getDate()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                  <p className="text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {' at '}
                    {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {isOrganizer && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Your Event
                </span>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-2xl font-bold">{event.attendee_count}/{event.capacity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">{event.status}</p>
              </div>
            </div>

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

            {!isOrganizer && (
              <button
                onClick={handleRSVP}
                disabled={submitting || event.attendee_count >= event.capacity}
                className={`w-full px-6 py-3 font-semibold rounded-lg transition disabled:opacity-50 ${
                  isAttending
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-accent text-accent-foreground hover:opacity-90'
                }`}
              >
                {submitting ? 'Processing...' : isAttending ? 'Cancel RSVP' : event.attendee_count >= event.capacity ? 'Event Full' : 'RSVP to Event'}
              </button>
            )}
          </div>

          {/* Attendees List - Only visible to organizer */}
          {isOrganizer && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Attendees ({attendees.length})</h2>
              {attendees.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No one has RSVP'd yet</p>
              ) : (
                <div className="space-y-2">
                  {attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-semibold">{attendee.users.username}</p>
                        <p className="text-xs text-muted-foreground">{attendee.users.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          RSVP'd {new Date(attendee.created_at).toLocaleDateString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          attendee.attended ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attendee.attended ? 'Attended' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Public Attendees Count - Visible to everyone */}
          {!isOrganizer && attendees.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Who's Going</h2>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-muted-foreground">{attendees.length} people have RSVP'd</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
