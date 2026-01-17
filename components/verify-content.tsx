"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  return (
    <div className="w-full max-w-md">
      <div className="card p-8 text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-4">
          We've sent a confirmation email to <strong>{email || "your email"}</strong>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            Click the confirmation link in your email to verify your account and start collecting with ThriftUp.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="w-full block px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition text-center"
          >
            Back to Sign In
          </Link>
          <p className="text-muted-foreground text-sm">
            Didn't receive the email? <button className="text-primary font-semibold hover:underline">Resend</button>
          </p>
        </div>
      </div>
    </div>
  )
}
