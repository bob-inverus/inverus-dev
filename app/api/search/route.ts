import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

interface SearchResult {
  [key: string]: any
  confidence_score: number
  match_reasons: string[]
}

interface SearchResponse {
  results: SearchResult[]
  count: number
  query: string
  confidence_level: 'high' | 'medium' | 'low'
  suggestions?: string[]
  message?: string
}

// Helper function to calculate confidence score based on search input and matches
function calculateConfidenceScore(
  searchTerm: string,
  record: any,
  matchedFields: string[]
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []
  const lowerSearchTerm = searchTerm.toLowerCase()

  // Get all possible field names (both capitalized and lowercase, with spaces)
  const emailFields = ['email', 'Email', 'EMAIL']
  const nameFields = ['name', 'Name', 'NAME']
  const firstNameFields = ['first_name', 'First_Name', 'firstName', 'FirstName', 'FIRST_NAME', 'First_name']
  const lastNameFields = ['last_name', 'Last_Name', 'lastName', 'LastName', 'LAST_NAME', 'Last_name']
  const phoneFields = ['mobile_phone', 'Mobile_Phone', 'phone', 'Phone', 'PHONE', 'MOBILE_PHONE', 'Mobile Phone']
  const cityFields = ['city', 'City', 'CITY']
  const stateFields = ['state', 'State', 'STATE']
  const addressFields = ['address', 'Address', 'ADDRESS']

  // Helper function to get field value
  const getFieldValue = (fields: string[]) => {
    for (const field of fields) {
      if (record[field]) return record[field]
    }
    return null
  }

  // Email match (highest confidence)
  const emailValue = getFieldValue(emailFields)
  if (emailValue && emailValue.toLowerCase().includes(lowerSearchTerm)) {
    score += 50
    reasons.push('Email match')
  }

  // Exact name matches
  const nameValue = getFieldValue(nameFields)
  if (nameValue && nameValue.toLowerCase() === lowerSearchTerm) {
    score += 40
    reasons.push('Exact name match')
  }

  // First name + Last name combination
  const firstNameValue = getFieldValue(firstNameFields)
  const lastNameValue = getFieldValue(lastNameFields)
  if (firstNameValue && lastNameValue) {
    const fullName = `${firstNameValue} ${lastNameValue}`.toLowerCase()
    if (fullName.includes(lowerSearchTerm)) {
      score += 35
      reasons.push('Full name match')
    }
  }

  // Individual name matches
  if (firstNameValue && firstNameValue.toLowerCase().includes(lowerSearchTerm)) {
    score += 25
    reasons.push('First name match')
  }
  if (lastNameValue && lastNameValue.toLowerCase().includes(lowerSearchTerm)) {
    score += 25
    reasons.push('Last name match')
  }

  // Phone number match
  const phoneValue = getFieldValue(phoneFields)
  if (phoneValue && phoneValue.toString().includes(lowerSearchTerm)) {
    score += 30
    reasons.push('Phone match')
  }

  // Location matches
  const cityValue = getFieldValue(cityFields)
  if (cityValue && cityValue.toLowerCase().includes(lowerSearchTerm)) {
    score += 20
    reasons.push('City match')
  }

  const stateValue = getFieldValue(stateFields)
  if (stateValue && stateValue.toLowerCase().includes(lowerSearchTerm)) {
    score += 15
    reasons.push('State match')
  }

  const addressValue = getFieldValue(addressFields)
  if (addressValue && addressValue.toLowerCase().includes(lowerSearchTerm)) {
    score += 20
    reasons.push('Address match')
  }

  // Verification bonus/penalty
  const isValidValue = record['Is Valid'] || record['is_valid'] || record['Is_Valid']
  if (isValidValue === true) {
    score += 10
    reasons.push('Verified record')
  } else if (isValidValue === false) {
    score -= 5
    reasons.push('Unverified record')
  }

  return { score, reasons }
}

// Function to analyze search query quality
function analyzeSearchQuery(query: string): {
  quality: 'high' | 'medium' | 'low'
  suggestions: string[]
} {
  const trimmedQuery = query.trim()
  
  // High quality indicators
  if (trimmedQuery.includes('@') || /^\d{10,}$/.test(trimmedQuery.replace(/[^\d]/g, ''))) {
    return {
      quality: 'high',
      suggestions: []
    }
  }
  
  // Medium quality indicators
  if (trimmedQuery.split(' ').length >= 2 || trimmedQuery.length >= 5) {
    return {
      quality: 'medium',
      suggestions: [
        'Try including an email address for more accurate results',
        'Add a phone number if available',
        'Include location information (city, state)'
      ]
    }
  }
  
  // Low quality
  return {
    quality: 'low',
    suggestions: [
      'Please provide more specific information for better results:',
      '• Full name (first and last name)',
      '• Email address',
      '• Phone number',
      '• Location (city, state)',
      '• Try searching with multiple pieces of information'
    ]
  }
}

