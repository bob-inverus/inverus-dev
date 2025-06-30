"use client"

import { TrustScoreChart } from "../charts/trust-score-chart"
import { ConfidenceScoreChart } from "../charts/confidence-score-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type PersonSearchResult = {
  id: string
  firstName: string
  lastName: string
  location?: string
  email?: string
  phone?: string
  idNumber?: string
  trustScore: number
  confidenceScore: number
  verificationSources: string[]
}

type PeopleSearchResultsProps = {
  results: PersonSearchResult[]
  searchQuery: string
}

// Static people data for demonstration
const STATIC_PEOPLE: PersonSearchResult[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    location: "New York, NY",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    idNumber: "PID001",
    trustScore: 85,
    confidenceScore: 92,
    verificationSources: ["Social Security", "DMV Records", "Credit Bureau", "Employment History"]
  },
  {
    id: "2", 
    firstName: "Sarah",
    lastName: "Johnson",
    location: "Los Angeles, CA",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 234-5678",
    idNumber: "PID002",
    trustScore: 78,
    confidenceScore: 88,
    verificationSources: ["Social Security", "DMV Records", "Utility Bills", "Bank Records"]
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Davis",
    location: "Chicago, IL", 
    email: "michael.davis@email.com",
    phone: "+1 (555) 345-6789",
    idNumber: "PID003",
    trustScore: 91,
    confidenceScore: 95,
    verificationSources: ["Social Security", "DMV Records", "Credit Bureau", "Property Records", "Employment History"]
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Wilson",
    location: "Houston, TX",
    email: "emily.wilson@email.com", 
    phone: "+1 (555) 456-7890",
    idNumber: "PID004",
    trustScore: 82,
    confidenceScore: 89,
    verificationSources: ["Social Security", "DMV Records", "Educational Records", "Bank Records"]
  },
  {
    id: "5",
    firstName: "David",
    lastName: "Brown",
    location: "Phoenix, AZ",
    email: "david.brown@email.com",
    phone: "+1 (555) 567-8901", 
    idNumber: "PID005",
    trustScore: 87,
    confidenceScore: 91,
    verificationSources: ["Social Security", "DMV Records", "Credit Bureau", "Professional License"]
  }
]

export function PeopleSearchResults({ results, searchQuery }: PeopleSearchResultsProps) {
  // Check if search query contains both first name and last name fields
  const hasFirstName = searchQuery.toLowerCase().includes("first name:")
  const hasLastName = searchQuery.toLowerCase().includes("last name:")
  
  // If both first name and last name are present, show results with charts
  if (hasFirstName && hasLastName) {
    // Extract first and last names from the search query
    const firstNameMatch = searchQuery.match(/first name:\s*([^,]+?)(?:\s+last name:|$)/i)
    const lastNameMatch = searchQuery.match(/last name:\s*([^,]+?)(?:\s+first name:|$)/i)
    
    const firstName = firstNameMatch?.[1]?.trim().toLowerCase()
    const lastName = lastNameMatch?.[1]?.trim().toLowerCase()

    // Find matching person based on search terms
    let matchedPerson = null

    if (firstName && lastName) {
      matchedPerson = STATIC_PEOPLE.find(person => {
        const personFirstName = person.firstName.toLowerCase()
        const personLastName = person.lastName.toLowerCase()
        return personFirstName.includes(firstName) && personLastName.includes(lastName)
      })
    }

    // If no exact match, return a randomized person to simulate database search
    if (!matchedPerson) {
      const randomIndex = Math.floor(Math.random() * STATIC_PEOPLE.length)
      matchedPerson = STATIC_PEOPLE[randomIndex]
    }

    // Return only the matched person as an array
    const searchResults = [matchedPerson]
    
    return (
      <div className="my-6 space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">People Search Results</h3>
          <p className="text-muted-foreground text-sm">
            Found {searchResults.length} verified individual{searchResults.length !== 1 ? 's' : ''} matching your search criteria
          </p>
        </div>
        
        {searchResults.map((person) => (
          <Card key={person.id} className="p-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {person.firstName} {person.lastName}
                </CardTitle>
                <div className="flex gap-2">
                  {person.verificationSources.map((source) => (
                    <Badge key={source} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Person Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {person.location && (
                  <div>
                    <span className="font-medium">Location:</span> {person.location}
                  </div>
                )}
                {person.email && (
                  <div>
                    <span className="font-medium">Email:</span> {person.email}
                  </div>
                )}
                {person.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {person.phone}
                  </div>
                )}
                {person.idNumber && (
                  <div>
                    <span className="font-medium">ID Number:</span> {person.idNumber}
                  </div>
                )}
              </div>
              
              {/* Trust and Confidence Score Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrustScoreChart 
                  score={person.trustScore}
                  className="w-full"
                />
                <ConfidenceScoreChart 
                  score={person.confidenceScore}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  // If not a first name + last name search, don't show anything
  return null
} 