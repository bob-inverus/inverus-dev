import { tool } from "ai"
import { z } from "zod"

export const searchUserDataTool = tool({
  description: `Search for people in the database. This tool searches the local database only and returns formatted results for the user. Do not use any other knowledge - only present the results from this tool.`,
  
  parameters: z.object({
    query: z.string().describe("The search term to look for. Can be name, email, phone, address, city, state, or any combination."),
  }),
  
  execute: async ({ query }) => {
    try {
      // Start with search indicator
      let response = `🔎 Searching for: '${query}'...\n\n`

      // Call our enhanced search API endpoint
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}))
        return `🔎 Searching for: '${query}'...\n\n❌ I encountered an issue while searching the database. ${errorData.error || apiResponse.statusText}\n\n💡 Please try rephrasing your search or check if you've entered the information correctly. I'm here to help you find the right person!`
      }

      const data = await apiResponse.json()
      
      if (data.error) {
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
        const email = result.Email || 'No email'
        const location = `${result.city || 'nan'}, ${result.state || 'nan'}`
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
        
        if (result.Email) {
          const emailIcon = data.pii_masked && result.Email.includes('*') ? '🔒📧' : '📧'
          response += `   ${emailIcon} ${result.Email}\n`
        }
        if (result['Mobile Phone']) {
          const phoneIcon = data.pii_masked && result['Mobile Phone'].includes('*') ? '🔒📱' : '📱'
          response += `   ${phoneIcon} ${result['Mobile Phone']}\n`
        }
        if (result.Address) {
          const addressIcon = data.pii_masked && result.Address.includes('*') ? '🔒🏠' : '🏠'
          response += `   ${addressIcon} ${result.Address}\n`
        }
        if (result.city || result.state) {
          const location = `${result.city || 'Unknown'}, ${result.state || 'Unknown'}`
          response += `   📍 ${location}\n`
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

      // Add personalized guidance based on results and PII masking
      if (data.pii_masked) {
        response += `🔒 **Privacy Protection Notice:** Some personal information has been masked for privacy protection.\n\n`
        response += `📋 **To view complete contact information, please provide more specific search criteria:**\n`
        response += `• Full email address (e.g., john.doe@company.com)\n`
        response += `• Complete phone number (e.g., 555-123-4567)\n`
        response += `• Full name with location (e.g., "John Smith Boston MA")\n`
        response += `• Specific ID numbers or reference codes\n\n`
        response += `🎯 **Examples:**\n`
        response += `• Instead of "${query}", try "John Smith Massachusetts" or "john.smith@email.com"\n`
        response += `• You can also use natural language: "find everyone whose name is John Smith"\n`
        response += `• Or ask: "show me people named John in Boston"`
      } else if (data.confidence_level === 'low' || isVagueSearch) {
        response += `💡 **To get more accurate results, try:**\n`
        response += `• Searching with full names (first and last name together)\n`
        response += `• Including email addresses if you know them\n`
        response += `• Adding phone numbers for exact matches\n`
        response += `• Specifying location details (city, state)\n`
        response += `• Using quotes for exact phrases\n\n`
        response += `🎯 **Examples:**\n`
        response += `• Instead of "${query}", try "John Smith Massachusetts" or "john.smith@email.com"\n`
        response += `• Natural language: "find everyone whose name is John Smith"\n`
        response += `• Or ask: "who is John Smith in Boston"`
      } else if (data.confidence_level === 'medium') {
        response += `✅ **These results look promising!** The matches have decent confidence scores, but if you're looking for someone specific, you might want to search with more details like email or phone number for exact matches.`
      } else {
        response += `🎯 **Excellent matches!** These results have high confidence scores and are very likely what you're looking for. The database found strong matches based on your search criteria.`
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