async function searchPeopleDB(supabase: any, query: string): Promise<SearchResponse> {
  const searchTerm = query.trim()
  
  if (searchTerm.length < 2) {
    return {
      results: [],
      count: 0,
      query: searchTerm,
      confidence_level: 'low',
      suggestions: ['Please enter at least 2 characters to search'],
      message: 'Search term too short'
    }
  }

  const queryAnalysis = analyzeSearchQuery(searchTerm)

  try {
    // Get sample data to determine column structure
    const { data: sampleData, error: sampleError } = await supabase
      .from("people_db")
      .select("*")
      .limit(1)

    if (sampleError || !sampleData || sampleData.length === 0) {
      return {
        results: [],
        count: 0,
        query: searchTerm,
        confidence_level: queryAnalysis.quality,
        suggestions: queryAnalysis.suggestions,
        message: "No data available in the database"
      }
    }

    // Get searchable columns
    const actualColumns = Object.keys(sampleData[0])
    const searchableColumns = actualColumns.filter(col => {
      const lowerCol = col.toLowerCase()
      const sampleValue = (sampleData[0] as any)[col]
      const isTextColumn = typeof sampleValue === 'string'
      
      return isTextColumn && (
        lowerCol.includes('name') || 
        lowerCol.includes('email') || 
        lowerCol.includes('city') || 
        lowerCol.includes('state') || 
        lowerCol.includes('address')
      )
    })

    if (searchableColumns.length === 0) {
      return {
        results: [],
        count: 0,
        query: searchTerm,
        confidence_level: 'low',
        message: "No searchable columns found in the database",
        suggestions: ['Please check your database structure']
      }
    }

    // Create search query
    const orConditions = searchableColumns
      .map(field => {
        const escapedField = field.includes(' ') ? `"${field}"` : field
        return `${escapedField}.ilike.%${searchTerm}%`
      })
      .join(',')

    // Execute search
    const { data, error } = await supabase
      .from("people_db")
      .select("*")
      .or(orConditions)
      .limit(50)

    if (error) {
      return {
        results: [],
        count: 0,
        query: searchTerm,
        confidence_level: 'low',
        message: "Search failed",
        suggestions: ['Please try again with different search terms']
      }
    }

    if (!data || data.length === 0) {
      return {
        results: [],
        count: 0,
        query: searchTerm,
        confidence_level: queryAnalysis.quality,
        suggestions: queryAnalysis.suggestions,
        message: "No records found matching your search criteria"
      }
    }

    // Calculate confidence scores for each result
    const resultsWithConfidence: SearchResult[] = data.map((record: any) => {
      const { score, reasons } = calculateConfidenceScore(searchTerm, record, [])
      return {
        ...record,
        confidence_score: score,
        match_reasons: reasons
      }
    })

    // Sort by confidence score (highest first)
    resultsWithConfidence.sort((a, b) => b.confidence_score - a.confidence_score)

    // Determine overall confidence level based on top results
    const topScore = resultsWithConfidence[0]?.confidence_score || 0
    let confidence_level: 'high' | 'medium' | 'low' = 'low'
    
    if (topScore >= 50) {
      confidence_level = 'high'
    } else if (topScore >= 25) {
      confidence_level = 'medium'
    }

    return {
      results: resultsWithConfidence,
      count: resultsWithConfidence.length,
      query: searchTerm,
      confidence_level,
      suggestions: confidence_level === 'low' ? queryAnalysis.suggestions : [],
      message: `Found ${resultsWithConfidence.length} result${resultsWithConfidence.length === 1 ? '' : 's'}`
    }

  } catch (error) {
    return {
      results: [],
      count: 0,
      query: searchTerm,
      confidence_level: 'low',
      message: "An error occurred during search",
      suggestions: ['Please try again with different search terms']
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { query } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { 
          error: "Search query is required",
          suggestions: [
            'Please provide search terms such as:',
            '• Name (first and/or last)',
            '• Email address', 
            '• Phone number',
            '• Location (city, state)'
          ]
        },
        { status: 400 }
      )
    }

    const searchResponse = await searchPeopleDB(supabase, query)
    return NextResponse.json(searchResponse)

  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        suggestions: ['Please try again later']
      },
      { status: 500 }
    )
  }
} 