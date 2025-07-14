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
        return `🔎 Searching for: '${query}'...\n\n❌ Error: ${errorData.error || apiResponse.statusText}\n\nPlease try again with a different search term.`
      }

      const data = await apiResponse.json()
      
      if (data.error) {
        return `🔎 Searching for: '${query}'...\n\n❌ No results found.\n\n💡 Suggestions:\n${data.suggestions?.map((s: string) => `• ${s}`).join('\n') || '• Try using full names, email addresses, or phone numbers\n• Check spelling and try different variations'}`
      }

      if (data.count === 0) {
        return `🔎 Searching for: '${query}'...\n\n📋 Found 0 matching record(s)\n\n💡 Try:\n• Using full names instead of just first names\n• Including email addresses or phone numbers\n• Checking spelling and trying variations\n• Using location information (city, state)`
      }

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

      response += `\n🤖 Generating detailed response...\n\n`

      // Add the detailed response section
      response += `📝 Response:\n`
      response += `Found ${data.count} matching record(s) for '${query}':\n\n`
      
      // Show detailed results
      data.results.forEach((result: any, index: number) => {
        response += `${index + 1}. ${result.Name || 'Unknown Name'}\n`
        
        if (result.Email) response += `   📧 ${result.Email}\n`
        if (result['Mobile Phone']) response += `   📱 ${result['Mobile Phone']}\n`
        if (result.Address) response += `   🏠 ${result.Address}\n`
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

      // Add confidence level guidance
      if (data.confidence_level === 'low') {
        response += `💡 **Low confidence results**: For better matches, try:\n• Full email addresses\n• Complete phone numbers\n• First and last names together\n• Specific location details`
      } else if (data.confidence_level === 'medium') {
        response += `✅ **Medium confidence**: These results are likely relevant to your search.`
      } else {
        response += `🎯 **High confidence**: These results are very likely what you're looking for.`
      }

      return response

    } catch (error) {
      console.error('Search tool error:', error)
      return `🔎 Searching for: '${query}'...\n\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again with a different search term.`
    }
  },
}) 