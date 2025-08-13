"use client"

import { LayoutApp } from "@/app/components/layout/layout-app"
import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <LayoutApp>
      <div className="flex h-full w-full flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Learn how to make the most of inVerus with our comprehensive guides and tutorials.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-8">
            <div className="p-6 border rounded-lg space-y-3">
              <h3 className="font-semibold">Getting Started</h3>
              <p className="text-sm text-muted-foreground">
                Learn the basics of identity verification with inVerus.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="#getting-started">
                  Read Guide
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="p-6 border rounded-lg space-y-3">
              <h3 className="font-semibold">API Reference</h3>
              <p className="text-sm text-muted-foreground">
                Detailed API documentation for developers.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="#api-reference">
                  View API
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="p-6 border rounded-lg space-y-3">
              <h3 className="font-semibold">Trust Score</h3>
              <p className="text-sm text-muted-foreground">
                Understanding how trust scores are calculated.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="#trust-score">
                  Learn More
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="p-6 border rounded-lg space-y-3">
              <h3 className="font-semibold">Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help and contact our support team.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="mailto:support@inverus.tech">
                  Contact Support
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="pt-8">
            <Button asChild>
              <Link href="/">
                Back to Chat
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </LayoutApp>
  )
} 