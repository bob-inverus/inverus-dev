"use client"

import { isSupabaseEnabled } from "@/lib/supabase/config"
import { notFound } from "next/navigation"
import { LoginPage } from "./login-page"
import Link from "next/link"

export default function AuthPage() {
  if (!isSupabaseEnabled) {
    return notFound()
  }

  return (
    <div className="bg-popover relative flex h-screen w-full flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Link
        href="/"
        className="text-md text-muted-foreground hover:text-primary absolute top-6 left-6"
      >
        ← Back to chat
      </Link>
      <LoginPage />
    </div>
  )
}
