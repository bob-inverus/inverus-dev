"use client"

import { useUser } from "@/lib/user-store/provider"
import { useEffect, useState } from "react"

export function DebugUserInfo() {
  const { user, refreshUser } = useUser()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]) // Keep last 20 logs
  }

  useEffect(() => {
    if (user) {
      addLog(`User loaded: ${user.email}, tier: ${user.tier}, name: ${user.display_name || 'NO NAME'}`)
    } else {
      addLog('No user data available')
    }
  }, [user])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto bg-black/90 text-white text-xs p-4 rounded-lg font-mono z-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Debug User Info</span>
        <button 
          onClick={() => {
            addLog('Manual refresh triggered')
            refreshUser()
          }}
          className="bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Refresh
        </button>
      </div>
      
      <div className="mb-2 text-xs">
        <div>Email: {user?.email || 'N/A'}</div>
        <div>Name: {user?.display_name || 'N/A'}</div>
        <div>Tier: {user?.tier || 'N/A'}</div>
        <div>Credits: {user?.credits || 'N/A'}</div>
        <div>Avatar: {user?.profile_image ? 'Yes' : 'No'}</div>
      </div>

      <div className="border-t border-gray-600 pt-2">
        <div className="font-bold mb-1">Logs:</div>
        {logs.map((log, i) => (
          <div key={i} className="text-xs opacity-80">{log}</div>
        ))}
      </div>
    </div>
  )
} 