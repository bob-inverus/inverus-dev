import { tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

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
function maskPIIData(value: any, type: 'email' | 'phone' | 'id' | 'address' | 'name'): string {
  if (!value) return value
  
  // Convert to string if it's not already
  const stringValue = String(value)
  
  switch (type) {
    case 'email':
      const emailParts = stringValue.split('@')
      if (emailParts.length === 2) {
        const username = emailParts[0]
        const domain = emailParts[1]
        const maskedUsername = username.length > 2 
          ? username.substring(0, 2) + '*'.repeat(username.length - 2)
          : username
        return `${maskedUsername}@${domain}`
      }
      return stringValue
    
    case 'phone':
      const phoneDigits = stringValue.replace(/\D/g, '')
      if (phoneDigits.length >= 10) {
        return phoneDigits.substring(0, 3) + '-***-' + phoneDigits.substring(phoneDigits.length - 4)
      }
      return '***-***-' + stringValue.slice(-4)
    
    case 'id':
      return stringValue.length > 4 ? '***' + stringValue.slice(-4) : '***'
    
    case 'address':
      const parts = stringValue.split(' ')
      if (parts.length > 2) {
        return parts[0] + ' *** ' + parts[parts.length - 1]
      }
      return '*** ' + parts[parts.length - 1]
    
    case 'name':
      // Mask name: show first letter, then mask the rest
      if (stringValue.length > 1) {
        return stringValue.substring(0, 1) + '*'.repeat(stringValue.length - 1)
      }
      return stringValue
    
    default:
      return stringValue
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
  
  return false
}

// Function to analyze search specificity and provide guidance
function analyzeSearchSpecificity(query: string, resultsCount: number): {
  searchType: 'specific' | 'partial' | 'broad'
  shouldMaskPII: boolean
  guidanceMessage: string
  suggestions: string[]
} {
  const trimmedQuery = query.trim().toLowerCase()
  const words = trimmedQuery.split(/\s+/)
  
  // Specific search - should show full data
  if (hasSpecificIdentifiers(trimmedQuery)) {
    return {
      searchType: 'specific',
      shouldMaskPII: false,
      guidanceMessage: '🎯 Great! You provided specific identifiers, showing complete contact information.',
      suggestions: []
    }
  }
  
  // Partial search - name + surname + city/location
  if (words.length >= 2 && words.length <= 5) {
    const locationPatterns = [
      // US States (full names)
      'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 
      'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 
      'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 
      'missouri', 'montana', 'nebraska', 'nevada', 'hampshire', 'jersey', 'mexico', 'york', 
      'carolina', 'dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode', 'tennessee', 
      'texas', 'utah', 'vermont', 'virginia', 'washington', 'wisconsin', 'wyoming',
      // US States (abbreviations)
      'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 
      'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 
      'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 
      'va', 'wa', 'wv', 'wi', 'wy',
      // Major cities
      'boston', 'miami', 'chicago', 'houston', 'phoenix', 'philadelphia', 'antonio', 'diego', 
      'dallas', 'jose', 'austin', 'jacksonville', 'francisco', 'columbus', 'worth', 'charlotte', 
      'seattle', 'denver', 'washington', 'nashville', 'baltimore', 'louisville', 'portland', 
      'oklahoma', 'milwaukee', 'vegas', 'albuquerque', 'tucson', 'fresno', 'sacramento', 
      'atlanta', 'raleigh', 'omaha', 'cleveland', 'tulsa', 'minneapolis', 'colorado', 'arlington'
    ]
    
    const hasLocationWords = words.some(word => 
      locationPatterns.some(pattern => word.includes(pattern)) ||
      /^\d{5}(-\d{4})?$/.test(word) || // ZIP code pattern
      word.includes('city') || word.includes('county') || word.includes('town')
    )
    
    // Also consider 3+ words as potentially including location
    if (hasLocationWords || words.length >= 3) {
      return {
        searchType: 'partial',
        shouldMaskPII: true,
        guidanceMessage: `🔍 Found ${resultsCount} potential matches. Contact details are masked for privacy - provide more specific information to see complete details.`,
        suggestions: [
          '📧 **For exact match, please provide:**',
          '• Email address (most reliable)',
          '• Phone number (10+ digits)',
          '• Full address with zip code',
          '• Employee ID or reference number',
          '',
          '🎯 **Examples:**',
          '• "john.smith@company.com"',
          '• "John Smith 555-123-4567"',
          '• "John Smith 123 Main St Boston MA 02101"'
        ]
      }
    }
  }
  
  // Broad search - just name or very general
  return {
    searchType: 'broad',
    shouldMaskPII: true,
    guidanceMessage: `🔍 Found ${resultsCount} matches. This is a broad search, so contact details are masked for privacy protection.`,
    suggestions: [
      '💡 **To narrow down your search and see complete information:**',
      '• Add last name: "John Smith" instead of just "John"',
      '• Include location: "John Smith Boston" or "John Smith Massachusetts"',
      '• Provide email: "john.smith@email.com"',
      '• Include phone: "John Smith 555-123-4567"',
      '',
      '🎯 **The more specific your search, the better results you\'ll get!**'
    ]
  }
}

// Function to mask PII in search results
function maskResultsPII(results: SearchResult[], searchType: 'specific' | 'partial' | 'broad', searchTerm: string): SearchResult[] {
  const lowerSearchTerm = searchTerm.toLowerCase()
  
  return results.map((result, index) => {
    const maskedResult = { ...result }
    
    // Mask name fields for broad searches
    if (searchType === 'broad') {
      const nameFields = ['Name', 'name', 'First_name', 'Last_name', 'first_name', 'last_name', 'firstName', 'lastName']
      nameFields.forEach(field => {
        if (maskedResult[field]) {
          const fieldValue = String(maskedResult[field]).toLowerCase()
          // Don't mask if this field contains the search term
          if (!fieldValue.includes(lowerSearchTerm)) {
            maskedResult[field] = maskPIIData(maskedResult[field], 'name')
          }
        }
      })
    }
    
    // Mask email fields
    const emailFields = ['email', 'Email', 'EMAIL']
    emailFields.forEach(field => {
      if (maskedResult[field]) {
        const fieldValue = String(maskedResult[field]).toLowerCase()
        // Don't mask if this field contains the search term
        if (!fieldValue.includes(lowerSearchTerm)) {
          maskedResult[field] = maskPIIData(maskedResult[field], 'email')
        }
      }
    })
    
    // Mask phone fields
    const phoneFields = ['mobile_phone', 'Mobile_Phone', 'phone', 'Phone', 'PHONE', 'MOBILE_PHONE', 'Mobile Phone']
    phoneFields.forEach(field => {
      if (maskedResult[field]) {
        const fieldValue = String(maskedResult[field]).toLowerCase()
        // Don't mask if this field contains the search term (for phone numbers, remove non-digits first)
        const cleanFieldValue = fieldValue.replace(/\D/g, '')
        const cleanSearchTerm = lowerSearchTerm.replace(/\D/g, '')
        if (!cleanFieldValue.includes(cleanSearchTerm) && !fieldValue.includes(lowerSearchTerm)) {
          maskedResult[field] = maskPIIData(maskedResult[field], 'phone')
        }
      }
    })
    
    // Mask address fields
    const addressFields = ['address', 'Address', 'ADDRESS']
    addressFields.forEach(field => {
      if (maskedResult[field]) {
        const fieldValue = String(maskedResult[field]).toLowerCase()
        // Don't mask if this field contains the search term
        if (!fieldValue.includes(lowerSearchTerm)) {
          maskedResult[field] = maskPIIData(maskedResult[field], 'address')
        }
      }
    })
    
    // Mask location fields
    const locationFields = ['city', 'City', 'CITY', 'state', 'State', 'STATE']
    locationFields.forEach(field => {
      if (maskedResult[field]) {
        const fieldValue = String(maskedResult[field]).toLowerCase()
        // Don't mask if this field contains the search term
        if (!fieldValue.includes(lowerSearchTerm)) {
          maskedResult[field] = maskPIIData(maskedResult[field], 'name')
        }
      }
    })
    
    // Mask ID fields
    const idFields = ['id', 'ID', 'user_id', 'customer_id']
    idFields.forEach(field => {
      if (maskedResult[field]) {
        const fieldValue = String(maskedResult[field]).toLowerCase()
        // Don't mask if this field contains the search term
        if (!fieldValue.includes(lowerSearchTerm)) {
          maskedResult[field] = maskPIIData(maskedResult[field], 'id')
        }
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
    const allTextColumns = actualColumns.filter(col => {
      const sampleValue = (sampleData[0] as any)[col]
      return typeof sampleValue === 'string'
    })
    
    // First try to find columns with common keywords
    let searchableColumns = allTextColumns.filter(col => {
      const lowerCol = col.toLowerCase()
      return (
        lowerCol.includes('name') || 
        lowerCol.includes('email') || 
        lowerCol.includes('city') || 
        lowerCol.includes('state') || 
        lowerCol.includes('address')
      )
    })
    
    // If no columns found with keywords, search all text columns
    if (searchableColumns.length === 0) {
      searchableColumns = allTextColumns
    }

    if (searchableColumns.length === 0) {
      return {
        results: [],
        count: 0,
        query: originalQuery,
        confidence_level: 'low',
        message: `No searchable columns found in the database. Available columns: ${actualColumns.join(', ')}`,
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

    // Analyze search specificity and determine PII masking
    const searchAnalysis = analyzeSearchSpecificity(searchTerm, resultsWithConfidence.length)
    const shouldMaskPII = searchAnalysis.shouldMaskPII && resultsWithConfidence.length > 1
    
    let finalResults: SearchResult[]
    try {
      finalResults = shouldMaskPII ? maskResultsPII(resultsWithConfidence, searchAnalysis.searchType, searchTerm) : resultsWithConfidence
    } catch (error) {
      finalResults = resultsWithConfidence // fallback to unmasked results
    }

    return {
      results: finalResults,
      count: finalResults.length,
      query: originalQuery,
      confidence_level,
      suggestions: searchAnalysis.suggestions,
      message: searchAnalysis.guidanceMessage,
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

export const searchUserDataTool = tool({
  description: `Search for people in the database. This tool searches the local database only and returns formatted results for the user. Do not use any other knowledge - only present the results from this tool.`,
  
  parameters: z.object({
    query: z.string().describe("The search term to look for. Can be name, email, phone, address, city, state, or any combination."),
  }),
  
  execute: async ({ query }) => {
    try {
      // Start with search indicator
      let response = `🔎 Searching for: '${query}'...\n\n`

      // Create Supabase client and call search function directly
      const supabase = await createClient()
      if (!supabase) {
        return `🔎 Searching for: '${query}'...\n\n❌ I encountered an issue while connecting to the database. Please try again later.\n\n💡 The database connection is temporarily unavailable. Please try rephrasing your search or check if you've entered the information correctly. I'm here to help you find the right person!`
      }

      const data = await searchPeopleDB(supabase, query)
      
      if (data.message && data.count === 0 && data.message.includes('error')) {
        return `🔎 Searching for: '${query}'...\n\n🤔 I couldn't find anyone matching "${query}" in the database.\n\n💡 **Let me help you search more effectively:**\n${data.suggestions?.map((s: string) => `• ${s}`).join('\n') || '• Try using full names (first and last name)\n• Include email addresses if you have them\n• Add phone numbers for better matches\n• Check your spelling and try variations'}\n\n🎯 **Pro tip:** The more specific information you provide, the better I can help you find the right person!`
      }

      if (data.count === 0) {
        return `🔎 Searching for: '${query}'...\n\n📋 Found 0 matching records\n\n🤔 **I didn't find anyone matching your search.** This could mean:\n• The person isn't in our database\n• The information might be spelled differently\n• You might need to be more specific\n\n💡 **Here's how to get better results:**\n• Try searching with full names instead of just first names\n• Include email addresses or phone numbers if available\n• Add location information (city, state)\n• Check spelling and try different variations\n\n🎯 **Need help?** Feel free to ask me to search using different terms or provide more details about who you're looking for!`
      }

      // Analyze the quality of results for guidance
      const hasHighConfidence = data.results.some((r: any) => r.confidence_score >= 80)
      const hasEmailMatches = data.results.some((r: any) => r.match_reasons?.includes('Email match'))
      const hasPhoneMatches = data.results.some((r: any) => r.match_reasons?.includes('Phone match'))
      const isVagueSearch = query.split(' ').length === 1 && query.length <= 4
      
      // Check if this was a natural language query that was processed
      const wasNaturalLanguageQuery = query.toLowerCase().includes('find') || 
                                     query.toLowerCase().includes('search') || 
                                     query.toLowerCase().includes('who is') ||
                                     query.toLowerCase().includes('people named') ||
                                     query.toLowerCase().includes('everyone whose') ||
                                     query.toLowerCase().includes('show me') ||
                                     query.toLowerCase().includes('look for')

      // Show initial results summary
      response += `📋 Found ${data.count} matching record(s):\n`
      response += `--------------------------------------------------------------------------------\n`
      
      // Show brief summary of top results
      const topResults = data.results.slice(0, 3)
      topResults.forEach((result: any, index: number) => {
        const name = result.Name || 'Unknown Name'
        const email = (result.Email && result.Email.trim()) ? String(result.Email) : 'No email'
        
        // Build location only from available parts
        const cityPart = result.city && result.city.trim() ? result.city : ''
        const statePart = result.state && result.state.trim() ? result.state : ''
        const location = [cityPart, statePart].filter(Boolean).join(', ') || 'No location'
        
        const score = ((result.confidence_score || 0) / 100).toFixed(3)
        
        response += `${index + 1}. ${name.padEnd(25)} | ${email.padEnd(30)} | ${location.padEnd(15)} | Score: ${score}\n`
      })

      // Show "and X more matches" if there are more results
      if (data.count > 3) {
        response += `    ... and ${data.count - 3} more matches\n`
      }

      response += `\n🤖 Analyzing results and generating detailed response...\n\n`

      // Add AI-generated analysis based on result quality
      if (wasNaturalLanguageQuery) {
        response += `🧠 **I understood your natural language query!** Processing your request...\n\n`
      }
      
      if (isVagueSearch && data.count > 5) {
        response += `🤔 **I notice you searched for just "${query}" - that's quite broad!** I found ${data.count} people, but you might want to be more specific.\n\n`
      } else if (hasHighConfidence && (hasEmailMatches || hasPhoneMatches)) {
        response += `✅ **Great news!** I found some very promising matches with high confidence scores.\n\n`
      } else if (data.confidence_level === 'low') {
        response += `🔍 **I found some potential matches, but the confidence is lower than I'd like.** Let me show you what I found, and then I'll suggest how to get better results.\n\n`
      } else {
        response += `📊 **Here's what I found in the database:**\n\n`
      }

      // Add the detailed response section
      response += `📝 **Detailed Results:**\n`
      response += `Found ${data.count} matching record(s) for '${query}':\n\n`
      
      // Show detailed results with PII masking indicator
      data.results.forEach((result: any, index: number) => {
        response += `${index + 1}. ${result.Name || 'Unknown Name'}\n`
        
        // Only show fields with actual values
        if (result.Email && result.Email.trim()) {
          const emailValue = String(result.Email)
          const emailIcon = data.pii_masked && emailValue.includes('*') ? '🔒📧' : '📧'
          response += `   ${emailIcon} ${emailValue}\n`
        }
        
        if (result['Mobile Phone'] && String(result['Mobile Phone']).trim()) {
          const phoneValue = String(result['Mobile Phone'])
          const phoneIcon = data.pii_masked && phoneValue.includes('*') ? '🔒📱' : '📱'
          response += `   ${phoneIcon} ${phoneValue}\n`
        }
        
        if (result.Address && String(result.Address).trim()) {
          const addressValue = String(result.Address)
          const addressIcon = data.pii_masked && addressValue.includes('*') ? '🔒🏠' : '🏠'
          response += `   ${addressIcon} ${addressValue}\n`
        }
        
        // Show location only if at least one field has a value
        if ((result.city && result.city.trim()) || (result.state && result.state.trim())) {
          const cityPart = result.city && result.city.trim() ? result.city : ''
          const statePart = result.state && result.state.trim() ? result.state : ''
          const location = [cityPart, statePart].filter(Boolean).join(', ')
          if (location) {
            response += `   📍 ${location}\n`
          }
        }
        
        if (result.confidence_score) {
          response += `   🎯 Match confidence: ${(result.confidence_score / 100 * 100).toFixed(1)}%\n`
        }
        
        if (result['Is Valid']) {
          response += `   ✅ Status: ${result['Is Valid'] === 'Y' ? 'Verified' : 'Unverified'}\n`
        }
        
        if (result.match_reasons && result.match_reasons.length > 0) {
          response += `   🔍 Match reasons: ${result.match_reasons.join(', ')}\n`
        }
        
        response += '\n'
      })

      // Add personalized guidance based on search analysis
      if (data.suggestions && data.suggestions.length > 0) {
        response += `\n💡 **Search Guidance:**\n`
        response += data.suggestions.map(suggestion => `${suggestion}\n`).join('')
        response += `\n`
      }
      
      // Add confidence-based guidance
      if (data.confidence_level === 'low') {
        response += `⚠️ **Low Confidence Results:** These matches may not be exactly what you're looking for. Consider refining your search.\n\n`
      } else if (data.confidence_level === 'medium') {
        response += `✅ **Medium Confidence Results:** These matches look promising. For more precision, try providing additional details.\n\n`
      } else if (data.confidence_level === 'high') {
        response += `🎯 **High Confidence Results:** These matches are very likely what you're looking for!\n\n`
      }

      // Add helpful closing
      if (data.count > 5) {
        response += `\n\n📊 **Found ${data.count} total matches** - I'm showing you the most relevant ones. If you need to see more results or want to narrow down your search, just let me know!`
      }

      return response

    } catch (error) {
      console.error('Search tool error:', error)
      return `🔎 Searching for: '${query}'...\n\n❌ I encountered an unexpected error while searching the database: ${error instanceof Error ? error.message : 'Unknown error'}\n\n🤔 **Don't worry, let's try again!** This might be a temporary issue. Please try:\n• Rephrasing your search query\n• Using different search terms\n• Checking your spelling\n\n💡 I'm here to help you find the information you need - just give me another search term to try!`
    }
  },
}) 