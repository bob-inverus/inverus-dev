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
  pii_masked?: boolean
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

// Function to mask PII data
function maskPIIData(value: string, type: 'email' | 'phone' | 'id' | 'address'): string {
  if (!value) return value
  
  switch (type) {
    case 'email':
      const emailParts = value.split('@')
      if (emailParts.length === 2) {
        const username = emailParts[0]
        const domain = emailParts[1]
        const maskedUsername = username.length > 2 
          ? username.substring(0, 2) + '*'.repeat(username.length - 2)
          : username
        return `${maskedUsername}@${domain}`
      }
      return value
    
    case 'phone':
      const phoneDigits = value.replace(/\D/g, '')
      if (phoneDigits.length >= 10) {
        return phoneDigits.substring(0, 3) + '-***-' + phoneDigits.substring(phoneDigits.length - 4)
      }
      return '***-***-' + value.slice(-4)
    
    case 'id':
      return value.length > 4 ? '***' + value.slice(-4) : '***'
    
    case 'address':
      const parts = value.split(' ')
      if (parts.length > 2) {
        return parts[0] + ' *** ' + parts[parts.length - 1]
      }
      return '*** ' + parts[parts.length - 1]
    
    default:
      return value
  }
}

// Function to check if search query contains specific identifiers
function hasSpecificIdentifiers(query: string): boolean {
  const trimmedQuery = query.trim().toLowerCase()
  
  // Check for email pattern
  if (trimmedQuery.includes('@') && trimmedQuery.includes('.')) {
    return true
  }
  
  // Check for phone number pattern (10+ digits)
  const phoneDigits = trimmedQuery.replace(/\D/g, '')
  if (phoneDigits.length >= 10) {
    return true
  }
  
  // Check for ID-like patterns (specific numbers/codes)
  if (/\b\d{4,}\b/.test(trimmedQuery)) {
    return true
  }
  
  // Check for full name (first + last + location or other specific info)
  const words = trimmedQuery.split(/\s+/)
  if (words.length >= 3) {
    return true
  }
  
  return false
}

