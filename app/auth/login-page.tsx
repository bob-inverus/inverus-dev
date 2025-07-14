"use client"
import { LoginForm } from "@/components/ui/login-form"
import { useState } from "react"
import { signInWithLinkedIn, signInWithGoogle, signInWithX, signInWithOTP, verifyOTP } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"

export function LoginPage() {
  const [isLoading, setIsLoading] = useState<{
    linkedin: boolean
    google: boolean
    x: boolean
    otp: boolean
    verify: boolean
  }>({
    linkedin: false,
    google: false,
    x: false,
    otp: false,
    verify: false
  })
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const handleSocialLogin = async (provider: 'linkedin' | 'google' | 'x') => {
    const supabase = createClient()
    if (!supabase) {
      setError("Authentication is not available")
      return
    }

    try {
      setIsLoading(prev => ({ ...prev, [provider]: true }))
      setError(null)

      let data
      switch (provider) {
        case 'linkedin':
          data = await signInWithLinkedIn(supabase)
          break
        case 'google':
          data = await signInWithGoogle(supabase)
          break
        case 'x':
          data = await signInWithX(supabase)
          break
      }

      if (data?.url) {
        // Keep loading state active during redirect
        // The loading will persist until the page redirects
        window.location.href = data.url
      } else {
        // Only reset loading if no redirect occurred
        setIsLoading(prev => ({ ...prev, [provider]: false }))
      }
    } catch (err: unknown) {
      console.error(`Error signing in with ${provider}:`, err)
      setError(
        (err as Error).message ||
        "An unexpected error occurred. Please try again."
      )
      // Only reset loading on error
      setIsLoading(prev => ({ ...prev, [provider]: false }))
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter your email address")
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setError("Authentication is not available")
      return
    }

    try {
      setIsLoading(prev => ({ ...prev, otp: true }))
      setError(null)

      await signInWithOTP(supabase, email)
      setOtpSent(true)
    } catch (err: unknown) {
      console.error("Error sending OTP:", err)
      setError(
        (err as Error).message ||
        "Failed to send verification code. Please try again."
      )
    } finally {
      setIsLoading(prev => ({ ...prev, otp: false }))
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otpToken) {
      setError("Please enter the verification code")
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setError("Authentication is not available")
      return
    }

    try {
      setIsLoading(prev => ({ ...prev, verify: true }))
      setError(null)

      await verifyOTP(supabase, email, otpToken)
      // Redirect will be handled by Supabase auth state change
      window.location.href = '/'
    } catch (err: unknown) {
      console.error("Error verifying OTP:", err)
      setError(
        (err as Error).message ||
        "Invalid verification code. Please try again."
      )
    } finally {
      setIsLoading(prev => ({ ...prev, verify: false }))
    }
  }

  return (
    <div className="min-h-screen">
      <LoginForm
        isLoading={isLoading}
        error={error}
        email={email}
        setEmail={setEmail}
        otpToken={otpToken}
        setOtpToken={setOtpToken}
        otpSent={otpSent}
        setOtpSent={setOtpSent}
        setError={setError}
        onSocialLogin={handleSocialLogin}
        onSendOTP={handleSendOTP}
        onVerifyOTP={handleVerifyOTP}
      />
    </div>
  )
} 