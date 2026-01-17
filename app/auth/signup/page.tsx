"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import Navigation from "@/components/navigation"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      console.log("Starting signup for:", email)

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: fullName || username,
          },
        },
      })

      // Log the full error for debugging
      if (signUpError) {
        console.error("Full signup error:", JSON.stringify(signUpError, null, 2))
        throw new Error(signUpError.message || "Signup failed")
      }

      if (!authData.user) {
        throw new Error("Signup failed - no user returned")
      }

      console.log("Auth user created successfully:", authData.user.id)

      // Wait for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if user profile was created
      const { data: existingProfile, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", authData.user.id)
        .maybeSingle()

      if (checkError) {
        console.error("Profile check error:", checkError)
      }

      // If trigger didn't create the profile, create it manually
      if (!existingProfile) {
        console.log("Creating profile manually...")
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user.id,
          email,
          username,
          full_name: fullName || username,
          avatar_url: null,
          bio: null,
          reputation_score: 0,
          verified: false,
          seller_rating: 0,
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
          // Only throw if it's not a duplicate error
          if (!profileError.message.includes("duplicate") && !profileError.code?.includes("23505")) {
            console.warn("Profile creation failed but continuing:", profileError.message)
          }
        } else {
          console.log("Profile created successfully")
        }
      } else {
        console.log("Profile already exists (created by trigger)")
      }

      // Check if email confirmation is required
      if (authData.session) {
        console.log("User has session, redirecting to dashboard")
        router.push("/dashboard")
      } else {
        console.log("Email confirmation required")
        alert("Please check your email to confirm your account before logging in.")
        router.push("/auth/login")
      }
    } catch (err) {
      console.error("Signup error:", err)
      const errorMessage = err instanceof Error ? err.message : "Signup failed. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h1 className="text-3xl font-bold mb-2">Join ThriftUp</h1>
            <p className="text-muted-foreground mb-6">Create your account to start collecting</p>

            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-lg mb-4 text-sm">
                <p className="font-semibold mb-1">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                  minLength={3}
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Your full name (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
