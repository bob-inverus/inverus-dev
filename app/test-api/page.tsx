"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function TestApiPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const testEndpoint = async (test: any) => {
    const { name, url, method = 'GET', body } = test
    setLoading(prev => ({ ...prev, [name]: true }))
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) })
      })
      
      const data = await response.json()
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          data: data
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }))
    }
  }

  const tests = [
    {
      name: 'Available Models',
      url: '/api/models',
      description: 'Get available chat models for external clients'
    },
    {
      name: 'Chat Completion',
      url: '/api/chat',
      method: 'POST',
      body: {
        messages: [{ role: 'user', content: 'Hello, test message' }],
        model: 'harvestor'
      },
      description: 'Send chat completion request'
    },
    {
      name: 'Search People',
      url: '/api/searchPeople',
      description: 'Search for people (requires API key)'
    },
    {
      name: 'General Search',
      url: '/api/search', 
      description: 'General search functionality (requires API key)'
    },
    {
      name: 'Health Check',
      url: '/api/health',
      description: 'API health status'
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Chat API Testing Dashboard</h1>
        <p className="text-muted-foreground">
          Test your chat and search API endpoints for external clients
        </p>
      </div>

      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                    {test.url}
                  </code>
                </div>
                <Button
                  onClick={() => testEndpoint(test)}
                  disabled={loading[test.name]}
                  size="sm"
                >
                  {loading[test.name] ? 'Testing...' : 'Test'}
                </Button>
              </div>
            </CardHeader>
            
            {results[test.name] && (
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      results[test.name].ok 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {results[test.name].status}
                    </span>
                  </div>
                  
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      View Response Data
                    </summary>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(results[test.name].data || results[test.name].error, null, 2)}
                    </pre>
                  </details>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test All Endpoints</CardTitle>
          <CardDescription>Run all tests at once</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              tests.forEach(test => testEndpoint(test))
            }}
            className="w-full"
          >
            Run All Tests
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
