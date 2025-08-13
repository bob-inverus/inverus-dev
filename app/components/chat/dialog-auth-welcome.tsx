"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { signInWithGoogle } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { useState } from "react"

type DialogAuthWelcomeProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export function DialogAuthWelcome({ open, setOpen }: DialogAuthWelcomeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isSupabaseEnabled) {
    return null
  }

  const supabase = createClient()

  if (!supabase) {
    return null
  }

  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await signInWithGoogle(supabase)

      // Redirect to the provider URL
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      console.error("Error signing in with Google:", err)
      setError(
        (err as Error).message ||
          "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleStayLoggedOut = () => {
    setOpen(false)
    // Let the parent know they chose to stay logged out
    // This will allow them to continue with limitations
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md rounded-3xl p-8">
        <DialogHeader className="sr-only">
          <DialogTitle>Sign in / Sign up</DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Sign in / Sign up
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              You've reached your limit of 5 free queries. Sign up to get unlimited access, full identity data, and complete trust scores.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                ⚠️ Without signing in, personal data and scores will be masked with ******, and you'll have limited access to features.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              className="w-full h-12 text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full text-base font-medium"
              onClick={handleSignInWithGoogle}
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Sign in"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12 border-gray-300 dark:border-gray-600 rounded-full text-base font-medium"
              onClick={handleSignInWithGoogle}
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Sign up"}
            </Button>
            
            <button
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-base underline font-medium mt-4"
              onClick={handleStayLoggedOut}
            >
              Stay logged out
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 