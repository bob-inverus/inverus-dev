import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "next-themes"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "inVerus Identity Search",
  description: "Search for verified individuals with Trust and Confidence scores.",
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider delayDuration={200} skipDelayDuration={500}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            {children}
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  )
} 