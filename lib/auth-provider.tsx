"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "./supabase-client"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initialized.current) return
    initialized.current = true

    const supabase = getSupabaseBrowserClient()

    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session check error:", error)
          setUser(null)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        // Silently handle abort errors during initialization
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Session check error:", error)
        }
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      initialized.current = false
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
