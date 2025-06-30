"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Mail, Phone, Hash, CheckCircle } from "lucide-react"
import { TrustScoreChart } from "../charts/trust-score-chart"
import { ConfidenceScoreChart } from "../charts/confidence-score-chart"

// Static people data
const staticPeopleData = [
  {
    id: "PID001",
    name: "John Smith",
    location: "New York, NY",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    trustScore: 85,
    confidenceScore: 92,
    verificationSources: ["Social Security", "DMV Records", "Credit Bureau", "Employment History"]
  },
  {
    id: "PID002", 
    name: "Sarah Johnson",
    location: "Los Angeles, CA",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 234-5678",
    trustScore: 78,
    confidenceScore: 88,
    verificationSources: ["Social Security", "DMV Records", "Utility Bills", "Bank Records"]
  },
  {
    id: "PID003",
    name: "Michael Davis", 
    location: "Chicago, IL",
    email: "michael.davis@email.com",
    phone: "+1 (555) 345-6789",
    trustScore: 91,
    confidenceScore: 95,
    verificationSources: ["Social Security", "DMV Records", "Credit Bureau", "Property Records", "Employment History"]
  },
  {
    id: "PID004",
    name: "Emily Wilson",
    location: "Houston, TX", 
    email: "emily.wilson@email.com",
    phone: "+1 (555) 456-7890",
    trustScore: 82,
    confidenceScore: 89,
    verificationSources: ["Social Security", "DMV Records", "Educational Records", "Bank Records"]
  },
  {
    id: "PID005",
    name: "David Brown",
    location: "Phoenix, AZ",
    email: "david.brown@email.com", 
    phone: "+1 (555) 567-8901",
    trustScore: 87,
    confidenceScore: 91,
    verificationSources: ["Social Security", "DMV Records", "Credit Bureau", "Professional License"]
  }
]

export function StandalonePeopleSearch() {
  const [searchInput, setSearchInput] = useState("")
  const [searchResults, setSearchResults] = useState<typeof staticPeopleData | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    // Check if search contains both "First Name:" and "Last Name:"
    const isPeopleSearch = searchInput.toLowerCase().includes("first name:") && 
                          searchInput.toLowerCase().includes("last name:")

    if (!isPeopleSearch) {
      alert("Please use the format: First Name: [name] Last Name: [name]")
      return
    }

    setIsSearching(true)
    
    // Extract first and last names from the search input
    const firstNameMatch = searchInput.match(/first name:\s*([^,]+?)(?:\s+last name:|$)/i)
    const lastNameMatch = searchInput.match(/last name:\s*([^,]+?)(?:\s+first name:|$)/i)
    
    const firstName = firstNameMatch?.[1]?.trim().toLowerCase()
    const lastName = lastNameMatch?.[1]?.trim().toLowerCase()

    // Simulate search delay
    setTimeout(() => {
      // Find matching person based on search terms
      let matchedPerson = null

      if (firstName && lastName) {
        matchedPerson = staticPeopleData.find(person => {
          const personFirstName = person.name.split(' ')[0].toLowerCase()
          const personLastName = person.name.split(' ').slice(1).join(' ').toLowerCase()
          return personFirstName.includes(firstName) && personLastName.includes(lastName)
        })
      }

      // If no exact match, return a randomized person to simulate database search
      if (!matchedPerson) {
        const randomIndex = Math.floor(Math.random() * staticPeopleData.length)
        matchedPerson = staticPeopleData[randomIndex]
      }

      setSearchResults([matchedPerson])
      setIsSearching(false)
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">inVerus Identity Search</h1>
        <p className="text-muted-foreground">
          Search for verified individuals using the format: "First Name: [name] Last Name: [name]"
        </p>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Example: First Name: John Last Name: Smith"
                className="text-lg py-6"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              size="lg"
              className="px-8"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Search Results</h2>
            <p className="text-muted-foreground">
              Found {searchResults.length} verified individual{searchResults.length !== 1 ? 's' : ''} matching your search criteria
            </p>
          </div>

          <div className="grid gap-6">
            {searchResults.map((person) => (
              <Card key={person.id} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Person Info */}
                  <div className="lg:col-span-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">{person.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        <Hash className="h-3 w-3 mr-1" />
                        {person.id}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{person.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{person.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{person.phone}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Verification Sources
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {person.verificationSources.map((source) => (
                          <Badge key={source} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Trust Score Chart */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-center">Trust Score</h4>
                        <div className="flex justify-center">
                          <TrustScoreChart score={person.trustScore} />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                          Based on verification data and identity consistency
                        </p>
                      </div>

                      {/* Confidence Score Chart */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-center">Confidence Score</h4>
                        <div className="flex justify-center">
                          <ConfidenceScoreChart score={person.confidenceScore} />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                          Based on data quality and verification completeness
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>How to Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p>To search for people, use the following format:</p>
              <div className="bg-muted p-3 rounded-md font-mono">
                First Name: [first name] Last Name: [last name]
              </div>
              
              <div>
                <p className="font-medium mb-2">Available people in database:</p>
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <div>• First Name: John Last Name: Smith</div>
                  <div>• First Name: Sarah Last Name: Johnson</div>
                  <div>• First Name: Michael Last Name: Davis</div>
                  <div>• First Name: Emily Last Name: Wilson</div>
                  <div>• First Name: David Last Name: Brown</div>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                Each search will return one verified individual with their Trust Score and Confidence Score.
                If the name doesn't match exactly, the system will return a similar person from the database.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 