import Link from "next/link"
import React from "react"

export function Header() {
  return (
    <header className="h-app-header fixed top-0 right-0 left-0 z-50 bg-background">
      <div className="relative mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 bg-background">
        <Link href="/" className="text-xl font-medium tracking-tight">
          inVerus
        </Link>
      </div>
    </header>
  )
}