// Function to mask PII in search results
function maskResultsPII(results: SearchResult[]): SearchResult[] {
  return results.map(result => {
    const maskedResult = { ...result }
    
    // Mask email fields
    const emailFields = ['email', 'Email', 'EMAIL']
    emailFields.forEach(field => {
      if (maskedResult[field]) {
        maskedResult[field] = maskPIIData(maskedResult[field], 'email')
      }
    })
    
    // Mask phone fields
    const phoneFields = ['mobile_phone', 'Mobile_Phone', 'phone', 'Phone', 'PHONE', 'MOBILE_PHONE', 'Mobile Phone']
    phoneFields.forEach(field => {
      if (maskedResult[field]) {
        maskedResult[field] = maskPIIData(maskedResult[field], 'phone')
      }
    })
    
    // Mask address fields
    const addressFields = ['address', 'Address', 'ADDRESS']
    addressFields.forEach(field => {
      if (maskedResult[field]) {
        maskedResult[field] = maskPIIData(maskedResult[field], 'address')
      }
    })
    
    // Mask ID fields
    const idFields = ['id', 'ID', 'user_id', 'customer_id']
    idFields.forEach(field => {
      if (maskedResult[field]) {
        maskedResult[field] = maskPIIData(maskedResult[field], 'id')
      }
    })
    
    return maskedResult
  })
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

// Function to extract search terms from natural language queries
function extractSearchTerms(query: string): string {
  const lowerQuery = query.toLowerCase().trim()
  
  // Common patterns for natural language queries
  const patterns = [
    // "find everyone whose name is X" or "find people named X"
    /(?:find|search|look for|get|show me|list|display)\s+(?:everyone|people|person|anyone|somebody|someone)\s+(?:whose|with|named?|called|that|who)\s+(?:name|first name|last name|full name)\s+(?:is|are|contains?|includes?|starts? with|ends? with)?\s*(.+)/i,
    
    // "search for X" or "find X"
    /(?:find|search|look for|get|show me|list|display)\s+(?:for\s+)?(.+)/i,
    
    // "who is X" or "who are X"
    /(?:who\s+(?:is|are))\s+(.+)/i,
    
    // "people named X" or "person called X"
    /(?:people|person|someone|anyone)\s+(?:named?|called|with name|whose name)\s+(.+)/i,
    
    // "X's contact" or "X's information"
    /(.+)(?:'s|s')\s+(?:contact|info|information|details|phone|email|address)/i,
    
    // "email X" or "phone X"
    /(?:email|phone|contact|call|reach)\s+(.+)/i,
    
    // "where is X" or "location of X"
    /(?:where\s+(?:is|are)|location\s+of)\s+(.+)/i,
    
    // "X in [location]" or "X from [location]"
    /(.+)\s+(?:in|from|at|located in|living in|based in)\s+(.+)/i,
    
    // Direct questions: "Aaron Smith", "john.doe@email.com"
    /^([a-zA-Z0-9@._\-\s]+)$/i
  ]
  
  // Try each pattern to extract the search term
  for (const pattern of patterns) {
    const match = lowerQuery.match(pattern)
    if (match) {
      // For location-based searches, combine name and location
      if (pattern.source.includes('in|from|at|located')) {
        const name = match[1]?.trim()
        const location = match[2]?.trim()
        if (name && location) {
          return `${name} ${location}`
        }
      }
      
      // For other patterns, return the captured group
      const extractedTerm = match[1]?.trim()
      if (extractedTerm && extractedTerm.length > 0) {
        return extractedTerm
      }
    }
  }
  
  // If no pattern matches, clean up common filler words
  const fillerWords = [
    'find', 'search', 'look', 'for', 'get', 'show', 'me', 'list', 'display',
    'who', 'is', 'are', 'the', 'a', 'an', 'person', 'people', 'someone',
    'anyone', 'everybody', 'everyone', 'named', 'called', 'with', 'name',
    'whose', 'that', 'contains', 'includes', 'has', 'have'
  ]
  
  const words = lowerQuery.split(/\s+/)
  const cleanedWords = words.filter(word => !fillerWords.includes(word))
  
  return cleanedWords.join(' ').trim() || query.trim()
}

async function searchPeopleDB(supabase: any, query: string): Promise<SearchResponse> {
  const originalQuery = query.trim()
  
  if (originalQuery.length < 2) {
    return {
      results: [],
      count: 0,
      query: originalQuery,
      confidence_level: 'low',
      suggestions: ['Please enter at least 2 characters to search'],
      message: 'Search term too short'
    }
  }
  
  // Extract actual search terms from natural language
  const searchTerm = extractSearchTerms(originalQuery)

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
      query: originalQuery,
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
      query: originalQuery,
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
        query: originalQuery,
        confidence_level: 'low',
        message: "Search failed",
        suggestions: ['Please try again with different search terms']
      }
    }

    if (!data || data.length === 0) {
      return {
        results: [],
        count: 0,
        query: originalQuery,
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

    // Apply PII masking if user hasn't provided specific identifiers
    const shouldMaskPII = !hasSpecificIdentifiers(searchTerm) && resultsWithConfidence.length > 1
    const finalResults = shouldMaskPII ? maskResultsPII(resultsWithConfidence) : resultsWithConfidence

    // Update suggestions if PII is masked
    let finalSuggestions = confidence_level === 'low' ? queryAnalysis.suggestions : []
    if (shouldMaskPII) {
      finalSuggestions = [
        '🔒 PII data has been masked for privacy protection.',
        'To view complete information, please provide more specific search criteria:',
        '• Full email address (e.g., john.doe@company.com)',
        '• Complete phone number (e.g., 555-123-4567)',
        '• Full name with location (e.g., "John Smith Boston MA")',
        '• Specific ID numbers or reference codes'
      ]
    }

    return {
      results: finalResults,
      count: finalResults.length,
      query: originalQuery,
      confidence_level,
      suggestions: finalSuggestions,
      message: `Found ${finalResults.length} result${finalResults.length === 1 ? '' : 's'}${shouldMaskPII ? ' (PII masked for privacy)' : ''}`,
      pii_masked: shouldMaskPII
    }

  } catch (error) {
    return {
      results: [],
      count: 0,
      query: originalQuery,
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