"use client"

import { PeopleSearchResults } from "../components/search/people-search-results"
import { TrustScoreChart } from "../components/charts/trust-score-chart"
import { ConfidenceScoreChart } from "../components/charts/confidence-score-chart"

export default function DemoPage() {
  const demoSearchQuery = "First Name: John Last Name: Smith Location: New York"

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold">inVerus Search Demo</h1>
          <p className="text-muted-foreground text-lg">
            People search with Trust Score and Confidence Score charts
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Demo Search Query</h2>
          <div className="bg-card border rounded-lg p-4">
            <code className="text-sm">{demoSearchQuery}</code>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Chart Components</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrustScoreChart score={85} />
            <ConfidenceScoreChart score={92} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Search Results</h2>
          <PeopleSearchResults 
            results={[]}
            searchQuery={demoSearchQuery}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>User types search with "First Name:" and "Last Name:" fields</li>
              <li>System detects both fields are present in the search query</li>
              <li>Returns 5 static people with Trust and Confidence scores</li>
              <li>Displays charts side by side for each person</li>
              <li>Shows verification sources and person details</li>
            </ol>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Integration Notes</h2>
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Charts use CSS/SVG instead of recharts for better compatibility</li>
              <li>Search results appear in chat interface when search criteria met</li>
              <li>Fully integrated with existing message and conversation components</li>
              <li>Uses existing UI components and color scheme</li>
              <li>Responsive design for mobile and desktop</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
} 