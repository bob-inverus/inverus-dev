"use client"

import { useEffect, useState } from "react"

export function DebugEnvCheck() {
  const [serverEnv, setServerEnv] = useState<any>(null)
  const [clientEnv, setClientEnv] = useState<any>(null)

  useEffect(() => {
    // Check client-side environment variables
    setClientEnv({
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'NOT_SET',
    })

    // Check server-side environment variables
    fetch('/api/debug-env')
      .then(res => res.json())
      .then(data => setServerEnv(data))
      .catch(error => console.error('Debug env check failed:', error))
  }, [])

  // Temporarily show in both dev and production for debugging
  // if (process.env.NODE_ENV === 'production') {
  //   return null // Don't show in production
  // }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: '#000', 
      color: '#fff', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      borderRadius: '4px'
    }}>
      <div><strong>Client ENV:</strong></div>
      <pre>{JSON.stringify(clientEnv, null, 2)}</pre>
      <div><strong>Server ENV:</strong></div>
      <pre>{JSON.stringify(serverEnv, null, 2)}</pre>
    </div>
  )
} 